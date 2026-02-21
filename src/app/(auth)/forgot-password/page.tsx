"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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
import { useTranslation } from "@/contexts/LanguageContext";

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { t } = useTranslation();

  const forgotPasswordSchema = z.object({
    email: z
      .string()
      .email(t("auth.validation.emailRequired"))
      .refine(
        (email) => email.endsWith("@metu.edu.tr"),
        t("auth.validation.emailMetu")
      ),
  });

  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error);
        return;
      }

      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t("auth.forgotPassword.linkSent")}
          </CardTitle>
          <CardDescription className="text-gray-500">
            {t("auth.forgotPassword.linkSentDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              {t("auth.forgotPassword.emailSentMessage", { email: submittedEmail })}
            </p>
            <p className="text-sm text-gray-500">
              {t("auth.forgotPassword.checkEmail")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-8">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
          >
            {t("auth.forgotPassword.tryDifferentEmail")}
          </Button>
          <Link href="/login" className="w-full">
            <Button
              variant="ghost"
              className="w-full text-gray-500 hover:text-[#a41034]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("auth.forgotPassword.backToLogin")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {t("auth.forgotPassword.title")}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {t("auth.forgotPassword.description")}
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
                  <FormLabel className="text-gray-700">{t("auth.login.email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="example@metu.edu.tr"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-[#a41034] focus:ring-[#a41034]/20"
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
                  {t("auth.forgotPassword.sending")}
                </>
              ) : (
                t("auth.forgotPassword.sendResetLink")
              )}
            </Button>
          </form>
        </Form>
        <p className="mt-4 text-xs text-center text-gray-400">
          {t("auth.forgotPassword.rateLimit")}
        </p>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-[#a41034] transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </CardFooter>
    </Card>
  );
}
