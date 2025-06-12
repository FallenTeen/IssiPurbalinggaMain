<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\KategoriArtikel;

class TestSeeder extends Seeder
{
    public function run()
    {
        // Create default users
        User::factory()->create([
            'email' => 'admin@example.com',
            'role' => 'admin'
        ]);

        User::factory()->create([
            'email' => 'reporter@example.com',
            'role' => 'reporter'
        ]);

        // Create default categories
        KategoriArtikel::factory()->count(5)->create();
    }
}
