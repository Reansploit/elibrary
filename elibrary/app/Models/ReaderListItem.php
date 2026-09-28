<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReaderListItem extends Model
{
    protected $table = 'reader_list_items';
    public $timestamps = true;

    protected $fillable = [
        'list_id',
        'id_buku',
    ];
}
