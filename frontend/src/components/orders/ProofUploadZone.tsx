import { useEffect, useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Play,
  Upload,
  Video,
  X,
} from 'lucide-react';
import type { ProofFile } from '../../lib/ordersApi';
import { proofMediaUrl } from '../../lib/proofMediaUrl';
import { cn } from '../../lib/cn';

type ProofUploadZoneProps = {
  label: string;
  description: string;
  accept: string;
  multiple?: boolean;
  mediaType: 'image' | 'video';
  uploadedFiles: ProofFile[];
  disabled?: boolean;
  uploading?: boolean;
  complete?: boolean;
  deletingFileId?: number | null;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  onDeleteFile?: (fileId: number) => void | Promise<void>;
  icon?: ReactNode;
};

export function ProofUploadZone({
  label,
  description,
  accept,
  multiple = false,
  mediaType,
  uploadedFiles,
  disabled = false,
  uploading = false,
  complete = false,
  deletingFileId = null,
  onFilesSelected,
  onDeleteFile,
  icon,
}: ProofUploadZoneProps) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex == null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
        return;
      }
      if (uploadedFiles.length < 2) return;
      if (event.key === 'ArrowLeft') {
        setActiveIndex((index) =>
          index == null ? index : (index - 1 + uploadedFiles.length) % uploadedFiles.length,
        );
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((index) =>
          index == null ? index : (index + 1) % uploadedFiles.length,
        );
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, uploadedFiles.length]);

  useEffect(() => {
    if (activeIndex == null) return;
    if (uploadedFiles.length === 0) {
      setActiveIndex(null);
      return;
    }
    if (activeIndex >= uploadedFiles.length) {
      setActiveIndex(uploadedFiles.length - 1);
    }
  }, [activeIndex, uploadedFiles.length]);

  const pickFiles = (fileList: FileList | null) => {
    if (!fileList?.length || disabled || uploading) return;
    const files = multiple ? Array.from(fileList) : [fileList[0]];
    void onFilesSelected(files);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    pickFiles(event.dataTransfer.files);
  };

  const zoneIcon =
    icon ??
    (mediaType === 'video' ? (
      <Video className="h-6 w-6 text-voo" />
    ) : (
      <ImagePlus className="h-6 w-6 text-voo" />
    ));

  const viewing = activeIndex != null ? uploadedFiles[activeIndex] : null;
  const hasMultiple = uploadedFiles.length > 1;

  return (
    <>
      <div
        className={cn(
          'rounded-xl border bg-white transition-colors',
          complete ? 'border-liberado/40 bg-liberado-light/30' : 'border-nuvem',
        )}
      >
        <div className="flex items-start justify-between gap-3 border-b border-nuvem/80 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  complete ? 'bg-liberado/15' : 'bg-voo-light',
                )}
              >
                {zoneIcon}
              </span>
              <div>
                <h3 className="font-semibold text-solo">{label}</h3>
                <p className="text-xs text-cinza">{description}</p>
              </div>
            </div>
          </div>
          {complete ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-liberado/15 px-2.5 py-1 text-xs font-semibold text-liberado-dark">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enviado
            </span>
          ) : (
            <span className="shrink-0 rounded-full bg-nuvem/80 px-2.5 py-1 text-xs font-medium text-cinza">
              Pendente
            </span>
          )}
        </div>

        {uploadedFiles.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-4">
            {uploadedFiles.map((file, index) => (
              <div key={file.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="h-20 w-20 overflow-hidden rounded-lg border border-nuvem bg-bruma focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-voo"
                  aria-label={
                    mediaType === 'image' ? `Ver foto ${index + 1}` : `Ver vídeo ${index + 1}`
                  }
                >
                  {mediaType === 'image' ? (
                    <img
                      src={proofMediaUrl(file.url)}
                      alt=""
                      className="h-full w-full object-cover transition-opacity hover:opacity-90"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-solo/5 text-cinza">
                      <Play className="h-5 w-5 text-voo" />
                      <span className="text-[9px] font-medium uppercase tracking-wide">Vídeo</span>
                    </div>
                  )}
                </button>

                {onDeleteFile ? (
                  <button
                    type="button"
                    disabled={disabled || uploading || deletingFileId === file.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDeleteFile(file.id);
                    }}
                    className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-nuvem bg-white text-solo shadow-sm transition-colors hover:bg-error hover:text-white disabled:opacity-50"
                    aria-label="Excluir arquivo"
                  >
                    {deletingFileId === file.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="px-4 pb-4">
          <button
            type="button"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              if (!disabled && !uploading) setDragOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (!disabled && !uploading) setDragOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragOver(false);
            }}
            onDrop={handleDrop}
            className={cn(
              'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              dragOver
                ? 'border-voo bg-voo-light/60'
                : 'border-nuvem bg-bruma/50 hover:border-voo hover:bg-voo-light/40',
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-voo" />
                <span className="text-sm font-medium text-solo">Enviando…</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-voo" />
                <span className="text-sm font-medium text-solo">
                  {uploadedFiles.length > 0
                    ? 'Adicionar mais arquivos'
                    : 'Arraste ou clique para enviar'}
                </span>
                <span className="text-xs text-cinza">
                  {mediaType === 'video' ? 'MP4 ou WebM' : 'JPG, PNG ou WebP'}
                  {multiple ? ' · múltiplos arquivos' : ''}
                </span>
              </>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(event) => {
              pickFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      {viewing && activeIndex != null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-solo/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-nuvem bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between gap-3 border-b border-nuvem px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p id={titleId} className="truncate font-display text-base font-bold text-solo">
                  {label}
                </p>
                {hasMultiple ? (
                  <p className="text-xs text-cinza">
                    {activeIndex + 1} de {uploadedFiles.length}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setActiveIndex(null)}
                className="shrink-0 rounded-lg p-2 text-cinza transition-colors hover:bg-bruma hover:text-solo"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="relative bg-bruma">
              <div className="relative mx-auto flex h-[min(58vh,28rem)] w-full items-center justify-center px-12 sm:px-14">
                {mediaType === 'image' ? (
                  <img
                    src={proofMediaUrl(viewing.url)}
                    alt={label}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <video
                    key={viewing.id}
                    src={proofMediaUrl(viewing.url)}
                    controls
                    className="max-h-full max-w-full rounded-lg"
                  />
                )}
              </div>

              {hasMultiple ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(
                        (index) =>
                          index == null
                            ? 0
                            : (index - 1 + uploadedFiles.length) % uploadedFiles.length,
                      )
                    }
                    className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-nuvem bg-white p-2 text-solo shadow-sm transition-colors hover:bg-bruma sm:left-3"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex((index) =>
                        index == null ? 0 : (index + 1) % uploadedFiles.length,
                      )
                    }
                    className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-nuvem bg-white p-2 text-solo shadow-sm transition-colors hover:bg-bruma sm:right-3"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
