<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderProgress extends Model
{
    protected $table = 'reader_progress';
    public $timestamps = true;

    protected $fillable = [
        'id_anggota',
        'id_buku',
        'page',
        'status',
    ];
}
