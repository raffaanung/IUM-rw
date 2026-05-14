<?php

namespace App\Http\Controllers\Api\Rw;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AdminController extends Controller
{
    // semua akun RT
    public function index()
    {
        $admins = User::where('role', 'rt')
            ->orderBy('rt')
            ->get();

        return $this->sendResponse(
            $admins,
            'Data admin RT berhasil diambil.'
        );
    }

    // detail admin RT
    public function show($id)
    {
        $admin = User::where('role', 'rt')
            ->findOrFail($id);

        return $this->sendResponse(
            $admin,
            'Detail admin RT berhasil diambil.'
        );
    }

    // tambah admin RT
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',

            'username' => 'required|string|max:255|unique:users,username',

            'email' => 'required|email|unique:users,email',

            'nik' => 'required|string|size:16|unique:users,nik',

            'password' => 'required|string|min:6',

            'rt' => 'required|string|max:10',
        ]);

        $admin = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'nik' => $validated['nik'],
            'password' => Hash::make($validated['password']),
            'role' => 'rt',
            'rt' => $validated['rt'],
        ]);

        return $this->sendResponse(
            $admin,
            'Admin RT berhasil dibuat.'
        );
    }

    // update admin RT
    public function update(Request $request, $id)
    {
        $admin = User::where('role', 'rt')
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',

            'username' => [
                'required',
                Rule::unique('users', 'username')->ignore($admin->id),
            ],

            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($admin->id),
            ],

            'nik' => [
                'required',
                'size:16',
                Rule::unique('users', 'nik')->ignore($admin->id),
            ],

            'rt' => 'required|string|max:10',
        ]);

        $admin->update($validated);

        return $this->sendResponse(
            $admin,
            'Admin RT berhasil diupdate.'
        );
    }

    // hapus admin RT
    public function destroy($id)
    {
        $admin = User::where('role', 'rt')
            ->findOrFail($id);

        $admin->delete();

        return $this->sendResponse(
            [],
            'Admin RT berhasil dihapus.'
        );
    }
}