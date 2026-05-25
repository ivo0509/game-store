import { NextRequest } from "next/server";

import { requireSession } from "@/lib/auth";
import {
  MAX_UPLOAD_BYTES,
  deleteR2ObjectByUrl,
  uploadImageToR2,
} from "@/lib/r2";

export async function POST(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "publisher" && session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Expected multipart/form-data body." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { error: 'Missing "file" field in form data.' },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return Response.json({ error: "Uploaded file is empty." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json(
      {
        error: `File too large. Maximum size is ${
          MAX_UPLOAD_BYTES / (1024 * 1024)
        } MB.`,
      },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { url, key } = await uploadImageToR2(buffer, file.type);
    return Response.json({ url, key }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload file.";
    console.error("[POST /api/upload]", err);
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  let session;
  try {
    session = await requireSession();
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "publisher" && session.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");
  if (!url) {
    return Response.json(
      { error: 'Missing "url" query parameter.' },
      { status: 400 }
    );
  }

  const deleted = await deleteR2ObjectByUrl(url);
  return Response.json({ deleted });
}
