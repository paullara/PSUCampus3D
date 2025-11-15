<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    public function show($meshName)
    {
        // Map 3D mesh names to roles
        $mapping = [
            '3DGeom-1078' => 'bsit',
            '3DGeom-1080' => 'beed',
            '3DGeom-1102' => 'library',
            '3DGeom-1095' => 'mis',
            '3DGeom-1110' => 'accounting',
            '3DGeom-1115' => 'cashier',
            '3DGeom-1120' => 'registrar',
            '3DGeom-1200' => 'guidance',
            '3DGeom-1300' => 'supply_room',
            '3DGeom-1400' => 'covered_court',
            '3DGeom-1500' => 'audio_visual',
            '3DGeom-1600' => 'agri',
        ];

        $role = $mapping[$meshName] ?? null;

        if (!$role) {
            return response()->json(['message' => 'Building not mapped.'], 404);
        }

        $user = User::where('role', $role)->first();

        if (!$user) {
            return response()->json(['message' => "No user found for role {$role}"], 404);
        }

        return response()->json([
            'mesh_name' => $meshName,
            'role' => $user->role,
            'name' => $user->name,
            'email' => $user->email,
            'info' => "This building is managed by the {$user->role} department.",
            'image' => "/images/buildings/{$user->role}.jpg",
        ]);
    }
}