// دوال مساعدة للتواريخ

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

export function formatDateAr(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  return `${AR_DAYS[d.getDay()]} ${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateShortAr(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${AR_MONTHS[d.getMonth()]}`;
}

// تحويل تاريخ إلى صيغة input date (YYYY-MM-DD)
export function toDateInputValue(dateInput: string | Date): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  const dd = d.getDate().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// بداية الأسبوع (السبت) الذي يحتوي على التاريخ المعطى
// في التقويم: الأسبوع يبدأ من السبت
// getDay: 0=الأحد ... 6=السبت
// نريد العودة للسبت
export function getWeekStart(dateInput: string | Date): Date {
  const d = new Date(dateInput);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0..6
  const diff = (day + 1) % 7; // السبت => 0, الأحد => 1, ... الجمعة => 6
  d.setDate(d.getDate() - diff);
  return d;
}

export function addDays(dateInput: string | Date, days: number): Date {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + days);
  return d;
}

export function getDayName(dayValue: string): string {
  if (dayValue === "saturday") return "السبت";
  if (dayValue === "tuesday") return "الثلاثاء";
  return dayValue;
}

// حساب تاريخ اليوم المختار (سبت أو ثلاثاء) ضمن أسبوع معين
export function getLessonDate(weekStart: string | Date, lessonDay: string): Date {
  const base = new Date(weekStart);
  base.setHours(0, 0, 0, 0);
  if (lessonDay === "tuesday") {
    base.setDate(base.getDate() + 3);
  }
  return base;
}
