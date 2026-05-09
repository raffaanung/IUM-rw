<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaksi;

class TransaksiController extends Controller
{
    // Ambil semua transaksi
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'rt') {
            // RT hanya lihat transaksi RT-nya
            $transaksi = Transaksi::where('kategori', 'rt')
                                  ->where('rt', $user->rt)
                                  ->orderBy('tanggal', 'desc')
                                  ->get();
        } elseif ($user->role === 'warga') {
            // Warga hanya lihat transaksi RT-nya
            $transaksi = Transaksi::where('kategori', 'rt')
                                  ->where('rt', $user->rt)
                                  ->orderBy('tanggal', 'desc')
                                  ->get();
        } else {
            // RW lihat semua
            $transaksi = Transaksi::orderBy('tanggal', 'desc')->get();
        }

        $saldo = $transaksi->sum(function ($t) {
            return $t->jenis === 'pemasukan' ? $t->jumlah : -$t->jumlah;
        });

        return response()->json([
            'transaksi' => $transaksi,
            'saldo'     => $saldo
        ]);
    }

    // Tambah transaksi
    public function store(Request $request)
    {
        $request->validate([
            'judul'      => 'required|string',
            'keterangan' => 'nullable|string',
            'jumlah'     => 'required|integer|min:1',
            'jenis'      => 'required|in:pemasukan,pengeluaran',
            'kategori'   => 'required|in:rw,rt',
            'rt'         => 'nullable|string',
            'tanggal'    => 'required|date',
        ]);

        $transaksi = Transaksi::create([
            'judul'      => $request->judul,
            'keterangan' => $request->keterangan,
            'jumlah'     => $request->jumlah,
            'jenis'      => $request->jenis,
            'kategori'   => $request->kategori,
            'rt'         => $request->rt,
            'tanggal'    => $request->tanggal,
            'created_by' => $request->user()->id,
        ]);

        return response()->json([
            'message'   => 'Transaksi berhasil ditambahkan',
            'transaksi' => $transaksi
        ], 201);
    }

    // Edit transaksi
    public function update(Request $request, $id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        $request->validate([
            'judul'      => 'sometimes|string',
            'keterangan' => 'nullable|string',
            'jumlah'     => 'sometimes|integer|min:1',
            'jenis'      => 'sometimes|in:pemasukan,pengeluaran',
            'kategori'   => 'sometimes|in:rw,rt',
            'rt'         => 'nullable|string',
            'tanggal'    => 'sometimes|date',
        ]);

        $transaksi->update($request->all());

        return response()->json([
            'message'   => 'Transaksi berhasil diupdate',
            'transaksi' => $transaksi
        ]);
    }

    // Hapus transaksi
    public function destroy($id)
    {
        $transaksi = Transaksi::find($id);

        if (!$transaksi) {
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        $transaksi->delete();

        return response()->json([
            'message' => 'Transaksi berhasil dihapus'
        ]);
    }
}