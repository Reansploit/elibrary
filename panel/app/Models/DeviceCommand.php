<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceCommand extends Model
{
    public const OPEN_APP = 'open_app';
    public const CLOSE_APP = 'close_app';
    public const RESTART_AGENT = 'restart_agent';

    protected $fillable = ['device_id', 'action', 'status', 'claimed_at', 'done_at'];

    protected function casts(): array
    {
        return [
            'claimed_at' => 'datetime',
            'done_at' => 'datetime',
        ];
    }

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    public function label(): string
    {
        return match ($this->action) {
            self::OPEN_APP => 'Buka app',
            self::CLOSE_APP => 'Tutup app',
            self::RESTART_AGENT => 'Restart agen',
            default => $this->action,
        };
    }
}
