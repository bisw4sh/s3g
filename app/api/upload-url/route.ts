import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/s3";

export async function POST(req: NextRequest) {
  const { fileName, fileType } = await req.json();

  const url = await getPresignedUrl(fileName, fileType);

  return NextResponse.json({ url });
}
