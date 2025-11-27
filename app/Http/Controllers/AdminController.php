<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function happenings()
    {
        return Inertia::render('Admin/HappeningPosting');
    }

    public function services()
    {
        return Inertia::render('Admin/ServicesPosting');
    }

    public function achievements()
    {
        return Inertia::render('Admin/AchievementPosting');
    }

    public function postBldgInfo()
    {
        return Inertia::render('Admin/InfoBuilding');
    }
}
