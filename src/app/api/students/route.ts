import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/students — قائمة بكل الطلاب (قراءة فقط)
export async function GET() {
  try {
    const students = await db.student.findMany({
      orderBy: [{ lessonDay: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { records: true } },
      },
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("[GET /api/students]", error);
    return NextResponse.json(
      { error: "تعذر جلب الطلاب" },
      { status: 500 }
    );
  }
}
