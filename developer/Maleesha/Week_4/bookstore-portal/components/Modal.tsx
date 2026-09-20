"use client";

export default function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-popIn overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="text-xl font-bold text-stone-800">
            {title}
          </h3>
        </div>
        <div className="px-6 pb-2 max-h-[65vh] overflow-y-auto">{children}</div>
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end gap-3">{footer}</div>
      </div>
    </div>
  );
}