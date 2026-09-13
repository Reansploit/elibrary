<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Eksemplar extends Model
{
    protected $table = 'tb_eksemplar';
    public $timestamps = false;

    public const TERSEDIA = 'tersedia';
    public const DIPINJAM = 'dipinjam';
    public const HILANG = 'hilang';
    public const RUSAK = 'rusak';

    protected $fillable = [
        'id_buku',
        'kode',
        'status',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'id_buku', 'id_buku');
    }

    public function circulations()
    {
        return $this->hasMany(Circulation::class, 'id_eksemplar', 'id');
    }

    public function isAvailable(): bool
    {
        return $this->status === self::TERSEDIA;
    }
}
