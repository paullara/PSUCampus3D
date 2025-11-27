<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class BOAController extends Controller
{
    public function happenings()
    {
        return Inertia::render('BOA/HappeningPosting');
    }
    
    public function services()
    {
        return Inertia::render('BOA/ServicesPosting');
    }

    
}
