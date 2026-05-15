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
        User::updateOrCreate(
            ['username' => 'superadmin'],
            [
                'name'     => 'Ketua RW 8',
                'email'    => 'rw@sitegar.com',
                'nik'      => '3273010101800001',
                'password' => Hash::make('password'),
                'role'     => 'rw',
                'rt'       => null,
            ]
        );

        // Akun RT 01
        User::updateOrCreate(
            ['username' => 'admin01'],
            [
                'name'     => 'Ketua RT 01',
                'email'    => 'rt01@sitegar.com',
                'nik'      => '3273010101800002',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '01',
            ]
        );

        // Akun RT 02
        User::updateOrCreate(
            ['username' => 'admin02'],
            [
                'name'     => 'Ketua RT 02',
                'email'    => 'rt02@sitegar.com',
                'nik'      => '3273010101800003',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '02',
            ]
        );

        // Akun RT 03
        User::updateOrCreate(
            ['username' => 'admin03'],
            [
                'name'     => 'Ketua RT 03',
                'email'    => 'rt03@sitegar.com',
                'nik'      => '3273010101800004',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '03',
            ]
        );

        // Akun RT 04
        User::updateOrCreate(
            ['username' => 'admin04'],
            [
                'name'     => 'Ketua RT 04',
                'email'    => 'rt04@sitegar.com',
                'nik'      => '3273010101800005',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '04',
            ]
        );

        // Akun RT 05
        User::updateOrCreate(
            ['username' => 'admin05'],
            [
                'name'     => 'Ketua RT 05',
                'email'    => 'rt05@sitegar.com',
                'nik'      => '3273010101800006',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '05',
            ]
        );

        // Akun RT 06
        User::updateOrCreate(
            ['username' => 'admin06'],
            [
                'name'     => 'Ketua RT 06',
                'email'    => 'rt06@sitegar.com',
                'nik'      => '3273010101800007',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '06',
            ]
        );

        // Akun RT 07
        User::updateOrCreate(
            ['username' => 'admin07'],
            [
                'name'     => 'Ketua RT 07',
                'email'    => 'rt07@sitegar.com',
                'nik'      => '3273010101800008',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '07',
            ]
        );

        // Akun RT 08
        User::updateOrCreate(
            ['username' => 'admin08'],
            [
                'name'     => 'Ketua RT 08',
                'email'    => 'rt08@sitegar.com',
                'nik'      => '3273010101800009',
                'password' => Hash::make('password'),
                'role'     => 'rt',
                'rt'       => '08',
            ]
        );
    }
}