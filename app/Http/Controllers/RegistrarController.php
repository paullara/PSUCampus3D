<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrarController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Registrar/Announcement');
    }

    public function achievements()
    {
        return Inertia::render('Registrar/AchievementPosting');
    }

    public function services()
    {
        return Inertia::render('Registrar/ServicesPosting');
    }

    public function happenings()
    {
        return Inertia::render('Registrar/HapppeningPosting');
    }
}
