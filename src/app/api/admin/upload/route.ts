import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createAdminClient } from "@/lib/supabase/server";

// Node.js runtime — required for Buffer streaming (avoids Vercel memory limits)
export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "portfolio";
    const title = (formData.get("title") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Convert File to Buffer — Node.js streaming to avoid Vercel memory limits
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary via stream (memory-safe for large files)
    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `arm-artistry/${category}`,
            resource_type: "image",
            // Auto-generate WebP thumbnails on upload
            eager: [
              {
                width: 800,
                height: 600,
                crop: "fill",
                gravity: "auto",
                format: "webp",
                quality: "auto:good",
              },
              {
                width: 400,
                height: 300,
                crop: "fill",
                gravity: "auto",
                format: "webp",
                quality: "auto:eco",
              },
            ],
            eager_async: false,
            format: "webp",
            quality: "auto:best",
            fetch_format: "auto",
            tags: ["arm-artistry", category],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        );
        uploadStream.end(buffer);
      }
    );

    // Save to Supabase portfolio table (non-fatal if missing table)
    try {
      const supabase = createAdminClient();
      await supabase.from("portfolio_items").insert({
        title: title || file.name.split(".")[0],
        image_url: uploadResult.secure_url,
        cloudinary_public_id: uploadResult.public_id,
        category,
        is_featured: false,
      });
    } catch (dbErr) {
      console.error("[Upload] DB insert failed (non-fatal):", dbErr);
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error: unknown) {
    console.error("[Upload] Cloudinary error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
