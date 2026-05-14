<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\KartuKeluarga;
use Illuminate\Http\Request;

class KartuKeluargaController extends Controller
{
    // semua KK se-RW
    public function index(Request $request)
    {
        $query = KartuKeluarga::query();

        if ($request->filled('rt')) {
            $query->where('rt', $request->rt);
        }

        $kk = $query
            ->orderBy('rt')
            ->paginate(10);

        return $this->sendResponse(
            $kk,
            'Data kartu keluarga berhasil diambil.'
        );
    }

    // detail KK
    public function show($id)
    {
        $kk = KartuKeluarga::findOrFail($id);

        return $this->sendResponse(
            $kk,
            'Detail kartu keluarga berhasil diambil.'
        );
    }
}