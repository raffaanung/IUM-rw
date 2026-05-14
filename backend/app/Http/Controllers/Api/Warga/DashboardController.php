<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;

class DashboardController extends Controller
{
    /**
     * Menampilkan ringkasan data dashboard warga (Read Only)
     */
    public function summary(Request $request)
    {
        $user = $request->user();
        $profilWarga = $user->warga;

        // Validasi: Pastikan user memiliki data warga dan terikat dengan RT
        if (!$profilWarga) {
            return $this->sendError('Data profil warga Anda belum lengkap. Silakan hubungi admin RT.', [], 400);
        }

        $rt = $profilWarga->rt;
        $rw = $profilWarga->rw;

        // Menghitung statistik keuangan RT yang sama dengan Warga
        $totalPemasukan = Transaksi::where('rt', $rt)
            ->where('rw', $rw)
            ->where('jenis_transaksi', 'masuk')
            ->sum('nominal');

        $totalPengeluaran = Transaksi::where('rt', $rt)
            ->where('rw', $rw)
            ->where('jenis_transaksi', 'keluar')
            ->sum('nominal');

        $saldoKas = $totalPemasukan - $totalPengeluaran;

        // Mengambil 5 riwayat transaksi terbaru (terakhir)
        $riwayatTransaksi = Transaksi::where('rt', $rt)
            ->where('rw', $rw)
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        // Data yang dikirim ke frontend
        $data = [
            'user' => [
                'nama' => $profilWarga->nama,
                'rt'   => $rt,
                'rw'   => $rw,
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