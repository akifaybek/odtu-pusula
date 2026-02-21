"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Compass,
  Users,
  BookOpen,
  ArrowRight,
  Star,
  GraduationCap,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Zap,
  Shield,
  ChevronRight,
} from "lucide-react";
import Logo from "@/components/shared/Logo";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { ref: socialRef, isVisible: socialVisible } = useScrollAnimation();

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f7]">
      {/* Header - Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 flex h-20 items-center justify-between">
          <Logo size="lg" />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Courses
            </Link>
            <Link href="/professors" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Professors
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="text-gray-600 hover:text-gray-900">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-[#a41034] hover:bg-[#8a0d2c] rounded-full px-6">
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero - Asymmetric Layout */}
        <section className="min-h-screen pt-20 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-[#a41034]/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Floating decorative elements */}

          <div
            ref={heroRef}
            className={cn(
              "max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative z-10 pt-16 lg:pt-24 transition-all duration-1000",
              heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
              {/* Left - Content */}
              <div className="space-y-8 lg:pr-8">
                {/* Tag */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <div className="w-2 h-2 bg-[#a41034] rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">For METU Students</span>
                </div>

                {/* Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.1] tracking-tight">
                    Don&apos;t get lost
                    <br />
                    <span className="text-[#a41034]">choosing courses.</span>
                  </h1>
                  <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                    Make the right decision with real student reviews.
                    Experiences from thousands of METU students at your fingertips.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    size="lg"
                    asChild
                    className="bg-[#a41034] hover:bg-[#8a0d2c] text-white rounded-full h-14 px-8 text-base font-medium shadow-lg shadow-[#a41034]/20 group"
                  >
                    <Link href="/register">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-full h-14 px-8 text-base font-medium border-gray-200 hover:bg-white hover:border-gray-300"
                  >
                    <Link href="/courses">
                      Browse Courses
                    </Link>
                  </Button>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-500">Courses</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">3K+</div>
                    <div className="text-sm text-gray-500">Reviews</div>
                  </div>
                  <div className="w-px h-12 bg-gray-200" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">200+</div>
                    <div className="text-sm text-gray-500">Professors</div>
                  </div>
                </div>
              </div>

              {/* Right - Visual */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg mx-auto">
                  {/* Main Card */}
                  <div className="relative bg-white rounded-3xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
                    {/* Course Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">CENG 242</div>
                        <div className="text-gray-500">Programming Language Concepts</div>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 rounded-full">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-semibold text-amber-700">4.5</span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-lg font-semibold text-gray-900">3.8</div>
                        <div className="text-xs text-gray-500">Difficulty</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-lg font-semibold text-gray-900">4.2</div>
                        <div className="text-xs text-gray-500">Usefulness</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl">
                        <div className="text-lg font-semibold text-emerald-600">85%</div>
                        <div className="text-xs text-gray-500">Recommend</div>
                      </div>
                    </div>

                    {/* Review Preview */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#a41034]/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-[#a41034]">AK</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Anonymous</div>
                          <div className="text-xs text-gray-400">Fall 2024</div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        &quot;Challenging but very educational. Professor&apos;s explanations are great, labs are fun.&quot;
                      </p>
                    </div>
                  </div>

                  {/* Floating Card 1 */}
                  <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 border border-gray-100 animate-float-slow hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">156 Reviews</div>
                        <div className="text-xs text-gray-400">This semester</div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Card 2 */}
                  <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 border border-gray-100 animate-float-reverse hover:scale-105 transition-transform cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#a41034]/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-[#a41034]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">Prof. Dr. Yilmaz</div>
                        <div className="text-xs text-gray-400">⭐ 4.7 rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Bento Grid */}
        <section className="py-32 bg-white relative">
          <div
            ref={featuresRef}
            className={cn(
              "max-w-7xl mx-auto px-6 md:px-8 lg:px-12 transition-all duration-1000",
              featuresVisible ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Section Header */}
            <div className="max-w-2xl mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Course registration <br />
                <span className="text-[#a41034]">without the stress.</span>
              </h2>
              <p className="text-xl text-gray-500">
                All the information you need in one place.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Large Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#a41034] to-[#7a0c28] rounded-3xl p-10 text-white relative overflow-hidden group hover-lift animate-gradient">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />

                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="h-7 w-7" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">500+ Course Reviews</h3>
                  <p className="text-white/70 text-lg max-w-md mb-6">
                    Know your courses with difficulty, workload, usefulness ratings and real student reviews.
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 text-white font-medium hover:gap-3 transition-all"
                  >
                    Explore Courses <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>

              {/* Small Card 1 */}
              <div className="bg-gray-50 rounded-3xl p-8 group hover:bg-gray-100 transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professor Ratings</h3>
                <p className="text-gray-500">
                  Teaching, grading, accessibility - know your professor.
                </p>
              </div>

              {/* Small Card 2 */}
              <div className="bg-gray-50 rounded-3xl p-8 group hover:bg-gray-100 transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <MessageCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real Reviews</h3>
                <p className="text-gray-500">
                  Honest advice and warnings from students who took the course.
                </p>
              </div>

              {/* Small Card 3 */}
              <div className="bg-gray-50 rounded-3xl p-8 group hover:bg-gray-100 transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Search</h3>
                <p className="text-gray-500">
                  Filter instantly by department, credits, difficulty.
                </p>
              </div>

              {/* Small Card 4 */}
              <div className="bg-gray-50 rounded-3xl p-8 group hover:bg-gray-100 transition-all duration-300 hover-lift">
                <div className="w-12 h-12 bg-[#a41034]/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-[#a41034]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">METU Only</h3>
                <p className="text-gray-500">
                  Register with @metu.edu.tr, anonymous reviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-32 bg-[#faf9f7] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute top-20 left-20 w-96 h-96 border border-[#a41034] rounded-full" />
            <div className="absolute bottom-20 right-20 w-64 h-64 border border-[#a41034] rounded-full" />
          </div>

          <div
            ref={socialRef}
            className={cn(
              "max-w-7xl mx-auto px-6 md:px-8 lg:px-12 relative transition-all duration-1000",
              socialVisible ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#a41034]/5 rounded-full mb-6">
                  <GraduationCap className="h-4 w-4 text-[#a41034]" />
                  <span className="text-sm font-medium text-[#a41034]">METU Only</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  The campus&apos;s biggest
                  <br />
                  <span className="text-[#a41034]">course guide.</span>
                </h2>

                <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                  For those who drink coffee at A4, those who pull all-nighters at the library.
                  A platform for those who know the METU spirit.
                </p>

                <div className="space-y-4">
                  {[
                    "Register only with @metu.edu.tr",
                    "Completely anonymous reviews",
                    "Daily updated content",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-[#a41034]/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-[#a41034]" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - Stats */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover-lift">
                  <div className="text-5xl font-bold text-[#a41034] mb-2">92%</div>
                  <div className="text-gray-500">Satisfaction Rate</div>
                </div>
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 hover-lift">
                  <div className="text-5xl font-bold text-gray-900 mb-2">1K+</div>
                  <div className="text-gray-500">Active Users</div>
                </div>
                <div className="col-span-2 bg-[#a41034] rounded-3xl p-8 text-white hover-lift group">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      <Compass className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold">Find Your Way</div>
                      <div className="text-white/70">Your compass in course selection</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Get <span className="text-[#a41034]">started.</span>
              </h2>
              <p className="text-xl text-gray-500 mb-10 max-w-lg mx-auto">
                Thousands of METU students are already here.
                Join and stay one step ahead in course selection.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-[#a41034] hover:bg-[#8a0d2c] text-white rounded-full h-16 px-12 text-lg font-medium shadow-xl shadow-[#a41034]/25 group"
              >
                <Link href="/register">
                  Sign Up Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo size="md" />
            <div className="flex items-center gap-8">
              <Link href="/courses" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Courses
              </Link>
              <Link href="/professors" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Professors
              </Link>
              <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} METU Compass
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
