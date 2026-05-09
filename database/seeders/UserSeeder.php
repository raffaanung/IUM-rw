<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun RW (Super Admin)
        User::create([
            'name'     => 'Ketua RW 05',
            'username' => 'superadmin',
            'email'    => 'rw@sitegar.com',
            'nik'      => '3273010101800001',
            'password' => Hash::make('password123'),
            'role'     => 'rw',
            'rt'       => null,
        ]);

        // Akun RT 01
        User::create([
            'name'     => 'Ketua RT 01',
            'username' => 'admin01',
            'email'    => 'rt01@sitegar.com',
            'nik'      => '3273010101800002',
            'password' => Hash::make('password123'),
            'role'     => 'rt',
            'rt'       => '01',
        ]);

        // Akun RT 02
        User::create([
            'name'     => 'Ketua RT 02',
            'username' => 'admin02',
            'email'    => 'rt02@sitegar.com',
            'nik'      => '3273010101800003',
            'password' => Hash::make('password123'),
            'role'     => 'rt',
            'rt'       => '02',
        ]);

        // Akun RT 03
        User::create([
            'name'     => 'Ketua RT 03',
            'username' => 'admin03',
            'email'    => 'rt03@sitegar.com',
            'nik'      => '3273010101800004',
            'password' => Hash::make('password123'),
            'role'     => 'rt',
            'rt'       => '03',
        ]);
    }
}