"use client";

import { useState } from "react";
import { Department } from "@prisma/client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CourseForm } from "./CourseForm";
import { deleteCourse } from "@/actions/admin/course-actions";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type CourseListItem = {
    id: string;
    code: string;
    name: string;
    departmentId: string;
    credits: number;
    description?: string | null;
    department: { code: string };
    professors: Array<{ professorId: string; professor: { name: string } }>;
};

type ProfessorOption = {
    id: string;
    name: string;
};

interface CourseClientProps {
    initialCourses: CourseListItem[];
    departments: Department[];
    professors: ProfessorOption[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function CourseClient({
    initialCourses,
    departments,
    professors,
    pagination,
}: CourseClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseListItem | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

    // Search handler with debounce (simplified)
    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCourse(id);
            toast.success("Ders silindi");
            router.refresh();
        } catch {
            toast.error("Silme işlemi başarısız");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Ders Yönetimi</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingCourse(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Yeni Ders Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCourse ? "Ders Düzenle" : "Yeni Ders Ekle"}
                            </DialogTitle>
                        </DialogHeader>
                        <CourseForm
                            initialData={editingCourse ?? undefined}
                            departments={departments}
                            professors={professors}
                            onSuccess={() => {
                                setIsOpen(false);
                                setEditingCourse(null);
                                router.refresh();
                            }}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Ders ara..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kod</TableHead>
                            <TableHead>Ad</TableHead>
                            <TableHead>Bölüm</TableHead>
                            <TableHead>Kredi</TableHead>
                            <TableHead>Hocalar</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {initialCourses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.code}</TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell>{course.department.code}</TableCell>
                                <TableCell>{course.credits}</TableCell>
                                <TableCell className="max-w-[200px] truncate">
                                    {course.professors.map((p) => p.professor.name).join(", ")}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            setEditingCourse(course);
                                            setIsOpen(true);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Bu işlem geri alınamaz. Bu dersi silmek istediğinize emin misiniz?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>İptal</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(course.id)}
                                                    className="bg-destructive hover:bg-destructive/90"
                                                >
                                                    Sil
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        {initialCourses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Ders bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Basic Pagination */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (pagination.page - 1).toString());
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    disabled={pagination.page <= 1}
                >
                    Önceki
                </Button>
                <div className="text-sm">
                    Sayfa {pagination.page} / {pagination.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("page", (pagination.page + 1).toString());
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                    disabled={pagination.page >= pagination.totalPages}
                >
                    Sonraki
                </Button>
            </div>
        </div>
    );
}
