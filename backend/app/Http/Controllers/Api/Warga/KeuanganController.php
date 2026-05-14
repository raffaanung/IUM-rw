<?php

namespace App\Http\Controllers\Api\Warga;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;

class KeuanganController extends Controller
{
    /**
     * Menampilkan laporan transaksi keuangan RT secara keseluruhan (Read Only)
     * Lengkap dengan perhitungan statistik agregat, search, filter, dan pagination
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $profilWarga = $user->warga;

        if (!$profilWarga) {
            return $this->sendError('Profil warga tidak ditemukan.', [], 400);
        }

        $rt = $profilWarga->rt;
        $rw = $profilWarga->rw;

        // Query Dasar Keuangan untuk RT tersebut
        $query = Transaksi::with(['pencatat:id,name'])->where('rt', $rt)->where('rw', $rw);

        // Filter: Search Keterangan/Nama Transaksi
        if ($request->filled('search')) {
            $query->where('nama_transaksi', 'LIKE', '%' . $request->search . '%');
        }

        // Filter: Berdasarkan Kategori (Iuran, Sosial, Operasional, dll)
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }

        // Filter: Jenis Transaksi (Masuk / Keluar)
        if ($request->filled('jenis_transaksi')) {
            $query->where('jenis_transaksi', $request->jenis_transaksi);
        }

        // Filter: Bulan & Tahun (Opsional jika frontend menyediakan filter periode)
        if ($request->filled('bulan') && $request->filled('tahun')) {
            $query->whereMonth('tanggal_transaksi', $request->bulan)
                  ->whereYear('tanggal_transaksi', $request->tahun);
        }

        // Eksekusi Pagination
        $perPage = $request->input('limit', 15);
        $transaksiList = $query->orderBy('tanggal_transaksi', 'desc')
                               ->orderBy('id', 'desc')
                               ->paginate($perPage);

        // Agregasi Data (Total Kas) yang tidak terpengaruh filter table pagination
        // Mengambil kas total RT sepanjang masa atau berdasarkan filter tahun jika diperlukan
        $totalPemasukan = Transaksi::where('rt', $rt)->where('rw', $rw)->where('jenis_transaksi', 'masuk')->sum('nominal');
        $totalPengeluaran = Transaksi::where('rt', $rt)->where('rw', $rw)->where('jenis_transaksi', 'keluar')->sum('nominal');
        $totalKas = $totalPemasukan - $totalPengeluaran;

        // Format Ulang Collection (Menyertakan nama pencatat dari relasi User Admin)
        $transaksiList->getCollection()->transform(function ($item) {
            return [
                'id'                => $item->id,
                'tanggal_transaksi' => $item->tanggal_transaksi,
                'nama_transaksi'    => $item->nama_transaksi,
                'kategori'          => $item->kategori,
                'jenis_transaksi'   => $item->jenis_transaksi,
                'nominal'           => $item->nominal,
                'pencatat'          => $item->pencatat ? $item->pencatat->name : 'Sistem',
            ];
        });

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