<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use App\Models\Warga;
use Illuminate\Support\Facades\Schema;

class KeuanganController extends Controller
{
    /**
     * Menampilkan laporan transaksi keuangan RT secara keseluruhan (Read Only)
     * Lengkap dengan perhitungan statistik agregat, search, filter, dan pagination
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $profilWarga = null;

        // Cari profil warga untuk mendapatkan RT/RW
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan atau data belum lengkap.', [], 400);
        }

        $rt = trim($profilWarga->rt);
        $rw = trim($profilWarga->rw);

        // Normalisasi RT/RW (hapus non-digit dan pastikan 2 digit)
        $normalize = function($val) {
            $digits = preg_replace('/\D+/', '', $val);
            if (!$digits) return $val;
            return str_pad($digits, 2, '0', STR_PAD_LEFT);
        };

        $rt = $normalize($rt);
        $rw = $normalize($rw);

        // Query Dasar Keuangan untuk RT tersebut
        $query = Transaksi::with('user:id,name')->where('rt', $rt);

        // Filter: Search Keterangan/Nama Transaksi
        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($q) use ($term) {
                $q->where('judul', 'LIKE', '%' . $term . '%')
                  ->orWhere('keterangan', 'LIKE', '%' . $term . '%')
                  ->orWhere('kategori', 'LIKE', '%' . $term . '%');
            });
        }

        // Filter: Berdasarkan Kategori
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter: Berdasarkan Jenis
        if ($request->filled('jenis')) {
            $jenis = $request->jenis;
            if ($jenis === 'masuk') $jenis = 'pemasukan';
            if ($jenis === 'keluar') $jenis = 'pengeluaran';
            $query->where('jenis', $jenis);
        }

        $perPage = $request->input('limit', 10);
        $transaksiList = $query->orderBy('tanggal', 'desc')
                               ->orderBy('id', 'desc')
                               ->paginate($perPage);

        // Perhitungan Statistik
        $totalPemasukan = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pemasukan', 'masuk'])
            ->sum('jumlah');
            
        $totalPengeluaran = Transaksi::where('rt', $rt)
            ->whereIn('jenis', ['pengeluaran', 'keluar'])
            ->sum('jumlah');
            
        $totalKas = $totalPemasukan - $totalPengeluaran;

        // Format data untuk frontend
        $formattedData = collect($transaksiList->items())->map(function ($item) {
            return [
                'id' => $item->id,
                'tanggal' => $item->tanggal ? $item->tanggal->format('Y-m-d') : null,
                'keterangan' => $item->judul,
                'kategori' => $item->kategori,
                'jenis' => $item->jenis === 'pengeluaran' ? 'keluar' : ($item->jenis === 'pemasukan' ? 'masuk' : $item->jenis),
                'jumlah' => $item->jumlah,
                'rt' => $item->rt,
                'pencatat' => $item->user ? $item->user->name : ($item->pencatat ?? 'Sistem'),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Laporan keuangan RT berhasil diambil.',
            'statistik' => [
                'total_kas'         => (float) $totalKas,
                'total_pemasukan'   => (float) $totalPemasukan,
                'total_pengeluaran' => (float) $totalPengeluaran,
                'rt'                => $rt,
            ],
            'data' => $formattedData,
            'meta' => [
                'rt' => $rt,
                'rw' => $rw,
            ],
            'pagination' => [
                'current_page' => $transaksiList->currentPage(),
                'per_page'     => $transaksiList->perPage(),
                'total_data'   => $transaksiList->total(),
                'total_pages'  => $transaksiList->lastPage(),
                'has_more'     => $transaksiList->hasMorePages(),
            ]
        ], 200);
    }
}
