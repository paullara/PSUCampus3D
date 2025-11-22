<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    protected $fillable = [
        'user_id',
        'achievement',
        'achievement_pic'
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
