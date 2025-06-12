<?php
namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\Event;
use App\Models\Registrasi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EventTest extends TestCase
{
    use RefreshDatabase;

    public function test_event_has_many_registrations()
    {
        $event = Event::factory()->create();
        $registrasi = Registrasi::factory()->create(['event_id' => $event->id]);

        $this->assertInstanceOf('Illuminate\Database\Eloquent\Collection', $event->registrations);
        $this->assertTrue($event->registrations->contains($registrasi));
    }

    public function test_upcoming_scope()
    {
        $upcomingEvent = Event::factory()->create([
            'tanggal_mulai' => now()->addWeek()
        ]);

        $pastEvent = Event::factory()->create([
            'tanggal_mulai' => now()->subWeek()
        ]);

        $results = Event::upcoming()->get();

        $this->assertTrue($results->contains($upcomingEvent));
        $this->assertFalse($results->contains($pastEvent));
    }

    public function test_registration_quota_calculation()
    {
        $event = Event::factory()->create(['max_participants' => 10]);

        // Create 3 confirmed registrations
        Registrasi::factory()->count(3)->create([
            'event_id' => $event->id,
            'status' => 'confirmed'
        ]);

        // Create 2 pending registrations (should not count)
        Registrasi::factory()->count(2)->create([
            'event_id' => $event->id,
            'status' => 'pending'
        ]);

        $this->assertEquals(7, $event->sisa_kuota);
        $this->assertEquals(30, $event->registration_percentage);
    }

    public function test_can_register()
    {
        $event = Event::factory()->create([
            'status' => 'registration_open',
            'max_participants' => 10,
            'tanggal_mulai' => now()->addWeek()
        ]);

        $this->assertTrue($event->canRegister());

        // Fill up the event
        Registrasi::factory()->count(10)->create([
            'event_id' => $event->id,
            'status' => 'confirmed'
        ]);

        $this->assertFalse($event->fresh()->canRegister());
    }
}
