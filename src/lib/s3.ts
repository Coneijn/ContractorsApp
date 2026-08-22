import 'server-only';

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_MIME_EXTENSIONS,
  MAX_FILE_SIZE,
  S3_UPLOAD_FOLDER,
} from '@/lib/uploadConfig';

/**
 * Helpers de S3. Este archivo NO lleva 'use server': todo lo que se exporta
 * desde un módulo de Server Actions queda expuesto como endpoint público, y
 * `deleteS3Object` no debe serlo (el formulario de contratistas es anónimo).
 * Solo `getPresignedUrl` vive en `src/actions/s3Actions.ts`.
 */

const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_BUCKET_NAME',
] as const;

/** Único prefijo cuyo borrado se permite (defensa en profundidad). */
const DELETABLE_PREFIX = `${S3_UPLOAD_FOLDER}/`;

/** URL firmada de subida: 60 s. Una URL filtrada caduca en un minuto. */
const SIGNED_URL_EXPIRES_IN = 60;

type S3Config = { client: S3Client; bucket: string; region: string };

let cached: S3Config | null = null;

/**
 * Valida las 4 variables de entorno y construye el cliente una sola vez.
 *
 * La validación es perezosa (no a nivel de módulo) para que `next build`
 * siga funcionando en imágenes Docker, donde las credenciales se inyectan
 * en tiempo de ejecución y no durante el build. El fail-fast se mantiene:
 * la primera llamada real falla nombrando la variable que falta, en vez de
 * dejar que S3 devuelva un 403 opaco.
 */
function getS3(): S3Config {
  if (cached) return cached;

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  cached = {
    client: new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    }),
    bucket: process.env.AWS_BUCKET_NAME!,
    region: process.env.AWS_REGION!,
  };

  return cached;
}

/** Evita path traversal en el nombre de carpeta. */
function sanitizeFolder(folder: string) {
  return folder.replace(/[^a-zA-Z0-9-_]/g, '');
}

/**
 * Genera una URL prefirmada para subir un archivo a S3.
 * Devuelve también la URL pública permanente y la key del objeto.
 */
export async function createPresignedUpload(
  fileType: string,
  fileSize: number,
  folder: string = S3_UPLOAD_FOLDER
) {
  if (!ALLOWED_IMAGE_TYPES.includes(fileType)) {
    throw new Error('Invalid file type');
  }

  if (!Number.isFinite(fileSize) || fileSize <= 0 || fileSize > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  const { client, bucket, region } = getS3();

  const safeFolder = sanitizeFolder(folder) || S3_UPLOAD_FOLDER;
  const extension = (IMAGE_MIME_EXTENSIONS[fileType]?.[0] ?? '.jpg').slice(1);
  const key = `${safeFolder}/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
  });

  // signableHeaders: sin esto el presigner firma solo `host` (X-Amz-SignedHeaders=host)
  // y el ContentType del comando no obliga a nada: se puede subir text/html a una
  // key .jpg. Con content-type firmado, mandar otro tipo devuelve 403.
  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: SIGNED_URL_EXPIRES_IN,
    signableHeaders: new Set(['content-type']),
  });

  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return { signedUrl, publicUrl, key };
}

/**
 * Filtra una lista de URLs dejando solo las que apuntan a nuestro bucket.
 *
 * El formulario de contratistas es público y manda las URLs ya subidas, así
 * que cualquiera podría inyectar enlaces ajenos que luego el dashboard
 * renderiza como <img src>. Esto los descarta.
 */
export function filterOwnBucketUrls(urls: string[]) {
  const { bucket, region } = getS3();
  const base = `https://${bucket}.s3.${region}.amazonaws.com/${DELETABLE_PREFIX}`;

  return urls.filter((url) => typeof url === 'string' && url.startsWith(base));
}

/** Convierte una URL pública de S3 en la key del objeto. */
function toObjectKey(urlOrKey: string) {
  if (!urlOrKey.startsWith('http')) return urlOrKey;

  const url = new URL(urlOrKey);
  const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  return decodeURIComponent(path);
}

/**
 * Borra un objeto de S3 a partir de su URL pública o de su key.
 * Solo permite borrar dentro de DELETABLE_PREFIX.
 */
export async function deleteS3Object(urlOrKey: string) {
  if (!urlOrKey) return;

  // Fuera del try a propósito: una key fuera del prefijo es un error de
  // programación y debe explotar, no devolverse como { success: false }.
  const key = toObjectKey(urlOrKey);

  if (!key.startsWith(DELETABLE_PREFIX)) {
    throw new Error('Invalid key path');
  }

  try {
    const { client, bucket } = getS3();

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return { success: true };
  } catch (error) {
    console.error('Failed to delete S3 object:', error);
    return { success: false, error };
  }
}
