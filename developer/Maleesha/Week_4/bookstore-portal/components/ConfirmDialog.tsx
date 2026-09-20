"use client";

import { forwardRef, useImperativeHandle, useState } from "react";

export interface ConfirmDialogHandle {
  open: (opts: { title?: string; message: string }) => Promise<boolean>;
}

const ConfirmDialog = forwardRef<ConfirmDialogHandle>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("Confirm");
  const [message, setMessage] = useState("Are you sure?");
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    open: ({ title, message }) => {
      setTitle(title || "Confirm Delete");
      setMessage(message);
      setVisible(true);
      return new Promise<boolean>((resolve) => {
        setResolver(() => resolve);
      });
    },
  }));

  function handleConfirm() {
    setVisible(false);
    resolver?.(true);
  }

  function handleCancel() {
    setVisible(false);
    resolver?.(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-7 w-full max-w-sm animate-popIn">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-lg font-bold text-stone-800">
              {title}
            </h3>
            <p className="text-sm text-stone-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmDialog.displayName = "ConfirmDialog";
export default ConfirmDialog;