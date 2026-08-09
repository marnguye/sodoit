import { createClient } from "@supabase/supabase-js";
import {
  optimizeImage,
  formatKB,
  percentSaved,
} from "./lib/optimize-image.mjs";

const BUCKET = "experience-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function loadExperiences() {
  const { data, error } = await supabase
    .from("experiences")
    .select("id, title, image_url")
    .not("image_url", "is", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

function storagePathFromPublicUrl(url) {
  const marker = `/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return url.slice(index + marker.length).split("?")[0];
}

function toWebpPath(originalPath) {
  return `${originalPath.replace(/\.[^./]+$/, "")}.webp`;
}

async function downloadImage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image download failed (${response.status})`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function optimizeExperience(experience, totals) {
  const oldPath = storagePathFromPublicUrl(experience.image_url);

  if (!oldPath) {
    console.warn(`Skipping (unrecognized URL): ${experience.title}`);
    return;
  }

  console.log(`Optimizing: ${experience.title}`);

  const original = await downloadImage(experience.image_url);
  const optimized = await optimizeImage(original);

  const newPath = toWebpPath(oldPath);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(newPath, optimized, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(newPath);

  const bustedUrl = `${publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("experiences")
    .update({ image_url: bustedUrl })
    .eq("id", experience.id);

  if (updateError) {
    throw updateError;
  }

  if (newPath !== oldPath) {
    const { error: removeError } = await supabase.storage
      .from(BUCKET)
      .remove([oldPath]);

    if (removeError) {
      console.warn(
        `  Could not remove old file for ${experience.title}: ${removeError.message}`,
      );
    }
  }

  totals.original += original.byteLength;
  totals.optimized += optimized.byteLength;
  totals.count += 1;

  console.log(
    `  ${formatKB(original.byteLength)} -> ${formatKB(optimized.byteLength)} (-${percentSaved(original.byteLength, optimized.byteLength)}%)`,
  );
}

function printSummary(totals) {
  if (totals.count === 0) {
    console.log("No images processed.");
    return;
  }

  const originalMB = totals.original / (1024 * 1024);
  const optimizedMB = totals.optimized / (1024 * 1024);

  console.log(
    `\nProcessed ${totals.count} images. Original: ${originalMB.toFixed(2)} MB, Optimized: ${optimizedMB.toFixed(2)} MB, Saved: ${percentSaved(totals.original, totals.optimized)}%`,
  );
}

async function main() {
  const experiences = await loadExperiences();

  console.log(`Found ${experiences.length} experiences with images.`);

  const totals = { original: 0, optimized: 0, count: 0 };

  for (const experience of experiences) {
    try {
      await optimizeExperience(experience, totals);
    } catch (error) {
      console.error(`Failed: ${experience.title}`, error);
    }
  }

  printSummary(totals);

  console.log("Image optimization finished.");
}

await main();
