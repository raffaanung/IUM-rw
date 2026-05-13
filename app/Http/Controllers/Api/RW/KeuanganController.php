<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use Illuminate\Http\Request;

class KeuanganController extends Controller
{
    // semua transaksi se-RW
    public function index(Request $request)
    {
        $query = Transaksi::query();

        if ($request->filled('rt')) {
            $query->where('rt', $request->rt);
        }

        if ($request->filled('jenis')) {
            $query->where('jenis_transaksi', $request->jenis);
        }

        $transaksi = $query
            ->orderBy('tanggal_transaksi', 'desc')
            ->paginate(10);

        return $this->sendResponse(
            $transaksi,
            'Data keuangan berhasil diambil.'
        );
    }

    // detail transaksi
    public function show($id)
    {
        $transaksi = Transaksi::findOrFail($id);

        return $this->sendResponse(
            $transaksi,
            'Detail transaksi berhasil diambil.'
        );
    }
}