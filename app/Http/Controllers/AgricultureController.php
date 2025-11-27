<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AgricultureController extends Controller
{
    public function happenings()
    {
        return Inertia::render('Agriculture/HappeningPosting');
    }

    public function services()
    {
        return Inertia::render('Agriculture/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('Agriculture/AchievementPosting');
    }
}
