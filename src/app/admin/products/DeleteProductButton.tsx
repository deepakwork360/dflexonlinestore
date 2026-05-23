"use client";

import { Trash2 } from "lucide-react";
import { deleteProduct } from "../actions";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
  compact?: boolean;
}

export default function DeleteProductButton({
  productId,
  productName,
  compact = false,
}: DeleteProductButtonProps) {
  return (
    <form
      action={deleteProduct}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${productName}" permanently?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <button
        className={
          compact
            ? "inline-flex h-9 items-center gap-1.5 rounded-md border border-rose-200 px-3 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50"
            : "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-rose-600 px-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-rose-700"
        }
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
    </form>
  );
}
