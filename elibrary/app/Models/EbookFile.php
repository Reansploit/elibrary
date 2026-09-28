<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EbookFile extends Model
{
    protected $table = 'tb_ebook_files';

    protected $fillable = [
        'id_buku',
        'format',
        'original_name',
        'stored_name',
        'mime_type',
        'size_bytes',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
    ];

    public function book()
    {
        return $this->belongsTo(Book::class, 'id_buku', 'id_buku');
    }
}
