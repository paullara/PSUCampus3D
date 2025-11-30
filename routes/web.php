<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AdministrativeController;
use App\Http\Controllers\AudioVisualController;
use App\Http\Controllers\BOAController;
use App\Http\Controllers\CashierController;
use App\Http\Controllers\CEDController;
use App\Http\Controllers\COAController;
use App\Http\Controllers\HMOController;
use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\InfoBuildingController;
use App\Http\Controllers\ITDeptController;
use App\Http\Controllers\ArtsAndScienceController;
use App\Http\Controllers\AchievementController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\HappeningController;
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
Route::post('/info-buildings', [InfoBuildingController::class, 'store'])->name('info.buildings.store');

Route::put('/info-buildings/{id}', [InfoBuildingController::class, 'update'])->name('info.buildings.update');
Route::delete('/info-buildings/{id}', [InfoBuildingController::class, 'destroy'])->name('info.buildings.destroy');

// Happenings
Route::get('/happenings/json', [HappeningController::class, 'index']);
Route::get('/happenings/{role}', [HappeningController::class, 'getByRole']);
Route::post('/happenings', [HappeningController::class, 'store']);
Route::put('/happenings/{id}', [HappeningController::class, 'update']);
Route::delete('/happenings/{id}', [HappeningController::class, 'destroy']);

// Services
Route::get('/services/json', [ServicesController::class, 'index']);
Route::get('/services/{role}', [ServicesController::class, 'getByRole']);
// Route::get('/services', [ServicesController::class, 'index']);
Route::post('/services', [ServicesController::class, 'store']);
Route::put('/services/{id}', [ServicesController::class, 'update']);
Route::delete('/services/{id}', [ServicesController::class, 'destroy']);

// Achievements
Route::get('/achievements/json', [AchievementController::class, 'index']);
Route::get('/achievements/{role}', [AchievementController::class, 'getByRole']);
// Route::get('/achievements', [AchievementController::class, 'index']);
Route::post('/achievements', [AchievementController::class, 'store']);
Route::put('/achievements/{id}', [AchievementController::class, 'update']);
Route::delete('/achievements/{id}', [AchievementController::class, 'destroy']);

// Announcement
Route::get('/announcements/json', [AnnouncementController::class, 'index']);
Route::get('/announcements/{role}', [AnnouncementController::class, 'getByRole']);
Route::post('/announcements', [AnnouncementController::class, 'store']);
Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);

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

Route::get('/admin/posting', [DashboardController::class, 'admin'])->name('admin.posting');


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

// Admin
Route::get('/admin/happenings', [AdminController::class, 'happenings'])->name('admin.happenings');
Route::get('/admin/services', [AdminController::class, 'services'])->name('admin.services');
Route::get('/admin/achievements', [AdminController::class, 'achievements'])->name('admin.achievements');
Route::get('/admin/infobuildings', [AdminController::class, 'postBldgInfo'])->name('admin.bldgInfo');

Route::get('/administrative/postInfoBuildings', [AdministrativeController::class, 'postInfoBldg'])->name('administrative.postInfoBldg');
Route::get('/administrative/happenings', [AdministrativeController::class, 'happenings'])->name('administrative.happenings');
Route::get('/administrative/services', [AdministrativeController::class, 'services'])->name('administrative.services');
Route::get('/administrative/achievements', [AdministrativeController::class, 'achievements'])->name('administrative.achievements');
Route::get('/administrative/building-information', [AdministrativeController::class, 'BuildingInfo'])->name('administrative.bldg.info');
Route::get('/administrative/announcement', [AdministrativeController::class, 'announcement'])->name('administrative.announcement');

Route::get('/audiovisual/happenings', [AudioVisualController::class, 'happenings'])->name('audiovisual.happenings');
Route::get('/audiovisual/announcement', [AudioVisualController::class, 'announcement'])->name('audiovisual.announcement');

Route::get('/hmo/happenings', [HMOController::class, 'happenings'])->name('hmo.happenings');
Route::get('/hmo/services', [HMOController::class, 'services'])->name('hmo.services');
Route::get('/hmo/achievements', [HMOController::class, 'achievements'])->name('hmo.achievements');
Route::get('/hmo/announcements', [HMOController::class, 'announcement'])->name('hmo.announcement');

Route::get('/boa/happenings', [BOAController::class, 'happenings'])->name('boa.happenings');
Route::get('/boa/services', [BOAController::class, 'services'])->name('boa.services');
Route::get('/boa/achievements', [BOAController::class, 'achievements'])->name('boa.achievements');
Route::get('/boa/announcements', [BOAController::class, 'announcement'])->name('boa.announcement');

Route::get('/ced/happenings', [CEDController::class, 'happenings'])->name('ced.happenings');
Route::get('/ced/services', [CEDController::class, 'services'])->name('ced.services');
Route::get('/ced/achievements', [CEDController::class, 'achievements'])->name('ced.achievements');
Route::get('/ced/announcements', [CEDController::class, 'announcement'])->name('ced.announcement');

Route::get('/it/happenings', [ITDeptController::class, 'happenings'])->name('it.happenings');
Route::get('/it/services', [ITDeptController::class, 'services'])->name('it.services');
Route::get('/it/achievements', [ITDeptController::class, 'achievements'])->name('it.achievements');
Route::get('/it/announcements', [ITDeptController::class, 'announcement'])->name('it.announcement');

Route::resource('accounts', AccountController::class);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';