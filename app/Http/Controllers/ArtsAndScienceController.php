<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BuildingInfo;
use Inertia\Inertia;

class ArtsAndScienceController extends Controller
{
    public function getBuildingInfoPost()
    {
        $post = BuildingInfo::where('user_id', auth()->id())->latest()->get();

        return response()->json([
            'post'
        ]);
    }
}
