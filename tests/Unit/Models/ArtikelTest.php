<?php
namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Artikel;
use App\Models\User;
use App\Models\KategoriArtikel;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ArtikelTest extends TestCase
{
    use RefreshDatabase;

    public function test_artikel_belongs_to_reporter()
    {
        $user = User::factory()->create(['role' => 'reporter']);
        $kategori = KategoriArtikel::factory()->create();
        $artikel = Artikel::factory()->create([
            'reporter_id' => $user->id,
            'kategori_id' => $kategori->id
        ]);

        $this->assertInstanceOf(User::class, $artikel->reporter);
        $this->assertEquals($user->id, $artikel->reporter->id);
    }

    public function test_artikel_belongs_to_kategori()
    {
        $kategori = KategoriArtikel::factory()->create();
        $artikel = Artikel::factory()->create(['kategori_id' => $kategori->id]);

        $this->assertInstanceOf(KategoriArtikel::class, $artikel->kategori);
        $this->assertEquals($kategori->id, $artikel->kategori->id);
    }

    public function test_published_scope()
    {
        $publishedArtikel = Artikel::factory()->create([
            'status' => 'published',
            'tanggal_publikasi' => now()->subDay()
        ]);

        $draftArtikel = Artikel::factory()->create([
            'status' => 'draft'
        ]);

        $futureArtikel = Artikel::factory()->create([
            'status' => 'published',
            'tanggal_publikasi' => now()->addDay()
        ]);

        $results = Artikel::published()->get();

        $this->assertTrue($results->contains($publishedArtikel));
        $this->assertFalse($results->contains($draftArtikel));
        $this->assertFalse($results->contains($futureArtikel));
    }

    public function test_slug_is_generated_automatically()
    {
        $artikel = new Artikel();
        $artikel->judul = 'Test Article Title';

        $this->assertEquals('test-article-title', $artikel->slug);
    }

    public function test_reading_time_is_calculated()
    {
        $content = str_repeat('word ', 200); // 200 words
        $artikel = new Artikel();
        $artikel->content = $content;

        $this->assertEquals(1, $artikel->reading_time); // 200 words / 200 wpm = 1 minute
    }

    public function test_increment_view()
    {
        $artikel = Artikel::factory()->create(['jumlah_view' => 5]);

        $artikel->incrementView();

        $this->assertEquals(6, $artikel->fresh()->jumlah_view);
    }

    public function test_publish_method()
    {
        $artikel = Artikel::factory()->create(['status' => 'draft']);

        $artikel->publish();

        $this->assertEquals('published', $artikel->fresh()->status);
        $this->assertNotNull($artikel->fresh()->tanggal_publikasi);
    }

    public function test_unique_slug_generation()
    {
        Artikel::factory()->create(['slug' => 'test-title']);

        $slug = Artikel::generateUniqueSlug('Test Title');

        $this->assertEquals('test-title-1', $slug);
    }
}
