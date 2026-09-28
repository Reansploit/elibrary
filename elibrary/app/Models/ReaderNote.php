<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderNote extends Model
{
    protected $table = 'reader_notes';
    public $timestamps = true;

    protected $fillable = [
        'id_anggota',
        'id_buku',
        'page',
        'catatan',
    ];
}
