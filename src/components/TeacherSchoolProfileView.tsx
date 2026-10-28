import React, { useState } from 'react';
import {
  User,
  School,
  Save,
  Printer,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { TeacherProfile, SchoolProfile, User as UserType } from '../types';
import { StorageService } from '../services/storageService';

interface TeacherSchoolProfileViewProps {
  currentUser: UserType;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const TeacherSchoolProfileView: React.FC<TeacherSchoolProfileViewProps> = ({
  currentUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'guru' | 'sekolah' | 'lembar_cetak'>('guru');

  const [teacher, setTeacher] = useState<TeacherProfile>(StorageService.getTeacherProfile());
  const [school, setSchool] = useState<SchoolProfile>(StorageService.getSchoolProfile());

  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateTeacherProfile(teacher);
    showToast('Profil guru PJOK berhasil diperbarui.');
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.updateSchoolProfile(school);
    showToast('Identitas sekolah berhasil diperbarui.');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'guru'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil Guru PJOK</span>
        </button>
        <button
          onClick={() => setActiveTab('sekolah')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'sekolah'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Identitas Sekolah</span>
        </button>
        <button
          onClick={() => setActiveTab('lembar_cetak')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'lembar_cetak'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Lembar Biodata Resmi (Cetak)</span>
        </button>
      </div>

      {/* TAB 1: GURU PROFILE */}
      {activeTab === 'guru' && (
        <form onSubmit={handleSaveTeacher} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
              {teacher.fotoProfil ? (
                <img
                  src={teacher.fotoProfil}
                  alt={teacher.namaGuru}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-blue-100 text-blue-700 font-bold text-2xl flex items-center justify-center">
                  PJOK
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-blue-700">
                  Guru Mata Pelajaran PJOK
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {teacher.namaGuru}
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  NIP. {teacher.nip} · NUPTK: {teacher.nuptk}
                </div>
                <div className="text-xs text-slate-600 font-medium pt-1">
                  {teacher.pangkatGolongan} ({teacher.jabatan})
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={teacher.namaGuru}
                  onChange={(e) => setTeacher({ ...teacher, namaGuru: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  value={teacher.nip}
                  onChange={(e) => setTeacher({ ...teacher, nip: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  NUPTK
                </label>
                <input
                  type="text"
                  value={teacher.nuptk}
                  onChange={(e) => setTeacher({ ...teacher, nuptk: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Status Kepegawaian
                </label>
                <select
                  value={teacher.statusKepegawaian}
                  onChange={(e) => setTeacher({ ...teacher, statusKepegawaian: e.target.value as any })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                  <option value="PPPK">Pegawai Pemerintah dengan Perjanjian Kerja (PPPK)</option>
                  <option value="GTT">Guru Tidak Tetap (GTT / Honorer)</option>
                  <option value="Guru Tetap Yayasan">Guru Tetap Yayasan (GTY)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Pangkat / Golongan Ruang
                </label>
                <input
                  type="text"
                  value={teacher.pangkatGolongan}
                  onChange={(e) => setTeacher({ ...teacher, pangkatGolongan: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Jabatan Fungsional
                </label>
                <input
                  type="text"
                  value={teacher.jabatan}
                  onChange={(e) => setTeacher({ ...teacher, jabatan: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Email Guru
                </label>
                <input
                  type="email"
                  value={teacher.email}
                  onChange={(e) => setTeacher({ ...teacher, email: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={teacher.nomorTelepon}
                  onChange={(e) => setTeacher({ ...teacher, nomorTelepon: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Pendidikan Terakhir
                </label>
                <input
                  type="text"
                  value={teacher.pendidikanTerakhir}
                  onChange={(e) => setTeacher({ ...teacher, pendidikanTerakhir: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Jurusan / Program Studi
                </label>
                <input
                  type="text"
                  value={teacher.jurusan}
                  onChange={(e) => setTeacher({ ...teacher, jurusan: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Tugas Tambahan di Sekolah
                </label>
                <input
                  type="text"
                  value={teacher.tugasTambahan}
                  onChange={(e) => setTeacher({ ...teacher, tugasTambahan: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Alamat Rumah
                </label>
                <input
                  type="text"
                  value={teacher.alamat}
                  onChange={(e) => setTeacher({ ...teacher, alamat: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Profil Guru</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SEKOLAH PROFILE */}
      {activeTab === 'sekolah' && (
        <form onSubmit={handleSaveSchool} className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
              {school.logoUrl ? (
                <img
                  src={school.logoUrl}
                  alt={school.namaSekolah}
                  referrerPolicy="no-referrer"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-2xl flex items-center justify-center">
                  SMA
                </div>
              )}
              <div className="space-y-1">
                <div className="text-xs font-semibold text-blue-700">
                  Identitas Satuan Pendidikan
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {school.namaSekolah}
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  NPSN: {school.npsn} · Akreditasi: {school.akreditasi}
                </div>
                <div className="text-xs text-slate-600">
                  Kepala Sekolah: <strong>{school.kepalaSekolah}</strong> (NIP. {school.nipKepalaSekolah})
                </div>
              </div>
            </div>

            {/* School Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 text-xs">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Resmi Sekolah
                </label>
                <input
                  type="text"
                  value={school.namaSekolah}
                  onChange={(e) => setSchool({ ...school, namaSekolah: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nomor Pokok Sekolah Nasional (NPSN)
                </label>
                <input
                  type="text"
                  value={school.npsn}
                  onChange={(e) => setSchool({ ...school, npsn: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={school.kepalaSekolah}
                  onChange={(e) => setSchool({ ...school, kepalaSekolah: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={school.nipKepalaSekolah}
                  onChange={(e) => setSchool({ ...school, nipKepalaSekolah: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Status Akreditasi
                </label>
                <input
                  type="text"
                  value={school.akreditasi}
                  onChange={(e) => setSchool({ ...school, akreditasi: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Nomor Telepon Sekolah
                </label>
                <input
                  type="text"
                  value={school.telepon}
                  onChange={(e) => setSchool({ ...school, telepon: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Alamat Jalan Lengkap
                </label>
                <input
                  type="text"
                  value={school.alamat}
                  onChange={(e) => setSchool({ ...school, alamat: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Kecamatan / Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={`${school.kecamatan}, ${school.kabupaten}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(',');
                    setSchool({
                      ...school,
                      kecamatan: parts[0]?.trim() || '',
                      kabupaten: parts[1]?.trim() || '',
                    });
                  }}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={school.provinsi}
                  onChange={(e) => setSchool({ ...school, provinsi: e.target.value })}
                  className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Identitas Sekolah</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: LEMBAR BIODATA RESMI (PRINTABLE) */}
      {activeTab === 'lembar_cetak' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF Lembar Biodata</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-300 p-8 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6 text-slate-900">
            {/* Kop Surat Sekolah */}
            <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1">
              <h2 className="text-xs uppercase tracking-widest font-semibold text-slate-700">
                Pemerintah Daerah Provinsi {school.provinsi}
              </h2>
              <h1 className="text-lg font-black uppercase text-slate-900 tracking-tight">
                {school.namaSekolah}
              </h1>
              <p className="text-[11px] text-slate-600">
                {school.alamat}, {school.kecamatan}, {school.kabupaten} — NPSN: {school.npsn}
              </p>
            </div>

            {/* Judul Lembar */}
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold uppercase underline tracking-wider">
                LEMBAR BIODATA & IDENTITAS GURU PJOK
              </h3>
              <p className="text-[11px] text-slate-500">
                Dokumen Kelengkapan Administrasi & Portofolio Pembelajaran
              </p>
            </div>

            {/* Foto & Biodata Grid */}
            <div className="flex items-start gap-6 pt-2">
              <div className="w-32 h-40 border border-slate-300 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-slate-50">
                {teacher.fotoProfil ? (
                  <img
                    src={teacher.fotoProfil}
                    alt={teacher.namaGuru}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-slate-400">Pas Foto 3x4</span>
                )}
              </div>

              <div className="flex-1 space-y-2 text-xs">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600 w-44">Nama Lengkap Guru</td>
                      <td className="py-1.5 font-bold text-slate-900">: {teacher.namaGuru}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">NIP</td>
                      <td className="py-1.5 font-mono">: {teacher.nip}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">NUPTK</td>
                      <td className="py-1.5 font-mono">: {teacher.nuptk}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Status Kepegawaian</td>
                      <td className="py-1.5">: {teacher.statusKepegawaian}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Pangkat / Golongan</td>
                      <td className="py-1.5">: {teacher.pangkatGolongan}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Jabatan</td>
                      <td className="py-1.5">: {teacher.jabatan}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Mata Pelajaran Diampu</td>
                      <td className="py-1.5 font-bold">: {teacher.mataPelajaran}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Tugas Tambahan</td>
                      <td className="py-1.5">: {teacher.tugasTambahan}</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-semibold text-slate-600">Pendidikan Terakhir</td>
                      <td className="py-1.5">: {teacher.pendidikanTerakhir} ({teacher.jurusan})</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tanda Tangan Validasi */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-xs text-center">
              <div className="space-y-16">
                <div>
                  Mengetahui,<br />
                  Kepala {school.namaSekolah}
                </div>
                <div>
                  <strong className="underline">{school.kepalaSekolah}</strong>
                  <div className="text-[11px] text-slate-600 font-mono">
                    NIP. {school.nipKepalaSekolah}
                  </div>
                </div>
              </div>

              <div className="space-y-16">
                <div>
                  {school.kabupaten}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
                  Guru Mata Pelajaran PJOK
                </div>
                <div>
                  <strong className="underline">{teacher.namaGuru}</strong>
                  <div className="text-[11px] text-slate-600 font-mono">
                    NIP. {teacher.nip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
