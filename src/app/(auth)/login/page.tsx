"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail, Lock, AlertCircle, Send, CheckCircle, MailCheck } from "lucide-react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslation } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      setVerifiedSuccess(true);
      toast.success(t("auth.verification.success"));
    }
    if (searchParams.get("registered") === "true") {
      setJustRegistered(true);
    }
  }, [searchParams, t]);

  const loginSchema = z.object({
    email: z
      .string()
      .email(t("auth.validation.emailRequired"))
      .refine(
        (email) => email.endsWith("@metu.edu.tr"),
        t("auth.validation.emailMetu")
      ),
    password: z.string().min(1, t("auth.validation.passwordRequired")),
    rememberMe: z.boolean(),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setEmailNotVerified(false);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "EMAIL_NOT_VERIFIED") {
        setEmailNotVerified(true);
        setUnverifiedEmail(data.email);
      } else {
        toast.error(result.error);
      }
    } else {
      toast.success(t("auth.login.loginSuccess"));
      router.push("/home");
      router.refresh();
    }
  };

  const resendVerification = async () => {
    setResending(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: unverifiedEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(t("auth.verification.emailSent"));
      } else {
        toast.error(data.error || t("common.error"));
      }
    } catch {
      toast.error(t("common.error"));
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-200/50 bg-white">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold text-gray-900">{t("auth.login.title")}</CardTitle>
        <CardDescription className="text-gray-500">
          {t("auth.login.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {justRegistered && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <MailCheck className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <p className="font-medium">{t("auth.register.registerSuccess")}</p>
            </AlertDescription>
          </Alert>
        )}

        {verifiedSuccess && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {t("auth.verification.success")}
            </AlertDescription>
          </Alert>
        )}

        {emailNotVerified && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <p className="font-medium mb-2">{t("auth.verification.required")}</p>
              <p className="text-sm mb-3">{t("auth.verification.checkEmail")}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={resendVerification}
                disabled={resending}
                className="gap-2"
              >
                {resending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t("auth.verification.resend")}
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">{t("auth.login.password")}</FormLabel>
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
            <div className="flex items-center justify-between pt-2">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="border-gray-300 data-[state=checked]:bg-[#a41034] data-[state=checked]:border-[#a41034]"
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal text-gray-600 cursor-pointer">
                      {t("auth.login.rememberMe")}
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#a41034] hover:text-[#8a0d2c] hover:underline transition-colors"
              >
                {t("auth.login.forgotPassword")}
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
                  {t("auth.login.signingIn")}
                </>
              ) : (
                t("common.signIn")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center pb-8">
        <p className="text-sm text-gray-500">
          {t("auth.login.noAccount")}{" "}
          <Link href="/register" className="text-[#a41034] hover:underline font-medium">
            {t("common.signUp")}
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
