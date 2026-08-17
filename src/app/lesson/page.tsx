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
  FileText,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getWeekStart,
  addDays,
  formatDateAr,
  toDateInputValue,
  getLessonDate,
} from "@/lib/date";
import { LESSON_DAYS, getLessonDayLabel } from "@/lib/constants";
import type { Lesson, LessonImage, LessonDay } from "@/types";

function LessonPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const weekStartParam = searchParams.get("weekStart");
  const dayParam = searchParams.get("day") as LessonDay | null;

  const [weekStart, setWeekStart] = useState<Date>(
    weekStartParam ? getWeekStart(new Date(weekStartParam)) : getWeekStart(new Date())
  );
  const [day, setDay] = useState<LessonDay | null>(
    dayParam && (dayParam === "saturday" || dayParam === "tuesday") ? dayParam : null
  );
  const [dayPickerOpen, setDayPickerOpen] = useState(!day);
  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewing, setViewing] = useState<LessonImage | null>(null);

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
      setDayPickerOpen(false);
    }
  }, [dayParam]);

  // تحديث URL
  const updateWeek = (newWeekStart: Date) => {
    const normalized = getWeekStart(newWeekStart);
    const qs = new URLSearchParams();
    qs.set("weekStart", toDateInputValue(normalized));
    if (day) qs.set("day", day);
    router.replace(`/lesson?${qs.toString()}`, { scroll: false });
  };

  const selectDay = (newDay: LessonDay) => {
    setDay(newDay);
    setDayPickerOpen(false);
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

  // إيجاد درس اليوم المختار + صوره
  const selectedLesson = useMemo(() => {
    if (!lessons || !day) return null;
    const ws = toDateInputValue(weekStart);
    return (
      lessons.find(
        (l) =>
          l.lessonDay === day &&
          toDateInputValue(l.weekStart) === ws
      ) ?? null
    );
  }, [lessons, day, weekStart]);

  const selectedImages: LessonImage[] = selectedLesson?.images ?? [];

  return (
    <SiteShell showHomeLink>
      {/* Popup اختيار اليوم */}
      <DayPickerDialog
        open={dayPickerOpen}
        onOpenChange={(o) => {
          if (!o) setDayPickerOpen(false);
        }}
        selectedDay={day}
        onSelect={selectDay}
      />

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
          اختر يوم الدرس أولاً، ثم تنقّل بين الأسابيع
        </p>
      </div>

      {/* اختيار اليوم — في الأعلى */}
      <Card className="mb-5 border-primary/20 bg-card">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <span className="text-sm font-bold text-foreground">١. اختر يوم الدرس</span>
            </div>
            {day && (
              <Button variant="ghost" size="sm" onClick={() => setDayPickerOpen(true)} className="text-xs">
                تغيير
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {LESSON_DAYS.map((d) => (
              <button
                key={d.value}
                onClick={() => selectDay(d.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-3 cursor-pointer transition-all ${
                  day === d.value
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <CalendarDays className="size-4" />
                <span className="text-sm sm:text-base font-bold">{d.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* التنقل الأسبوعي — يظهر بعد اختيار اليوم */}
      {day && (
        <Card className="mb-5 border-primary/20 bg-card">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="size-4 text-primary" />
              <span className="text-sm font-bold text-foreground">٢. اختر الأسبوع</span>
            </div>
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
                  {day ? getLessonDayLabel(day) : "أسبوع"}
                </div>
                <div className="text-sm sm:text-base font-bold text-foreground truncate">
                  {day ? formatDateAr(getLessonDate(weekStart, day)) : formatDateAr(weekStart)}
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

            <div className="mt-3 flex items-center gap-2">
              <label htmlFor="weekPicker" className="text-xs text-muted-foreground shrink-0">
                اذهب إلى:
              </label>
              <Input
                id="weekPicker"
                type="date"
                value={toDateInputValue(weekStart)}
                onChange={(e) => {
                  if (e.target.value) updateWeek(new Date(e.target.value));
                }}
                className="h-9 text-sm nums"
              />
            </div>
          </CardContent>
        </Card>
      )}

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
      {day && !lessons && !error && (
        <Skeleton className="aspect-video w-full rounded-xl" />
      )}

      {/* عرض الصور */}
      {day && lessons !== null && (
        <>
          {selectedImages.length > 0 ? (
            <div className="space-y-4">
              {selectedImages.map((img, idx) => (
                <Card key={img.id} className="overflow-hidden">
                  <div className="relative bg-muted/40">
                    <button
                      onClick={() => setViewing(img)}
                      className="block w-full group cursor-zoom-in"
                      aria-label="تكبير الصورة"
                    >
                      <img
                        src={img.imageUrl}
                        alt={img.caption || `صورة ${idx + 1}`}
                        className="w-full h-auto max-h-[70vh] object-contain"
                      />
                      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-3 py-1.5 text-xs font-medium text-foreground shadow-md border border-border/60 group-hover:bg-background transition-colors">
                        <ZoomIn className="size-3.5" />
                        اضغط للتكبير
                      </div>
                      {selectedImages.length > 1 && (
                        <div className="absolute top-3 right-3 rounded-full bg-primary/90 px-2.5 py-1 text-xs font-bold text-primary-foreground">
                          {idx + 1} / {selectedImages.length}
                        </div>
                      )}
                    </button>
                  </div>
                  {img.caption && (
                    <CardContent className="p-3 flex items-start gap-2">
                      <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground">{img.caption}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
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
                  لا يوجد درس لـ{day ? getLessonDayLabel(day) : ""} في {day ? formatDateAr(getLessonDate(weekStart, day)) : formatDateAr(weekStart)}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* عرض الصورة بالتكبير */}
      <Dialog open={!!viewing} onOpenChange={(o) => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>عرض الصورة</DialogTitle>
            <DialogDescription>صورة الدرس مكبّرة</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="relative">
              <img
                src={viewing.imageUrl}
                alt={viewing.caption || "صورة الدرس"}
                className="w-full h-auto max-h-[85vh] object-contain bg-black/5"
              />
              {viewing.caption && (
                <div className="p-3 bg-card border-t border-border">
                  <p className="text-sm text-foreground flex items-start gap-2">
                    <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                    {viewing.caption}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SiteShell>
  );
}

// Popup اختيار اليوم
function DayPickerDialog({
  open, onOpenChange, selectedDay, onSelect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedDay: LessonDay | null;
  onSelect: (day: LessonDay) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            اختر يوم الدرس
          </DialogTitle>
          <DialogDescription>اختر اليوم الذي تريد مشاهدة درسه</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-2">
          {LESSON_DAYS.map((d) => (
            <button
              key={d.value}
              onClick={() => onSelect(d.value)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-6 transition-all hover:shadow-md ${
                selectedDay === d.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <CalendarDays className={`size-8 ${selectedDay === d.value ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`text-base font-bold ${selectedDay === d.value ? "text-primary" : ""}`}>
                {d.label}
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
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
