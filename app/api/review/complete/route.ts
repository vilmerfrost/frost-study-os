import { NextResponse } from "next/server";
import { completeReviewItem } from "@/lib/review/reviewItems";

export async function POST(req: Request) {
  try {
    const { reviewItemId, quality } = await req.json();

    if (!reviewItemId || typeof quality !== "number") {
      return NextResponse.json(
        { error: "reviewItemId och quality krävs" },
        { status: 400 }
      );
    }

    await completeReviewItem(reviewItemId, quality);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error completing review:", err);
    return NextResponse.json(
      { error: "Kunde inte uppdatera review item" },
      { status: 500 }
    );
  }
}

