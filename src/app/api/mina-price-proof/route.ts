import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { ProofModel } from "@/lib/models/proof.model";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const latestProof = await ProofModel.findOne()
      .sort({ blockHeight: -1 })
      .lean();

    if (!latestProof) {
      return NextResponse.json(
        { status: "error", message: "No proof found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: "success", data: latestProof },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching latest proof:", error);
    return NextResponse.json(
      {
        status: "error",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
