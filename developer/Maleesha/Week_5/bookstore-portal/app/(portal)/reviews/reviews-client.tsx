"use client";

import { useRef, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea, NumericTextBox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { reviewsApi, Review, Book } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmDialog, { ConfirmDialogHandle } from "@/components/ConfirmDialog";

interface FormState {
  bookId: number | null;
  reviewerName: string;
  rating: number | null;
  comment: string;
}

const emptyForm: FormState = { bookId: null, reviewerName: "", rating: 5, comment: "" };

export default function ReviewsClient({ initialReviews, books }: { initialReviews: Review[]; books: Book[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);
  const confirmRef = useRef<ConfirmDialogHandle>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function bookTitle(id: number) {
    return books.find((b) => b.id === id)?.title || "Unknown";
  }

  async function refresh() {
    setReviews(await reviewsApi.getAll());
  }

  function openAdd() {
    setForm(emptyForm);
    setTouched({});
    setShowModal(true);
  }

  const errors = {
    bookId: !form.bookId,
    reviewerName: !form.reviewerName.trim(),
    rating: form.rating === null || form.rating < 1 || form.rating > 5,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSave() {
    setTouched({ bookId: true, reviewerName: true, rating: true });
    if (hasErrors) return;
    setSaving(true);
    try {
      await reviewsApi.create({
        bookId: form.bookId as number,
        reviewerName: form.reviewerName,
        rating: form.rating as number,
        comment: form.comment || undefined,
      });
      showToast("Review added", "success");
      setShowModal(false);
      await refresh();
    } catch {
      showToast("Failed to save review", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(review: Review) {
    const confirmed = await confirmRef.current?.open({
      title: "Delete Review",
      message: `Delete this review by ${review.reviewerName}? This can't be undone.`,
    });
    if (!confirmed) return;
    try {
      await reviewsApi.remove(review.id);
      showToast("Review deleted", "success");
      await refresh();
    } catch {
      showToast("Failed to delete review", "error");
    }
  }

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const fiveStars = reviews.filter((r) => r.rating === 5).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4 animate-fadeUp">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl sm:text-3xl font-bold text-stone-800">
            Reviews
          </h2>
          <p className="text-stone-500 text-sm mt-1">What readers are saying</p>
        </div>
        <Button
          themeColor="primary"
          onClick={openAdd}
          className="!bg-gradient-to-r !from-amber-700 !to-amber-800 !border-0 !shadow-lg !shadow-amber-900/25 !px-5 !py-2.5 !rounded-xl hover:!shadow-xl hover:!-translate-y-0.5 !transition-all"
        >
          + Add Review
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
        {[
          { label: "Total Reviews", value: reviews.length, accent: "from-amber-500 to-amber-700" },
          { label: "Avg Rating", value: `${avgRating} ★`, accent: "from-orange-500 to-orange-700" },
          { label: "5-Star Reviews", value: fiveStars, accent: "from-emerald-500 to-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className="relative bg-white rounded-2xl p-4 shadow-sm border border-stone-200/60 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`} />
            <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-24 bg-white/60 rounded-2xl border-2 border-dashed border-stone-300 animate-fadeUp">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-lg font-semibold text-stone-600">No reviews yet</p>
          <p className="text-sm text-stone-400 mt-1">Reviews from readers will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {reviews.map((review, i) => (
            <div
              key={review.id}
              className="animate-fadeUp group bg-white rounded-2xl shadow-sm border border-stone-200/70 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-stone-800 text-lg truncate">
                    {bookTitle(review.bookId)}
                  </h3>
                  <p className="text-sm text-stone-500 mt-0.5">by {review.reviewerName}</p>
                </div>
                <div className="text-amber-500 text-lg tracking-wide flex-shrink-0">
                  {"★".repeat(review.rating)}
                  <span className="text-stone-200">{"★".repeat(5 - review.rating)}</span>
                </div>
              </div>
              {review.comment && <p className="text-sm text-stone-600 mt-3.5 italic leading-relaxed">&ldquo;{review.comment}&rdquo;</p>}
              <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                <button
                  onClick={() => handleDelete(review)}
                  className="px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Add Review"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="px-4 py-2 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-700 to-amber-800 text-white font-semibold hover:shadow-md transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Book</label>
              <DropDownList
                data={books}
                textField="title"
                dataItemKey="id"
                value={books.find((b) => b.id === form.bookId) || null}
                onChange={(e) => setForm({ ...form, bookId: e.value?.id ?? null })}
                onBlur={() => setTouched({ ...touched, bookId: true })}
                valid={!touched.bookId || !errors.bookId}
              />
              {touched.bookId && errors.bookId && <p className="text-red-600 text-xs mt-1">Please select a book.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Your Name</label>
              <Input
                value={form.reviewerName}
                onChange={(e) => setForm({ ...form, reviewerName: String(e.value ?? "") })}
                onBlur={() => setTouched({ ...touched, reviewerName: true })}
                valid={!touched.reviewerName || !errors.reviewerName}
              />
              {touched.reviewerName && errors.reviewerName && <p className="text-red-600 text-xs mt-1">Name is required.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Rating (1-5)</label>
              <NumericTextBox
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.value })}
                onBlur={() => setTouched({ ...touched, rating: true })}
                valid={!touched.rating || !errors.rating}
                min={1}
                max={5}
                format="n0"
              />
              {touched.rating && errors.rating && <p className="text-red-600 text-xs mt-1">Rating must be 1-5.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Comment (optional)</label>
              <TextArea value={form.comment} onChange={(e) => setForm({ ...form, comment: String(e.value ?? "") })} rows={3} />
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div
          className={`fixed top-5 right-5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl z-50 animate-popIn ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      <ConfirmDialog ref={confirmRef} />
    </div>
  );
}