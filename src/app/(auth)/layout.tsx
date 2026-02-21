import Link from "next/link";
import { Compass } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f7] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#a41034]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-amber-100/30 to-transparent rounded-full blur-3xl" />

      {/* Floating dots */}
      <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-[#a41034]/20 rounded-full animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-amber-400/20 rounded-full animate-float-slow" />

      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 mb-8 group relative z-10"
      >
        <div className="p-2.5 rounded-xl bg-[#a41034] shadow-lg shadow-[#a41034]/20 group-hover:scale-105 transition-transform">
          <Compass className="h-7 w-7 text-white" />
        </div>
        <span className="text-2xl font-bold">
          <span className="text-[#a41034]">ODTÜ</span>
          <span className="text-gray-900"> Pusula</span>
        </span>
      </Link>

      {/* Auth Card */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-gray-400 relative z-10">
        &copy; {new Date().getFullYear()} ODTU Pusula. All rights reserved.
      </p>
    </div>
  );
}
