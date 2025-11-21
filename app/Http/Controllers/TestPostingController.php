<?php

namespace App\Http\Controllers;

use App\Models\InfoBuilding;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TestPostingController extends Controller
{
    public function index()
    {
        return response()->json(InfoBuilding::latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'information' => 'nullable|string|max:255',
            'happenings' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'picture' => 'nullable|mimes:jpg,jpeg,png|max:51200',
            'video' => 'nullable|mimes:mp4,mov,avi|max:102400',
        ]);

        if ($request->hasFile('picture')) {
            $validated['picture'] = $request->file('picture')->store('pictures', 'public');
        }

        if ($request->hasFile('video')) {
            $validated['video'] = $request->file('video')->store('videos', 'public');
        }

        $validated['user_id'] = auth()->id();

        $building = InfoBuilding::create($validated);

        return response()->json([
            'message' => 'Building info created!',
            'data' => $building
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $building = InfoBuilding::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'information' => 'nullable|string|max:255',
            'happenings' => 'nullable|string|max:255',
            'building' => 'nullable|string|max:255',
            'picture' => 'nullable|mimes:jpg,jpeg,png|max:51200',
            'video' => 'nullable|mimes:mp4,mov,avi|max:102400',
        ]);

        
        if ($request->hasFile('picture')) {
            if ($building->picture) {
                Storage::disk('public')->delete($building->picture);
            }
            $validated['picture'] = $request->file('picture')->store('pictures', 'public');
        }

        
        if ($request->hasFile('video')) {
            if ($building->video) {
                Storage::disk('public')->delete($building->video);
            }
            $validated['video'] = $request->file('video')->store('videos', 'public');
        }

        $building->update($validated);

        return response()->json([
            'message' => 'Building updated!',
            'data' => $building
        ]);
    }

    public function destroy($id)
    {
        $building = InfoBuilding::findOrFail($id);

        // Delete media
        if ($building->picture) {
            Storage::disk('public')->delete($building->picture);
        }

        if ($building->video) {
            Storage::disk('public')->delete($building->video);
        }

        $building->delete();

        return response()->json(['message' => 'Building deleted!']);
    }
}
