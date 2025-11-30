<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class LibraryController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Library/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('Library/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('Library/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('Library/HapppeningPosting');
    }
}
