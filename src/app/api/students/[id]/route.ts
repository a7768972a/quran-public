import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/students/[id] — بروفايل الطالب مع سجل الحفظ (قراءة فقط)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await db.student.findUnique({
      where: { id },
      include: {
        records: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "الطالب غير موجود" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("[GET /api/students/[id]]", error);
    return NextResponse.json({ error: "تعذر جلب بيانات الطالب" }, { status: 500 });
  }
}
