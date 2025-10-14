<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InfoBuilding;
use Inertia\Inertia;

class BldgInfoJson extends Controller
{
    public function getBuildingInfoPost()
    {
        if (!auth()->check()) {
            return response()->json(['post' => []]);
        }

        $post = InfoBuilding::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'post' => $post
        ]);
    }
}
