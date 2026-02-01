import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EmailVerificationBanner from "@/components/layout/EmailVerificationBanner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-6 md:py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
