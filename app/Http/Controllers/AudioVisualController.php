<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AudioVisualController extends Controller
{
    public function happenings()
    {
        return Inertia::render('AudioVisual/HappeningPosting');
    }

    public function services()
    {
        return Inertia::render('AudioVisual/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('AudioVisual/AchievementPosting');
    }
}
