<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderVote extends Model
{
    protected $table = 'reader_votes';

    protected $fillable = [
        'id_anggota',
        'id_buku',
        'vote',
    ];
}
