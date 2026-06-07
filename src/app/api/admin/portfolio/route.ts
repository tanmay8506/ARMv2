import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user && user.email === process.env.ADMIN_EMAIL;
}

function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/image/upload/");
    if (parts.length < 2) return null;
    const filePart = parts[1];
    // Remove version segment (e.g. v1717723901/) if present
    const urlPath = filePart.replace(/^v\d+\//, "");
    const dotIndex = urlPath.lastIndexOf(".");
    if (dotIndex === -1) return urlPath;
    return urlPath.substring(0, dotIndex);
  } catch (err) {
    console.error("Failed to parse Cloudinary URL:", err);
    return null;
  }
}

// Fetch all portfolio assets for admin management
export async function GET() {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createAdminClient();
    const { data: assets, error } = await adminSupabase
      .from("portfolio_assets")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, assets });
  } catch (error: unknown) {
    console.error("Admin Portfolio GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update an asset's details, display order, or active status
export async function PATCH(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, category, display_order, is_active } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing asset ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (display_order !== undefined) updates.display_order = parseInt(display_order, 10);
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await adminSupabase
      .from("portfolio_assets")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, asset: data });
  } catch (error: unknown) {
    console.error("Admin Portfolio PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete an asset from database and Cloudinary CDN
export async function DELETE(request: Request) {
  try {
    if (!await isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing asset ID" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();
    
    // 1. Fetch asset details to get the Cloudinary path
    const { data: asset, error: fetchErr } = await adminSupabase
      .from("portfolio_assets")
      .select("cloudinary_path")
      .eq("id", id)
      .single();

    if (fetchErr || !asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // 2. Delete from Cloudinary CDN if credentials exist and path parses
    const publicId = getPublicIdFromUrl(asset.cloudinary_path);
    if (publicId) {
      try {
        console.log(`Deleting Cloudinary asset with public ID: ${publicId}`);
        await new Promise((resolve, reject) => {
          cloudinary.uploader.destroy(publicId, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      } catch (cloudinaryErr) {
        console.error("Cloudinary asset deletion warning (continuing DB delete):", cloudinaryErr);
      }
    }

    // 3. Delete from Supabase Database
    const { error: deleteErr } = await adminSupabase
      .from("portfolio_assets")
      .delete()
      .eq("id", id);

    if (deleteErr) throw deleteErr;

    return NextResponse.json({ success: true, message: "Asset deleted from database and Cloudinary." });
  } catch (error: unknown) {
    console.error("Admin Portfolio DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
