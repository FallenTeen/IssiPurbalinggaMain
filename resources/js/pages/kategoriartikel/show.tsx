import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface KategoriArtikel {
    id: number;
    nama: string;
    deskripsi: string | null;
    color_code: string | null;
    icon: string | null;
    parent_id: number | null;
    parent?: KategoriArtikel; // Include parent relationship for display
    sort_order: number | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface KategoriArtikelShowProps {
    kategoriArtikel: KategoriArtikel;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Kategori Artikel',
        href: '/kategori-artikels',
    },
    {
        title: 'Detail',
        href: '#', // This will be dynamic based on kategoriArtikel.id
    },
];

export default function KategoriArtikelShow({ kategoriArtikel }: KategoriArtikelShowProps) {
    // Update the breadcrumbs to include the current article category name
    const dynamicBreadcrumbs = [
        ...breadcrumbs.slice(0, 2),
        {
            title: kategoriArtikel.nama,
            href: route('kategori-artikels.show', kategoriArtikel.id),
        },
    ];

    return (
        <AppLayout breadcrumbs={dynamicBreadcrumbs}>
            <Head title={`Detail Kategori Artikel: ${kategoriArtikel.nama}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl leading-none font-semibold tracking-tight">Detail Kategori Artikel</h2>
                    <div className="flex gap-2">
                        <Link href={route('kategori-artikels.edit', kategoriArtikel.id)}>
                            <Button variant="outline">Edit</Button>
                        </Link>
                        <Link href={route('kategori-artikels.index')}>
                            <Button>Kembali</Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{kategoriArtikel.nama}</CardTitle>
                        <CardDescription>Informasi lengkap mengenai kategori artikel ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Nama:</h4>
                            <p>{kategoriArtikel.nama}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Deskripsi:</h4>
                            <p>{kategoriArtikel.deskripsi || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Kode Warna:</h4>
                            <p style={{ color: kategoriArtikel.color_code || 'inherit' }}>{kategoriArtikel.color_code || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Ikon:</h4>
                            <p>{kategoriArtikel.icon || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Kategori Induk:</h4>
                            <p>{kategoriArtikel.parent?.nama || 'Tidak Ada'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Urutan Sortir:</h4>
                            <p>{kategoriArtikel.sort_order || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Status Aktif:</h4>
                            <p>{kategoriArtikel.is_active ? 'Aktif' : 'Tidak Aktif'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Dibuat Pada:</h4>
                            <p>{new Date(kategoriArtikel.created_at).toLocaleString()}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Terakhir Diperbarui:</h4>
                            <p>{new Date(kategoriArtikel.updated_at).toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
