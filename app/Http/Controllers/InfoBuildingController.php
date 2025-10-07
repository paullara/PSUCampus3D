<?php

namespace App\Http\Controllers;

use App\Models\InfoBuilding;
use App\Models\User;

class InfoBuildingController extends Controller
{
    public function getByRole($role)
    {
        // Find user(s) with this role
        $users = User::where('role', $role)->pluck('id');

        if ($users->isEmpty()) {
            return response()->json([]);
        }

        // Fetch info buildings created by users with this role
        $info = InfoBuilding::whereIn('user_id', $users)->latest()->get();

        return response()->json($info);
    }
}