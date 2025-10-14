<?php

namespace App\Http\Controllers;

use App\Models\InfoBuilding;
use App\Models\User;
use Illuminate\Http\Request;

class InfoBuildingController extends Controller
{
    public function getByRole($role)
    {
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }

        $info = InfoBuilding::whereIn('user_id', $users)->latest()->get();

        return response()->json($info);
    }

    public function index()
    {
        return response()->json(InfoBuilding::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'information' => 'nullable|string',
            'happenings' => 'nullable|string',
            'picture' => 'nullable|file|mimes:jpg,jpeg,png,gif',
            'video' => 'nullable|file|mimes:mp4,avi,mov,wmv',
        ]);

        // If you need user_id, set it from auth:
        $validated['user_id'] = auth()->id();

        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images'), $filename);
            $validated['picture'] = '/images/' . $filename;
        }

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $file->move(public_path('videos'), $filename);
            $validated['video'] = '/videos/' . $filename;
        }

        $info = InfoBuilding::create($validated);
        return response()->json($info, 201);
    }

    public function show($id)
    {
        $info = InfoBuilding::findOrFail($id);
        return response()->json($info);
    }

    public function update(Request $request, $id)
    {
        $info = InfoBuilding::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'name' => 'sometimes|string|max:255',
            'information' => 'nullable|string',
            'picture' => 'nullable|file|mimes:jpg,jpeg,png,gif',
            'video' => 'nullable|file|mimes:mp4,avi,mov,wmv',
            'happenings' => 'nullable|string',
        ]);

        if ($request->hasFile('picture')) {
            $file = $request->file('picture');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images'), $filename);
            $validated['picture'] = '/images/' . $filename;
        }

        if ($request->hasFile('video')) {
            $file = $request->file('video');
            $filename = uniqid() . '_' . $file->getClientOriginalName();
            $file->move(public_path('videos'), $filename);
            $validated['video'] = '/videos/' . $filename;
        }

        $info->update($validated);
        return response()->json($info);
    }

    public function destroy($id)
    {
        $info = InfoBuilding::findOrFail($id);
        $info->delete();
        return response()->json(['message' => 'Deleted']);
    }
}