"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createCourse, updateCourse } from "@/actions/admin/course-actions";
import { toast } from "sonner";
import { Department } from "@prisma/client";

const courseSchema = z.object({
    code: z.string().min(2, "Ders kodu en az 2 karakter olmalıdır"),
    name: z.string().min(3, "Ders adı en az 3 karakter olmalıdır"),
    departmentId: z.string().min(1, "Bölüm seçilmelidir"),
    credits: z.number().min(0, "Kredi 0'dan küçük olamaz").max(20, "Kredi 20'den fazla olamaz"),
    description: z.string().optional(),
    professorIds: z.array(z.string()).optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

type CourseInitialData = {
    id: string;
    code: string;
    name: string;
    departmentId: string;
    credits: number;
    description?: string | null;
    professors?: Array<{ professorId: string }>;
};

interface CourseFormProps {
    initialData?: CourseInitialData;
    departments: Department[];
    professors: { id: string; name: string }[];
    onSuccess: () => void;
}

export function CourseForm({
    initialData,
    departments,
    professors,
    onSuccess,
}: CourseFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema),
        defaultValues: {
            code: initialData?.code || "",
            name: initialData?.name || "",
            departmentId: initialData?.departmentId || "",
            credits: initialData?.credits || 3,
            description: initialData?.description || "",
            professorIds: initialData?.professors?.map((p) => p.professorId) || [],
        },
    });

    const onSubmit = async (data: CourseFormValues) => {
        setLoading(true);
        try {
            let result;
            if (initialData) {
                result = await updateCourse(initialData.id, data);
            } else {
                result = await createCourse(data);
            }

            if (result.success) {
                toast.success(
                    initialData ? "Ders güncellendi" : "Ders oluşturuldu"
                );
                onSuccess();
            } else {
                toast.error(result.error);
            }
        } catch {
            toast.error("Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ders Kodu</FormLabel>
                                <FormControl>
                                    <Input placeholder="CENG101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="credits"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Kredi</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ders Adı</FormLabel>
                            <FormControl>
                                <Input placeholder="Introduction to Computer Engineering" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bölüm</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Bölüm seçin" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id}>
                                            {dept.name} ({dept.code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Açıklama</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Ders açıklaması..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="professorIds"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hocalar (Çoklu Seçim - Basit Liste)</FormLabel>
                            <FormControl>
                                <div className="border rounded-md p-2 h-32 overflow-y-auto space-y-1">
                                    {/* Simple multi-select via checkboxes for now since Shadcn Select is single value */}
                                    {professors.map((prof) => (
                                        <div key={prof.id} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id={prof.id}
                                                className="h-4 w-4"
                                                checked={field.value?.includes(prof.id)}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    const current = field.value || [];
                                                    if (checked) {
                                                        field.onChange([...current, prof.id]);
                                                    } else {
                                                        field.onChange(current.filter((id) => id !== prof.id));
                                                    }
                                                }}
                                            />
                                            <label htmlFor={prof.id} className="text-sm">
                                                {prof.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Dersi veren tüm hocaları seçebilirsiniz.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Güncelle" : "Oluştur"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
