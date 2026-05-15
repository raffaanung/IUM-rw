<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class KeuanganController extends Controller
{
    // semua transaksi se-RW
    public function index(Request $request)
    {
        $query = Transaksi::with('user:id,name');

        if ($request->filled('rt')) {
            $query->where('rt', $request->rt);
        }

        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        $perPage = $request->input('limit', 15);
        $transaksi = $query
            ->orderBy('tanggal', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return $this->sendResponse(
            $transaksi,
            'Data keuangan berhasil diambil.'
        );
    }

    public function store(Request $request)
    {
        $rw = $request->user();

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'rt' => 'required|string|max:3',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->only(['judul', 'tanggal', 'jenis', 'kategori', 'jumlah', 'keterangan', 'rt']);
        if (Schema::hasColumn('transaksi', 'created_by')) {
            $data['created_by'] = $rw->id;
        }
        if (Schema::hasColumn('transaksi', 'pencatat')) {
            $data['pencatat'] = 'RW 08';
        }

        $transaksi = Transaksi::create($data);

        return $this->sendResponse($transaksi, 'Transaksi berhasil dicatat.', 201);
    }

    public function update(Request $request, $id)
    {
        $rw = $request->user();

        $transaksi = Transaksi::find($id);
        if (!$transaksi) {
            return $this->sendError('Transaksi tidak ditemukan.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string',
            'rt' => 'required|string|max:3',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->only(['judul', 'tanggal', 'jenis', 'kategori', 'jumlah', 'keterangan', 'rt']);
        if (Schema::hasColumn('transaksi', 'pencatat')) {
            $data['pencatat'] = 'RW 08';
        }
        $transaksi->update($data);

        return $this->sendResponse($transaksi, 'Transaksi berhasil diperbarui.');
    }

    public function destroy(Request $request, $id)
    {
        $rw = $request->user();

        $transaksi = Transaksi::find($id);
        if (!$transaksi) {
            return $this->sendError('Transaksi tidak ditemukan.', [], 404);
        }

        $transaksi->delete();

        return $this->sendResponse([], 'Transaksi berhasil dihapus.');
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
