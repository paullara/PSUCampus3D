<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
class GeneralEducationController extends Controller
{
    public function announcement()
    {
        return Inertia::render('GeneralEducation/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('GeneralEducation/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('GeneralEducation/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('GeneralEducation/HapppeningPosting');
    }
}
