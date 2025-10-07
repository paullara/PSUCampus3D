<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InfoBuilding extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'information',
        'picture',
        'building',
        'happenings',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}