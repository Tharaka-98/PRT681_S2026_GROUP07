"use client";

import { useState } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Input, TextArea } from "@progress/kendo-react-inputs";
import { authorsApi, Author } from "@/lib/api";

interface FormState {
  name: string;
  country: string;
  bio: string;
}

const emptyForm: FormState = { name: "", country: "", bio: "" };
const avatarPalette = ["#92400e", "#7c2d12", "#78350f", "#a16207", "#1e3a5f", "#3f4a3d", "#4a044e"];

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function colorFor(name: string) {
  const idx = name.charCodeAt(0) % avatarPalette.length;
  return avatarPalette[idx];
}

export default function AuthorsClient({ initialAuthors }: { initialAuthors: Author[] }) {
  const [authors, setAuthors] = useState<Author[]>(initialAuthors);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Author | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [saving, setSaving] = useState(false);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function refresh() {
    setAuthors(await authorsApi.getAll());
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setTouched({});
    setShowModal(true);
  }

  function openEdit(author: Author) {
    setEditing(author);
    setForm({ name: author.name, country: author.country, bio: author.bio || "" });
    setTouched({});
    setShowModal(true);
  }

  const errors = {
    name: !form.name.trim(),
    country: !form.country.trim(),
  };
  const hasErrors = Object.values(errors).some(Boolean);

  async function handleSave() {
    setTouched({ name: true, country: true });
    if (hasErrors) return;
    setSaving(true);
    try {
      const payload = { name: form.name, country: form.country, bio: form.bio || undefined };
      if (editing) {
        await authorsApi.update(editing.id, payload);
        showToast("Author updated", "success");
      } else {
        await authorsApi.create(payload);
        showToast("Author added", "success");
      }
      setShowModal(false);
      await refresh();
    } catch {
      showToast("Failed to save author", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(author: Author) {
    if (!confirm(`Delete "${author.name}"?`)) return;
    try {
      await authorsApi.remove(author.id);
      showToast("Author deleted", "success");
      await refresh();
    } catch {
      showToast("Failed to delete author", "error");
    }
  }

  const countries = new Set(authors.map((a) => a.country)).size;
  const withBio = authors.filter((a) => a.bio && a.bio.trim()).length;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4 animate-fadeUp">
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif" }} className="text-2xl sm:text-3xl font-bold text-stone-800">
            Authors
          </h2>
          <p className="text-stone-500 text-sm mt-1">The voices behind the shelf</p>
        </div>
        <Button
          themeColor="primary"
          onClick={openAdd}
          className="!bg-gradient-to-r !from-amber-700 !to-amber-800 !border-0 !shadow-lg !shadow-amber-900/25 !px-5 !py-2.5 !rounded-xl hover:!shadow-xl hover:!-translate-y-0.5 !transition-all"
        >
          + Add Author
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8 animate-fadeUp" style={{ animationDelay: "0.05s" }}>
        {[
          { label: "Total Authors", value: authors.length, accent: "from-amber-500 to-amber-700" },
          { label: "Countries", value: countries, accent: "from-orange-500 to-orange-700" },
          { label: "With Bio", value: withBio, accent: "from-emerald-500 to-emerald-700" },
        ].map((stat) => (
          <div key={stat.label} className="relative bg-white rounded-2xl p-4 shadow-sm border border-stone-200/60 overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent}`} />
            <p className="text-2xl font-bold text-stone-800">{stat.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {authors.length === 0 ? (
        <div className="text-center py-24 bg-white/60 rounded-2xl border-2 border-dashed border-stone-300 animate-fadeUp">
          <p className="text-4xl mb-3">✒️</p>
          <p className="text-lg font-semibold text-stone-600">No authors yet</p>
          <p className="text-sm text-stone-400 mt-1">Add your first author to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {authors.map((author, i) => {
            const color = colorFor(author.name);
            return (
              <div
                key={author.id}
                className="animate-fadeUp group bg-white rounded-2xl shadow-sm border border-stone-200/70 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${color}, #1c1917)` }}
                  >
                    {initials(author.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 style={{ fontFamily: "'Playfair Display', serif" }} className="font-bold text-stone-800 text-lg truncate">
                      {author.name}
                    </h3>
                    <p className="text-xs text-amber-700 font-semibold bg-amber-100 inline-block px-2 py-0.5 rounded-full mt-1">
                      {author.country}
                    </p>
                  </div>
                </div>
                {author.bio && (
                  <p className="text-sm text-stone-600 mt-3.5 line-clamp-3 leading-relaxed">{author.bio}</p>
                )}
                <div className="flex gap-2 mt-4 pt-4 border-t border-stone-100">
                  <button
                    onClick={() => openEdit(author)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(author)}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <Dialog title={editing ? "Edit Author" : "Add Author"} onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4 min-w-[280px]">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: String(e.value ?? "") })}
                onBlur={() => setTouched({ ...touched, name: true })}
                valid={!touched.name || !errors.name}
              />
              {touched.name && errors.name && <p className="text-red-600 text-xs mt-1">Name is required.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Country</label>
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: String(e.value ?? "") })}
                onBlur={() => setTouched({ ...touched, country: true })}
                valid={!touched.country || !errors.country}
              />
              {touched.country && errors.country && <p className="text-red-600 text-xs mt-1">Country is required.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1">Bio (optional)</label>
              <TextArea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: String(e.value ?? "") })}
                rows={3}
              />
            </div>
          </div>

          <DialogActionsBar>
            <Button onClick={() => setShowModal(false)} disabled={saving}>Cancel</Button>
            <Button themeColor="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActionsBar>
        </Dialog>
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
    </div>
  );
}