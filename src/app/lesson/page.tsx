"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  ImageIcon,
  AlertCircle,
  ZoomIn,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getWeekStart,
  addDays,
  formatDateAr,
  toDateInputValue,
} from "@/lib/date";
import { LESSON_DAYS } from "@/lib/constants";
import type { Lesson, LessonDay } from "@/types";

function LessonPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekStartParam = searchParams.get("weekStart");
  const dayParam = searchParams.get("day") as LessonDay | null;

  const [weekStart, setWeekStart] = useState<Date>(
    weekStartParam ? getWeekStart(new Date(weekStartParam)) : getWeekStart(new Date())
  );
  const [day, setDay] = useState<LessonDay>(
    dayParam && (dayParam === "saturday" || dayParam === "tuesday")
      ? dayParam
      : "saturday"
  );
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);

  // مزامنة مع query params
  useEffect(() => {
    if (weekStartParam) {
      setWeekStart(getWeekStart(new Date(weekStartParam)));
    } else {
      setWeekStart(getWeekStart(new Date()));
    }
  }, [weekStartParam]);

  useEffect(() => {
    if (dayParam === "saturday" || dayParam === "tuesday") {
      setDay(dayParam);
    } else {
      setDay("saturday");
    }
  }, [dayParam]);

  // تحديث URL
  const updateWeek = (newWeekStart: Date) => {
    const normalized = getWeekStart(newWeekStart);
    const qs = new URLSearchParams();
    qs.set("weekStart", toDateInputValue(normalized));
    qs.set("day", day);
    router.replace(`/lesson?${qs.toString()}`, { scroll: false });
  };

  const updateDay = (newDay: LessonDay) => {
    const qs = new URLSearchParams();
    qs.set("weekStart", toDateInputValue(weekStart));
    qs.set("day", newDay);
    router.replace(`/lesson?${qs.toString()}`, { scroll: false });
  };

  // جلب الدروس لهذا الأسبوع
  useEffect(() => {
    let cancelled = false;
    setLessons(null);
    setError(null);
    (async () => {
      try {
        const url = `/api/lessons?weekStart=${toDateInputValue(weekStart)}`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as Lesson[];
        if (!cancelled) setLessons(data);
      } catch {
        if (!cancelled) setError("تعذر جلب الدروس");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  // إيجاد درس اليوم المختار
  const selectedLesson = useMemo(() => {
    if (!lessons) return null;
    const ws = getWeekStart(weekStart);
    return (
      lessons.find(
        (l) =>
          l.lessonDay === day &&
          new Date(l.weekStart).getTime() === ws.getTime()
      ) ?? null
    );
  }, [lessons, day, weekStart]);

  const dayLabel = day === "saturday" ? "السبت" : "الثلاثاء";

  return (
    <SiteShell showHomeLink>
      {/* زر العودة */}
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="-mr-2">
          <Link href="/">
            <ChevronRight className="size-4" />
            رجوع للقائمة
          </Link>
        </Button>
      </div>

      {/* العنوان */}
      <div className="mb-5">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2">
          <span className="grid place-items-center size-10 rounded-2xl bg-primary text-primary-foreground">
            <ImageIcon className="size-5" />
          </span>
          دروس الأسبوع
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          صور دروس السبت والثلاثاء لهذا الأسبوع
        </p>
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
              التالي
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
              السابق
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

      {/* اختيار اليوم */}
      <Card className="mb-5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="size-4 text-primary" />
            <span className="text-sm font-bold text-foreground">اختر اليوم</span>
          </div>
          <RadioGroup
            value={day}
            onValueChange={(v) => updateDay(v as LessonDay)}
            className="grid grid-cols-2 gap-2 sm:gap-3"
          >
            {LESSON_DAYS.map((d) => (
              <Label
                key={d.value}
                htmlFor={`day-${d.value}`}
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 cursor-pointer hover:bg-accent/30 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:text-primary"
              >
                <RadioGroupItem id={`day-${d.value}`} value={d.value} />
                <span className="text-sm sm:text-base font-bold">{d.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* حالة الخطأ */}
      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
            <AlertCircle className="size-5 shrink-0" />
            <span>{error}</span>
          </CardContent>
        </Card>
      )}

      {/* تحميل */}
      {!lessons && !error && (
        <Skeleton className="aspect-video w-full rounded-xl" />
      )}

      {/* عرض الدرس */}
      {lessons !== null && (
        <>
          {selectedLesson ? (
            <Card className="overflow-hidden">
              <div className="relative bg-muted/40">
                <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="block w-full group cursor-zoom-in"
                      aria-label="تكبير الصورة"
                    >
                      <img
                        src={selectedLesson.imageUrl}
                        alt={`درس ${dayLabel} - ${formatDateAr(weekStart)}`}
                        className="w-full h-auto max-h-[70vh] object-contain"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground shadow-md border border-border/60 group-hover:bg-background transition-colors">
                        <ZoomIn className="size-3.5" />
                        اضغط للتكبير
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-w-7xl p-0 border-0 bg-transparent shadow-none overflow-hidden sm:max-w-7xl"
                    showCloseButton
                  >
                    <DialogTitle className="sr-only">
                      درس {dayLabel} - {formatDateAr(weekStart)}
                    </DialogTitle>
                    <img
                      src={selectedLesson.imageUrl}
                      alt={`درس ${dayLabel} - ${formatDateAr(weekStart)}`}
                      className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              </div>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">أسبوع:</span>
                  <span className="font-bold text-foreground">
                    {formatDateAr(weekStart)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{dayLabel}</span>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                <div className="grid place-items-center size-14 rounded-full bg-muted">
                  <ImageIcon className="size-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  لم يتم رفع درس لهذا اليوم بعد
                </p>
                <p className="text-xs text-muted-foreground max-w-xs">
                  لا يوجد درس لـ{dayLabel} في أسبوع {formatDateAr(weekStart)}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </SiteShell>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <SiteShell showHomeLink>
          <Skeleton className="h-24 rounded-xl mb-5" />
          <Skeleton className="h-24 rounded-xl mb-5" />
          <Skeleton className="aspect-video w-full rounded-xl" />
        </SiteShell>
      }
    >
      <LessonPageContent />
    </Suspense>
  );
}
