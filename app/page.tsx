"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useState } from "react";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const steps = [
  {
    title: "Upload",
    description: "Add one dog or cat photo from your device.",
  },
  {
    title: "Remove",
    description: "We send it to remove.bg through a secure server route.",
  },
  {
    title: "Download",
    description: "Grab a transparent PNG as soon as processing finishes.",
  },
];

const faqs = [
  {
    question: "What image types are supported?",
    answer: "PNG, JPG, JPEG, and WEBP are supported for the first version.",
  },
  {
    question: "Do you store my pet photos?",
    answer:
      "No. Files are processed in memory and are not saved in a database or object storage.",
  },
  {
    question: "Why can a photo fail?",
    answer:
      "Large files, unsupported formats, or temporary remove.bg API issues can all cause a retry prompt.",
  },
];

function formatFileError(file: File) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Please upload a PNG, JPG, or WEBP image.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Please upload an image under 10MB.";
  }

  return "";
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [previewUrl, resultUrl]);

  function updateFile(nextFile: File | null) {
    if (!nextFile) {
      return;
    }

    const validationError = formatFileError(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl(null);
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setError("");
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    updateFile(event.target.files?.[0] ?? null);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    updateFile(event.dataTransfer.files?.[0] ?? null);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setError("Please choose a pet photo first.");
      return;
    }

    const validationError = formatFileError(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image_file", file);

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(
          data?.error ??
            "Failed to remove the background. Please try again in a moment.",
        );
      }

      const blob = await response.blob();

      if (resultUrl) {
        URL.revokeObjectURL(resultUrl);
      }

      setResultUrl(URL.createObjectURL(blob));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function downloadResult() {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "pet-cutout.png";
    link.click();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(255,240,217,0.9)_30%,_rgba(255,229,185,0.72)_55%,_#f4ddbc_100%)] text-stone-900">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
              Pet Photo Background Remover
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
              Remove the background from dog and cat photos in seconds.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700 sm:text-lg">
              Built for pet photos, with a fast upload flow, transparent PNG
              download, no signup, and no image storage.
            </p>
          </div>
          <div className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm backdrop-blur">
            No signup
            <span className="mx-2 text-stone-300">•</span>
            No storage
            <span className="mx-2 text-stone-300">•</span>
            Transparent PNG
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <form
            onSubmit={onSubmit}
            className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(76,52,18,0.12)] backdrop-blur sm:p-7"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-stone-950">
                  Upload your pet photo
                </h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">
                  Best results come from a clear dog or cat image with the full
                  body, face, or fur visible.
                </p>
              </div>
              <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">
                10MB max
              </div>
            </div>

            <label
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={`mt-6 flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 text-center transition ${
                isDragging
                  ? "border-amber-500 bg-amber-50"
                  : "border-stone-300 bg-stone-50 hover:border-amber-400 hover:bg-amber-50/60"
              }`}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={onFileChange}
              />
              <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                Click to upload or drag a photo here
              </span>
              <p className="mt-5 max-w-sm text-sm leading-6 text-stone-600">
                Supports PNG, JPG, and WEBP. We process one pet photo at a
                time and do not store the image after the request finishes.
              </p>
              {file ? (
                <div className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-stone-700 shadow-sm">
                  Selected: <span className="font-semibold">{file.name}</span>
                </div>
              ) : null}
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-w-44 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                {isLoading ? "Removing background..." : "Remove Background"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  if (resultUrl) URL.revokeObjectURL(resultUrl);
                  setFile(null);
                  setPreviewUrl(null);
                  setResultUrl(null);
                  setError("");
                }}
                className="inline-flex items-center justify-center rounded-full border border-stone-300 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-white"
              >
                Reset
              </button>
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : (
              <p className="mt-4 text-sm text-stone-500">
                Processing runs through a server-side `remove.bg` proxy so your
                API key stays private.
              </p>
            )}
          </form>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/70 bg-stone-950 p-5 text-white shadow-[0_18px_60px_rgba(76,52,18,0.16)] sm:p-7">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Result preview</h2>
                {resultUrl ? (
                  <button
                    type="button"
                    onClick={downloadResult}
                    className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-200"
                  >
                    Download PNG
                  </button>
                ) : null}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium text-stone-300">
                    Original
                  </p>
                  <div className="relative overflow-hidden rounded-[1.5rem] bg-stone-800">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Original pet upload preview"
                        className="h-72 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-stone-400">
                        Upload a pet photo to see the before and after preview.
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-stone-300">
                    Transparent PNG
                  </p>
                  <div className="overflow-hidden rounded-[1.5rem] bg-[linear-gradient(45deg,_#f5f5f4_25%,_#e7e5e4_25%,_#e7e5e4_50%,_#f5f5f4_50%,_#f5f5f4_75%,_#e7e5e4_75%,_#e7e5e4_100%)] bg-[length:24px_24px]">
                    {resultUrl ? (
                      <img
                        src={resultUrl}
                        alt="Background removed pet preview"
                        className="h-72 w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-72 items-center justify-center px-6 text-center text-sm text-stone-500">
                        Your transparent PNG will appear here after processing.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_18px_60px_rgba(76,52,18,0.08)] sm:grid-cols-3 sm:p-7">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-[1.5rem] bg-stone-50 p-5 ring-1 ring-stone-200"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 text-lg font-semibold text-stone-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_18px_60px_rgba(76,52,18,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
              Why this MVP works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-stone-950">
              Focused on one outcome: transparent pet PNGs fast.
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-stone-700">
              <li>Built for dog and cat photos instead of generic cutout copy.</li>
              <li>No account flow, no gallery, and no storage layer to slow launch.</li>
              <li>Server-side API proxy keeps the `remove.bg` key out of the browser.</li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-white/70 bg-stone-900 p-6 text-stone-100 shadow-[0_18px_60px_rgba(76,52,18,0.14)]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
              Privacy and product notes
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-white/8 p-5">
                <h3 className="text-lg font-semibold">No image storage</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Files are processed in memory only and are not saved as part
                  of this MVP flow.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-white/8 p-5">
                <h3 className="text-lg font-semibold">Third-party processing</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Background removal is powered by remove.bg and returned
                  directly to the browser.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_18px_60px_rgba(76,52,18,0.08)]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                FAQ
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-stone-950">
                A few practical answers before you launch.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              This page is intentionally lean so we can validate the pet-photo
              use case before adding logins, billing, or batch workflows.
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-[1.5rem] bg-stone-50 p-5 ring-1 ring-stone-200"
              >
                <h3 className="text-lg font-semibold text-stone-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
