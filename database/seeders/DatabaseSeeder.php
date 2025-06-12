<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('interaksi_users')->truncate();
        DB::table('registrasis')->truncate();
        DB::table('artikels')->truncate();
        DB::table('kategori_artikels')->truncate();
        DB::table('events')->truncate();
        DB::table('model_mls')->truncate();
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_roles')->truncate();
        DB::table('role_has_permissions')->truncate();
        DB::table('roles')->truncate();
        DB::table('permissions')->truncate();
        DB::table('users')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 1. Seed Permissions
        $permissions = [
            // User Management
            'create-users',
            'read-users',
            'update-users',
            'delete-users',
            'create-articles',
            'read-articles',
            'update-articles',
            'delete-articles',
            'publish-articles',
            'create-events',
            'read-events',
            'update-events',
            'delete-events',
            'publish-events',
            'read-registrations',
            'update-registrations',
            'delete-registrations',
            'create-ml-models',
            'read-ml-models',
            'update-ml-models',
            'delete-ml-models',
            'create-categories',
            'read-categories',
            'update-categories',
            'delete-categories',
            'read-analytics',
            'read-interactions',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Seed Roles
        $adminRole = Role::create(['name' => 'admin', 'guard_name' => 'web']);
        $reporterRole = Role::create(['name' => 'reporter', 'guard_name' => 'web']);
        $verifikatorRole = Role::create(['name' => 'verifikator', 'guard_name' => 'web']);
        $userRole = Role::create(['name' => 'user', 'guard_name' => 'web']);

        $adminRole->givePermissionTo(Permission::all());
        $reporterRole->givePermissionTo([
            'create-articles',
            'read-articles',
            'update-articles',
            'read-events',
            'read-categories',
            'read-registrations'
        ]);
        $verifikatorRole->givePermissionTo([
            'read-articles',
            'update-articles',
            'publish-articles',
            'read-events',
            'update-events',
            'publish-events',
            'read-registrations',
            'update-registrations'
        ]);
        $userRole->givePermissionTo(['read-articles', 'read-events']);

        // 3. Seed Users
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'admin@cycling.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Super+Admin&background=dc2626&color=fff',
                'profile_data' => json_encode([
                    'phone' => '+62812345678',
                    'address' => 'Jakarta, Indonesia',
                    'bio' => 'System Administrator'
                ]),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Reporter Budi',
                'email' => 'reporter@cycling.com',
                'password' => Hash::make('password'),
                'role' => 'reporter',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Reporter+Budi&background=2563eb&color=fff',
                'profile_data' => json_encode([
                    'phone' => '+62812345679',
                    'address' => 'Bandung, Indonesia',
                    'bio' => 'Sports Reporter specializing in cycling events'
                ]),
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Verifikator Sari',
                'email' => 'verifikator@cycling.com',
                'password' => Hash::make('password'),
                'role' => 'verifikator',
                'avatar_url' => 'https://ui-avatars.com/api/?name=Verifikator+Sari&background=16a34a&color=fff',
                'profile_data' => json_encode([
                    'phone' => '+62812345680',
                    'address' => 'Surabaya, Indonesia',
                    'bio' => 'Content Verifier and Editor'
                ]),
                'email_verified_at' => now(),
            ],
        ];

        $createdUsers = [];
        foreach ($users as $userData) {
            $user = User::create($userData);
            $user->assignRole($userData['role']);
            $createdUsers[] = $user;
        }

        for ($i = 1; $i <= 10; $i++) {
            $user = User::create([
                'name' => "User $i",
                'email' => "user$i@example.com",
                'password' => Hash::make('password'),
                'role' => 'user',
                'avatar_url' => "https://ui-avatars.com/api/?name=User+$i&background=6b7280&color=fff",
                'profile_data' => json_encode([
                    'phone' => '+6281234567' . str_pad($i, 2, '0', STR_PAD_LEFT),
                    'address' => 'Indonesia',
                    'bio' => "Cycling enthusiast #$i"
                ]),
                'email_verified_at' => now(),
            ]);
            $user->assignRole('user');
            $createdUsers[] = $user;
        }

        // 4. Seed Kategori Artikel
        $categories = [
            [
                'nama' => 'Berita Cycling',
                'slug' => 'berita-cycling',
                'deskripsi' => 'Berita terkini seputar dunia cycling',
                'color_code' => '#dc2626',
                'icon' => 'newspaper',
                'sort_order' => 1,
            ],
            [
                'nama' => 'Tips & Tricks',
                'slug' => 'tips-tricks',
                'deskripsi' => 'Tips dan trik untuk cyclists',
                'color_code' => '#2563eb',
                'icon' => 'lightbulb',
                'sort_order' => 2,
            ],
            [
                'nama' => 'Review Gear',
                'slug' => 'review-gear',
                'deskripsi' => 'Review peralatan cycling',
                'color_code' => '#16a34a',
                'icon' => 'star',
                'sort_order' => 3,
            ],
            [
                'nama' => 'Event Report',
                'slug' => 'event-report',
                'deskripsi' => 'Laporan dari berbagai event cycling',
                'color_code' => '#ca8a04',
                'icon' => 'calendar',
                'sort_order' => 4,
            ],
            [
                'nama' => 'Health & Fitness',
                'slug' => 'health-fitness',
                'deskripsi' => 'Kesehatan dan kebugaran untuk cyclists',
                'color_code' => '#dc2626',
                'icon' => 'heart',
                'sort_order' => 5,
            ],
        ];

        $createdCategories = [];
        foreach ($categories as $category) {
            $createdCategories[] = DB::table('kategori_artikels')->insertGetId(array_merge($category, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 5. Seed Events
        $events = [
            [
                'nama' => 'Jakarta Downhill Championship 2025',
                'slug' => 'jakarta-downhill-championship-2025',
                'type' => 'downhill',
                'kategori' => 'professional',
                'tanggal_mulai' => Carbon::now()->addMonths(2),
                'tanggal_selesai' => Carbon::now()->addMonths(2)->addDays(2),
                'lokasi' => 'Sentul, Bogor',
                'deskripsi' => 'Kompetisi downhill terbesar di Jakarta dengan hadiah jutaan rupiah',
                'max_participants' => 150,
                'registration_fee' => 500000,
                'difficulty_level' => 'expert',
                'requirements' => json_encode(['helmet', 'protective_gear', 'mountain_bike']),
                'weather_dependency' => true,
                'terrain_type' => 'mountain',
                'elevation_gain' => 500,
                'jarak_km' => 5.5,
                'status' => 'registration_open',
                'banner_image_url' => 'https://picsum.photos/800/400?random=1',
                'event_features' => json_encode(['prize_money', 'live_streaming', 'food_court']),
                'popularity_score' => 0.85,
                'success_rate' => 0.92,
            ],
            [
                'nama' => 'Bandung Road Bike Festival',
                'slug' => 'bandung-road-bike-festival',
                'type' => 'roadbike',
                'kategori' => 'amatir',
                'tanggal_mulai' => Carbon::now()->addWeeks(6),
                'tanggal_selesai' => Carbon::now()->addWeeks(6),
                'lokasi' => 'Bandung, Jawa Barat',
                'deskripsi' => 'Festival road bike untuk semua kalangan dengan rute pemandangan indah',
                'max_participants' => 300,
                'registration_fee' => 150000,
                'difficulty_level' => 'medium',
                'requirements' => json_encode(['helmet', 'road_bike']),
                'weather_dependency' => false,
                'terrain_type' => 'road',
                'elevation_gain' => 200,
                'jarak_km' => 25.0,
                'status' => 'registration_open',
                'banner_image_url' => 'https://picsum.photos/800/400?random=2',
                'event_features' => json_encode(['scenic_route', 'rest_stops', 'certificate']),
                'popularity_score' => 0.78,
                'success_rate' => 0.88,
            ],
            [
                'nama' => 'Solo Unsupported Ultra',
                'slug' => 'solo-unsupported-ultra',
                'type' => 'unsupported',
                'kategori' => 'senior',
                'tanggal_mulai' => Carbon::now()->addMonths(3),
                'tanggal_selesai' => Carbon::now()->addMonths(3)->addDays(3),
                'lokasi' => 'Solo - Yogyakarta',
                'deskripsi' => 'Tantangan unsupported cycling dari Solo ke Yogyakarta',
                'max_participants' => 50,
                'registration_fee' => 750000,
                'difficulty_level' => 'expert',
                'requirements' => json_encode(['gps_device', 'emergency_kit', 'touring_bike']),
                'weather_dependency' => true,
                'terrain_type' => 'mixed',
                'elevation_gain' => 800,
                'jarak_km' => 120.0,
                'status' => 'published',
                'banner_image_url' => 'https://picsum.photos/800/400?random=3',
                'event_features' => json_encode(['gps_tracking', 'emergency_support', 'finisher_medal']),
                'popularity_score' => 0.65,
                'success_rate' => 0.72,
            ],
        ];

        $createdEvents = [];
        foreach ($events as $event) {
            $createdEvents[] = DB::table('events')->insertGetId(array_merge($event, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 6. Seed Artikel
        $articles = [
            [
                'judul' => 'Tips Memilih Sepeda Gunung yang Tepat untuk Pemula',
                'slug' => 'tips-memilih-sepeda-gunung-pemula',
                'content' => '<p>Memilih sepeda gunung yang tepat untuk pemula memerlukan pertimbangan khusus. Berikut adalah beberapa tips yang dapat membantu Anda dalam memilih sepeda gunung yang sesuai dengan kebutuhan dan budget.</p><p>Pertama, tentukan budget Anda. Sepeda gunung entry-level biasanya berkisar antara 3-8 juta rupiah. Kedua, pilih ukuran frame yang sesuai dengan tinggi badan Anda. Ketiga, pertimbangkan jenis terrain yang akan Anda lalui.</p>',
                'excerpt' => 'Panduan lengkap memilih sepeda gunung untuk pemula dengan budget terbatas',
                'reporter_id' => $createdUsers[1]->id,
                'kategori_id' => $createdCategories[1],
                'status' => 'published',
                'featured_image_url' => 'https://picsum.photos/800/600?random=4',
                'tags' => json_encode(['sepeda gunung', 'pemula', 'tips', 'mountain bike']),
                'meta_description' => 'Tips memilih sepeda gunung yang tepat untuk pemula dengan budget terbatas',
                'reading_time' => 5,
                'jumlah_view' => 1250,
                'jumlah_like' => 89,
                'jumlah_share' => 23,
                'tanggal_publikasi' => now()->subDays(10),
                'sentiment_score' => 0.8,
                'readability_score' => 0.75,
                'keywords_extracted' => json_encode(['sepeda gunung', 'pemula', 'budget', 'frame']),
            ],
            [
                'judul' => 'Laporan Event: Jakarta Cycling Week 2024',
                'slug' => 'laporan-jakarta-cycling-week-2024',
                'content' => '<p>Jakarta Cycling Week 2024 telah berlangsung dengan sukses pada tanggal 15-17 Desember 2024. Event ini dihadiri oleh lebih dari 2000 peserta dari berbagai daerah di Indonesia.</p><p>Berbagai kategori perlombaan diselenggarakan, mulai dari road race, mountain bike, hingga BMX. Antusiasme peserta sangat tinggi dan cuaca mendukung sepanjang acara berlangsung.</p>',
                'excerpt' => 'Laporan lengkap acara Jakarta Cycling Week 2024 yang dihadiri ribuan peserta',
                'reporter_id' => $createdUsers[1]->id,
                'kategori_id' => $createdCategories[3],
                'status' => 'published',
                'featured_image_url' => 'https://picsum.photos/800/600?random=5',
                'tags' => json_encode(['jakarta', 'cycling week', 'event', 'laporan']),
                'meta_description' => 'Laporan Jakarta Cycling Week 2024 dengan ribuan peserta',
                'reading_time' => 7,
                'jumlah_view' => 2100,
                'jumlah_like' => 156,
                'jumlah_share' => 45,
                'tanggal_publikasi' => now()->subDays(5),
                'sentiment_score' => 0.9,
                'readability_score' => 0.8,
                'keywords_extracted' => json_encode(['jakarta', 'cycling', 'event', 'peserta']),
            ],
            [
                'judul' => 'Review: Helm Specialized Ambush 2024',
                'slug' => 'review-helm-specialized-ambush-2024',
                'content' => '<p>Helm Specialized Ambush adalah salah satu helm mountain bike terbaru yang menawarkan perlindungan maksimal dengan desain yang aerodinamis. Setelah menggunakan helm ini selama 3 bulan, berikut adalah review lengkap kami.</p><p>Kelebihan utama helm ini adalah sistem ventilasi yang sangat baik dan material yang ringan namun kuat. Harga yang ditawarkan juga cukup kompetitif di kelasnya.</p>',
                'excerpt' => 'Review lengkap helm Specialized Ambush 2024 untuk mountain biking',
                'reporter_id' => $createdUsers[1]->id,
                'kategori_id' => $createdCategories[2],
                'status' => 'published',
                'featured_image_url' => 'https://picsum.photos/800/600?random=6',
                'tags' => json_encode(['helm', 'specialized', 'review', 'mountain bike', 'gear']),
                'meta_description' => 'Review helm Specialized Ambush 2024 untuk mountain bike',
                'reading_time' => 6,
                'jumlah_view' => 890,
                'jumlah_like' => 67,
                'jumlah_share' => 18,
                'tanggal_publikasi' => now()->subDays(3),
                'sentiment_score' => 0.85,
                'readability_score' => 0.78,
                'keywords_extracted' => json_encode(['helm', 'specialized', 'mountain bike', 'review']),
            ],
        ];

        $createdArticles = [];
        foreach ($articles as $article) {
            $createdArticles[] = DB::table('artikels')->insertGetId(array_merge($article, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 7. Seed Registrasi
        $registrations = [];
        $usedCombinations = [];

        for ($i = 0; $i < 20; $i++) {
            $maxAttempts = 50;
            $attempts = 0;

            do {
                $user = $createdUsers[array_rand($createdUsers)];
                $event = $createdEvents[array_rand($createdEvents)];
                $combination = $user->id . '-' . $event;
                $attempts++;

                if ($attempts >= $maxAttempts) {
                    $this->command->warn("Skipping registration $i - couldn't find unique combination after $maxAttempts attempts");
                    break;
                }
            } while (in_array($combination, $usedCombinations));

            if ($attempts < $maxAttempts) {
                $usedCombinations[] = $combination;

                $registrations[] = [
                    'user_id' => $user->id,
                    'event_id' => $event,
                    'kode_registrasi' => 'REG' . str_pad($i + 1, 6, '0', STR_PAD_LEFT),
                    'status' => ['pending', 'confirmed', 'cancelled'][rand(0, 2)],
                    'status_pembayaran' => ['pending', 'paid', 'failed'][rand(0, 2)],
                    'metode_pembayaran' => ['bank_transfer', 'gopay', 'ovo', 'dana'][rand(0, 3)],
                    'data_registrasi' => json_encode([
                        'emergency_contact' => '+62812345678',
                        'medical_condition' => 'Sehat',
                        'bike_type' => 'Mountain Bike',
                    ]),
                    'kontak_darurat' => json_encode([
                        'nama' => 'Emergency Contact',
                        'telepon' => '+62812345678',
                        'hubungan' => 'Keluarga'
                    ]),
                    'pengalaman' => ['pemula', 'menengah', 'mahir'][rand(0, 2)],
                    'spesifikasi_sepeda' => json_encode([
                        'merk' => 'Polygon',
                        'type' => 'Mountain Bike',
                        'ukuran' => 'M'
                    ]),
                    'biaya_pendaftaran' => [150000, 500000, 750000][rand(0, 2)],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        if (!empty($registrations)) {
            DB::table('registrasis')->insert($registrations);
        }

        // 8. Seed Model ML
        $mlModels = [
            [
                'nama_model' => 'Article Classifier',
                'tipe_model' => 'classification',
                'versi' => 'v1.0',
                'deskripsi' => 'Model untuk mengklasifikasikan artikel berdasarkan kategori',
                'model_path' => '/models/article_classifier_v1.pkl',
                'model_parameters' => json_encode(['algorithm' => 'Random Forest', 'n_estimators' => 100]),
                'training_data_info' => json_encode(['samples' => 5000, 'features' => 150]),
                'accuracy_score' => 0.8950,
                'precision_score' => 0.8800,
                'recall_score' => 0.8750,
                'f1_score' => 0.8775,
                'status' => 'ready',
                'is_active' => true,
                'created_by' => $createdUsers[0]->id,
                'last_trained_at' => now()->subDays(30),
                'training_samples' => 4000,
                'validation_samples' => 1000,
            ],
            [
                'nama_model' => 'Event Recommender',
                'tipe_model' => 'recommendation',
                'versi' => 'v1.2',
                'deskripsi' => 'Model rekomendasi event berdasarkan preferensi user',
                'model_path' => '/models/event_recommender_v1.pkl',
                'model_parameters' => json_encode(['algorithm' => 'Collaborative Filtering', 'factors' => 50]),
                'training_data_info' => json_encode(['samples' => 3000, 'users' => 500, 'events' => 200]),
                'accuracy_score' => 0.7850,
                'precision_score' => 0.7900,
                'recall_score' => 0.7750,
                'f1_score' => 0.7825,
                'status' => 'ready',
                'is_active' => true,
                'created_by' => $createdUsers[0]->id,
                'last_trained_at' => now()->subDays(15),
                'training_samples' => 2400,
                'validation_samples' => 600,
            ],
            [
                'nama_model' => 'Sentiment Analyzer',
                'tipe_model' => 'sentiment_analysis',
                'versi' => 'v2.0',
                'deskripsi' => 'Model analisis sentimen untuk komentar dan artikel',
                'model_path' => '/models/sentiment_analyzer_v2.pkl',
                'model_parameters' => json_encode(['algorithm' => 'LSTM', 'layers' => 3, 'units' => 128]),
                'training_data_info' => json_encode(['samples' => 10000, 'languages' => ['id', 'en']]),
                'accuracy_score' => 0.9200,
                'precision_score' => 0.9150,
                'recall_score' => 0.9100,
                'f1_score' => 0.9125,
                'status' => 'ready',
                'is_active' => true,
                'created_by' => $createdUsers[0]->id,
                'last_trained_at' => now()->subDays(7),
                'training_samples' => 8000,
                'validation_samples' => 2000,
            ],
        ];

        foreach ($mlModels as $model) {
            DB::table('model_mls')->insert(array_merge($model, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 9. Seed User Interactions
        $interactions = [];
        $interactionTypes = ['view', 'like', 'share', 'comment', 'bookmark', 'click'];
        $deviceTypes = ['desktop', 'mobile', 'tablet'];

        for ($i = 0; $i < 500; $i++) {
            $user = $createdUsers[array_rand($createdUsers)];
            $article = $createdArticles[array_rand($createdArticles)];
            $interactionType = $interactionTypes[array_rand($interactionTypes)];

            $interactions[] = [
                'user_id' => $user->id,
                'artikel_id' => $article,
                'event_id' => null,
                'tipe_interaksi' => $interactionType,
                'interaction_value' => $interactionType === 'view' ? null : '1',
                'metadata' => json_encode(['source' => 'web', 'referrer' => 'google']),
                'durasi_baca' => $interactionType === 'view' ? rand(30, 300) : null,
                'device_type' => $deviceTypes[array_rand($deviceTypes)],
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'ip_address' => '192.168.1.' . rand(1, 255),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ];
        }

        for ($i = 0; $i < 200; $i++) {
            $user = $createdUsers[array_rand($createdUsers)];
            $event = $createdEvents[array_rand($createdEvents)];
            $interactionType = ['view', 'like', 'share', 'register'][array_rand(['view', 'like', 'share', 'register'])];

            $interactions[] = [
                'user_id' => $user->id,
                'artikel_id' => null,
                'event_id' => $event,
                'tipe_interaksi' => $interactionType,
                'interaction_value' => $interactionType === 'view' ? null : '1',
                'metadata' => json_encode(['source' => 'mobile_app', 'referrer' => 'direct']),
                'durasi_baca' => null,
                'device_type' => $deviceTypes[array_rand($deviceTypes)],
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
                'ip_address' => '192.168.1.' . rand(1, 255),
                'created_at' => now()->subDays(rand(1, 30)),
                'updated_at' => now(),
            ];
        }

        DB::table('interaksi_users')->insert($interactions);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Default accounts:');
        $this->command->info('Admin: admin@cycling.com / password');
        $this->command->info('Reporter: reporter@cycling.com / password');
        $this->command->info('Verifikator: verifikator@cycling.com / password');
        $this->command->info('Users: user1@example.com to user10@example.com / password');
    }
}
