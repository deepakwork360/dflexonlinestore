"use client";

import { useMemo, useState } from "react";
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
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Upload Photos
        </span>
        <div className="mt-2 grid gap-2">
          {Array.from({ length: visibleFileCount }, (_, index) => (
            <label
              key={index}
              className="grid gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500"
            >
              Photo {index + 1}{index === 0 ? " / Primary" : ""}
              <Input
                name={`photo${index + 1}`}
                type="file"
                accept="image/*"
                className="h-auto bg-white py-2 text-xs"
                onChange={(event) => {
                  const next = [...filledFiles];
                  next[index] = Boolean(event.target.files?.length);
                  setFilledFiles(next);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Or Image URLs
        </span>
        <div className="mt-2 grid gap-2">
          {Array.from({ length: visibleUrlCount }, (_, index) => (
            <label
              key={index}
              className="grid gap-1 rounded-md border border-neutral-200 bg-white p-2 text-[10px] font-bold uppercase tracking-wider text-neutral-500"
            >
              Image URL {index + 1}{index === 0 ? " / Primary fallback" : ""}
              <Input
                name={`imageUrl${index + 1}`}
                type="url"
                value={urls[index]}
                placeholder="https://..."
                className="text-xs"
                onChange={(event) => {
                  const next = [...urls];
                  next[index] = event.target.value;
                  setUrls(next);
                }}
              />
            </label>
          ))}
        </div>
      </div>

      <span className="block text-[10px] font-semibold text-neutral-400">
        Add one photo or URL to reveal the next slot. Maximum 10 photos per product.
      </span>
    </div>
  );
}
