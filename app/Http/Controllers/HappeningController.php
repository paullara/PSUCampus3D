<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Happening;

class HappeningController extends Controller
{
    public function getByRole($role)
    {
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }

        $happenings = Happening::whereIn('user_id', $users)->latest()->get();

        return response()->json($happenings);
    }
}
