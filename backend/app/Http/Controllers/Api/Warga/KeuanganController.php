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
        if (Schema::hasColumn('users', 'warga_id') && $user->warga_id) {
            $profilWarga = Warga::where('id', $user->warga_id)->first();
        }
        if (!$profilWarga && $user->nik) {
            $profilWarga = Warga::where('nik', $user->nik)->first();
        }

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan.', [], 400);
        }

        $rt = $profilWarga->rt;
        $rw = $profilWarga->rw;

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

        // Filter: Berdasarkan Kategori (Iuran, Sosial, Operasional, dll)
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        if ($request->filled('jenis')) {
            $jenis = $request->jenis;
            if ($jenis === 'masuk') $jenis = 'pemasukan';
            if ($jenis === 'keluar') $jenis = 'pengeluaran';
            $query->where('jenis', $jenis);
        }

        $transaksiList = $query->orderBy('tanggal_transaksi', 'desc')
                               ->orderBy('id', 'desc')
        $transaksiList = $query->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
        // Mengambil kas total RT sepanjang masa atau berdasarkan filter tahun jika diperlukan
        $totalPemasukan = Transaksi::where('rt', $rt)->where('rw', $rw)->where('jenis_transaksi', 'masuk')->sum('nominal');
        $totalPengeluaran = Transaksi::where('rt', $rt)->where('rw', $rw)->where('jenis_transaksi', 'keluar')->sum('nominal');
        $totalPemasukan = Transaksi::where('rt', $rt)->whereIn('jenis', ['pemasukan', 'masuk'])->sum('jumlah');
        $totalPengeluaran = Transaksi::where('rt', $rt)->whereIn('jenis', ['pengeluaran', 'keluar'])->sum('jumlah');
        // Format Ulang Collection (Menyertakan nama pencatat dari relasi User Admin)
        $transaksiList->getCollection()->transform(function ($item) {
        $transaksiList->getCollection()->transform(function ($item) {
                'tanggal_transaksi' => $item->tanggal_transaksi,
                'id' => $item->id,
                'tanggal' => $item->tanggal,
                'keterangan' => $item->judul,
                'kategori' => $item->kategori,
                'jenis' => $item->jenis === 'pengeluaran' ? 'keluar' : ($item->jenis === 'pemasukan' ? 'masuk' : $item->jenis),
                'jumlah' => $item->jumlah,
                'rt' => $item->rt,
                'pencatat' => $item->user ? $item->user->name : ($item->pencatat ?? 'Sistem'),

        // Buat custom response yg menggabungkan statistik keuangan + pagination
        return response()->json([
            'success' => true,
            'message' => 'Laporan keuangan RT berhasil diambil.',
            'statistik' => [
                'total_kas'         => $totalKas,
                'total_pemasukan'   => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
            ],
            'data' => $transaksiList->items(),
                'rt'                => $rt,
                'rw'                => '08',
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
    }
}
