<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function informationTechnology()
    {
        return Inertia::render('InformationTechnology/Dashboard');
    }

    public function artsAndScience()
    {
        return Inertia::render('Arts_Science/Dashboard');
    }
    
    public function education()
    {
        return Inertia::render('Education/Posting');
    }

    public function academic()
    {
        return Inertia::render('Academic/Posting');
    }

    public function studentActivityCenter()
    {
        return Inertia::render('SAC/Posting');
    }

    public function cayetano()
    {
        return Inertia::render('Cayetano/Posting');
    }

    public function hmlab()
    {
        return Inertia::render('HMLab/Posting');
    }

    public function coveredCourt()
    {
        return Inertia::render('CC/Posting');
    }

    public function agriculture()
    {
        return Inertia::render('Agriculture/Posting');
    }

    public function audioVisual()
    {
        return Inertia::render('AudioVisual/Posting');
    }

    public function twinBuilding()
    {
        return Inertia::render('TwinBuilding/Posting');
    }

    public function generalEduction()
    {
        return Inertia::render('GeneralEducation/Posting');
    }

    public function productionAndAuxiliaryServicesOffice()
    {
        return Inertia::render('Paso/Posting');
    }

    public function registrar()
    {
        return Inertia::render('Registrar/RegistrarPosting');
    }

    public function mis()
    {
        return Inertia::render('MIS/MISPosting');
    }

    public function administrativeOffice()
    {
        return Inertia::render('Administrative/AdministrativePosting');
    }
    
    public function supplyOffice()
    {
        return Inertia::render('SupplyOffice/SupplyPosting');
    }

    public function accountingOffice()
    {
        return Inertia::render('Accounting/Posting');
    }

    public function cashierOffice()
    {
        return Inertia::render('Cashier/Posting');
    }

    public function library()
    {
        return Inertia::render('Library/Posting');
    }

    public function guidance()
    {
        return Inertia::render('Guidance/Posting');
    }

    public function studentServicesOffice()
    {
        return Inertia::render('SSO/Posting');
    }

    public function supremeStudentCouncil()
    {
        return Inertia::render('SSC/Posting');
    }

    public function clinic()
    {
        return Inertia::render('Clinic/Posting');
    }

    public function hmo()
    {
        return Inertia::render('HMO/Posting');
    }

    public function boa()
    {
        return Inertia::render('BOA/Posting');
    }

    public function ced()
    {
        return Inertia::render('CED/Posting');
    }

    public function coa()
    {
        return Inertia::render('COA/Posting');
    }

    public function itDept()
    {
        return Inertia::render('IT/Posting');
    }
    
    public function admin()
    {
        return Inertia::render('Admin/Posting');
    }

}