import React from 'react';
import { Search, Shield, User as UserIcon, RefreshCw, Upload, LogOut } from 'lucide-react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';

interface HeaderProps {
  currentViewTitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUser: User;
  onUserSwitch: (user: User) => void;
  onOpenUpload: () => void;
  onNavigate: (viewId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentViewTitle,
  searchQuery,
  onSearchChange,
  currentUser,
  onUserSwitch,
  onOpenUpload,
  onNavigate,
}) => {
  const users = StorageService.getUsers();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = users.find((u) => u.id === e.target.value);
    if (selected) {
      onUserSwitch(selected);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Brand & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Arsip Administrasi PJOK
        </span>
        <span className="text-slate-300 font-light" aria-hidden="true">/</span>
        <span className="text-sm font-medium text-slate-600 truncate">
          {currentViewTitle}
        </span>
      </div>

      {/* Zone 2: Global Search */}
      <div className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari berkas, kode dokumen, atau kata kunci..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
        </div>
      </div>

      {/* Zone 3: Actions & Active User Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        {currentUser.role !== 'viewer' && (
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md transition-colors whitespace-nowrap shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Berkas</span>
          </button>
        )}

        {/* Role Switcher for Testing RBAC */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500 hidden sm:inline">Peran:</span>
          <select
            value={currentUser.id}
            onChange={handleRoleChange}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            title="Ubah peran untuk menguji hak akses (RBAC)"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* User Avatar */}
        <button
          onClick={() => onNavigate('profil')}
          className="flex items-center gap-2 p-1 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          title="Buka Profil Guru & Sekolah"
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};
