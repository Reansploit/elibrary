<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    protected $fillable = [
        'mac', 'hostname', 'custom_name', 'ip', 'token_hash',
        'agent_version', 'app_open', 'active_title', 'open_apps', 'last_foreign_title',
        'closed_beats', 'foreign_beats', 'last_seen_at',
    ];

    protected function casts(): array
    {
        return [
            'app_open' => 'boolean',
            'last_seen_at' => 'datetime',
            'open_apps' => 'array',
        ];
    }

    public function commands(): HasMany
    {
        return $this->hasMany(DeviceCommand::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(DeviceLog::class);
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(Alert::class);
    }

    public function displayName(): string
    {
        return $this->custom_name ?: $this->hostname;
    }

    public function isOnline(int $seconds = 180): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subSeconds($seconds));
    }

    public function log(string $kind, ?string $detail = null): void
    {
        $this->logs()->create(['kind' => $kind, 'detail' => $detail]);
    }

    public function raiseAlert(string $kind, string $message): void
    {
        $exists = $this->alerts()
            ->where('kind', $kind)
            ->where('handled', false)
            ->exists();
        if (! $exists) {
            $this->alerts()->create(['kind' => $kind, 'message' => $message]);
        }
    }
}
