import React from 'react';
import {
  LayoutDashboard,
  Files,
  UserCheck,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Dumbbell,
  Briefcase,
  Image as ImageIcon,
  CalendarRange,
  FolderTree,
  UserCog,
  Users,
  Database,
  Code2,
  Settings,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string, filterParams?: Record<string, string>) => void;
  trashCount: number;
  currentUser: User;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryFilter?: string;
  adminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  trashCount,
  currentUser,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'berkas-semua', label: 'Semua Berkas', icon: Files },
      ],
    },
    {
      title: 'ADMINISTRASI PJOK',
      items: [
        {
          id: 'berkas-umum',
          label: 'Administrasi Umum Guru',
          icon: UserCheck,
          categoryFilter: 'cat-umum',
        },
        {
          id: 'berkas-perangkat',
          label: 'Perangkat Pembelajaran',
          icon: BookOpen,
          categoryFilter: 'cat-perangkat',
        },
        {
          id: 'berkas-asesmen',
          label: 'Asesmen & Penilaian',
          icon: ClipboardCheck,
          categoryFilter: 'cat-asesmen',
        },
        {
          id: 'berkas-siswa',
          label: 'Administrasi Peserta Didik',
          icon: GraduationCap,
          categoryFilter: 'cat-siswa',
        },
        {
          id: 'berkas-olahraga',
          label: 'Program & Kegiatan Olahraga',
          icon: Dumbbell,
          categoryFilter: 'cat-olahraga',
        },
        {
          id: 'berkas-kepegawaian',
          label: 'Administrasi Kepegawaian',
          icon: Briefcase,
          categoryFilter: 'sub-kepegawaian',
        },
        {
          id: 'berkas-dokumentasi',
          label: 'Dokumentasi Foto & Video',
          icon: ImageIcon,
          categoryFilter: 'cat-dokumentasi',
        },
        { id: 'arsip-tahun', label: 'Arsip Berdasarkan Tahun', icon: CalendarRange },
      ],
    },
    {
      title: 'PENGELOLAAN',
      items: [
        { id: 'kategori', label: 'Kategori Berkas', icon: FolderTree },
        { id: 'profil', label: 'Profil Guru & Sekolah', icon: UserCog },
        {
          id: 'pengguna',
          label: 'Pengguna & Hak Akses',
          icon: Users,
          adminOnly: true,
        },
        {
          id: 'backup',
          label: 'Backup & Restore',
          icon: Database,
          adminOnly: true,
        },
        { id: 'ci4-export', label: 'Source Code CI4 & Migrasi', icon: Code2 },
        { id: 'pengaturan', label: 'Pengaturan Sistem', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            P
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white tracking-tight truncate">
              SI-ARSIP PJOK
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              SMA Negeri 1 Prestasi Bangsa
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(
            (item) => !item.adminOnly || currentUser.role === 'admin'
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 tracking-wider">
                {section.title}
              </div>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.categoryFilter) {
                        onSelectView(item.id, { category: item.categoryFilter });
                      } else {
                        onSelectView(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-md transition-colors text-left group ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Trash Item */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => onSelectView('trash')}
            className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-md transition-colors text-left ${
              currentView === 'trash'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Trash2 className="w-4 h-4 shrink-0 text-slate-400" />
              <span>Kotak Sampah</span>
            </div>
            {trashCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-mono tabular-nums bg-slate-800 text-rose-300 rounded border border-rose-900/60">
                {trashCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Active User Footer Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate capitalize font-mono">
              Peran: {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
