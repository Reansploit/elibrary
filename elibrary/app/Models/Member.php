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
    ];

    public function circulations()
    {
        return $this->hasMany(Circulation::class, 'id_anggota', 'id_anggota');
    }
}
