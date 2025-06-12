<?php
namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Artikel;
use App\Models\KategoriArtikel;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ArtikelControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_published_articles()
    {
        $artikel = Artikel::factory()->published()->create();

        $response = $this->get("/artikel/{$artikel->slug}");

        $response->assertStatus(200);
        $response->assertSee($artikel->judul);
    }

    public function test_article_view_is_incremented()
    {
        $artikel = Artikel::factory()->published()->create(['jumlah_view' => 5]);

        $this->get("/artikel/{$artikel->slug}");

        $this->assertEquals(6, $artikel->fresh()->jumlah_view);
    }

    public function test_reporter_can_create_article()
    {
        $reporter = User::factory()->create(['role' => 'reporter']);
        $kategori = KategoriArtikel::factory()->create();

        $this->actingAs($reporter);

        $response = $this->post('/admin/artikel', [
            'judul' => 'Test Article',
            'content' => 'This is test content',
            'kategori_id' => $kategori->id,
            'status' => 'draft'
        ]);

        $response->assertStatus(302);
        $this->assertDatabaseHas('artikels', [
            'judul' => 'Test Article',
            'reporter_id' => $reporter->id
        ]);
    }
}
