<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    use HasFactory;

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected function casts(): array
    {
        return [
            'media_items' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function targetCard()
    {
        return $this->belongsTo(Card::class, 'target_card_id');
    }
}
