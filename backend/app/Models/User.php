<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username', // Ditambahkan karena ada di migration add_username_to_users_table
        'email',
        'password',
        'nik',
        'role',
        'rt',
        'warga_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relasi ke data Warga (User terhubung ke satu data profil warga)
     */
    public function warga()
    {
        return $this->belongsTo(Warga::class, 'warga_id', 'id');
    }

    /**
     * Relasi ke data Transaksi (User sebagai admin/pencatat yang membuat transaksi)
     */
    public function transaksi()
    {
        return $this->hasMany(Transaksi::class, 'created_by');
    }
}