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

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    content: string;
    reporter: User;
    kategori: KategoriArtikel;
    status: 'draft' | 'review' | 'published' | 'archived';
    featured_image_url: string | null;
    gallery_urls: string[];
    tags: string[] | null;
    meta_description: string | null;
    tanggal_publikasi: string | null;
    views_count: number;
    created_at: string;
    updated_at: string;
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

    const canEdit = isAdmin || isVerifikator || (isReporter && auth.user?.id === artikel.reporter.id && artikel.status !== 'published');
    const canPublish = (isAdmin || isVerifikator) && artikel.status !== 'published';
    const canArchive = (isAdmin || isVerifikator) && artikel.status !== 'archived';
    const canReject = (isAdmin || isVerifikator) && (artikel.status === 'review' || artikel.status === 'published');
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
        if (confirm('Apakah Anda yakin ingin menolak artikel ini dan mengembalikannya ke draft?')) {
            router.put(
                route('artikels.reject', artikel.id),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil ditolak!'),
                    onError: (errors) => alert(errors.message || 'Gagal menolak artikel.'),
                },
            );
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
                        {canPublish && (
                            <Button variant="outline" onClick={handlePublish}>
                                Publish
                            </Button>
                        )}
                        {canArchive && (
                            <Button variant="outline" onClick={handleArchive}>
                                Archive
                            </Button>
                        )}
                        {canReject && (
                            <Button variant="outline" onClick={handleReject}>
                                Tolak
                            </Button>
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
                            <p>{artikel.status}</p>
                        </div>
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
                                <p>{artikel.tags.join(', ')}</p>
                            </div>
                        )}

                        {artikel.meta_description && (
                            <div>
                                <h4 className="font-semibold">Meta Deskripsi:</h4>
                                <p>{artikel.meta_description}</p>
                            </div>
                        )}

                        <Separator />

                        <div>
                            <h4 className="font-semibold">Dibuat Pada:</h4>
                            <p>{new Date(artikel.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Terakhir Diperbarui:</h4>
                            <p>{new Date(artikel.updated_at).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
