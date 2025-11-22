<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Achievement;

class AchievementController extends Controller
{
    public function getByRole($role)
    {
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }

        $achievements = Achievement::whereIn('user_id', $users)->latest()->get();

        return response()->json($achievements);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'achievement' => 'required|string|max:255',
            'achievement_pic' => 'nullable|file|mimes:jpg,jpeg,png',
        ]);

        $validated['user_id'] = auth()->id();

        
    }
}
