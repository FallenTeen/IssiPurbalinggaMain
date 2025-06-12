<?php
namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\InteraksiUser;
use App\Models\User;
use App\Models\Artikel;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;

class InteraksiUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_interaksi_belongs_to_user()
    {
        $user = User::factory()->create();
        $interaksi = InteraksiUser::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $interaksi->user);
        $this->assertEquals($user->id, $interaksi->user->id);
    }

    public function test_record_interaction()
    {
        $user = User::factory()->create();
        $artikel = Artikel::factory()->create();

        $interaksi = InteraksiUser::recordInteraction([
            'user_id' => $user->id,
            'artikel_id' => $artikel->id,
            'tipe_interaksi' => 'view',
            'durasi_baca' => 30
        ]);

        $this->assertDatabaseHas('interaksi_users', [
            'user_id' => $user->id,
            'artikel_id' => $artikel->id,
            'tipe_interaksi' => 'view',
            'durasi_baca' => 30
        ]);
    }

    public function test_by_type_scope()
    {
        InteraksiUser::factory()->create(['tipe_interaksi' => 'view']);
        InteraksiUser::factory()->create(['tipe_interaksi' => 'like']);

        $viewInteractions = InteraksiUser::byType('view')->get();

        $this->assertEquals(1, $viewInteractions->count());
        $this->assertEquals('view', $viewInteractions->first()->tipe_interaksi);
    }
}
