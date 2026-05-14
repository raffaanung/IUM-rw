<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Warga;
use App\Models\KartuKeluarga;
use App\Models\Transaksi;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $admin = $request->user();
        $rt = $admin->rt;

        if (!$rt) {
            return $this->sendError('Data RT untuk Admin ini belum diatur.', [], 400);
        }

        $totalWarga = Warga::where('rt', $rt)->count();
        $totalKK = KartuKeluarga::whereHas('kepalaKeluarga', function($q) use ($rt) {
             $q->where('rt', $rt);
        })->count();

        $lakiLaki = Warga::where('rt', $rt)->where('jenis_kelamin', 'Laki-laki')->count();
        $perempuan = Warga::where('rt', $rt)->where('jenis_kelamin', 'Perempuan')->count();
        $wargaTetap = Warga::where('rt', $rt)->where('status_warga', 'Tetap')->count();
        $wargaPendatang = Warga::where('rt', $rt)->where('status_warga', 'Pendatang')->count();

        $usiaBalita = Warga::where('rt', $rt)->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) <= 4')->count();
        $usiaAnak = Warga::where('rt', $rt)->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 5 AND 17')->count();
        $usiaDewasa = Warga::where('rt', $rt)->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 18 AND 59')->count();
        $usiaLansia = Warga::where('rt', $rt)->whereRaw('TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60')->count();

        $statistikPekerjaan = Warga::where('rt', $rt)
            ->whereNotNull('pekerjaan')
            ->select('pekerjaan', DB::raw('count(*) as total'))
            ->groupBy('pekerjaan')
            ->pluck('total', 'pekerjaan');

        $totalPemasukan = Transaksi::where('rt', $rt)->where('jenis_transaksi', 'masuk')->sum('nominal');
        $totalPengeluaran = Transaksi::where('rt', $rt)->where('jenis_transaksi', 'keluar')->sum('nominal');
        $saldoKas = $totalPemasukan - $totalPengeluaran;

        $transaksiTerbaru = Transaksi::where('rt', $rt)
            ->orderBy('tanggal_transaksi', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get();

        $data = [
            'rt' => $rt,
            'summary' => [
                'total_kk' => $totalKK,
                'total_warga' => $totalWarga,
            ],
            'demografi' => [
                'jenis_kelamin' => [
                    'laki_laki' => $lakiLaki,
                    'perempuan' => $perempuan,
                ],
                'status_kependudukan' => [
                    'tetap' => $wargaTetap,
                    'pendatang' => $wargaPendatang,
                ],
                'distribusi_usia' => [
                    'balita_0_4' => $usiaBalita,
                    'anak_5_17' => $usiaAnak,
                    'dewasa_18_59' => $usiaDewasa,
                    'lansia_60_plus' => $usiaLansia,
                ],
                'pekerjaan' => $statistikPekerjaan
            ],
            'keuangan' => [
                'saldo_kas' => $saldoKas,
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
            ],
            'transaksi_terbaru' => $transaksiTerbaru
        ];

        return $this->sendResponse($data, 'Data dashboard RT berhasil dimuat.');
    }
}