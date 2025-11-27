<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Announcement;

class AnnouncementController extends Controller
{
    public function getByRole($role)
    {
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }
        
        $announcements = Announcement::whereIn('user_id', $users)->latest()->get();

        return response()->json($announcements);
    }

    public function index()
    {
        if (!auth()->check()) {
            return response()->json(['announcement' => []]);
        }

        $announcements = Announcement::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'announcements' => $announcements,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'announcement' => 'required|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();

        $announcement = Announcement::create($validated);

        return response()->json($announcement, 201);
    }

    public function update(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'sometimes:exists:users,id',
            'announcement' => 'required|string|max:255',
        ]);

        $announcement->update($validated);

        return response()->json($announcement);
    }

    public function destroy($id)
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->delete();

        return response()->json([
            'message' => 'deleted'
        ]);
    }
}
