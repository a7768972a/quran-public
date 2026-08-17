"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Star,
  Users,
  BookOpen,
  ChevronLeft,
  CalendarDays,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site-shell";
import { getLessonDayLabel } from "@/lib/constants";
import type { Student } from "@/types";

export default function HomePage() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/students", { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as Student[];
        if (!cancelled) setStudents(data);
      } catch {
        if (!cancelled) setError("تعذر تحميل قائمة الطلاب");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = query.trim();
    if (!q) return students;
    return students.filter((s) => s.name.includes(q));
  }, [students, query]);

  return (
    <SiteShell>
      {/* الهيرو */}
      <section className="text-center pt-4 pb-8 sm:pt-8 sm:pb-10">
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          حلقة جامع الخضر
        </h2>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground">
          متابعة طلاب الحلقة
        </p>
      </section>

      {/* بطاقة درس الأسبوع */}
      <section className="mb-8">
        <Link href="/lesson" className="block">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-l from-primary/10 via-secondary/15 to-transparent hover:shadow-lg hover:shadow-primary/10 transition-all group cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className="grid place-items-center size-12 sm:size-14 shrink-0 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                <BookOpen className="size-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  📚 درس هذا الأسبوع
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  اطّلع على صور دروس السبت والثلاثاء لهذا الأسبوع
                </p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* البحث */}
      <section className="mb-5">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن اسم طالب..."
            className="h-11 sm:h-12 pr-10 text-base bg-card shadow-sm"
            aria-label="بحث عن طالب"
          />
        </div>
      </section>

      {/* عنوان القائمة */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
          <Users className="size-4 text-primary" />
          الطلاب
          {students && (
            <span className="text-xs text-muted-foreground font-normal">
              ({students.length} طالب)
            </span>
          )}
        </h3>
      </div>

      {/* الحالات */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {students === null && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      )}

      {students !== null && filtered.length === 0 && !error && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-2 p-10 text-center">
            <div className="grid place-items-center size-12 rounded-full bg-muted">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              {query.trim() ? "لا يوجد طالب بهذا الاسم" : "لا يوجد طلاب مسجّلون بعد"}
            </p>
            {query.trim() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery("")}
                className="mt-1"
              >
                مسح البحث
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* قائمة الطلاب */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <Link key={s.id} href={`/student/${s.id}`} className="block group">
              <Card className="hover:shadow-md hover:border-primary/30 transition-all h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="grid place-items-center size-11 shrink-0 rounded-xl bg-secondary/30 text-secondary-foreground">
                    <span className="text-lg font-bold">
                      {s.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {s.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" />
                        {getLessonDayLabel(s.lessonDay)}
                      </span>
                      <span>العمر: {s.age}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center shrink-0 rounded-lg bg-primary/5 px-2.5 py-1.5 border border-primary/10">
                    <Star
                      className="size-4 text-primary"
                      fill="currentColor"
                    />
                    <span className="text-xs font-bold text-primary mt-0.5 nums">
                      {s.points}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </SiteShell>
  );
}
