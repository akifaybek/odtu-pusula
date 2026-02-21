"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/contexts/LanguageContext";

const departments = [
  { code: "CENG", name: "Computer Engineering" },
  { code: "EE", name: "Electrical-Electronics Engineering" },
  { code: "ME", name: "Mechanical Engineering" },
  { code: "IE", name: "Industrial Engineering" },
  { code: "CE", name: "Civil Engineering" },
  { code: "CHE", name: "Chemical Engineering" },
  { code: "MATH", name: "Mathematics" },
  { code: "PHYS", name: "Physics" },
  { code: "CHEM", name: "Chemistry" },
  { code: "STAT", name: "Statistics" },
  { code: "BA", name: "Business Administration" },
  { code: "ECON", name: "Economics" },
  { code: "ARCH", name: "Architecture" },
  { code: "ID", name: "Industrial Design" },
  { code: "PSY", name: "Psychology" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const years = [
    { value: "PREP", label: t("auth.years.prep") },
    { value: "FRESHMAN", label: t("auth.years.freshman") },
    { value: "SOPHOMORE", label: t("auth.years.sophomore") },
    { value: "JUNIOR", label: t("auth.years.junior") },
    { value: "SENIOR", label: t("auth.years.senior") },
    { value: "MASTERS", label: t("auth.years.masters") },
    { value: "PHD", label: t("auth.years.phd") },
  ];

  const registerSchema = z
    .object({
      name: z.string().min(2, t("auth.validation.nameMin")),
      email: z
        .string()
        .email(t("auth.validation.emailRequired"))
        .refine(
          (email) => email.endsWith("@metu.edu.tr"),
          t("auth.validation.emailMetu")
        ),
      password: z
        .string()
        .min(6, t("auth.validation.passwordMin"))
        .regex(/[A-Z]/, t("auth.validation.passwordUppercase"))
        .regex(/[0-9]/, t("auth.validation.passwordNumber")),
      confirmPassword: z.string(),
      department: z.string().min(1, t("auth.validation.departmentRequired")),
      year: z.string().min(1, t("auth.validation.yearRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      department: "",
      year: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          department: data.department,
          year: data.year,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "An error occurred during registration");
        return;
      }

      toast.success(t("auth.register.registerSuccess"));
      // Email doğrulaması gerektiğini belirten parametre ile yönlendir
      router.push("/login?registered=true");
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">{t("auth.register.title")}</CardTitle>
        <CardDescription className="text-gray-500">
          {t("auth.register.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t("auth.register.fullName")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={t("auth.register.fullName")}
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t("auth.register.email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="example@metu.edu.tr"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">{t("auth.register.department")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder={t("auth.register.selectDepartment")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.code} - {t(`departments.${dept.code}`)}
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
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">{t("auth.register.year")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200">
                          <SelectValue placeholder={t("auth.register.selectYear")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t("auth.register.password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t("auth.register.confirmPassword")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034]"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-[#a41034] hover:bg-[#8a0d2c] rounded-xl h-12 text-base font-medium shadow-lg shadow-[#a41034]/20"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("auth.register.registering")}
                </>
              ) : (
                t("common.signUp")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <p className="text-sm text-gray-500">
          {t("auth.register.hasAccount")}{" "}
          <Link href="/login" className="text-[#a41034] hover:underline font-medium">
            {t("common.signIn")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
