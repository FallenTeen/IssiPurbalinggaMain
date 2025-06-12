<?php

namespace App\Http\Controllers;

use App\Models\InteraksiUser;
use Illuminate\Http\Request;

class InteraksiUserController extends Controller
{
    /**
     * Display a listing of user interactions.
     */
    public function index(Request $request)
    {
        $query = InteraksiUser::with(['user', 'artikel', 'event']);

        if ($request->has('user_id')) {
            $query->byUser($request->user_id);
        }

        if ($request->has('artikel_id')) {
            $query->byArtikel($request->artikel_id);
        }

        if ($request->has('event_id')) {
            $query->byEvent($request->event_id);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('period')) {
            if ($request->period === 'today') {
                $query->today();
            } elseif ($request->period === 'this_week') {
                $query->thisWeek();
            }
            // Add more periods as needed (e.g., this_month, last_month)
        }

        $interactions = $query->latest()->paginate(20);

        return view('interaksi_users.index', compact('interactions'));
    }

    /**
     * Store a new user interaction.
     */
    public function store(Request $request)
    {
        $request->validate([
            'tipe_interaksi' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'artikel_id' => 'nullable|exists:artikels,id',
            'event_id' => 'nullable|exists:events,id',
            'interaction_value' => 'nullable|numeric',
            'metadata' => 'nullable|array',
            'durasi_baca' => 'nullable|integer',
            'device_type' => 'nullable|string',
        ]);

        InteraksiUser::recordInteraction($request->all());

        return response()->json(['message' => 'Interaksi berhasil dicatat.'], 201);
    }

    /**
     * Display the specified user interaction.
     */
    public function show(InteraksiUser $interaksiUser)
    {
        return view('interaksi_users.show', compact('interaksiUser'));
    }

    /**
     * Remove the specified user interaction from storage.
     */
    public function destroy(InteraksiUser $interaksiUser)
    {
        $interaksiUser->delete();
        return redirect()->route('interaksi_users.index')->with('success', 'Interaksi berhasil dihapus!');
    }
}
