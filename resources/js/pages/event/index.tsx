import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { PaginatedQueryResult } from '@/types/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    MapPin,
    Users,
    DollarSign,
    Clock,
    Mountain,
    Bike,
    Trophy,
    Settings,
    Eye,
    Edit,
    Trash2,
    Play,
    Square,
    CheckCircle,
    XCircle,
    UserPlus
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface Event {
    id: number;
    nama: string;
    slug: string;
    type: string;
    kategori: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    lokasi: string;
    deskripsi: string;
    max_participants: number;
    registration_fee: number;
    difficulty_level: string;
    status: string;
    banner_image_url?: string;
    sisa_kuota: number;
    is_registration_open: boolean;
    status_label: string;
    difficulty_label: string;
    type_label: string;
    kategori_label: string;
    duration: number;
    created_at: string;
    jarak_km?: number;
    terrain_type?: string;
    elevation_gain?: number;
}

interface MyPageProps {
    auth: {
        user: User | null;
    };
    [key: string]: any;
}

interface EventIndexProps {
    events: PaginatedQueryResult<Event>;
    filters: {
        status: string | null;
        type: string | null;
        kategori: string | null;
        difficulty: string | null;
        search: string | null;
        sort_by: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Events',
        href: '/events',
    },
];

export default function EventIndex() {
    const { auth, events, filters } = usePage<EventIndexProps & MyPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [typeFilter, setTypeFilter] = useState(filters.type || 'all');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori || 'all');
    const [difficultyFilter, setDifficultyFilter] = useState(filters.difficulty || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'recent');

    const [searchDebounce, setSearchDebounce] = useState(filters.search || '');

    const isAdmin = auth.user?.roles.includes('admin');
    const isVerifikator = auth.user?.roles.includes('verifikator');

    const canCreateEvent = isAdmin || isVerifikator;
    const canEditEvent = isAdmin || isVerifikator;
    const canDeleteEvent = isAdmin;
    const canManageRegistration = isAdmin || isVerifikator;
    const canChangeEventStatus = isAdmin || isVerifikator;

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (typeFilter !== 'all') params.set('type', typeFilter);
        if (kategoriFilter !== 'all') params.set('kategori', kategoriFilter);
        if (difficultyFilter !== 'all') params.set('difficulty', difficultyFilter);
        if (searchDebounce) params.set('search', searchDebounce);
        if (sortBy !== 'recent') params.set('sort_by', sortBy);

        router.get(
            '/events',
            Object.fromEntries(params.entries()),
            {
                preserveState: true,
                replace: true,
                only: ['events'],
            }
        );
    }, [statusFilter, typeFilter, kategoriFilter, difficultyFilter, searchDebounce, sortBy]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleTypeChange = (value: string) => {
        setTypeFilter(value);
    };

    const handleKategoriChange = (value: string) => {
        setKategoriFilter(value);
    };

    const handleDifficultyChange = (value: string) => {
        setDifficultyFilter(value);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setTypeFilter('all');
        setKategoriFilter('all');
        setDifficultyFilter('all');
        setSortBy('recent');
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'registration_open':
                return 'default';
            case 'ongoing':
                return 'secondary';
            case 'completed':
                return 'outline';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getDifficultyBadgeVariant = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'secondary';
            case 'medium':
                return 'default';
            case 'hard':
                return 'destructive';
            case 'expert':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'downhill':
                return <Mountain className="h-4 w-4" />;
            case 'roadbike':
                return <Bike className="h-4 w-4" />;
            default:
                return <Trophy className="h-4 w-4" />;
        }
    };

    const handleOpenRegistration = (eventId: number) => {
        if (confirm('Apakah Anda yakin ingin membuka pendaftaran event ini?')) {
            router.put(
                route('events.openRegistration', eventId),
                {},
                {
                    onSuccess: () => alert('Pendaftaran event berhasil dibuka!'),
                    onError: (errors) => alert(errors.message || 'Gagal membuka pendaftaran event.'),
                },
            );
        }
    };

    const handleCloseRegistration = (eventId: number) => {
        if (confirm('Apakah Anda yakin ingin menutup pendaftaran event ini?')) {
            router.put(
                route('events.closeRegistration', eventId),
                {},
                {
                    onSuccess: () => alert('Pendaftaran event berhasil ditutup!'),
                    onError: (errors) => alert(errors.message || 'Gagal menutup pendaftaran event.'),
                },
            );
        }
    };

    const handleStartEvent = (eventId: number) => {
        if (confirm('Apakah Anda yakin ingin memulai event ini?')) {
            router.put(
                route('events.startEvent', eventId),
                {},
                {
                    onSuccess: () => alert('Event berhasil dimulai!'),
                    onError: (errors) => alert(errors.message || 'Gagal memulai event.'),
                },
            );
        }
    };

    const handleCompleteEvent = (eventId: number) => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan event ini?')) {
            router.put(
                route('events.completeEvent', eventId),
                {},
                {
                    onSuccess: () => alert('Event berhasil diselesaikan!'),
                    onError: (errors) => alert(errors.message || 'Gagal menyelesaikan event.'),
                },
            );
        }
    };

    const handleCancelEvent = (eventId: number) => {
        const reason = prompt('Masukkan alasan pembatalan event (minimal 10 karakter):');
        if (reason && reason.trim().length >= 10) {
            router.put(
                route('events.cancelEvent', eventId),
                { cancellation_reason: reason.trim() },
                {
                    onSuccess: () => {
                        alert('Event berhasil dibatalkan!');
                    },
                    onError: (errors) => {
                        console.error('Error cancelling event:', errors);
                        const errorMessage = errors.message || (typeof errors === 'object' && errors !== null ? Object.values(errors).flat().join('\n') : 'Gagal membatalkan event.');
                        alert(errorMessage);
                    },
                },
            );
        } else if (reason !== null) {
            alert('Alasan pembatalan harus diisi minimal 10 karakter.');
        }
    };

    const handleDelete = (eventId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('events.destroy', eventId), {
                onSuccess: () => alert('Event berhasil dihapus!'),
                onError: (errors) => alert(errors.message || 'Gagal menghapus event.'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Events" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Event Management</h2>
                        <p className="text-muted-foreground">Kelola semua event cycling di platform</p>
                    </div>
                    {canCreateEvent && (
                        <Link href={route('events.create')}>
                            <Button size="lg" className="shadow-lg">
                                <Calendar className="mr-2 h-5 w-5" />
                                Tambah Event
                            </Button>
                        </Link>
                    )}
                </div>

                <Card className="shadow-lg border-0 ">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            Filter Event
                        </CardTitle>
                        <CardDescription>Saring dan cari event sesuai kriteria Anda</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                            <div className="md:col-span-2">
                                <Label htmlFor="search" className="text-sm font-medium">Pencarian</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Cari nama event, lokasi..."
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
                                <Select onValueChange={handleStatusChange} value={statusFilter}>
                                    <SelectTrigger id="status-filter" className="mt-1">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="upcoming">Akan Datang</SelectItem>
                                        <SelectItem value="ongoing">Berlangsung</SelectItem>
                                        <SelectItem value="completed">Selesai</SelectItem>
                                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        <SelectItem value="registration_open">Pendaftaran Dibuka</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="type-filter" className="text-sm font-medium">Tipe</Label>
                                <Select onValueChange={handleTypeChange} value={typeFilter}>
                                    <SelectTrigger id="type-filter" className="mt-1">
                                        <SelectValue placeholder="Pilih Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tipe</SelectItem>
                                        <SelectItem value="downhill">Downhill</SelectItem>
                                        <SelectItem value="roadbike">Road Bike</SelectItem>
                                        <SelectItem value="unsupported">Unsupported</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="difficulty-filter" className="text-sm font-medium">Kesulitan</Label>
                                <Select onValueChange={handleDifficultyChange} value={difficultyFilter}>
                                    <SelectTrigger id="difficulty-filter" className="mt-1">
                                        <SelectValue placeholder="Pilih Tingkat" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Tingkat</SelectItem>
                                        <SelectItem value="easy">Mudah</SelectItem>
                                        <SelectItem value="medium">Menengah</SelectItem>
                                        <SelectItem value="hard">Sulit</SelectItem>
                                        <SelectItem value="expert">Expert</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button type="button" variant="outline" onClick={resetFilters} className="w-full">
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium">Urutkan:</Label>
                        <Select onValueChange={handleSortChange} value={sortBy}>
                            <SelectTrigger className="w-48">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="recent">Terbaru</SelectItem>
                                <SelectItem value="popular">Populer</SelectItem>
                                <SelectItem value="date_asc">Tanggal (Asc)</SelectItem>
                                <SelectItem value="date_desc">Tanggal (Desc)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Menampilkan {events.data.length} dari {events.total} event
                    </div>
                </div>

                {events.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.data.map((event) => (
                            <Card key={event.id} className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-0 shadow-lg">
                                <div className="relative h-48 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
                                    {event.banner_image_url ? (
                                        <img
                                            src={event.banner_image_url}
                                            alt={event.nama}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-white">
                                            {getEventTypeIcon(event.type)}
                                            <span className="ml-2 text-lg font-semibold">{event.type_label}</span>
                                        </div>
                                    )}

                                    <div className="absolute top-3 left-3">
                                        <Badge variant={getStatusBadgeVariant(event.status)} className="shadow-sm">
                                            {event.status_label}
                                        </Badge>
                                    </div>

                                    <div className="absolute top-3 right-3">
                                        <Badge variant={getDifficultyBadgeVariant(event.difficulty_level)} className="shadow-sm">
                                            {event.difficulty_label}
                                        </Badge>
                                    </div>
                                </div>

                                <CardContent className="p-6">
                                    <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                        {event.nama}
                                    </h3>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                            <span>
                                                {new Date(event.tanggal_mulai).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                                {event.duration > 1 && (
                                                    <span>
                                                        {' - '}
                                                        {new Date(event.tanggal_selesai).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </span>
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-4 w-4 flex-shrink-0" />
                                            <span className="truncate">{event.lokasi}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Users className="h-4 w-4 flex-shrink-0" />
                                            <span>{event.sisa_kuota}/{event.max_participants} peserta</span>
                                        </div>

                                        {event.jarak_km && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4 flex-shrink-0" />
                                                <span>{event.jarak_km} km</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        {event.registration_fee > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-green-600" />
                                                <span className="text-lg font-semibold text-green-600">
                                                    Rp {new Intl.NumberFormat('id-ID').format(event.registration_fee)}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4 text-blue-600" />
                                                <span className="text-lg font-semibold text-blue-600">Gratis</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <Badge variant="outline" className="text-xs">
                                            {getEventTypeIcon(event.type)}
                                            <span className="ml-1">{event.type_label}</span>
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {event.kategori_label}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Link href={route('events.show', event.slug)}>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="mr-1 h-3 w-3" />
                                                Lihat
                                            </Button>
                                        </Link>

                                        {canEditEvent && (
                                            <Link href={route('events.edit', event.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="mr-1 h-3 w-3" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        )}

                                        {canManageRegistration && (
                                            <Link href={route('admin.registrations.index', { event_id: event.id })}>
                                                <Button variant="outline" size="sm">
                                                    <UserPlus className="mr-1 h-3 w-3" />
                                                    Peserta
                                                </Button>
                                            </Link>
                                        )}
                                    </div>

                                    {canChangeEventStatus && (
                                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                                            {event.status === 'upcoming' && !event.is_registration_open && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenRegistration(event.id)}
                                                    className="bg-green-50 text-green-700 hover:bg-green-100 text-xs"
                                                >
                                                    <Play className="mr-1 h-3 w-3" />
                                                    Buka Daftar
                                                </Button>
                                            )}

                                            {event.is_registration_open && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCloseRegistration(event.id)}
                                                    className="bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs"
                                                >
                                                    <Square className="mr-1 h-3 w-3" />
                                                    Tutup Daftar
                                                </Button>
                                            )}

                                            {event.status === 'upcoming' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleStartEvent(event.id)}
                                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs"
                                                >
                                                    <Play className="mr-1 h-3 w-3" />
                                                    Mulai
                                                </Button>
                                            )}

                                            {event.status === 'ongoing' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCompleteEvent(event.id)}
                                                    className="bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs"
                                                >
                                                    <CheckCircle className="mr-1 h-3 w-3" />
                                                    Selesai
                                                </Button>
                                            )}

                                            {(event.status === 'upcoming' || event.status === 'ongoing') && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCancelEvent(event.id)}
                                                    className="bg-red-50 text-red-700 hover:bg-red-100 text-xs"
                                                >
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                    Batal
                                                </Button>
                                            )}

                                            {canDeleteEvent && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-xs"
                                                >
                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                    Hapus
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="rounded-full bg-gray-100 p-6">
                                <Calendar className="h-12 w-12 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Tidak Ada Event</h3>
                                <p className="text-gray-500">Belum ada event yang sesuai dengan filter Anda.</p>
                            </div>
                            {canCreateEvent && (
                                <Link href={route('events.create')}>
                                    <Button>
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Buat Event Pertama
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                )}

                {events.links && events.data.length > 0 && (
                    <div className="flex justify-center">
                        <div className="flex rounded-lg border bg-white shadow-sm">
                            {events.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-blue-50 text-blue-600 border-blue-200'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                    } ${
                                        i === 0 ? 'rounded-l-lg' : ''
                                    } ${
                                        i === events.links.length - 1 ? 'rounded-r-lg' : ''
                                    } border-r border-gray-200 last:border-r-0`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
