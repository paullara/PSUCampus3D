<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Service;

class ServicesController extends Controller
{
    public function getByRole($role)
    {
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }

        $services = Service::whereIn('user_id', $users)->latest()->get();

        return response()->json($services);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'services' => 'required|string|max:255',
        ]);

        $validated['user_id'] = auth()->id();

        $service = Service::create($validated);
        
        return response()->json($service, 201);
    }

    public function update(Request $request, $id)
    {
        $service = Service::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'services' => 'required|string|max:255',
        ]);

        $service->update($validated);

        return response()->json($service);
    }

    public function destroy($id)
    {
        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'message' => 'deleted'
        ]);
    }
}
 