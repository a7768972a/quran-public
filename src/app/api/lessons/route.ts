import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWeekStart } from "@/lib/date";

// GET /api/lessons — جلب الدروس
// ?weekStart=YYYY-MM-DD => دروس أسبوع معين
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const weekStartStr = searchParams.get("weekStart");

    let where: { weekStart?: Date } = {};
    if (weekStartStr) {
      where.weekStart = getWeekStart(new Date(weekStartStr));
    }

    const lessons = await db.lesson.findMany({
      where,
      orderBy: { weekStart: "desc" },
      include: {
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(lessons);
  } catch (error) {
    console.error("[GET /api/lessons]", error);
    return NextResponse.json({ error: "تعذر جلب الدروس" }, { status: 500 });
  }
}
