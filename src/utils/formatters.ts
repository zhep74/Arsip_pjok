import { FileType } from '../types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function getFileTypeBadge(fileType: FileType, extension: string): { label: string; bg: string; text: string } {
  switch (fileType) {
    case 'word':
      return { label: extension.toUpperCase(), bg: 'bg-blue-50 border border-blue-200', text: 'text-blue-700' };
    case 'excel':
      return { label: extension.toUpperCase(), bg: 'bg-emerald-50 border border-emerald-200', text: 'text-emerald-700' };
    case 'pdf':
      return { label: 'PDF', bg: 'bg-rose-50 border border-rose-200', text: 'text-rose-700' };
    case 'image':
      return { label: extension.toUpperCase(), bg: 'bg-purple-50 border border-purple-200', text: 'text-purple-700' };
    default:
      return { label: extension.toUpperCase() || 'FILE', bg: 'bg-slate-50 border border-slate-200', text: 'text-slate-700' };
  }
}

export function getFileCategoryIconColor(categorySlug: string): string {
  if (categorySlug.includes('umum')) return 'text-sky-600 bg-sky-50';
  if (categorySlug.includes('perangkat')) return 'text-indigo-600 bg-indigo-50';
  if (categorySlug.includes('asesmen')) return 'text-emerald-600 bg-emerald-50';
  if (categorySlug.includes('olahraga')) return 'text-amber-600 bg-amber-50';
  if (categorySlug.includes('siswa')) return 'text-teal-600 bg-teal-50';
  if (categorySlug.includes('dokumentasi')) return 'text-fuchsia-600 bg-fuchsia-50';
  return 'text-slate-600 bg-slate-50';
}
