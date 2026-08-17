// أنواع البيانات المشتركة

export type LessonDay = "saturday" | "tuesday";

export interface Student {
  id: string;
  name: string;
  age: number;
  lessonDay: LessonDay;
  points: number;
  createdAt: string;
  updatedAt: string;
  _count?: { records: number };
}

export interface StudentWithRecords extends Student {
  records: RecordItem[];
}

export type Grade = "مقبول" | "جيد" | "جيد جدا" | "ممتاز";

export interface RecordItem {
  id: string;
  studentId: string;
  memorization: string;
  grade: Grade;
  homework: string;
  date: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  lessonDay: LessonDay;
  weekStart: string;
  imageUrl: string;
  createdAt: string;
}
