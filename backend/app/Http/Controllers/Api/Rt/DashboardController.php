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
        $totalKK = KartuKeluarga::where('rt', $rt)->count();

        $lakiLaki = Warga::where('rt', $rt)->where('jenis_kelamin', 'L')->count();
        $perempuan = Warga::where('rt', $rt)->where('jenis_kelamin', 'P')->count();
        $wargaTetap = Warga::where('rt', $rt)->where('status_warga', 'tetap')->count();
        $wargaDomisili = Warga::where('rt', $rt)->where('status_warga', 'pendatang')->count();
        $wargaKontrak = Warga::where('rt', $rt)->where('status_warga', 'kontrak')->count();

        // Calculate ages in PHP to be database-agnostic
        $warga = Warga::where('rt', $rt)->get(['tanggal_lahir']);
        $usiaBalita = 0;
        $usiaAnak = 0;
        $usiaDewasa = 0;
        $usiaLansia = 0;

        $now = now();
        foreach ($warga as $w) {
            $age = $w->tanggal_lahir->diffInYears($now);
            if ($age <= 4) $usiaBalita++;
            elseif ($age <= 17) $usiaAnak++;
            elseif ($age <= 59) $usiaDewasa++;
            else $usiaLansia++;
        }

        $statistikPekerjaan = Warga::where('rt', $rt)
            ->whereNotNull('pekerjaan')
            ->select('pekerjaan', DB::raw('count(*) as total'))
            ->groupBy('pekerjaan')
            ->pluck('total', 'pekerjaan');

        $totalPemasukan = Transaksi::where('rt', $rt)
            ->where('jenis', 'pemasukan')
            ->sum('jumlah');
            
        $totalPengeluaran = Transaksi::where('rt', $rt)
            ->where('jenis', 'pengeluaran')
            ->sum('jumlah');
            
        $saldoKas = $totalPemasukan - $totalPengeluaran;

        $transaksiTerbaru = Transaksi::with('user:id,name')->where('rt', $rt)
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'keterangan' => $t->judul,
                    'tanggal' => $t->tanggal,
                    'jenis' => $t->jenis,
                    'jumlah' => $t->jumlah,
                    'kategori' => $t->kategori,
                    'rt' => $t->rt,
                    'pencatat' => $t->user ? $t->user->name : ($t->pencatat ?? 'Sistem'),
                ];
            });

        $data = [
            'statistik' => [
                'total_warga' => $totalWarga,
                'total_kk'    => $totalKK,
                'laki_laki'   => $lakiLaki,
                'perempuan'   => $perempuan,
                'tetap'       => $wargaTetap,
                'domisili'    => $wargaDomisili,
                'kontrak'     => $wargaKontrak,
                'pendatang'   => $wargaDomisili,
            ],
            'usia' => [
                'balita'  => $usiaBalita,
                'anak'    => $usiaAnak,
                'dewasa'  => $usiaDewasa,
                'lansia'  => $usiaLansia,
            ],
            'pekerjaan' => $statistikPekerjaan,
            'keuangan' => [
                'pemasukan'   => $totalPemasukan,
                'pengeluaran' => $totalPengeluaran,
                'saldo'       => $saldoKas,
            ],
            'transaksi_terbaru' => $transaksiTerbaru
        ];

        return $this->sendResponse($data, 'Ringkasan dashboard RT berhasil diambil.');
    }
}
