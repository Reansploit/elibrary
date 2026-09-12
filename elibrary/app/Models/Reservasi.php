<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservasi extends Model
{
    protected $table = 'tb_reservasi';

    protected $fillable = [
        'id_buku',
        'id_anggota',
        'status',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'id_buku', 'id_buku');
    }

    public function member()
    {
        return $this->belongsTo(Member::class, 'id_anggota', 'id_anggota');
    }

    public function isOpen(): bool
    {
        return in_array($this->status, ['antre', 'siap'], true);
    }
}
