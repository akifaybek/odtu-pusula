"use client";

import Link from "next/link";
import { Github, Mail } from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useTranslation } from "@/contexts/LanguageContext";

const socialLinks = [
  { icon: Github, href: "https://github.com/akifaybek", label: "GitHub" },
  { icon: Mail, href: "mailto:odtupusula@gmail.com", label: "Email" },
];

export default function Footer() {
  const { t } = useTranslation();

  const footerLinks = {
    platform: [
      { label: t("common.courses"), href: "/courses" },
      { label: t("common.professors"), href: "/professors" },
      { label: t("footer.about"), href: "/about" },
      { label: t("footer.contact"), href: "/contact" },
    ],
    legal: [
      { label: t("footer.privacyPolicy"), href: "/legal?tab=privacy" },
      { label: t("footer.termsOfService"), href: "/legal?tab=terms" },
    ],
  };

  return (
    <footer className="border-t border-border/40 bg-card/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" />
            <p className="text-sm text-muted-foreground max-w-sm">
              {t("footer.description")}
            </p>
            {/* Social Media */}
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

          {/* Platform Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("footer.platform")}</h3>
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

          {/* Legal Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t("footer.legal")}</h3>
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
            &copy; {new Date().getFullYear()} ODTU Pusula. {t("common.allRightsReserved")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("footer.notAffiliated")}
          </p>
        </div>
      </div>
    </footer>
  );
}
