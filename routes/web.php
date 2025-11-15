<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\InfoBuildingController;
use App\Http\Controllers\ArtsAndScienceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BldgInfoJson;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/school/map', function () {
    return Inertia::render('SchoolMap');
});

Route::get('/buildings/{meshName}', [BuildingController::class, 'show']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/information-technology/dashboard', [DashboardController::class, 'informationTechnology'])->name('it.dashboard');
Route::get('/arts-science/dashboard', [DashboardController::class, 'artsAndScience'])->name('as.dashboard');
Route::get('/info-building/{role}', [InfoBuildingController::class, 'getByRole']);
Route::get('/info-buildings/{id}', [InfoBuildingController::class, 'show']);
Route::get('/information/json', [BldgInfoJson::class, 'getBuildingInfoPost']);
Route::get('/info-buildings', [InfoBuildingController::class, 'index']);
Route::post('/info-buildings', [InfoBuildingController::class, 'store']);
Route::put('/info-buildings/{id}', [InfoBuildingController::class, 'update']);
Route::delete('/info-buildings/{id}', [InfoBuildingController::class, 'destroy']);

// Cayetano
Route::get('/cayetano/posting', [DashboardController::class, 'cayetano'])->name('cayetano.posting');

// HMLab
Route::get('/hmlab/posting', [DashboardController::class, 'hmlab'])->name('hmlab.posting');

// Covered Court
Route::get('/cc/posting', [DashboardController::class, 'coveredCourt'])->name('cc.posting');

// Agriculture
Route::get('/agriculture/posting', [DashboardController::class, 'agriculture'])->name('agriculture.posting');

// Education
Route::get('/education/posting', [DashboardController::class, 'education'])->name('education.posting');

// AudioVisual
Route::get('/audiovisual/posting', [DashboardController::class, 'audioVisual'])->name('audiovisual.posting');

// TwinBuilding
Route::get('/twinbuilding/posting', [DashboardController::class, 'twinBuilding'])->name('twinbuilding.posting');

// Academic
Route::get('/hmo/posting', [DashboardController::class, 'hmo'])->name('hmo.posting');
Route::get('/boa/posting', [DashboardController::class, 'boa'])->name('boa.posting');
Route::get('/ced/posting', [DashboardController::class, 'ced'])->name('ced.posting');
Route::get('/coa/posting', [DashboardController::class, 'coa'])->name('coa.posting');
Route::get('/it-dept/posting', [DashboardController::class, 'itDept'])->name('itdept.posting');
// Student Activity Center
Route::get('/guidance/posting', [DashboardController::class, 'guidance'])->name('guidance.posting');
Route::get('/sso/posting', [DashboardController::class, 'studentServicesOffice'])->name('sso.posting');
Route::get('/ssc/posting', [DashboardController::class, 'supremeStudentCouncil'])->name('ssc.posting');
Route::get('/clinic/posting', [DashboardController::class, 'clinic'])->name('clinic.posting');

// Administrative Office
Route::get('/registrar/posting', [DashboardController::class, 'registrar'])->name('registrar.posting');
Route::get('/mis/posting', [DashboardController::class, 'mis'])->name('mis.posting');
Route::get('/administrative-office/posting', [DashboardController::class, 'administrativeOffice'])->name('administrative.posting');
Route::get('/supply-office/posting', [DashboardController::class, 'supplyOffice'])->name('supply.posting');
Route::get('/accounting-office/posting', [DashboardController::class, 'accountingOffice'])->name('accounting.posting');
Route::get('/library/posting', [DashboardController::class, 'library'])->name('library.posting');
Route::get('/cashier/posting', [DashboardController::class, 'cashierOffice'])->name('cashier.posting');

// Arts & Science
Route::get('/general-education/posting', [DashboardController::class, 'generalEducation'])->name('gened.posting');
Route::get('/production&auxiliary-services/posting', [DashboardController::class, 'productionAndAuxiliaryServicesOffice'])->name('paso.posting');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';