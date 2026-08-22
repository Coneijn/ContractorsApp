/**
 * Configuración compartida de subidas (cliente + servidor).
 *
 * Vive fuera de `src/actions/s3Actions.ts` a propósito: un archivo con
 * `'use server'` solo puede exportar funciones async, así que las constantes
 * que el cliente necesita (para rechazar temprano) tienen que estar aquí.
 */

/** MIME types aceptados y las extensiones que les corresponden. Fuente única de verdad. */
export const IMAGE_MIME_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
};

/** Lista plana de MIME types permitidos. */
export const ALLOWED_IMAGE_TYPES = Object.keys(IMAGE_MIME_EXTENSIONS);

/** Tamaño máximo por archivo: 5 MB. */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Mismo límite en MB, para los mensajes de la UI. */
export const MAX_FILE_SIZE_MB = MAX_FILE_SIZE / 1024 / 1024;

/** Carpeta (prefijo) por defecto dentro del bucket. */
export const S3_UPLOAD_FOLDER = 'uploads';
