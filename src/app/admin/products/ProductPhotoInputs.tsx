"use client";

import { useMemo, useState } from "react";
import { ImagePlus, LinkIcon, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const MAX_PHOTOS = 10;

export default function ProductPhotoInputs() {
  const [filledFiles, setFilledFiles] = useState<boolean[]>(
    Array.from({ length: MAX_PHOTOS }, () => false),
  );
  const [urls, setUrls] = useState<string[]>(
    Array.from({ length: MAX_PHOTOS }, () => ""),
  );

  const visibleFileCount = useMemo(() => {
    const firstEmpty = filledFiles.findIndex((filled) => !filled);
    return firstEmpty === -1 ? MAX_PHOTOS : Math.min(firstEmpty + 1, MAX_PHOTOS);
  }, [filledFiles]);

  const visibleUrlCount = useMemo(() => {
    const firstEmpty = urls.findIndex((url) => url.trim().length === 0);
    return firstEmpty === -1 ? MAX_PHOTOS : Math.min(firstEmpty + 1, MAX_PHOTOS);
  }, [urls]);

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
            <ImagePlus className="h-4 w-4 text-rose-600" />
            Upload Photos
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Max {MAX_PHOTOS}
          </span>
        </div>
        <div className="grid gap-2 p-3">
          {Array.from({ length: visibleFileCount }, (_, index) => (
            <div
              key={index}
              className="rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-neutral-800">
                    Photo {index + 1}
                    {index === 0 ? " / Primary" : ""}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-neutral-500">
                    JPG, PNG, or WebP image
                  </p>
                </div>
                {index === visibleFileCount - 1 && visibleFileCount < MAX_PHOTOS ? (
                  <Plus className="h-4 w-4 shrink-0 text-neutral-400" />
                ) : null}
              </div>
              <Input
                name={`photo${index + 1}`}
                type="file"
                accept="image/*"
                className="mt-3 h-10 cursor-pointer bg-white px-3 py-2 text-xs file:mr-3 file:rounded-md file:bg-neutral-950 file:px-3 file:text-xs file:font-bold file:uppercase file:tracking-wider file:text-white"
                onChange={(event) => {
                  const next = [...filledFiles];
                  next[index] = Boolean(event.target.files?.length);
                  setFilledFiles(next);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white">
        <div className="flex items-center justify-between border-b border-neutral-100 px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-800">
            <LinkIcon className="h-4 w-4 text-rose-600" />
            Image URLs
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Optional
          </span>
        </div>
        <div className="grid gap-2 p-3">
          {Array.from({ length: visibleUrlCount }, (_, index) => (
            <div
              key={index}
              className="rounded-md border border-neutral-200 bg-neutral-50 p-3"
            >
              <span className="text-xs font-black uppercase tracking-wider text-neutral-800">
                URL {index + 1}{index === 0 ? " / Primary fallback" : ""}
              </span>
              <Input
                name={`imageUrl${index + 1}`}
                type="url"
                value={urls[index]}
                placeholder="https://..."
                className="mt-2 h-10 bg-white text-xs"
                onChange={(event) => {
                  const next = [...urls];
                  next[index] = event.target.value;
                  setUrls(next);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <span className="block rounded-md bg-neutral-50 px-3 py-2 text-[11px] font-semibold text-neutral-500">
        Add one photo or URL to reveal the next slot. The first image becomes the primary product image.
      </span>
    </div>
  );
}
