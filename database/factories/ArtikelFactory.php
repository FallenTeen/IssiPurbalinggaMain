<?php
namespace Database\Factories;

use App\Models\Artikel;
use App\Models\User;
use App\Models\KategoriArtikel;
use Illuminate\Database\Eloquent\Factories\Factory;

class ArtikelFactory extends Factory
{
    protected $model = Artikel::class;

    public function definition()
    {
        $judul = $this->faker->sentence();

        return [
            'judul' => $judul,
            'slug' => \Str::slug($judul),
            'content' => $this->faker->paragraphs(5, true),
            'excerpt' => $this->faker->paragraph(),
            'reporter_id' => User::factory(),
            'kategori_id' => KategoriArtikel::factory(),
            'status' => $this->faker->randomElement(['draft', 'review', 'published', 'archived']),
            'featured_image_url' => $this->faker->imageUrl(),
            'reading_time' => $this->faker->numberBetween(1, 10),
            'jumlah_view' => $this->faker->numberBetween(0, 1000),
            'jumlah_like' => $this->faker->numberBetween(0, 100),
            'jumlah_share' => $this->faker->numberBetween(0, 50),
            'tanggal_publikasi' => $this->faker->dateTimeThisYear(),
        ];
    }

    public function published()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'published',
                'tanggal_publikasi' => $this->faker->dateTimeBetween('-1 month', 'now'),
            ];
        });
    }

    public function draft()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'draft',
                'tanggal_publikasi' => null,
            ];
        });
    }
}
