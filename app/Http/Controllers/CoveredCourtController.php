<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CoveredCourtController extends Controller
{
    public function announcement()
    {
        return Inertia::render('CC/Announcement');
    }

    public function happenings()
    {
        return Inertia::render('CC/HappeningPost');
    }
}
