const ACCEPTED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey) {
    return jsonError("Missing REMOVE_BG_API_KEY on the server.", 500);
  }

  const formData = await request.formData();
  const imageFile = formData.get("image_file");

  if (!(imageFile instanceof File)) {
    return jsonError("Please upload an image file.", 400);
  }

  if (!ACCEPTED_TYPES.has(imageFile.type)) {
    return jsonError("Please upload a PNG, JPG, or WEBP image.", 400);
  }

  if (imageFile.size > MAX_FILE_SIZE) {
    return jsonError("Please upload an image under 10MB.", 400);
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("image_file", imageFile, imageFile.name);
  upstreamFormData.append("size", "auto");

  const upstreamResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: upstreamFormData,
    cache: "no-store",
  });

  if (!upstreamResponse.ok) {
    let message = "Failed to remove the background. Please try again later.";

    try {
      const errorData = (await upstreamResponse.json()) as {
        errors?: Array<{ title?: string }>;
      };
      message = errorData.errors?.[0]?.title ?? message;
    } catch {
      const fallbackMessage = await upstreamResponse.text();

      if (fallbackMessage) {
        message = fallbackMessage;
      }
    }

    return jsonError(message, upstreamResponse.status);
  }

  const resultBlob = await upstreamResponse.blob();

  return new Response(resultBlob, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": 'attachment; filename="pet-cutout.png"',
      "Cache-Control": "no-store",
    },
  });
}
