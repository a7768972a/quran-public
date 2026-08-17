import Link from "next/link";
import { Heart, Github, Home as HomeIcon, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface SiteShellProps {
  children: React.ReactNode;
  /** عرض حاوية المحتوى */
  maxWidth?: "default" | "narrow";
  /** إظهار زر العودة للرئيسية في الرأس */
  showHomeLink?: boolean;
}

export function SiteShell({
  children,
  maxWidth = "default",
  showHomeLink = false,
}: SiteShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#edebe0] via-background to-background">
      {/* الرأس الثابت */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="grid place-items-center size-10 sm:size-11 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 overflow-hidden">
              <img src="/logo.svg" alt="شعار حلقة جامع الخضر" className="size-7 sm:size-8" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold leading-tight">
                حلقة جامع الخضر
              </h1>
              <p className="text-[11px] sm:text-xs text-muted-foreground">
                متابعة الطلاب
              </p>
            </div>
          </Link>

          {showHomeLink && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card px-3 py-1.5 text-xs sm:text-sm font-medium shadow-sm hover:bg-accent/40 transition-colors"
            >
              <HomeIcon className="size-4" />
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
          )}
        </div>
      </header>

      {/* المحتوى */}
      <main
        className={cn(
          "flex-1 mx-auto w-full px-4 py-6",
          maxWidth === "narrow" ? "max-w-3xl" : "max-w-6xl"
        )}
      >
        {children}
      </main>

      {/* التذييل الثابت */}
      <footer className="mt-auto border-t border-border/60 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span>أيام الدرس: السبت والثلاثاء</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            <span>صُمّم بـ</span>
            <Heart className="size-3 text-primary" fill="currentColor" />
            <span>بواسطة</span>
            <a
              href="https://github.com/a7768972a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-foreground hover:text-primary transition-colors"
              title="GitHub"
            >
              عبدالكريم طه
              <Github className="size-3" />
            </a>
            <span className="mx-1 text-border">|</span>
            <a
              href="tel:+963948579158"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
              title="اتصال: +963 948 579 158"
              dir="ltr"
            >
              <Phone className="size-3" />
              <span className="text-[11px] nums">+963 948 579 158</span>
            </a>
            <span className="mx-1 text-border">|</span>
            <a
              href="mailto:abdulkarim.mmx@gmail.com"
              className="inline-flex items-center gap-1 text-foreground hover:text-primary transition-colors"
              title="Gmail: abdulkarim.mmx@gmail.com"
              dir="ltr"
            >
              <Mail className="size-3" />
              <span className="text-[11px]">abdulkarim.mmx@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
