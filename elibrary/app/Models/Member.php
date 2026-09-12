<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $table = 'tb_anggota';
    protected $primaryKey = 'id_anggota';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_anggota',
        'nama',
        'jekel',
        'kelas',
        'foto',
        'sanksi',
        'sanksi_sampai',
    ];

    protected function casts(): array
    {
        return [
            'sanksi' => 'boolean',
            'sanksi_sampai' => 'date',
        ];
    }

    /**
     * Apakah anggota sedang dalam masa sanksi (peminjaman diblokir).
     */
    public function isSanctioned(): bool
    {
        if (! $this->sanksi) {
            return false;
        }

        // Tanpa tanggal berakhir = berlaku sampai dicabut manual.
        if (! $this->sanksi_sampai) {
            return true;
        }

        return \Carbon\Carbon::today()->lte(\Carbon\Carbon::parse($this->sanksi_sampai));
    }

    public function circulations()
    {
        return $this->hasMany(Circulation::class, 'id_anggota', 'id_anggota');
    }
}
