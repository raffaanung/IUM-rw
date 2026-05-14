<?php

namespace App\Http\Controllers\Api\Rt;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Transaksi;
use Illuminate\Support\Facades\Validator;

class KeuanganController extends Controller
{
    public function index(Request $request)
    {
        $admin = $request->user();
        $query = Transaksi::with('user:id,name')->where('rt', $admin->rt);

        if ($request->filled('search')) {
            $query->where('judul', 'LIKE', "%{$request->search}%");
        }
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }
        if ($request->filled('jenis')) {
            $query->where('jenis', $request->jenis);
        }

        $perPage = $request->input('limit', 15);
        $transaksiList = $query->orderBy('tanggal', 'desc')->orderBy('id', 'desc')->paginate($perPage);

        return $this->sendPaginatedResponse($transaksiList, 'Data transaksi berhasil diambil.');
    }

    public function store(Request $request)
    {
        $admin = $request->user();

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->all();
        $data['rt'] = $admin->rt;
        $data['created_by'] = $admin->id;

        $transaksi = Transaksi::create($data);

        return $this->sendResponse($transaksi, 'Transaksi berhasil dicatat.', 201);
    }

    public function update(Request $request, $id)
    {
        $admin = $request->user();
        
        $transaksi = Transaksi::where('id', $id)->where('rt', $admin->rt)->first();

        if (!$transaksi) {
            return $this->sendError('Transaksi tidak ditemukan di RT Anda.', [], 404);
        }

        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'tanggal' => 'required|date',
            'jenis' => 'required|in:pemasukan,pengeluaran',
            'kategori' => 'required|string',
            'jumlah' => 'required|numeric|min:1',
            'keterangan' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validasi Error.', $validator->errors(), 422);
        }

        $data = $request->only([
            'judul', 'tanggal', 'jenis', 'kategori', 'jumlah', 'keterangan'
        ]);

        $transaksi->update($data);

        return $this->sendResponse($transaksi, 'Transaksi berhasil diperbarui.');
    }
    
    public function destroy(Request $request, $id)
    {
         $admin = $request->user();
         $transaksi = Transaksi::where('id', $id)->where('rt', $admin->rt)->first();
         
         if (!$transaksi) {
             return $this->sendError('Transaksi tidak ditemukan di RT Anda.', [], 404);
         }
         
         $transaksi->delete();
         return $this->sendResponse([], 'Transaksi berhasil dihapus.');
    }
}