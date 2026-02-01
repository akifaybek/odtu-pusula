"use client";

import { signOut } from "next-auth/react";
import { Ban, LogOut, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Ban className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Hesabınız Askıya Alındı</CardTitle>
          <CardDescription className="mt-2">
            Hesabınız platform kurallarının ihlali nedeniyle askıya alınmıştır.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">Ne yapabilirsiniz?</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Durumu incelemek için destek ile iletişime geçin</li>
              <li>Kararı temyiz etmek için aşağıdaki butona tıklayın</li>
            </ul>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <a href="mailto:destek@odtupusula.com">
              <Mail className="h-4 w-4 mr-2" />
              Destek ile İletişime Geç
            </a>
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Çıkış Yap
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
