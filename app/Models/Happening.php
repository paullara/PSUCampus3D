<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Happening extends Model
{
    protected $fillable = [
        'user_id',
        'picture', 
        'video',
        'happenings'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
