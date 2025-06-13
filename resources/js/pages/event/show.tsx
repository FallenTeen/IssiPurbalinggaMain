import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    Edit,
    MapPin,
    Mountain,
    Play,
    Route,
    Settings,
    Share2,
    Square,
    Star,
    Trash2,
    UserPlus,
    Users,
    XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

interface Event {
    id: number;
    nama: string;
    slug: string;
    type: 'downhill' | 'roadbike' | 'unsupported';
    kategori: 'amatir' | 'professional' | 'junior' | 'senior';
    tanggal_mulai: string;
    tanggal_selesai: string;
    lokasi: string;
    deskripsi: string;
    max_participants: number;
    registration_fee: number;
    difficulty_level: 'easy' | 'medium' | 'hard' | 'expert';
    requirements: string[];
    weather_dependency: boolean;
    terrain_type: 'road' | 'mountain' | 'mixed';
    elevation_gain: number;
    jarak_km: number;
    status: 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'ongoing' | 'completed' | 'cancelled';
    banner_image_url?: string;
    gallery_urls: string[];
    event_features: string[];
    popularity_score: number;
    success_rate: number;
    created_at: string;
    updated_at: string;
    is_registration_open: boolean;
    sisa_kuota: number;
    status_label: string;
    difficulty_label: string;
    type_label: string;
    kategori_label: string;
    duration: number;
    is_upcoming: boolean;
    is_ongoing: boolean;
    is_past: boolean;
    registration_percentage: number;
}

interface Props {
    event: Event;
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const EventShow: React.FC<Props> = ({ event, auth, flash }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const isAdmin = auth.user?.roles?.some((role) => role.name === 'admin');
    const isVerifikator = auth.user?.roles?.some((role) => role.name === 'verifikator');
    const canManage = isAdmin || isVerifikator;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Events',
            href: '/events',
        },
        {
            title: event.nama,
            href: '#',
        },
    ];

    const handleDelete = () => {
        setActionLoading(true);
        router.delete(route('events.destroy', event.id), {
            onFinish: () => {
                setActionLoading(false);
                setDeleteDialogOpen(false);
            },
        });
    };

    const handleStatusChange = (action: string) => {
        setActionLoading(true);
        const routes = {
            'open-registration': route('events.openRegistration', event.id),
            'close-registration': route('events.closeRegistration', event.id),
            start: route('events.startEvent', event.id),
            complete: route('events.completeEvent', event.id),
            cancel: route('events.cancelEvent', event.id),
        };

        router.put(
            routes[action as keyof typeof routes],
            {},
            {
                onFinish: () => setActionLoading(false),
            },
        );
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'published':
                return 'secondary';
            case 'registration_open':
                return 'default';
            case 'registration_closed':
                return 'outline';
            case 'ongoing':
                return 'default';
            case 'completed':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            case 'draft':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'easy':
                return 'text-green-600';
            case 'medium':
                return 'text-yellow-600';
            case 'hard':
                return 'text-orange-600';
            case 'expert':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
        }).format(amount);
    };
    const ensureArray = (value: string | string[] | null | undefined): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            } catch {
                return value
                    .split(/[,;\n]/)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }
        }
        return [];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={event.nama} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert className="border-red-200 bg-red-50">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                        <div className="mb-4 flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('events.index')}>
                                    <ArrowLeft className="mr-1 h-4 w-4" />
                                    Kembali
                                </Link>
                            </Button>
                        </div>

                        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900">{event.nama}</h1>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <Badge variant={getStatusBadgeVariant(event.status)}>{event.status_label}</Badge>
                            <Badge variant="outline">{event.type_label}</Badge>
                            <Badge variant="outline">{event.kategori_label}</Badge>
                            <Badge variant="outline" className={getDifficultyColor(event.difficulty_level)}>
                                {event.difficulty_label}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {!canManage && event.is_registration_open && (
                            <Button asChild size="lg" className="shadow-lg">
                                <Link href={route('registrations.create', event.id)}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Daftar Sekarang
                                </Link>
                            </Button>
                        )}

                        {canManage && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={route('events.edit', event.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>

                                {event.status === 'published' && (
                                    <Button onClick={() => handleStatusChange('open-registration')} disabled={actionLoading}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Buka Pendaftaran
                                    </Button>
                                )}

                                {event.status === 'registration_open' && (
                                    <Button variant="secondary" onClick={() => handleStatusChange('close-registration')} disabled={actionLoading}>
                                        <Square className="mr-2 h-4 w-4" />
                                        Tutup Pendaftaran
                                    </Button>
                                )}

                                {event.status === 'registration_closed' && event.is_upcoming && (
                                    <Button onClick={() => handleStatusChange('start')} disabled={actionLoading}>
                                        <Play className="mr-2 h-4 w-4" />
                                        Mulai Event
                                    </Button>
                                )}

                                {event.status === 'ongoing' && (
                                    <>
                                        <Button onClick={() => handleStatusChange('complete')} disabled={actionLoading}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Selesaikan
                                        </Button>
                                        <Button variant="destructive" onClick={() => handleStatusChange('cancel')} disabled={actionLoading}>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Batalkan
                                        </Button>
                                    </>
                                )}

                                <Button variant="outline" asChild>
                                    <Link href={route('admin.registrations.index', { event: event.id })}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Kelola Pendaftaran
                                    </Link>
                                </Button>

                                {isAdmin && (
                                    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" size="sm">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Hapus
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Konfirmasi Hapus Event</DialogTitle>
                                                <DialogDescription>
                                                    Apakah Anda yakin ingin menghapus event "{event.nama}"? Tindakan ini tidak dapat dibatalkan.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                                    Batal
                                                </Button>
                                                <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                                                    Hapus Event
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </>
                        )}

                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Bagikan
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-6 lg:col-span-2">
                        {event.banner_image_url && (
                            <Card className="overflow-hidden border-0 shadow-lg">
                                <CardContent className="p-0">
                                    <img src={event.banner_image_url} alt={event.nama} className="h-64 w-full object-cover md:h-80" />
                                </CardContent>
                            </Card>
                        )}
                        <Card className="border-0 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Deskripsi Event
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="leading-relaxed whitespace-pre-line text-gray-700">{event.deskripsi}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {ensureArray(event.requirements).length > 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        Persyaratan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {ensureArray(event.requirements).map((requirement, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                                                <span className="text-gray-700">{requirement}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {ensureArray(event.event_features).length > 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-yellow-500" />
                                        Fasilitas Event
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        {ensureArray(event.event_features).map((feature, index) => (
                                            <div key={index} className="flex items-center rounded-lg bg-gray-50 p-2">
                                                <Star className="mr-2 h-4 w-4 flex-shrink-0 text-yellow-500" />
                                                <span className="text-gray-700">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {ensureArray(event.gallery_urls).length > 0 && (
                            <Card className="border-0 shadow-lg">
                                <CardHeader>
                                    <CardTitle>Galeri</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {ensureArray(event.gallery_urls).map((url, index) => (
                                            <img
                                                key={index}
                                                src={url}
                                                alt={`Gallery ${index + 1}`}
                                                className="h-32 w-full cursor-pointer rounded-lg object-cover shadow-sm transition-opacity hover:opacity-90"
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-500" />
                                    Informasi Event
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                    <Calendar className="mt-0.5 h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tanggal Mulai</p>
                                        <p className="font-semibold text-gray-900">{formatDate(event.tanggal_mulai)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                    <Calendar className="mt-0.5 h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Tanggal Selesai</p>
                                        <p className="font-semibold text-gray-900">{formatDate(event.tanggal_selesai)}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                    <MapPin className="mt-0.5 h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Lokasi</p>
                                        <p className="font-semibold text-gray-900">{event.lokasi}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                    <Clock className="mt-0.5 h-5 w-5 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Durasi</p>
                                        <p className="font-semibold text-gray-900">{event.duration} hari</p>
                                    </div>
                                </div>

                                {event.jarak_km && (
                                    <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                        <Route className="mt-0.5 h-5 w-5 text-purple-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Jarak</p>
                                            <p className="font-semibold text-gray-900">{event.jarak_km} km</p>
                                        </div>
                                    </div>
                                )}

                                {event.elevation_gain && (
                                    <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                        <Mountain className="mt-0.5 h-5 w-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Elevasi</p>
                                            <p className="font-semibold text-gray-900">{event.elevation_gain} m</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus className="h-5 w-5 text-green-500" />
                                    Pendaftaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {event.registration_fee > 0 && (
                                    <div className="flex items-start space-x-3 rounded-lg bg-white/70 p-3">
                                        <DollarSign className="mt-0.5 h-5 w-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Biaya Pendaftaran</p>
                                            <p className="text-lg font-bold text-gray-900">{formatCurrency(event.registration_fee)}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-lg bg-white/70 p-4">
                                    <div className="mb-3 flex items-start space-x-3">
                                        <Users className="mt-0.5 h-5 w-5 text-blue-500" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-500">Kuota Peserta</p>
                                            <p className="font-bold text-gray-900">
                                                {event.max_participants - event.sisa_kuota} / {event.max_participants}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-2 h-3 w-full rounded-full bg-gray-200">
                                        <div
                                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                            style={{ width: `${event.registration_percentage}%` }}
                                        ></div>
                                    </div>

                                    <p className="text-sm font-medium text-gray-600">
                                        Sisa: {event.sisa_kuota} peserta ({(100 - event.registration_percentage).toFixed(1)}%)
                                    </p>
                                </div>

                                {event.weather_dependency && (
                                    <Alert className="border-yellow-200 bg-yellow-50">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">Event ini bergantung pada kondisi cuaca</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {canManage && (
                            <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5 text-purple-500" />
                                        Statistik
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between rounded bg-white/70 p-2">
                                        <span className="font-medium text-gray-600">Popularity Score</span>
                                        <Badge variant="secondary" className="font-bold">
                                            {event.popularity_score}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between rounded bg-white/70 p-2">
                                        <span className="font-medium text-gray-600">Success Rate</span>
                                        <Badge variant="secondary" className="font-bold">
                                            {event.success_rate}%
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between rounded bg-white/70 p-2">
                                        <span className="font-medium text-gray-600">Tingkat Pendaftaran</span>
                                        <Badge variant="secondary" className="font-bold">
                                            {event.registration_percentage}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default EventShow;
