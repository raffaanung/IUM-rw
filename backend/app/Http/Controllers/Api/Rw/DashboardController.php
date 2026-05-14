<?php

namespace App\Http\Controllers\Api\Rw;

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
        // =========================
        // STATISTIK DEMOGRAFI
        // =========================
        $totalWarga = Warga::count();

        $lakiLaki = Warga::where('jenis_kelamin', 'L')->count();

        $perempuan = Warga::where('jenis_kelamin', 'P')->count();

        $wargaTetap = Warga::where('status_warga', 'tetap')->count();

        $wargaDomisili = Warga::where('status_warga', 'pendatang')->count();

        $wargaKontrak = Warga::where('status_warga', 'kontrak')->count();

        // =========================
        // SEBARAN RT
        // =========================
        $sebaranRT = Warga::select(
                'rt',
                DB::raw('count(*) as total_warga')
            )
            ->groupBy('rt')
            ->orderBy('rt')
            ->get()
            ->map(function ($item) {

                $totalKK = KartuKeluarga::where('rt', $item->rt)->count();

                return [
                    'rt'     => 'RT ' . $item->rt,
                    'warga'  => $item->total_warga,
                    'kk'     => $totalKK,
                ];
            });

        // =========================
        // TOTAL KK
        // =========================
        $totalKK = KartuKeluarga::count();

        // =========================
        // KEUANGAN
        // =========================
        $totalPemasukan = Transaksi::where('jenis', 'masuk')
            ->sum('jumlah');

        $totalPengeluaran = Transaksi::where('jenis', 'keluar')
            ->sum('jumlah');

        $saldoKas = $totalPemasukan - $totalPengeluaran;

        // =========================
        // TRANSAKSI TERBARU
        // =========================
        $transaksiTerbaru = Transaksi::with('user:id,name')
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($t) {

                return [
                    'id'          => $t->id,
                    'keterangan'  => $t->judul,
                    'tanggal'     => $t->tanggal,
                    'jenis'       => $t->jenis,
                    'jumlah'      => $t->jumlah,
                    'rt'          => $t->rt,
                    'pencatat'    => $t->user
                        ? $t->user->name
                        : 'Sistem',
                ];
            });

        // =========================
        // FINAL RESPONSE
        // =========================
        $data = [

            'demografi' => [
                'total'        => $totalWarga,
                'laki_laki'    => $lakiLaki,
                'perempuan'    => $perempuan,
                'tetap'        => $wargaTetap,
                'domisili'     => $wargaDomisili,
                'kontrak'      => $wargaKontrak,
            ],

            'sebaran_rt' => $sebaranRT,

            'total_kk' => $totalKK,

            'keuangan' => [
                'saldo'   => $saldoKas,
                'masuk'   => $totalPemasukan,
                'keluar'  => $totalPengeluaran,
            ],

            'transaksi_terbaru' => $transaksiTerbaru,
        ];

        return $this->sendResponse(
            $data,
            'Data dashboard RW berhasil dimuat.'
        );
    }
}