<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description'];

    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return static::parseValue($setting->value, $setting->type);
    }

    public static function set($key, $value, $type = 'string', $group = 'general', $label = null, $description = null)
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => static::normalizeValue($value, $type),
                'type' => $type,
                'group' => $group,
                'label' => $label,
                'description' => $description,
            ]
        );
    }

    public static function getGroup($group)
    {
        return static::where('group', $group)->get()->mapWithKeys(function ($setting) {
            return [$setting->key => static::parseValue($setting->value, $setting->type)];
        });
    }

    private static function parseValue($value, $type)
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($value, true),
            default => (string) $value,
        };
    }

    private static function normalizeValue($value, $type)
    {
        return match ($type) {
            'integer' => (int) $value,
            'boolean' => (bool) $value ? '1' : '0',
            'json' => json_encode($value),
            default => (string) $value,
        };
    }
}
