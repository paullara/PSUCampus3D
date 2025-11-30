<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Achievement;
use Illuminate\Support\Facades\Auth;

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

    public function index()
    {
        if (!auth()->check()) {
            return response()->json(['achievement' =>  []]);
        }

        $achievements = Achievement::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'achievements' => $achievements,
        ]);

    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'achievements' => 'required|string|max:255',
            'achievement_pic' => 'nullable|file|mimes:jpg,jpeg,png',
        ]);

        $validated['user_id'] = auth()->id();

        if ($file = $request->file('achievement_pic')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('images'), $filename);
            $validated['achievement_pic'] = "/images/$filename";
        }

        $achievement = Achievement::create($validated);

        return response()->json($achievement, 201);
    }

    public function update(Request $request, $id)
    {
        $achievement = Achievement::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'achievements' => 'sometimes|string|max:255',
            'achievement_pic' => 'nullable|file|mimes:jpg,jpeg,png,gif',
        ]);

        if ($file = $request->file('achievement_pic')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('images'), $filename);
            $validated['achievement_pic'] = "/images/$filename";
        }

        $achievement->update($validated);

        return response()->json($achievement);
    }

    public function destroy($id)
    {
        $achievement = Achievement::findOrFail($id);
        $achievement->delete();

        return response()->json([
            'message' => 'deleted'
        ]);
    }
    
}
