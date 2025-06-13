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
import { useState, useEffect } from 'react';

interface KategoriArtikel {
    id: number;
    nama: string;
}

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    status: 'draft' | 'review' | 'published' | 'archived';
    rejection_reason: string | null;
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

    const [searchDebounce, setSearchDebounce] = useState(filters.search || '');

    const isAdmin = auth.user?.roles.includes('admin');
    const isReporter = auth.user?.roles.includes('reporter');
    const isVerifikator = auth.user?.roles.includes('verifikator');
    const isUser = auth.user && !isAdmin && !isReporter && !isVerifikator;

    const canCreateArtikel = isAdmin || isReporter;
    const canEditArtikel = (artikel: Artikel) => {
        if (isReporter && auth.user?.id === artikel.reporter.id) {
            return artikel.status !== 'published' || isAdmin || isVerifikator;
        }
        return isAdmin || isVerifikator;
    };

    const canPublishArtikel = isAdmin || isVerifikator;
    const canArchiveArtikel = isAdmin || isVerifikator;
    const canRejectArtikel = isAdmin || isVerifikator;
    const canReviseArtikel = isAdmin || isVerifikator;
    const canDeleteArtikel = isAdmin;

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounce(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const params = new URLSearchParams();

        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (kategoriFilter !== 'all') params.set('kategori_id', kategoriFilter);
        if (reporterFilter !== 'all') params.set('reporter_id', reporterFilter);
        if (searchDebounce) params.set('search', searchDebounce);
        if (sortBy !== 'recent') params.set('sort_by', sortBy);

        router.get(
            '/artikels',
            Object.fromEntries(params.entries()),
            {
                preserveState: true,
                replace: true,
                only: ['artikels'],
            }
        );
    }, [statusFilter, kategoriFilter, reporterFilter, searchDebounce, sortBy]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleKategoriChange = (value: string) => {
        setKategoriFilter(value);
    };

    const handleReporterChange = (value: string) => {
        setReporterFilter(value);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
    };

    const resetFilters = () => {
        setSearch('');
        setStatusFilter('all');
        setKategoriFilter('all');
        setReporterFilter('all');
        setSortBy('recent');
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

    const handleReject = (artikel: Artikel) => {
        const reason = prompt('Masukkan alasan penolakan artikel (minimal 10 karakter):');
        if (reason && reason.trim().length >= 10) {
            router.put(
                route('artikels.reject', artikel.id),
                { rejection_reason: reason.trim() },
                {
                    onSuccess: () => {
                        alert('Artikel berhasil ditolak dan dikembalikan ke draft!');
                    },
                    onError: (errors) => {
                        console.error('Error rejecting artikel:', errors);
                        const errorMessage = errors.message || (typeof errors === 'object' && errors !== null ? Object.values(errors).flat().join('\n') : 'Gagal menolak artikel.');
                        alert(errorMessage);
                    },
                },
            );
        } else if (reason !== null) {
            alert('Alasan penolakan harus diisi minimal 10 karakter.');
        }
    };

    const handleRevise = (artikel: Artikel) => {
        const reason = prompt('Masukkan alasan revisi artikel (minimal 10 karakter):');
        if (reason && reason.trim().length >= 10) {
            router.put(
                route('artikels.revise', artikel.id),
                { revision_reason: reason.trim() },
                {
                    onSuccess: () => {
                        alert('Artikel berhasil dikembalikan untuk revisi!');
                    },
                    onError: (errors) => {
                        console.error('Error revising artikel:', errors);
                        const errorMessage = errors.message || (typeof errors === 'object' && errors !== null ? Object.values(errors).flat().join('\n') : 'Gagal meminta revisi artikel.');
                        alert(errorMessage);
                    },
                },
            );
        } else if (reason !== null) {
            alert('Alasan revisi harus diisi minimal 10 karakter.');
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
                        <Link href={route('artikels.create')}> {/* Use named route */}
                            <Button>Tambah Artikel</Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Artikel</CardTitle>
                        <CardDescription>Saring daftar artikel secara real-time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <Label htmlFor="search">Cari</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    value={search}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    placeholder="Cari judul atau konten..."
                                />
                            </div>

                            {/* Filter Status hanya untuk Admin/Verifikator */}
                            {(isAdmin || isVerifikator) && (
                                <div>
                                    <Label htmlFor="status-filter">Status</Label>
                                    <Select onValueChange={handleStatusChange} value={statusFilter}>
                                        <SelectTrigger id="status-filter">
                                            <SelectValue placeholder="Pilih Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="review">Review</SelectItem> {/* Keep review status filter */}
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <div>
                                <Label htmlFor="kategori-filter">Kategori</Label>
                                <Select onValueChange={handleKategoriChange} value={kategoriFilter}>
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

                            {/* Filter Reporter hanya untuk Admin/Verifikator */}
                            {(isAdmin || isVerifikator) && (
                                <div>
                                    <Label htmlFor="reporter-filter">Reporter</Label>
                                    <Select onValueChange={handleReporterChange} value={reporterFilter}>
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
                            )}

                            <div>
                                <Label htmlFor="sort-by">Urutkan Berdasarkan</Label>
                                <Select onValueChange={handleSortChange} value={sortBy}>
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
                                <Button type="button" variant="outline" onClick={resetFilters}>
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
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
                                                            : artikel.status === 'draft'
                                                              ? 'bg-gray-100 text-gray-800'
                                                              : artikel.status === 'review'
                                                                ? 'bg-blue-100 text-blue-800'
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
                                                <Link href={route('artikels.show', artikel.slug)}> {/* Use named route */}
                                                    <Button variant="outline" size="sm">
                                                        Lihat
                                                    </Button>
                                                </Link>

                                                {canEditArtikel(artikel) && (
                                                    <Link href={route('artikels.edit', artikel.id)}> {/* Use named route */}
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}

                                                {artikel.status === 'draft' && (
                                                    <>
                                                        {canPublishArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePublish(artikel.id)}
                                                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                                            >
                                                                Publish
                                                            </Button>
                                                        )}
                                                        {canRejectArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReject(artikel)}
                                                                className="bg-red-50 text-red-700 hover:bg-red-100"
                                                            >
                                                                Tolak
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {artikel.status === 'review' && (
                                                    <>
                                                        {canPublishArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePublish(artikel.id)}
                                                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                                            >
                                                                Publish
                                                            </Button>
                                                        )}
                                                        {canRejectArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleReject(artikel)}
                                                                className="bg-red-50 text-red-700 hover:bg-red-100"
                                                            >
                                                                Tolak
                                                            </Button>
                                                        )}
                                                        {canReviseArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRevise(artikel)}
                                                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                            >
                                                                Revisi
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {artikel.status === 'published' && (
                                                    <>
                                                        {canArchiveArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleArchive(artikel.id)}
                                                                className="bg-orange-50 text-orange-700 hover:bg-orange-100"
                                                            >
                                                                Archive
                                                            </Button>
                                                        )}
                                                        {canReviseArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRevise(artikel)}
                                                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                            >
                                                                Revisi
                                                            </Button>
                                                        )}
                                                    </>
                                                )}

                                                {artikel.status === 'archived' && (
                                                    <>
                                                        {canPublishArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handlePublish(artikel.id)}
                                                                className="bg-green-50 text-green-700 hover:bg-green-100"
                                                            >
                                                                Publish
                                                            </Button>
                                                        )}
                                                        {canReviseArtikel && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRevise(artikel)}
                                                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                                            >
                                                                Revisi
                                                            </Button>
                                                        )}
                                                    </>
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
