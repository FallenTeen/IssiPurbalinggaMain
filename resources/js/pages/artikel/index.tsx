import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { PaginatedQueryResult } from '@/types/pagination';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

interface KategoriArtikel {
    id: number;
    nama: string;
}

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    status: 'draft' | 'review' | 'published' | 'archived';
    reporter: User;
    kategori: KategoriArtikel;
    tanggal_publikasi?: string;
    views_count?: number;
    created_at: string;
}

interface MyPageProps {
    auth: {
        user: User | null;
    };
    [key: string]: any;
}

interface ArtikelIndexProps {
    artikels: PaginatedQueryResult<Artikel>;
    kategoris: KategoriArtikel[];
    reporters: User[];
    filters: {
        status: string | null;
        kategori_id: string | null;
        reporter_id: string | null;
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
        title: 'Artikel',
        href: '/artikels',
    },
];

export default function ArtikelIndex() {
    const { auth, artikels, kategoris, reporters, filters } = usePage<ArtikelIndexProps & MyPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori_id || 'all');
    const [reporterFilter, setReporterFilter] = useState(filters.reporter_id || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'recent');

    const isAdmin = auth.user?.roles.includes('admin');
    const isReporter = auth.user?.roles.includes('reporter');
    const isVerifikator = auth.user?.roles.includes('verifikator');

    const canCreateArtikel = isAdmin || isReporter;
    const canEditArtikel = (artikel: Artikel) => {
        return isAdmin || isVerifikator || (isReporter && auth.user?.id === artikel.reporter.id && artikel.status !== 'published');
    };
    const canPublishArtikel = isAdmin || isVerifikator;
    const canArchiveArtikel = isAdmin || isVerifikator;
    const canRejectArtikel = isAdmin || isVerifikator;
    const canDeleteArtikel = isAdmin;

    const applyFilters: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(
            route('artikels.index'),
            {
                status: statusFilter === 'all' ? null : statusFilter,
                kategori_id: kategoriFilter === 'all' ? null : kategoriFilter,
                reporter_id: reporterFilter === 'all' ? null : reporterFilter,
                search: search || null,
                sort_by: sortBy === 'recent' ? null : sortBy,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handlePublish = (artikelId: number) => {
        if (confirm('Apakah Anda yakin ingin mempublikasikan artikel ini?')) {
            router.put(
                route('artikels.publish', artikelId),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil dipublikasikan!'),
                    onError: (errors) => alert(errors.message || 'Gagal mempublikasikan artikel.'),
                },
            );
        }
    };

    const handleArchive = (artikelId: number) => {
        if (confirm('Apakah Anda yakin ingin mengarsipkan artikel ini?')) {
            router.put(
                route('artikels.archive', artikelId),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil diarsipkan!'),
                    onError: (errors) => alert(errors.message || 'Gagal mengarsipkan artikel.'),
                },
            );
        }
    };

    const handleReject = (artikelId: number) => {
        if (confirm('Apakah Anda yakin ingin menolak artikel ini dan mengembalikannya ke draft?')) {
            router.put(
                route('artikels.reject', artikelId),
                {},
                {
                    onSuccess: () => alert('Artikel berhasil ditolak!'),
                    onError: (errors) => alert(errors.message || 'Gagal menolak artikel.'),
                },
            );
        }
    };

    const handleDelete = (artikelId: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.')) {
            router.delete(route('artikels.destroy', artikelId), {
                onSuccess: () => alert('Artikel berhasil dihapus!'),
                onError: (errors) => alert(errors.message || 'Gagal menghapus artikel.'),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Artikel" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Daftar Artikel</h2>
                    {canCreateArtikel && (
                        <Link href={route('artikels.create')}>
                            <Button>Tambah Artikel</Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Artikel</CardTitle>
                        <CardDescription>Saring daftar artikel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari judul atau konten..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="status-filter">Status</Label>
                                <Select onValueChange={setStatusFilter} value={statusFilter}>
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="Pilih Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="review">Review</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="kategori-filter">Kategori</Label>
                                <Select onValueChange={setKategoriFilter} value={kategoriFilter}>
                                    <SelectTrigger id="kategori-filter">
                                        <SelectValue placeholder="Pilih Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {kategoris.map((kategori) => (
                                            <SelectItem key={kategori.id} value={String(kategori.id)}>
                                                {kategori.nama}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="reporter-filter">Reporter</Label>
                                <Select onValueChange={setReporterFilter} value={reporterFilter}>
                                    <SelectTrigger id="reporter-filter">
                                        <SelectValue placeholder="Pilih Reporter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua</SelectItem>
                                        {reporters.map((reporter) => (
                                            <SelectItem key={reporter.id} value={String(reporter.id)}>
                                                {reporter.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="sort-by">Urutkan Berdasarkan</Label>
                                <Select onValueChange={setSortBy} value={sortBy}>
                                    <SelectTrigger id="sort-by">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="recent">Terbaru</SelectItem>
                                        <SelectItem value="popular">Terpopuler</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit">Terapkan Filter</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Data Artikel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Judul</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Tanggal Publikasi</TableHead>
                                    <TableHead>Views</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {artikels.data.length > 0 ? (
                                    artikels.data.map((artikel) => (
                                        <TableRow key={artikel.id}>
                                            <TableCell>{artikel.judul}</TableCell>
                                            <TableCell>
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        artikel.status === 'published'
                                                            ? 'bg-green-100 text-green-800'
                                                            : artikel.status === 'review'
                                                              ? 'bg-yellow-100 text-yellow-800'
                                                              : artikel.status === 'draft'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {artikel.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{artikel.kategori?.nama || '-'}</TableCell>
                                            <TableCell>{artikel.reporter?.name || '-'}</TableCell>
                                            <TableCell>
                                                {artikel.tanggal_publikasi ? new Date(artikel.tanggal_publikasi).toLocaleDateString('id-ID') : '-'}
                                            </TableCell>
                                            <TableCell>{artikel.views_count ?? 0}</TableCell>
                                            <TableCell className="flex flex-wrap gap-2">
                                                <Link href={route('artikels.show', artikel.slug)}>
                                                    <Button variant="outline" size="sm">
                                                        Lihat
                                                    </Button>
                                                </Link>

                                                {canEditArtikel(artikel) && (
                                                    <Link href={route('artikels.edit', artikel.id)}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}

                                                {canPublishArtikel && artikel.status !== 'published' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePublish(artikel.id)}
                                                        className="bg-green-50 text-green-700 hover:bg-green-100"
                                                    >
                                                        Publish
                                                    </Button>
                                                )}

                                                {canArchiveArtikel && artikel.status !== 'archived' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleArchive(artikel.id)}
                                                        className="bg-orange-50 text-orange-700 hover:bg-orange-100"
                                                    >
                                                        Archive
                                                    </Button>
                                                )}

                                                {canRejectArtikel && (artikel.status === 'review' || artikel.status === 'published') && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleReject(artikel.id)}
                                                        className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                    >
                                                        Tolak
                                                    </Button>
                                                )}

                                                {canDeleteArtikel && (
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(artikel.id)}>
                                                        Hapus
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center text-gray-500">
                                            Tidak ada artikel ditemukan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        {artikels.links && (
                            <div className="mt-4 flex justify-center">
                                {artikels.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`mx-1 rounded px-3 py-1 ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
