import { createClient } from "@supabase/supabase-js";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";
const BUCKET = "experience-images";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pexelsApiKey = process.env.PEXELS_API_KEY;

if (!supabaseUrl || !serviceRoleKey || !pexelsApiKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or PEXELS_API_KEY",
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
    .select("id, title, category, image_url")
    .is("image_url", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function searchPhoto(experience) {
  const query = [experience.title, experience.category]
    .filter(Boolean)
    .join(" ");

  const url = new URL(PEXELS_API_URL);

  url.searchParams.set("query", query);
  url.searchParams.set("orientation", "landscape");
  url.searchParams.set("per_page", "5");

  const response = await fetch(url, {
    headers: {
      Authorization: pexelsApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Pexels request failed (${response.status}) for "${query}"`,
    );
  }

  const result = await response.json();

  return result.photos?.[0] ?? null;
}

async function downloadImage(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image download failed (${response.status})`);
  }

  return response.arrayBuffer();
}

async function uploadImage(experienceId, photo) {
  const path = `experiences/${experienceId}-${photo.id}.jpg`;

  const imageSrc = photo.src.large2x ?? photo.src.large ?? photo.src.landscape;
  const image = await downloadImage(imageSrc);

  const { error } = await supabase.storage.from(BUCKET).upload(path, image, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
    upsert: true,
  });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}

async function updateExperience(experience, photo, imageUrl) {
  const { error } = await supabase
    .from("experiences")
    .update({
      image_url: imageUrl,
      image_alt: photo.alt || experience.title,
    })
    .eq("id", experience.id);

  if (error) {
    throw error;
  }
}

async function seedExperience(experience) {
  console.log(`Searching: ${experience.title}`);

  const photo = await searchPhoto(experience);

  if (!photo) {
    console.warn(`No image found: ${experience.title}`);
    return;
  }

  const imageUrl = await uploadImage(experience.id, photo);

  await updateExperience(experience, photo, imageUrl);

  console.log(`Done: ${experience.title}`);
}

async function main() {
  const experiences = await loadExperiences();

  console.log(`Found ${experiences.length} experiences without images.`);

  for (const experience of experiences) {
    try {
      await seedExperience(experience);
    } catch (error) {
      console.error(`Failed: ${experience.title}`, error);
    }
  }

  console.log("Image seeding finished.");
}

await main();
