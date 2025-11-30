<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = auth()->user();

        switch ($user->role) {
            case 'arts_science':
                return redirect()->intended('/arts-science/dashboard');
            case 'student':
                return redirect()->intended('/dashboard');
            case 'education':
                return redirect()->intended('/education/posting');
            case 'cayetano':
                return redirect()->intended('/cayetano/posting');
            case 'hm_lb':
                return redirect()->intended('/hmlab/posting');
            case 'cc':
                return redirect()->intended('/cc/posting');
            case 'agri':
                return redirect()->intended('/agriculture/posting');
            case 'audiovisual':
                return redirect()->intended('/audiovisual/posting');
            case 'twinbldg':
                return redirect()->intended('/twinbuilding/posting');
            case 'gened':
                return redirect()->intended('/general-education/posting');
            case 'paso': 
                return redirect()->intended('/production&auxiliary-services/posting');
            case 'registrar':
                return redirect()->intended('/registrar/posting');
            case 'mis':
                return redirect()->intended('/mis/posting');
            case 'administrative':
                return redirect()->intended('/administrative/postInfoBuildings');
            case 'supply_office':
                return redirect()->intended('/supply-office/posting');
            case 'accounting_office':
                return redirect()->intended('/accounting-office/posting');
            case 'cashier_office':
                return redirect()->intended('/cashier/posting');
            case 'library_office':
                return redirect()->intended('/library/posting');
            case 'guidance_office':
                return redirect()->intended('/guidance/posting');
            case 'student_services_office':
                return redirect()->intended('/sso/posting');
            case 'supreme_student_council':
                return redirect()->intended('/ssc/posting');
            case 'clinic':
                return redirect()->intended('/clinic/posting');
            case 'hmo':
                return redirect()->intended('/hmo/happenings');
            case 'boa':
                return redirect()->intended('/boa/happenings');
            case 'it_dept': 
                return redirect()->intended('/it/happenings');
            case 'ced': 
                return redirect()->intended('/ced/happenings');
            case 'coa': 
                return redirect()->intended('/coa/posting');
            case 'admin':
                return redirect()->intended('/admin/posting');
            default:
                return redirect()->intended('/dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}