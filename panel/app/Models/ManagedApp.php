<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManagedApp extends Model
{
    protected $fillable = ['name', 'exe', 'launch', 'auto_reopen'];

    protected function casts(): array
    {
        return ['auto_reopen' => 'boolean'];
    }
}
