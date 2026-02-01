"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

const loginSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir email adresi giriniz")
    .refine(
      (email) => email.endsWith("@metu.edu.tr"),
      "Sadece @metu.edu.tr mail adresleri kabul edilir"
    ),
  password: z.string().min(1, "Şifre gereklidir"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function GirisPage() {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Giriş başarılı!");
      router.push("/anasayfa");
      router.refresh();
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">Hoş Geldin!</CardTitle>
        <CardDescription className="text-gray-500">
          ODTÜ mail adresiniz ile giriş yapın
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="ornek@metu.edu.tr"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Şifre</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Beni hatırla
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/sifremi-unuttum"
                className="text-sm text-gray-500 hover:text-[#a41034] transition-colors"
              >
                Şifremi unuttum
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#a41034] hover:bg-[#8a0d2c] rounded-xl h-12 text-base font-medium shadow-lg shadow-[#a41034]/20"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş yapılıyor...
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <p className="text-sm text-gray-500">
          Hesabınız yok mu?{" "}
          <Link href="/kayit" className="text-[#a41034] hover:underline font-medium">
            Kayıt Ol
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
