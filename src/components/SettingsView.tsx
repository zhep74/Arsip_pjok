import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Shield,
  HardDrive,
  FileCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { AppSettings, User } from '../types';
import { StorageService } from '../services/storageService';

interface SettingsViewProps {
  currentUser: User;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  showToast,
  onResetData,
}) => {
  const [settings, setSettings] = useState<AppSettings>(StorageService.getSettings());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSettings(settings);
    showToast('Pengaturan sistem berhasil disimpan.');
  };

  const handleReset = () => {
    if (confirm('PERINGATAN: Seluruh dokumen, perubahan kategori, dan profil akan diatur ulang ke data awal demo bawaan aplikasi. Apakah Anda yakin?')) {
      StorageService.resetToDefault();
      onResetData();
      showToast('Sistem berhasil diatur ulang ke data awal.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900">
          Pengaturan Sistem Arsip Digital PJOK
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi batas ukuran berkas, keamanan penyimpanan, tahun ajaran aktif, dan pemeliharaan database.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6 text-xs">
          {/* Section 1: Upload & Storage Limits */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span>Batas Unggahan & Kapasitas Penyimpanan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Batas Maksimal Ukuran Berkas Tunggal (MB)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={settings.maxUploadSizeMb}
                  onChange={(e) =>
                    setSettings({ ...settings, maxUploadSizeMb: Number(e.target.value) })
                  }
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Direkomendasikan: 50 MB untuk menampung video pendek atau foto HD.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Resmi Aplikasi
                </label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Period Defaults */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Tahun Pelajaran & Semester Bawaan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Tahun Pelajaran Berjalan
                </label>
                <select
                  value={settings.defaultAcademicYear}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultAcademicYear: e.target.value })
                  }
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Semester Berjalan
                </label>
                <select
                  value={settings.defaultSemester}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultSemester: e.target.value as any })
                  }
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Checksum & Security */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 font-bold text-slate-900">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Integritas Berkas & Pencegahan Duplikasi</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="chkDup"
                  checked={settings.enableDuplicateDetection}
                  onChange={(e) =>
                    setSettings({ ...settings, enableDuplicateDetection: e.target.checked })
                  }
                  className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <label htmlFor="chkDup" className="font-semibold text-slate-800 cursor-pointer">
                    Aktifkan Deteksi Duplikasi Otomatis (SHA-256 Checksum)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Mencegah pengguna mengunggah dokumen yang sama dua kali untuk menghemat ruang penyimpanan.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="chkAutoBackup"
                  checked={settings.autoBackup}
                  onChange={(e) =>
                    setSettings({ ...settings, autoBackup: e.target.checked })
                  }
                  className="mt-0.5 rounded text-blue-600 focus:ring-0 cursor-pointer"
                />
                <div>
                  <label htmlFor="chkAutoBackup" className="font-semibold text-slate-800 cursor-pointer">
                    Cadangkan Log Aktivitas Otomatis Berkala
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Menyimpan rekaman audit seluruh aktivitas penambahan, revisi, dan penghapusan dokumen.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Sistem</span>
            </button>
          </div>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>Zona Pemeliharaan & Reset Data</span>
        </div>
        <p className="text-xs text-rose-800">
          Jika Anda ingin mengembalikan seluruh dokumen, kategori, dan profil ke konfigurasi bawaan awal demo aplikasi, tekan tombol di bawah ini.
        </p>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-300 hover:bg-rose-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Seluruh Data ke Bawaan Awal</span>
        </button>
      </div>
    </div>
  );
};
