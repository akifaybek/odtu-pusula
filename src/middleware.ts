import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Giriş yapmış kullanıcıları auth sayfalarından anasayfaya yönlendir
    if (token && (pathname === "/giris" || pathname === "/kayit")) {
      return NextResponse.redirect(new URL("/anasayfa", req.url));
    }

    // Admin sayfaları için rol kontrolü
    if (pathname.startsWith("/admin")) {
      if (!token || (token.role !== "ADMIN" && token.role !== "MODERATOR")) {
        return NextResponse.redirect(new URL("/anasayfa", req.url));
      }
    }

    // Banned kullanıcıları engelle
    if (token?.isBanned) {
      return NextResponse.redirect(new URL("/hesap-askida", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public sayfalar - herkes erişebilir
        const publicPaths = ["/", "/giris", "/kayit", "/sifremi-unuttum", "/hesap-askida"];
        if (publicPaths.some((path) => pathname === path)) {
          return true;
        }

        // API routes - auth kontrolü NextAuth'a bırakılır
        if (pathname.startsWith("/api")) {
          return true;
        }

        // Korumalı sayfalar - token gerekli
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    // Korumalı sayfalar
    "/anasayfa/:path*",
    "/dersler/:path*",
    "/hocalar/:path*",
    "/profil/:path*",
    "/admin/:path*",
    "/asistan/:path*",
    // Auth sayfaları (yönlendirme için)
    "/giris",
    "/kayit",
  ],
};
