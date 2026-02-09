<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{
    use HasFactory;

    protected $table = 'circular_items';

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'section1_images' => 'array',
            'video_options' => 'array',
            'buttons' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
