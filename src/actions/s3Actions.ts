'use server';

import { createPresignedUpload } from '@/lib/s3';
import { S3_UPLOAD_FOLDER } from '@/lib/uploadConfig';

/**
 * Firma una URL de subida de corta vida para que el navegador haga el PUT
 * directo a S3. Los bytes nunca pasan por el servidor de Next y las
 * credenciales de AWS nunca salen del runtime de Node.
 *
 * OJO: el formulario de contratistas (/contractors/invoice) es público, así
 * que este Server Action es invocable por cualquiera que cargue la página.
 * Es intencional. Si algún día la subida pasa a requerir sesión, la
 * validación va AQUÍ, antes de firmar.
 */
export async function getPresignedUrl(
  fileType: string,
  fileSize: number,
  folder: string = S3_UPLOAD_FOLDER
) {
  return createPresignedUpload(fileType, fileSize, folder);
}
