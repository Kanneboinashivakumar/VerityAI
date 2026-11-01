import { NextRequest, NextResponse } from "next/server";
import { parsePdfBuffer } from "@/lib/documents/pdf";
import { logger } from "@/lib/logger";
import { getAuthenticatedUser } from "@/lib/supabase/server-auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return NextResponse.json({ error: "Sign in before uploading a document." }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF documents are currently supported for document analysis." },
        { status: 400 }
      );
    }

    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: "PDFs must be 25 MB or smaller." }, { status: 413 });
    }

    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json({ error: "The uploaded file is not a PDF." }, { status: 415 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const parsed = await parsePdfBuffer(buffer);

    return NextResponse.json({
      filename: file.name,
      pageCount: parsed.pageCount,
      textPreview: parsed.text.slice(0, 300),
      extractedText: parsed.text,
      success: true,
    });
  } catch (err: any) {
    logger.error("Document upload failed", { error: err.message });
    return NextResponse.json(
      { error: "Failed to extract and process uploaded PDF document." },
      { status: 500 }
    );
  }
}
