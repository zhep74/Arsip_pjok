import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Archive,
  Trash2,
  FileCode,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { BackupRecord, User } from '../types';
import { StorageService } from '../services/storageService';
import { formatBytes, formatDateTimeIndo } from '../utils/formatters';
import { CI4_CODEBASE } from '../utils/ci4Export';
import JSZip from 'jszip';

interface BackupRestoreViewProps {
  currentUser: User;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onDatabaseRestored: () => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  currentUser,
  showToast,
  onDatabaseRestored,
}) => {
  const [backups, setBackups] = useState<BackupRecord[]>(StorageService.getBackups());
  const [isProcessing, setIsProcessing] = useState(false);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  // 1. Export JSON Database Backup
  const handleBackupDatabase = () => {
    setIsProcessing(true);
    try {
      const snapshot = StorageService.getDatabaseSnapshot();
      const jsonStr = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const filename = `arsip_pjok_db_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${Date.now().toString().slice(-4)}.json`;

      // Download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      // Record
      const newRecord: BackupRecord = {
        id: `bcp-${Date.now()}`,
        backupFilename: filename,
        backupType: 'database',
        fileSize: blob.size,
        status: 'success',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        documentsCount: (snapshot.documents as any[]).length || 0,
      };

      StorageService.createBackupRecord(newRecord);
      setBackups(StorageService.getBackups());
      showToast('Pencadangan database berhasil diunduh.');
    } catch {
      showToast('Gagal membuat berkas backup database.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Export Full Documents ZIP Archive (Real ZIP with JSZip)
  const handleBackupFullZip = async () => {
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const docs = StorageService.getDocuments(false);
      const snapshot = StorageService.getDatabaseSnapshot();

      // Add database json inside zip
      zip.file('database_snapshot.json', JSON.stringify(snapshot, null, 2));

      // Add actual document files
      const docsFolder = zip.folder('documents');
      if (docsFolder) {
        for (const doc of docs) {
          if (doc.fileDataUrl && doc.fileDataUrl.startsWith('data:')) {
            const base64Data = doc.fileDataUrl.split(',')[1];
            docsFolder.file(doc.originalFilename, base64Data, { base64: true });
          } else {
            docsFolder.file(
              doc.originalFilename,
              `BERKAS ARSIP GURU PJOK\nKode Dokumen: ${doc.documentCode}\nJudul: ${doc.title}\nTahun: ${doc.academicYear}\nDeskripsi: ${doc.description}`
            );
          }
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const filename = `arsip_pjok_full_archive_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.zip`;

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      const newRecord: BackupRecord = {
        id: `bcp-${Date.now()}`,
        backupFilename: filename,
        backupType: 'full',
        fileSize: zipBlob.size,
        status: 'success',
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        documentsCount: docs.length,
      };

      StorageService.createBackupRecord(newRecord);
      setBackups(StorageService.getBackups());
      showToast(`Pencadangan arsip lengkap (${docs.length} dokumen) berhasil dibuat.`);
    } catch (e) {
      console.error(e);
      showToast('Gagal membuat paket cadangan ZIP.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Export SQL Dump
  const handleDownloadSqlDump = () => {
    const sqlFile = CI4_CODEBASE.find((f) => f.path === 'database/arsip_pjok.sql');
    if (!sqlFile) return;

    const blob = new Blob([sqlFile.content], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arsip_pjok.sql';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Skrip MySQL arsip_pjok.sql berhasil diunduh.');
  };

  // 4. Restore Database from JSON
  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm('PERINGATAN: Pemulihan database akan menimpa data yang ada saat ini dengan isi file cadangan. Pastikan Anda telah membuat cadangan terbaru terlebih dahulu. Lanjutkan proses pemulihan?')) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const res = StorageService.restoreDatabaseSnapshot(parsed);
        if (res.success) {
          showToast(res.message);
          onDatabaseRestored();
        } else {
          showToast(res.message, 'error');
        }
      } catch {
        showToast('File cadangan rusak atau format JSON tidak sesuai.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteBackupRecord = (id: string) => {
    StorageService.deleteBackup(id);
    setBackups(StorageService.getBackups());
    showToast('Catatan cadangan dihapus dari riwayat.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">
          Pencadangan & Pemulihan (Backup & Restore)
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Lindungi seluruh dokumen administrasi PJOK, profil guru, dan data sekolah dari kehilangan. Buat cadangan secara berkala.
        </p>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Database JSON Backup */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Cadangkan Database (JSON)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mengekspor seluruh tabel metadata dokumen, profil guru, kategori, akun pengguna, dan log aktivitas ke file JSON.
            </p>
          </div>

          <button
            onClick={handleBackupDatabase}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan Database</span>
          </button>
        </div>

        {/* Card 2: Full ZIP Documents Backup */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Archive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Cadangkan Seluruh Berkas (ZIP)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Memaketkan seluruh berkas fisik (Word, Excel, PDF, dan Foto) beserta file database ke dalam satu arsip ZIP siap simpan.
            </p>
          </div>

          <button
            onClick={handleBackupFullZip}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
          >
            <Archive className="w-4 h-4" />
            <span>Unduh Arsip Lengkap (.zip)</span>
          </button>
        </div>

        {/* Card 3: MySQL SQL Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <FileCode className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Ekspor MySQL Skrip (.sql)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh skema database MySQL \`arsip_pjok.sql\` lengkap dengan pembuatan tabel, indeks, foreign key, dan seeder data awal.
            </p>
          </div>

          <button
            onClick={handleDownloadSqlDump}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Skrip SQL (arsip_pjok.sql)</span>
          </button>
        </div>
      </div>

      {/* Restore Area */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h3 className="text-xs font-bold text-amber-900">
              Pemulihan Database dari Berkas Cadangan (Restore)
            </h3>
            <p className="text-xs text-amber-800">
              Pilih file cadangan JSON yang valid yang telah diunduh sebelumnya untuk memulihkan seluruh arsip dokumen ke kondisi saat cadangan dibuat.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={restoreFileRef}
              onChange={handleRestoreFileSelected}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => restoreFileRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              <span>Pilih Berkas Cadangan (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900">
              Riwayat Pencadangan Terakhir
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {backups.length} catatan cadangan tersimpan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama File Cadangan</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">Ukuran</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Pembuat</th>
                <th className="py-3 px-4">Tanggal Cadangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {backups.map((bcp) => (
                <tr key={bcp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                    {bcp.backupFilename}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap uppercase font-mono text-[11px] text-slate-700">
                    {bcp.backupType}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-600 whitespace-nowrap">
                    {formatBytes(bcp.fileSize)}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Berhasil
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                    {bcp.createdBy}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatDateTimeIndo(bcp.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleDeleteBackupRecord(bcp.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Hapus riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
