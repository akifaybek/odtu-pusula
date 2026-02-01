import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";
import Logo from "@/components/shared/Logo";

const footerLinks = {
  platform: [
    { label: "Dersler", href: "/dersler" },
    { label: "Hocalar", href: "/hocalar" },
    { label: "Hakkımızda", href: "/hakkimizda" },
    { label: "İletişim", href: "/iletisim" },
  ],
  legal: [
    { label: "Gizlilik Politikası", href: "/gizlilik" },
    { label: "Kullanım Şartları", href: "/kullanim-sartlari" },
  ],
};

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:info@odtupusula.com", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-muted-foreground max-w-sm">
              ODTÜ öğrencileri için ders ve hoca değerlendirme platformu.
              Deneyimlerini paylaş, diğer öğrencilerin yorumlarını oku.
            </p>
            {/* Sosyal Medya */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Linkleri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Platform</h3>
            <nav className="flex flex-col gap-2">
              {footerLinks.platform.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Yasal Linkler */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Yasal</h3>
            <nav className="flex flex-col gap-2">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ODTÜ Pusula. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-muted-foreground">
            ODTÜ ile resmi bir bağlantısı yoktur.
          </p>
        </div>
      </div>
    </footer>
  );
}
