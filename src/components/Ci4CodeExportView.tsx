import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  FileCode,
  FolderGit2,
  BookOpen,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { CI4_CODEBASE, generateCi4ZipPackage, Ci4File } from '../utils/ci4Export';

interface Ci4CodeExportViewProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const Ci4CodeExportView: React.FC<Ci4CodeExportViewProps> = ({ showToast }) => {
  const [selectedFile, setSelectedFile] = useState<Ci4File>(CI4_CODEBASE[0]);
  const [copied, setCopied] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    showToast(`Kode "${selectedFile.path}" disalin ke clipboard.`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await generateCi4ZipPackage();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'codeigniter4_arsip_pjok_master.zip';
      a.click();
      URL.revokeObjectURL(url);
      showToast('Paket lengkap CodeIgniter 4 (ZIP) berhasil diunduh.');
    } catch {
      showToast('Gagal membuat paket unduhan ZIP.', 'error');
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <Code2 className="w-4 h-4" />
            <span>STANDAR CODEIGNITER 4 & MYSQL / MARIADB</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Source Code, Migrasi Database, & Panduan Instalasi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seluruh arsitektur backend CodeIgniter 4, skema database SQL lengkap, controller, filter otentikasi, dan file panduan siap diekspor.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isExportingZip}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors shrink-0"
        >
          {isExportingZip ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Membuat Paket ZIP...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Unduh Paket Lengkap CI4 (.zip)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Split: File Tree on left, Code Inspector on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: File Tree */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <h3 className="text-xs font-bold text-slate-900 px-2">
            Struktur Berkas Proyek
          </h3>

          <div className="space-y-1">
            {CI4_CODEBASE.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 text-blue-800 font-semibold border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-blue-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="font-mono text-[11px] truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-2">
            <div className="font-semibold text-slate-700">Dukungan Lingkungan:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>PHP 8.1 / 8.2 (Intl, MySQLi)</li>
              <li>Laragon & XAMPP (Windows)</li>
              <li>Hosting cPanel / CyberPanel / VPS</li>
              <li>Tailwind CSS Build Pipeline</li>
            </ul>
          </div>
        </div>

        {/* Right: Code Inspector */}
        <div className="lg:col-span-3 bg-slate-900 rounded-xl border border-slate-800 shadow-md overflow-hidden flex flex-col">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950/80">
            <div className="min-w-0">
              <div className="font-mono text-xs font-bold text-blue-400 truncate">
                {selectedFile.path}
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {selectedFile.description}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto">
            <pre className="font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-blue-600 selection:text-white">
              {selectedFile.content}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
