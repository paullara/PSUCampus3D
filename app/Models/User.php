<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function infobuildings()
    {
        return $this->hasMany(InfoBuildings::class);
    }

    public function happenings()
    {
        return $this->hasMany(Happening::class);
    }

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function achievements()
    {
        return $this->hasMany(Achievement::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    public static function getRoles()
    {
        return [
            'arts_science',
            'academic',
            'education',
            'sac',
            'cayetano',
            'administrative',
            'hm_lb',
            'cc',
            'agri',
            'audiovisual',
            'twinbldg',
            'student',
            'gened',
            'paso',
            'registrar',
            'mis',
            'administrative_office',
            'supply_office',
            'accounting_office',
            'cashier_office',
            'library_office',
            'guidance_office',
            'student_services_office',
            'supreme_student_council',
            'clinic',
            'hmo',
            'boa',
            'it_dept',
            'ced',
            'coa',
            'admin',
        ];
    }
}