<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class HMLabController extends Controller
{
    public function announcement()
    {
        return Inertia::render('Education/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('Education/HapppeningPosting');
    }
}
