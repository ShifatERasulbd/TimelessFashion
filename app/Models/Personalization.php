<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Personalization extends Model
{
    protected $fillable = [
        'user_id',
        'title',
        'image_path',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];
}
