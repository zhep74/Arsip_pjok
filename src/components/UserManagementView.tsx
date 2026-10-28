import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  KeyRound,
  Lock,
  Edit2,
  Check,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { formatDateTimeIndo } from '../utils/formatters';

interface UserManagementViewProps {
  currentUser: User;
  onUserSwitch: (user: User) => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onUserSwitch,
  showToast,
}) => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('guru');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      showToast('Semua kolom pengguna wajib diisi.', 'error');
      return;
    }

    const newUser = StorageService.addUser({
      name,
      username,
      email,
      role,
      isActive: true,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });

    setUsers(StorageService.getUsers());
    setShowAddModal(false);
    setName('');
    setUsername('');
    setEmail('');
    showToast(`Pengguna "${newUser.name}" berhasil didaftarkan.`);
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser.id) {
      showToast('Anda tidak dapat menonaktifkan akun sendiri.', 'error');
      return;
    }
    StorageService.updateUser(u.id, { isActive: !u.isActive });
    setUsers(StorageService.getUsers());
    showToast(`Status akun ${u.name} diubah.`);
  };

  const handleRoleChange = (u: User, newRole: UserRole) => {
    StorageService.updateUser(u.id, { role: newRole });
    setUsers(StorageService.getUsers());
    showToast(`Peran akun ${u.name} diubah menjadi ${newRole.toUpperCase()}.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Pengguna dan Hak Akses (Role-Based Access Control)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem mendukung 3 tingkat hak akses: Administrator, Guru PJOK, dan Viewer (Pengawas/Kepala Sekolah).
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold text-slate-900">
            Matriks Hak Akses Aplikasi
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Fitur / Operasi Sistem</th>
                <th className="py-2.5 px-3 text-center">Administrator</th>
                <th className="py-2.5 px-3 text-center">Guru PJOK</th>
                <th className="py-2.5 px-3 text-center">Viewer (Pengawas)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Melihat & Mencari Berkas Administrasi</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Penuh</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Pratinjau & Mengunduh Dokumen Asli</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Unggah Berkas & Revisi Versi Dokumen</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Pindahkan Berkas ke Kotak Sampah & Pulihkan</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Hapus Permanen Dokumen & Kosongkan Sampah</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Kelola Kategori, Subkategori & Pengaturan</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-slate-800">Pencadangan (Backup) & Pemulihan (Restore) Database</td>
                <td className="py-2 px-3 text-center text-emerald-600 font-bold">✓ Ya</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
                <td className="py-2 px-3 text-center text-slate-400">✗ Tidak</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            Daftar Pengguna Terdaftar ({users.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Gunakan tombol "Masuk Sebagai" untuk menguji simulasi hak akses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama & Username</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Peran (Role)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Terakhir Masuk</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 font-semibold px-1.5 rounded">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">@{u.username}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">{u.email}</td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {currentUser.role === 'admin' && !isCurrent ? (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="text-xs py-1 px-2 bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none"
                        >
                          <option value="admin">Administrator</option>
                          <option value="guru">Guru PJOK</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
                          {u.role}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <button
                        disabled={isCurrent || currentUser.role !== 'admin'}
                        onClick={() => handleToggleStatus(u)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded transition-colors ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {formatDateTimeIndo(u.lastLogin)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onUserSwitch(u)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                          isCurrent
                            ? 'bg-slate-100 text-slate-400 cursor-default'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {isCurrent ? 'Sedang Aktif' : 'Masuk Sebagai'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="budisantoso"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi@sman1prestasibangsa.sch.id"
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Peran (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="guru">Guru PJOK (Kelola & Unggah Berkas)</option>
                  <option value="admin">Administrator (Akses Sistem Penuh)</option>
                  <option value="viewer">Viewer (Hanya Lihat & Unduh)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs"
                >
                  Daftarkan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
