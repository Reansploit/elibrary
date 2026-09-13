<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    protected $table = 'tb_buku';
    protected $primaryKey = 'id_buku';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id_buku',
        'judul_buku',
        'pengarang',
        'penerbit',
        'th_terbit',
        'jumlah',
        'foto',
        'lokasi',
    ];

    public function lokasiRak()
    {
        return $this->belongsTo(Lokasi::class, 'lokasi', 'id_lokasi');
    }

    public function circulations()
    {
        return $this->hasMany(Circulation::class, 'id_buku', 'id_buku');
    }

    public function exemplars()
    {
        return $this->hasMany(Eksemplar::class, 'id_buku', 'id_buku');
    }

    /**
     * Jumlah eksemplar yang siap dipinjam (tidak dipinjam/hilang/rusak).
     */
    public function availableCount(): int
    {
        return $this->exemplars()->where('status', Eksemplar::TERSEDIA)->count();
    }
}
