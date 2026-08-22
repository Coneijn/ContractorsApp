"use client";

import React, { useCallback, useState } from 'react';
import Image from 'next/image';
import { useDropzone, type Accept, type FileError, type FileRejection } from 'react-dropzone';

import { useLanguage } from '@/context/LanguageContext';
import { getPresignedUrl } from '@/actions/s3Actions';
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_MIME_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  S3_UPLOAD_FOLDER,
} from '@/lib/uploadConfig';

export interface ImageFile {
  /** id en BD, presente solo cuando la imagen ya se guardó */
  id?: string;
  /** URL pública en S3 */
  url: string;
  altText?: string;
  title?: string;
  caption?: string;
  description?: string;
}

interface ImageUploadProps {
  /** Texto principal de la zona de drop */
  label: string;
  /** Línea secundaria bajo el texto principal (formatos, límites…) */
  hint?: string;
  value: ImageFile[];
  onChange: (images: ImageFile[]) => void;
  multiple?: boolean;
  disableMetadata?: boolean;
  /** Carpeta (prefijo) dentro del bucket */
  folder?: string;
  maxFiles?: number;
}

const ACCEPT: Accept = IMAGE_MIME_EXTENSIONS;

/** Reemplaza {marcadores} en las cadenas del diccionario */
function fmt(template: string, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
    template
  );
}

export default function ImageUpload({
  label,
  hint,
  value,
  onChange,
  multiple = false,
  disableMetadata = false,
  folder = S3_UPLOAD_FOLDER,
  maxFiles = 20,
}: ImageUploadProps) {
  const { t } = useLanguage();
  const ui = t.imageUpload;

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setError(null);

      const room = multiple ? maxFiles - value.length : 1;
      const batch = acceptedFiles.slice(0, Math.max(room, 0));

      if (batch.length < acceptedFiles.length) {
        setError(fmt(ui.errorTooMany, { max: maxFiles }));
      }
      if (batch.length === 0) return;

      const uploaded: ImageFile[] = [];
      setUploading(true);
      setProgress({ current: 0, total: batch.length });

      try {
        for (const [index, file] of batch.entries()) {
          setProgress({ current: index + 1, total: batch.length });

          // Chequeos en cliente para dar un mensaje claro y no gastar una
          // firma. El servidor los repite: ahí está la puerta autoritativa.
          if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            throw new Error(fmt(ui.errorType, { name: file.name }));
          }
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(fmt(ui.errorTooLarge, { name: file.name, max: MAX_FILE_SIZE_MB }));
          }

          const { signedUrl, publicUrl } = await getPresignedUrl(file.type, file.size, folder);

          const res = await fetch(signedUrl, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type },
          });

          // IMPRESCINDIBLE: fetch no lanza en 4xx/5xx. Sin este check
          // guardaríamos una publicUrl que apunta a un objeto inexistente.
          if (!res.ok) {
            throw new Error(`S3 (${res.status})`);
          }

          uploaded.push({ url: publicUrl, altText: '', title: '', caption: '', description: '' });
        }
      } catch (err) {
        console.error('Upload failed:', err);
        // Los errores lanzados por un Server Action llegan enmascarados en
        // producción, así que solo confiamos en nuestros propios mensajes.
        const message = err instanceof Error ? err.message : '';
        setError(message.startsWith('"') ? message : ui.errorUpload);
      } finally {
        if (uploaded.length > 0) {
          onChange(multiple ? [...value, ...uploaded] : [uploaded[0]]);
        }
        setUploading(false);
        setProgress({ current: 0, total: 0 });
      }
    },
    [folder, maxFiles, multiple, onChange, ui, value]
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const first = rejections[0]?.errors[0];
      if (first) setError(first.message);
    },
    []
  );

  const getErrorMessage = useCallback(
    (error: FileError, file: File) => {
      switch (error.code) {
        case 'file-too-large':
          return fmt(ui.errorTooLarge, { name: file.name, max: MAX_FILE_SIZE_MB });
        case 'file-invalid-type':
          return fmt(ui.errorType, { name: file.name });
        case 'too-many-files':
          return fmt(ui.errorTooMany, { max: maxFiles });
        default:
          return error.message;
      }
    },
    [maxFiles, ui]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    getErrorMessage,
    accept: ACCEPT,
    maxSize: MAX_FILE_SIZE,
    multiple,
    disabled: uploading,
  });

  /**
   * Solo saca la imagen del estado del formulario. No borramos el objeto de
   * S3 desde aquí: el borrado vive en el servidor (ver deleteS3Object en
   * src/lib/s3.ts) porque esta página es pública. Los huérfanos que deje un
   * contratista que sube y se arrepiente los limpia la regla de ciclo de
   * vida del bucket.
   */
  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    setEditingIndex(null);
  };

  const updateImage = (index: number, patch: Partial<ImageFile>) => {
    onChange(value.map((img, i) => (i === index ? { ...img, ...patch } : img)));
  };

  const showDropzone = multiple || value.length === 0;
  const editing = editingIndex !== null ? value[editingIndex] : null;

  return (
    <div>
      {showDropzone && (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center transition mb-3 bg-slate-900 ${
            uploading
              ? 'border-slate-600 cursor-wait opacity-70'
              : isDragActive
                ? 'border-yellow-400 bg-slate-800/50 cursor-pointer'
                : 'border-slate-600 hover:border-yellow-400 hover:bg-slate-800/50 cursor-pointer'
          }`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <>
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-yellow-400" />
              <strong className="block text-sm text-slate-200">
                {fmt(ui.uploading, { current: progress.current, total: progress.total })}
              </strong>
            </>
          ) : (
            <>
              <div className="text-3xl mb-2">📸</div>
              <strong className="block text-sm text-slate-200">
                {isDragActive ? ui.dropActive : label}
              </strong>
              {hint && <span className="text-xs text-slate-500 mt-1 block">{hint}</span>}
            </>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-3 mb-3 flex items-start gap-2">
          <span className="text-sm leading-none">⚠️</span>
          <p className="text-xs text-red-200 flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 font-bold text-sm leading-none"
          >
            ✕
          </button>
        </div>
      )}

      {value.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {value.map((img, index) => (
              <div
                key={img.url}
                className="group relative aspect-square rounded-lg overflow-hidden border border-slate-600 bg-slate-900"
              >
                <Image
                  src={img.url}
                  alt={img.altText || ''}
                  fill
                  sizes="(max-width: 640px) 33vw, 160px"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition flex items-center justify-center gap-2">
                  {!disableMetadata && (
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      title={ui.edit}
                      aria-label={ui.edit}
                      className="bg-slate-800 border border-slate-600 text-yellow-400 rounded-lg px-2 py-1 text-sm hover:bg-slate-700 transition"
                    >
                      ✏️
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    title={ui.remove}
                    aria-label={ui.remove}
                    className="bg-slate-800 border border-red-900/50 text-red-400 rounded-lg px-2 py-1 text-sm hover:bg-red-950 transition"
                  >
                    🗑️
                  </button>
                </div>

                {!disableMetadata && !img.altText && (
                  <span className="absolute bottom-1 left-1 right-1 bg-yellow-400/90 text-slate-900 text-[9px] font-bold rounded px-1 py-0.5 text-center truncate">
                    ⚠️ {ui.missingAlt}
                  </span>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-500 mt-2">
            {fmt(ui.attached, { count: value.length })}
          </p>
        </>
      )}

      {editing && editingIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-4 pb-2 border-b border-slate-700">
              {ui.modalTitle}
            </h3>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-600 bg-slate-900 mb-4">
              <Image
                src={editing.url}
                alt={editing.altText || ''}
                fill
                sizes="400px"
                className="object-contain"
              />
            </div>

            <label className="block text-xs font-semibold text-slate-300 mb-1">{ui.altText}</label>
            <input
              type="text"
              value={editing.altText || ''}
              onChange={(e) => updateImage(editingIndex, { altText: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1 mb-3">{ui.altTextHint}</p>

            <label className="block text-xs font-semibold text-slate-300 mb-1">{ui.fieldTitle}</label>
            <input
              type="text"
              value={editing.title || ''}
              onChange={(e) => updateImage(editingIndex, { title: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition mb-3"
            />

            <label className="block text-xs font-semibold text-slate-300 mb-1">{ui.caption}</label>
            <input
              type="text"
              value={editing.caption || ''}
              onChange={(e) => updateImage(editingIndex, { caption: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition mb-3"
            />

            <label className="block text-xs font-semibold text-slate-300 mb-1">
              {ui.descriptionField}
            </label>
            <textarea
              value={editing.description || ''}
              onChange={(e) => updateImage(editingIndex, { description: e.target.value })}
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-yellow-400 transition min-h-[80px] resize-y mb-4"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingIndex(null)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold py-2.5 rounded-lg transition text-sm"
              >
                {ui.save}
              </button>
              <button
                type="button"
                onClick={() => removeImage(editingIndex)}
                className="px-4 bg-slate-900 border border-red-900/50 text-red-400 rounded-lg text-sm font-bold hover:bg-red-950 transition"
              >
                {ui.remove}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
