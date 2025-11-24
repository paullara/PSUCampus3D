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

    public function index()
    {
        if (!auth()->check()) {
            return response()->json(['happenings' =>  []]);
        }

        $happenings = Happening::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'happenings' => $happenings,
        ]);

    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'happenings' => 'required|string|max:255',
            'picture' => 'nullable|file|mimes:jpg,jpeg,png,gif|max:51200',
            'video' => 'nullable|mimes:mp4,mov,avi,wmv|max:512000',
        ]);

        $validated['user_id'] = auth()->id();

        if ($file = $request->file('picture')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('images'), $filename);
            $validated['picture'] = "/images/$filename";
        }

        if ($file = $request->file('video')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('videos'), $filename);
            $validated['video'] = "/videos/$filename";
        }

        $happening = Happening::create($validated);
        return response()->json($happening, 201);
    }

    public function update(Request $request, $id)
    {
        $happening = Happening::findOrFail($id);

       $validated = $request->validate([
            'happenings' => 'sometimes|string|max:255',
            'picture' => 'nullable|file|mimes:jpg,jpeg,png,gif',
            'video' => 'nullable|file|mimes:mp4,avi,mov,wmv',
        ]);

        $validated['user_id'] = auth()->id();

        if ($file = $request->file('picture')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('picture'), $filename);
            $validated['picture'] = "/images/$filename";
        }

        if ($file = $request->file('video')) {
            $filename = uniqid().'.'.$file->extension();
            $file->move(public_path('videos'), $filename);
            $validated['video'] = "/videos/$filename";
        }

        $happening->update($validated);
        return response()->json($happening);
    }

    public function destroy($id)
    {
        $happening = Happening::findOrFail($id);
        $happening->delete();
        return response()->json(['message', 'deleted']);
    }
}
