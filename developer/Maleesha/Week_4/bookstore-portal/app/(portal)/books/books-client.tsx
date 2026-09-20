"use client";

import { useRef, useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input, NumericTextBox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { booksApi, Book, Author } from "@/lib/api";
import Modal from "@/components/Modal";
import ConfirmDialog, { ConfirmDialogHandle } from "@/components/ConfirmDialog";

interface FormState {
  title: string;
  authorId: number | null;
  genre: string;
  price: number | null;
  stock: number | null;
}

const emptyForm: FormState = { title: "", authorId: null, genre: "", price: 0, stock: 0 };
const coverPalette = ["#92400e", "#7c2d12", "#78350f", "#451a03", "#a16207", "#854d0e", "#1e3a5f", "#3f4a3d"];

function shade(hex: string) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - 45);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - 45);
  const b = Math.max(0, (num & 0x0000ff) - 45);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function BooksClient({ initialBooks, authors }: { initialBooks: Book[]; authors: Author[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);
  const confirmRef = useRef<ConfirmDialogHandle>(null);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function authorName(id: number) {
    return authors.find((a) => a.id === id)?.name || "Unknown";
  }

  async function refresh() {
    setBooks(await booksApi.getAll());
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setTouched({});
    setShowModal(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setForm({ title: book.title, authorId: book.authorId, genre: book.genre, price: book.price, stock: book.stock });
    setTouched({});
    setShowModal(true);
  }

  const errors = {
    title: !form.title.trim(),
    authorId: !form.authorId,
    genre: !form.genre.trim(),
    price: form.price === null || form.price < 0,
    stock: form.stock === null || form.stock < 0,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSave() {
    setTouched({ title: true, authorId: true, genre: true, price: true, stock: true });
    if (hasErrors) return;
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        authorId: form.authorId as number,
        genre: form.genre,
        price: form.price as number,
        stock: form.stock as number,
        coverColor: editing?.coverColor || coverPalette[Math.floor(Math.random() * coverPalette.length)],
      };
      if (editing) {
        await booksApi.update(editing.id, payload);
        showToast("Book updated", "success");
      } else {
        await booksApi.create(payload);
        showToast("Book added", "success");
      }
      setShowModal(false);
      await refresh();
    } catch {
      showToast("Failed to save book", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(book: Book) {
    const confirmed = await confirmRef.current?.open({
      title: "Delete Book",
      message: `Delete "${book.title}"? This can't be undone.`,
    });
    if (!confirmed) return;
    try {
      await booksApi.remove(book.id);
      showToast("Book deleted", "success");
      await refresh();
    } catch {
      showToast("Failed to delete book", "error");
    }
  }

  const totalValue = books.reduce((sum, b) => sum + b.price * b.stock, 0);
  const lowStock = books.filter((b) => b.stock < 5).length;
  const genres = new Set(books.map((b) => b.genre)).size;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4 animate-fadeUp">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl sm:text-3xl font-bold text-stone-800">
            Books
          </h2>
          <p className="text-stone-500 text-sm mt-1">Manage your shelf inventory</p>
        </div>
        <Button
          themeColor="primary"
          onClick={openAdd}
          className="!bg-gradient-to-r !from-amber-700 !to-amber-800 !border-0 !shadow-lg !shadow-amber-900/25 !px-5 !py-2.5 !rounded-xl hover:!shadow-xl hover:!-translate-y-0.5 !transition-all"
        >
          + Add Book
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
        {[
          { label: "Total Titles", value: books.length, accent: "from-amber-500 to-amber-700" },
          { label: "Genres", value: genres, accent: "from-orange-500 to-orange-700" },
          { label: "Low Stock", value: lowStock, accent: "from-red-500 to-red-700" },
          { label: "Inventory Value", value: `$${totalValue.toFixed(0)}`, accent: "from-emerald-500 to-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className="relative bg-white rounded-2xl p-4 shadow-sm border border-stone-200/60 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`} />
            <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {books.length === 0 ? (
        <div className="text-center py-24 bg-white/60 rounded-2xl border-2 border-dashed border-stone-300 animate-fadeUp">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-lg font-semibold text-stone-600">The shelf is empty</p>
          <p className="text-sm text-stone-400 mt-1">Add your first title to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book, i) => {
            const color = book.coverColor || "#92400e";
            const lowStockFlag = book.stock < 5;
            return (
              <div
                key={book.id}
                className="animate-fadeUp group bg-white rounded-2xl shadow-sm border border-stone-200/70 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <div
                  className="h-40 relative flex items-end px-5 pb-4 overflow-hidden"
                  style={{ background: `linear-gradient(150deg, ${color}, ${shade(color)})` }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-black/25" />
                  <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/5" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {lowStockFlag && (
                    <span className="absolute top-3 right-3 text-[10px] font-bold text-white bg-red-500/90 px-2 py-1 rounded-full shadow">
                      LOW STOCK
                    </span>
                  )}
                  <p
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="relative text-white font-bold text-lg leading-tight drop-shadow-md line-clamp-3 pl-2"
                  >
                    {book.title}
                  </p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-stone-500 flex items-center gap-1.5">
                    <span className="text-stone-300">✒️</span>{authorName(book.authorId)}
                  </p>
                  <span className="inline-block text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full mt-2.5">
                    {book.genre}
                  </span>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                    <span className="text-xl font-bold text-stone-800">${book.price.toFixed(2)}</span>
                    <span className={`text-xs font-medium ${lowStockFlag ? "text-red-500" : "text-stone-400"}`}>
                      {book.stock} in stock
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(book)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book)}
                      className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Modal
          title={editing ? "Edit Book" : "Add Book"}
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
              <label className="block text-sm font-semibold text-stone-700 mb-1">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: String(e.value ?? "") })}
                onBlur={() => setTouched({ ...touched, title: true })}
                valid={!touched.title || !errors.title}
              />
              {touched.title && errors.title && <p className="text-red-600 text-xs mt-1">Title is required.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Author</label>
              <DropDownList
                data={authors}
                textField="name"
                dataItemKey="id"
                value={authors.find((a) => a.id === form.authorId) || null}
                onChange={(e) => setForm({ ...form, authorId: e.value?.id ?? null })}
                onBlur={() => setTouched({ ...touched, authorId: true })}
                valid={!touched.authorId || !errors.authorId}
              />
              {touched.authorId && errors.authorId && <p className="text-red-600 text-xs mt-1">Please select an author.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Genre</label>
              <Input
                value={form.genre}
                onChange={(e) => setForm({ ...form, genre: String(e.value ?? "") })}
                onBlur={() => setTouched({ ...touched, genre: true })}
                valid={!touched.genre || !errors.genre}
              />
              {touched.genre && errors.genre && <p className="text-red-600 text-xs mt-1">Genre is required.</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Price ($)</label>
                <NumericTextBox
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.value })}
                  onBlur={() => setTouched({ ...touched, price: true })}
                  valid={!touched.price || !errors.price}
                  min={0}
                  format="c2"
                />
                {touched.price && errors.price && <p className="text-red-600 text-xs mt-1">Enter a valid price.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Stock</label>
                <NumericTextBox
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.value })}
                  onBlur={() => setTouched({ ...touched, stock: true })}
                  valid={!touched.stock || !errors.stock}
                  min={0}
                  format="n0"
                />
                {touched.stock && errors.stock && <p className="text-red-600 text-xs mt-1">Enter valid stock.</p>}
              </div>
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