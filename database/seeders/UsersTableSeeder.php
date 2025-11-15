<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            'arts_science','academic','education','sac','cayetano',
            'administrative','hm_lb','cc','agri','audiovisual','twinbldg','student', 'gened',
            'paso', 'registrar', 'mis', 'administrative_office', 'supply_office', 'accounting_office',
            'cashier_office', 'library_office', 'guidance_office', 'student_services_office', 'supreme_student_council',
            'clinic', 'hmo', 'boa', 'it_dept', 'ced', 'coa', 'admin'
        ];

        foreach ($roles as $role) {
            User::create([
                'name' => ucfirst($role) . ' User',
                'email' => $role . '@example.com',
                'password' => Hash::make('password'),
                'role' => $role,
                'email_verified_at' => now(),
            ]);
        }
    }
}