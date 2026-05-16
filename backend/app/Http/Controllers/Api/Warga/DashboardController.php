<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Warga;
use App\Models\KartuKeluarga;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

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

        // Normalisasi RT/RW
        $normalize = function($val) {
            $digits = preg_replace('/\D+/', '', $val);
            if (!$digits) return $val;
            return str_pad($digits, 2, '0', STR_PAD_LEFT);
        };

        $rt = $normalize($rt);
        $rw = $normalize($rw);

        // Statistik Demografi (Hanya untuk RT tersebut)
        $totalWarga = Warga::where('rt', $rt)->count();
        $totalKK = KartuKeluarga::where('rt', $rt)->count();
        $lakiLaki = Warga::where('rt', $rt)->where('jenis_kelamin', 'L')->count();
        $perempuan = Warga::where('rt', $rt)->where('jenis_kelamin', 'P')->count();
        $wargaTetap = Warga::where('rt', $rt)->where('status_warga', 'tetap')->count();
        $wargaDomisili = Warga::where('rt', $rt)->where('status_warga', 'pendatang')->count();
        $wargaKontrak = Warga::where('rt', $rt)->where('status_warga', 'kontrak')->count();

        // Statistik Usia
        $wargaList = Warga::where('rt', $rt)->get(['tanggal_lahir']);
        $usiaBalita = 0; $usiaAnak = 0; $usiaDewasa = 0; $usiaLansia = 0;
        $now = now();
        foreach ($wargaList as $w) {
            $age = $w->tanggal_lahir->diffInYears($now);
            if ($age <= 4) $usiaBalita++;
            elseif ($age <= 17) $usiaAnak++;
            elseif ($age <= 59) $usiaDewasa++;
            else $usiaLansia++;
        }

        // Statistik Pekerjaan
        $statistikPekerjaan = Warga::where('rt', $rt)
            ->whereNotNull('pekerjaan')
            ->select('pekerjaan', DB::raw('count(*) as total'))
            ->groupBy('pekerjaan')
            ->pluck('total', 'pekerjaan');

        // Menghitung statistik keuangan RT yang sama dengan Warga
        $totalPemasukan = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pemasukan', 'masuk'])
            ->sum('jumlah');

        $totalPengeluaran = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pengeluaran', 'keluar'])
            ->sum('jumlah');

        $saldoKas = $totalPemasukan - $totalPengeluaran;

        // Mengambil 5 riwayat transaksi terbaru
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
                'rw'   => $rw,
            ],
            'profil_warga' => [
                'id' => $profilWarga->id,
                'nik' => $profilWarga->nik,
                'nama' => $profilWarga->nama,
                'rt' => $rt,
                'rw' => $rw,
                'status_warga' => $profilWarga->status_warga,
            ],
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
                'saldo_kas'         => $saldoKas,
                'total_pemasukan'   => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
            ],
            'transaksi_terbaru' => $riwayatTransaksi
        ];

        return $this->sendResponse($data, 'Data dashboard warga berhasil dimuat.');
    }
}
