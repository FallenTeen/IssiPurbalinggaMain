import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

interface KategoriArtikel {
    id: number;
    nama: string;
}

interface Event {
    id: number;
    nama: string;
}

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    content: string;
    reporter: User;
    kategori: KategoriArtikel;
    status: 'draft' | 'review' | 'published' | 'archived';
    rejection_reason: string | null;
    featured_image_url: string | null;
    gallery_urls: string[];
    tags: string[] | null;
    meta_description: string | null;
    tanggal_publikasi: string | null;
    views_count: number;
    created_at: string;
    updated_at: string;
    event_terkait: number[] | null;
    related_events?: Event[];
}

interface ArtikelShowProps {
    artikel: Artikel;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Artikel',
        href: '/artikels',
    },
    {
        title: 'Detail',
        href: '#',
    },
];

export default function ArtikelShow({ artikel }: ArtikelShowProps) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;

    const dynamicBreadcrumbs: BreadcrumbItem[] = [
        ...breadcrumbs.slice(0, 2),
        {
            title: artikel.judul,
            href: route('artikels.show', artikel.slug),
        },
    ];

    const isAdmin = auth.user?.roles.includes('admin');
    const isReporter = auth.user?.roles.includes('reporter');
    const isVerifikator = auth.user?.roles.includes('verifikator');
    const isUser = auth.user && !isAdmin && !isReporter && !isVerifikator;

    const canEdit = isAdmin || isVerifikator || (isReporter && auth.user?.id === artikel.reporter.id);
    const canPublish = (isAdmin || isVerifikator) && (artikel.status === 'draft' || artikel.status === 'archived' || artikel.status === 'review');
    const canArchive = (isAdmin || isVerifikator) && artikel.status === 'published';
    const canReject = (isAdmin || isVerifikator) && (artikel.status === 'review' || artikel.status === 'draft' || artikel.status === 'published');
    const canRevise = (isAdmin || isVerifikator) && (artikel.status === 'published' || artikel.status === 'archived' || artikel.status === 'review');
    const canDelete = isAdmin;

    const handlePublish = () => {
        if (confirm('Apakah Anda yakin ingin mempublikasikan artikel ini?')) {
            router.put(
                route('artikels.publish', artikel.id),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil dipublikasikan!'),
                    onError: (errors) => alert(errors.message || 'Gagal mempublikasikan artikel.'),
                },
            );
        }
    };

    const handleArchive = () => {
        if (confirm('Apakah Anda yakin ingin mengarsipkan artikel ini?')) {
            router.put(
                route('artikels.archive', artikel.id),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil diarsipkan!'),
                    onError: (errors) => alert(errors.message || 'Gagal mengarsipkan artikel.'),
                },
            );
        }
    };

    const handleReject = () => {
        const reason = prompt('Masukkan alasan penolakan artikel (minimal 10 karakter):');
        if (reason && reason.trim().length >= 10) {
            router.put(
                route('artikels.reject', artikel.id),
                { rejection_reason: reason.trim() },
                {
                    onSuccess: () => alert('Artikel berhasil ditolak dan dikembalikan ke draft!'),
                    onError: (errors) => alert(errors.message || errors.rejection_reason || 'Gagal menolak artikel.'),
                },
            );
        } else if (reason !== null) {
            alert('Alasan penolakan harus diisi minimal 10 karakter.');
        }
    };

    const handleRevise = () => {
        const reason = prompt('Masukkan alasan revisi artikel (minimal 10 karakter):');
        if (reason && reason.trim().length >= 10) {
            router.put(
                route('artikels.revise', artikel.id),
                { revision_reason: reason.trim() },
                {
                    onSuccess: () => alert('Artikel berhasil dikembalikan untuk revisi!'),
                    onError: (errors) => alert(errors.message || errors.revision_reason || 'Gagal meminta revisi artikel.'),
                },
            );
        } else if (reason !== null) {
            alert('Alasan revisi harus diisi minimal 10 karakter.');
        }
    };

    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('artikels.destroy', artikel.id), {
                onSuccess: () => alert('Artikel berhasil dihapus!'),
                onError: (errors) => alert(errors.message || 'Gagal menghapus artikel.'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Artikel: ${artikel.judul}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">{artikel.judul}</h2>
                    <div className="flex gap-2">
                        {canEdit && (
                            <Link href={route('artikels.edit', artikel.id)}>
                                <Button variant="outline">Edit</Button>
                            </Link>
                        )}

                        {/* Actions for Draft status */}
                        {artikel.status === 'draft' && (
                            <>
                                {canPublish && (
                                    <Button variant="outline" onClick={handlePublish} className="bg-green-50 text-green-700 hover:bg-green-100">
                                        Publish
                                    </Button>
                                )}
                                {canReject && (
                                    <Button variant="outline" onClick={handleReject} className="bg-red-50 text-red-700 hover:bg-red-100">
                                        Tolak
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Actions for Review status */}
                        {artikel.status === 'review' && (
                            <>
                                {canPublish && (
                                    <Button variant="outline" onClick={handlePublish} className="bg-green-50 text-green-700 hover:bg-green-100">
                                        Publish
                                    </Button>
                                )}
                                {canReject && (
                                    <Button variant="outline" onClick={handleReject} className="bg-red-50 text-red-700 hover:bg-red-100">
                                        Tolak
                                    </Button>
                                )}
                                {canRevise && (
                                    <Button variant="outline" onClick={handleRevise} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                                        Revisi
                                    </Button>
                                )}
                            </>
                        )}


                        {/* Actions for Published status */}
                        {artikel.status === 'published' && (
                            <>
                                {canArchive && (
                                    <Button variant="outline" onClick={handleArchive} className="bg-orange-50 text-orange-700 hover:bg-orange-100">
                                        Archive
                                    </Button>
                                )}
                                {canRevise && (
                                    <Button variant="outline" onClick={handleRevise} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                                        Revisi
                                    </Button>
                                )}
                            </>
                        )}

                        {/* Actions for Archived status */}
                        {artikel.status === 'archived' && (
                            <>
                                {canPublish && (
                                    <Button variant="outline" onClick={handlePublish} className="bg-green-50 text-green-700 hover:bg-green-100">
                                        Publish
                                    </Button>
                                )}
                                {canRevise && (
                                    <Button variant="outline" onClick={handleRevise} className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100">
                                        Revisi
                                    </Button>
                                )}
                            </>
                        )}

                        {canDelete && (
                            <Button variant="destructive" onClick={handleDelete}>
                                Hapus
                            </Button>
                        )}
                        <Link href={route('artikels.index')}>
                            <Button>Kembali ke Daftar</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Artikel</CardTitle>
                        <CardDescription>Informasi lengkap mengenai artikel ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Status:</h4>
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    artikel.status === 'published'
                                        ? 'bg-green-100 text-green-800'
                                        : artikel.status === 'draft'
                                          ? 'bg-gray-100 text-gray-800'
                                          : artikel.status === 'review'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                }`}
                            >
                                {artikel.status}
                            </span>
                        </div>
                        {artikel.rejection_reason && (
                            <div>
                                <h4 className="font-semibold text-red-600">Alasan Penolakan/Revisi:</h4>
                                <p className="text-red-500 italic">{artikel.rejection_reason}</p>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold">Kategori:</h4>
                            <p>{artikel.kategori?.nama || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Reporter:</h4>
                            <p>{artikel.reporter?.name || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Tanggal Publikasi:</h4>
                            <p>{artikel.tanggal_publikasi ? new Date(artikel.tanggal_publikasi).toLocaleDateString() : 'Belum Dipublikasi'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Jumlah Dilihat:</h4>
                            <p>{artikel.views_count}</p>
                        </div>

                        <Separator />

                        <div>
                            <h4 className="font-semibold">Konten:</h4>
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: artikel.content }}></div>
                        </div>

                        {artikel.featured_image_url && (
                            <div>
                                <h4 className="font-semibold">Gambar Unggulan:</h4>
                                <img src={artikel.featured_image_url} alt={artikel.judul} className="mt-2 h-auto max-w-md rounded-md" />
                            </div>
                        )}

                        {artikel.gallery_urls && artikel.gallery_urls.length > 0 && (
                            <div>
                                <h4 className="font-semibold">Galeri Gambar:</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {artikel.gallery_urls.map((url, index) => (
                                        <img key={index} src={url} alt={`Galeri ${index + 1}`} className="h-32 w-32 rounded-md object-cover" />
                                    ))}
                                </div>
                            </div>
                        )}

                        {artikel.tags && artikel.tags.length > 0 && (
                            <div>
                                <h4 className="font-semibold">Tags:</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {artikel.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {artikel.event_terkait && artikel.event_terkait.length > 0 && (
                            <div>
                                <h4 className="font-semibold">Event Terkait:</h4>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {artikel.related_events?.map((event, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800"
                                        >
                                            {event.nama}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {artikel.meta_description && (
                            <div>
                                <h4 className="font-semibold">Meta Description:</h4>
                                <p className="text-gray-600">{artikel.meta_description}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <h4 className="font-semibold">Dibuat pada:</h4>
                                <p>{new Date(artikel.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Terakhir diupdate:</h4>
                                <p>{new Date(artikel.updated_at).toLocaleDateString('id-ID')}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
