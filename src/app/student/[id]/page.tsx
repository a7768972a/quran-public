"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Star,
  CalendarDays,
  User as UserIcon,
  BookOpen,
  Award,
  ClipboardList,
  AlertCircle,
  BookMarked,
  NotebookPen,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getLessonDayLabel, getGradeColor } from "@/lib/constants";
import {
  getWeekStart,
  addDays,
  formatDateAr,
  toDateInputValue,
} from "@/lib/date";
import type { StudentWithRecords } from "@/types";

function StudentDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams<{ id: string }>();
  const id = params.id;

  // الأسبوع المختار من query param أو الأسبوع الحالي
  const weekStartParam = searchParams.get("weekStart");
  const initialWeekStart = weekStartParam
    ? getWeekStart(new Date(weekStartParam))
    : getWeekStart(new Date());

  const [weekStart, setWeekStart] = useState<Date>(initialWeekStart);
  const [student, setStudent] = useState<StudentWithRecords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // مزامنة weekStart مع query param
  useEffect(() => {
    if (weekStartParam) {
      setWeekStart(getWeekStart(new Date(weekStartParam)));
    } else {
      setWeekStart(getWeekStart(new Date()));
    }
  }, [weekStartParam]);

  // تحديث الـ URL عند تغيير الأسبوع
  const updateWeek = (newWeekStart: Date) => {
    const normalized = getWeekStart(newWeekStart);
    const qs = new URLSearchParams();
    qs.set("weekStart", toDateInputValue(normalized));
    router.replace(`/student/${id}?${qs.toString()}`, { scroll: false });
  };

  // جلب بيانات الطالب
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStudent(null);
    setError(null);
    (async () => {
      try {
        const res = await fetch(`/api/students/${id}`, { cache: "no-store" });
        if (res.status === 404) {
          if (!cancelled) setError("الطالب غير موجود");
          return;
        }
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as StudentWithRecords;
        if (!cancelled) setStudent(data);
      } catch {
        if (!cancelled) setError("تعذر جلب بيانات الطالب");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // تاريخ الدرس لهذا الأسبوع حسب يوم الطالب
  const lessonDate = useMemo(() => {
    if (!student) return null;
    // السبت = weekStart (0 أيام)، الثلاثاء = weekStart + 3 أيام
    const offset = student.lessonDay === "saturday" ? 0 : 3;
    return addDays(weekStart, offset);
  }, [student, weekStart]);

  // إيجاد سجل الأسبوع المطابق
  const weekRecord = useMemo(() => {
    if (!student || !lessonDate) return null;
    const start = new Date(lessonDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(lessonDate);
    end.setHours(23, 59, 59, 999);
    return (
      student.records.find((r) => {
        const d = new Date(r.date);
        return d >= start && d <= end;
      }) ?? null
    );
  }, [student, lessonDate]);

  // حالة معرّف مفقود
  if (!id) {
    return (
      <SiteShell showHomeLink maxWidth="narrow">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>معرّف الطالب مفقود</span>
          </CardContent>
        </Card>
      </SiteShell>
    );
  }

  return (
    <SiteShell showHomeLink maxWidth="narrow">
      {/* زر العودة */}
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-mr-2">
          <Link href="/">
            <ChevronRight className="size-4" />
            رجوع للقائمة
          </Link>
        </Button>
      </div>

      {/* التنقل الأسبوعي */}
      <Card className="mb-5 border-primary/20 bg-card">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateWeek(addDays(weekStart, 7))}
              className="gap-1"
              aria-label="الأسبوع التالي"
            >
              الأسبوع التالي
              <ChevronLeft className="size-4" />
            </Button>

            <div className="text-center flex-1 min-w-0">
              <div className="text-[11px] text-muted-foreground mb-0.5">
                أسبوع
              </div>
              <div className="text-sm sm:text-base font-bold text-foreground truncate">
                {formatDateAr(weekStart)}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateWeek(addDays(weekStart, -7))}
              className="gap-1"
              aria-label="الأسبوع السابق"
            >
              <ChevronRight className="size-4" />
              الأسبوع السابق
            </Button>
          </div>

          {/* اختيار تاريخ للقفز */}
          <div className="mt-3 flex items-center gap-2">
            <label
              htmlFor="weekPicker"
              className="text-xs text-muted-foreground shrink-0"
            >
              اذهب إلى:
            </label>
            <Input
              id="weekPicker"
              type="date"
              value={toDateInputValue(weekStart)}
              onChange={(e) => {
                if (e.target.value) {
                  updateWeek(new Date(e.target.value));
                }
              }}
              className="h-9 text-sm nums"
            />
          </div>
        </CardContent>
      </Card>

      {/* حالة الخطأ */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5 mb-5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* تحميل */}
      {!student && !error && (
        <div className="space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      )}

      {/* بطاقة معلومات الطالب */}
      {student && (
        <>
          <Card className="mb-5 overflow-hidden">
            <div className="h-2 bg-gradient-to-l from-primary via-primary/70 to-secondary" />
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="grid place-items-center size-14 sm:size-16 shrink-0 rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                  <UserIcon className="size-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">
                    {student.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {getLessonDayLabel(student.lessonDay)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <UserIcon className="size-3.5" />
                      {student.age} سنة
                    </span>
                  </div>
                </div>
              </div>

              {/* النقاط */}
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-primary/5 border border-primary/15 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid place-items-center size-10 rounded-xl bg-primary text-primary-foreground">
                    <Star className="size-5" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      النقاط المكتسبة
                    </div>
                    <div className="text-2xl font-extrabold text-primary nums leading-tight">
                      {student.points}
                    </div>
                  </div>
                </div>
                <Award className="size-7 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          {/* بطاقة سجل الأسبوع */}
          <div className="mb-3 flex items-center gap-2 px-1">
            <BookOpen className="size-4 text-primary" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              درس {getLessonDayLabel(student.lessonDay)} هذا الأسبوع
            </h3>
          </div>

          {lessonDate && (
            <div className="text-xs text-muted-foreground mb-3 px-1">
              تاريخ الدرس: {formatDateAr(lessonDate)}
            </div>
          )}

          {weekRecord ? (
            <Card>
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* الحفظ */}
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center size-9 shrink-0 rounded-lg bg-secondary/30 text-secondary-foreground">
                    <BookMarked className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      الحفظ
                    </div>
                    <div className="text-sm font-medium text-foreground break-words">
                      {weekRecord.memorization || "—"}
                    </div>
                  </div>
                </div>

                {/* الدرجة */}
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center size-9 shrink-0 rounded-lg bg-secondary/30 text-secondary-foreground">
                    <Award className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-1">
                      الدرجة
                    </div>
                    <Badge
                      className={`border ${getGradeColor(weekRecord.grade)}`}
                    >
                      {weekRecord.grade}
                    </Badge>
                  </div>
                </div>

                {/* الوظيفة */}
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center size-9 shrink-0 rounded-lg bg-secondary/30 text-secondary-foreground">
                    <NotebookPen className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      الوظيفة
                    </div>
                    <div className="text-sm font-medium text-foreground break-words">
                      {weekRecord.homework || "—"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                <div className="grid place-items-center size-12 rounded-full bg-muted">
                  <ClipboardList className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  لا يوجد درس مسجّل لهذا الأسبوع
                </p>
                <p className="text-xs text-muted-foreground">
                  لم يتم تسجيل حفظ للطالب في {getLessonDayLabel(student.lessonDay)} هذا الأسبوع
                </p>
              </CardContent>
            </Card>
          )}

          {/* تنقل سريع للأسبوع */}
          <div className="mt-6 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateWeek(addDays(weekStart, -7))}
              className="gap-1"
            >
              <ArrowRight className="size-4" />
              الأسبوع السابق
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateWeek(addDays(weekStart, 7))}
              className="gap-1"
            >
              الأسبوع التالي
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        </>
      )}
    </SiteShell>
  );
}

export default function StudentDetailPage() {
  return (
    <Suspense
      fallback={
        <SiteShell showHomeLink maxWidth="narrow">
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </SiteShell>
      }
    >
      <StudentDetailContent />
    </Suspense>
  );
}
