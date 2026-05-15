<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Warga;
use Illuminate\Support\Facades\Schema;

class DashboardController extends Controller
{
    /**
     * Menampilkan ringkasan data dashboard warga (Read Only)
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $profilWarga = null;
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        // Validasi: Pastikan user memiliki data warga dan terikat dengan RT
        if (!$profilWarga) {
            return $this->sendError('Data profil warga Anda belum lengkap. Silakan hubungi admin RT.', [], 400);
        }

        $rt = $profilWarga->rt;
        $rw = $profilWarga->rw;

        // Menghitung statistik keuangan RT yang sama dengan Warga
        $totalPemasukan = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pemasukan', 'masuk'])
            ->sum('jumlah');

        $totalPengeluaran = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pengeluaran', 'keluar'])
            ->sum('jumlah');

        $saldoKas = $totalPemasukan - $totalPengeluaran;

        // Mengambil 5 riwayat transaksi terbaru (terakhir)
        $riwayatTransaksi = Transaksi::with('user:id,name')->where('rt', $rt)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'tanggal' => $t->tanggal,
                    'keterangan' => $t->judul,
                    'kategori' => $t->kategori,
                    'jenis' => $t->jenis === 'pengeluaran' ? 'keluar' : ($t->jenis === 'pemasukan' ? 'masuk' : $t->jenis),
                    'jumlah' => $t->jumlah,
                    'rt' => $t->rt,
                    'pencatat' => $t->user ? $t->user->name : ($t->pencatat ?? 'Sistem'),
                ];
            });

        // Data yang dikirim ke frontend
        $data = [
            'user' => [
                'nama' => $profilWarga->nama,
                'rt'   => $rt,
                'rw'   => '08',
            ],
            'profil_warga' => [
                'id' => $profilWarga->id,
                'nik' => $profilWarga->nik,
                'nama' => $profilWarga->nama,
                'rt' => $profilWarga->rt,
                'rw' => $profilWarga->rw,
                'status_warga' => $profilWarga->status_warga,
            ],
            'keuangan' => [
                'saldo_kas'         => $saldoKas,
                'total_pemasukan'   => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
            ],
            'transaksi_terbaru' => $riwayatTransaksi
        ];

        return $this->sendResponse($data, 'Data dashboard warga berhasil dimuat.');
    }
}
