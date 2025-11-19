import { NextResponse } from "next/server";
import { getDueReviewItems } from "@/lib/review/reviewItems";

export async function GET() {
  try {
    const reviewItems = await getDueReviewItems(3);
    return NextResponse.json({ reviewItems }, { status: 200 });
  } catch (err) {
    console.error("Error fetching review items:", err);
    return NextResponse.json(
      { error: "Kunde inte hämta review items" },
      { status: 500 }
    );
  }
}

