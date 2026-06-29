"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Newspaper,
  Search,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ExternalLink,
  Link as LinkIcon,
} from "lucide-react";
import AuthGuard from "../auth-guard";

interface NewsItem {
  id?: number;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  image_url: string | null;
  published_at: string;
}

const EMPTY: Omit<NewsItem, "id"> = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  image_url: null,
  published_at: new Date().toISOString().slice(0, 10),
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[äöüß]/g, (c: string) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c))
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("de-DE", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-white/20 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20"
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-white/20 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 resize-y"
    />
  );
}

/* ── Delete modal ────────────────────────────────────────────────────── */
function DeleteModal({ item, onConfirm, onCancel, loading }: { item: NewsItem; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-white">Delete article</p>
            <p className="text-xs text-white/40">This cannot be undone.</p>
          </div>
        </div>
        <p className="mb-6 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">&quot;{item.title}&quot;</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Editor ──────────────────────────────────────────────────────────── */
function Editor({ initial, onSave, onCancel }: { initial: NewsItem | null; onSave: (data: Omit<NewsItem, "id">, id?: number) => Promise<void>; onCancel: () => void }) {
  const isNew = !initial?.id;
  const [form, setForm] = useState<Omit<NewsItem, "id">>(
    initial
      ? { title: initial.title, slug: initial.slug, short_description: initial.short_description, content: initial.content, image_url: initial.image_url, published_at: initial.published_at?.slice(0, 10) }
      : { ...EMPTY },
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [imgError, setImgError] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (v: string) => {
    set("title", v);
    if (!slugTouched) set("slug", slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.slug.trim()) return setError("Slug is required.");
    if (!form.published_at) return setError("Date is required.");
    setLoading(true);
    try {
      await onSave(form, initial?.id);
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
        <span className="text-white/20">/</span>
        <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
          {isNew ? "New Article" : "Edit Article"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-3">
        {/* Main */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">Content</p>
            <div className="flex flex-col gap-4">
              <Field label="Title *">
                <Input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Article headline…" />
              </Field>
              <Field label="Short description *">
                <Textarea value={form.short_description} onChange={(e) => set("short_description", e.target.value)} rows={2} placeholder="Summary shown on the news list…" />
              </Field>
              <Field label="Full content">
                <Textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={14} placeholder="Write the full article here…" style={{ fontFamily: "monospace", fontSize: "0.8rem" }} />
              </Field>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
            </div>
          )}

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">Publish</p>
            <div className="flex flex-col gap-4">
              <Field label="Date *">
                <Input type="date" value={form.published_at} onChange={(e) => set("published_at", e.target.value)} />
              </Field>
              <Field label="URL slug *">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20">
                  <span className="shrink-0 pl-3 text-xs text-white/20">/news/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }}
                    placeholder="my-article"
                    className="flex-1 bg-transparent py-2 pr-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">Cover image</p>
            <Field label="Image URL">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20">
                  <LinkIcon size={13} className="ml-3 shrink-0 text-white/20" />
                  <input
                    type="url"
                    value={form.image_url ?? ""}
                    onChange={(e) => { set("image_url", e.target.value || null); setImgError(false); }}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
                {form.image_url && (
                  <button type="button" onClick={() => set("image_url", null)} className="rounded-lg border border-white/10 p-2 text-white/30 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            </Field>

            {form.image_url && (
              <div className="mt-3 overflow-hidden rounded-lg border border-white/5">
                {imgError ? (
                  <div className="flex h-28 items-center justify-center gap-2 bg-white/5 text-xs text-white/30">
                    <AlertCircle size={14} /> Could not load image
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.image_url}
                    alt="Preview"
                    onError={() => setImgError(true)}
                    className="h-28 w-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm text-white/50 hover:bg-white/5 hover:text-white transition-colors">
              <X size={15} /> Cancel
            </button>
            <button type="submit" disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60 transition-colors">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isNew ? "Publish" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Table row ───────────────────────────────────────────────────────── */
function NewsRow({ item, onEdit, onDelete }: { item: NewsItem; onEdit: (i: NewsItem) => void; onDelete: (i: NewsItem) => void }) {
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <ImageIcon size={16} className="text-white/20" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{item.title}</p>
            <p className="truncate text-xs text-white/30">/news/{item.slug}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="line-clamp-2 text-xs text-white/40">{item.short_description}</p>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar size={12} /> {formatDate(item.published_at)}
        </div>
      </td>
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            <Pencil size={12} /> Edit
          </button>
          <a href={`/news/${item.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            <ExternalLink size={12} />
          </a>
          <button onClick={() => onDelete(item)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Main ────────────────────────────────────────────────────────────── */
function NewsDashboardContent() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "editor">("list");
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/news");
      const data = await res.json();
      setItems(data.data ?? []);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload: Omit<NewsItem, "id">, id?: number) => {
    const res = await fetch(id ? `/api/dashboard/news/${id}` : "/api/dashboard/news", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Failed to save"); }
    await load();
    setView("list"); setEditing(null);
    showToast(id ? "Article updated." : "Article published.");
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/dashboard/news/${deleteTarget.id}`, { method: "DELETE" });
      await load(); showToast("Article deleted.");
    } finally { setDeleteLoading(false); setDeleteTarget(null); }
  };

  const filtered = items.filter(
    (i) => i.title.toLowerCase().includes(search.toLowerCase()) || i.slug.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === "editor") {
    return <Editor initial={editing} onSave={handleSave} onCancel={() => { setView("list"); setEditing(null); }} />;
  }

  return (
    <div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-green-500/20 bg-gray-900 px-4 py-3 text-sm font-medium text-green-400 shadow-2xl">
          <Save size={14} /> {toast}
        </div>
      )}
      {deleteTarget && (
        <DeleteModal item={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>News</h1>
          <p className="mt-0.5 text-sm text-white/40">{items.length} articles</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/40 sm:w-56" />
          </div>
          <button onClick={load} disabled={loading} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { setEditing(null); setView("editor"); }} className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
            <Plus size={15} /> New article
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Newspaper size={32} className="text-white/10" />
            <p className="text-sm text-white/30">No articles yet.</p>
            <button onClick={() => { setEditing(null); setView("editor"); }} className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors">
              <Plus size={14} /> Write first article
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Article</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Date</th>
                  <th className="py-3 pl-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <NewsRow key={i} item={item} onEdit={(x) => { setEditing(x); setView("editor"); }} onDelete={setDeleteTarget} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsDashboard() {
  return <AuthGuard><NewsDashboardContent /></AuthGuard>;
}
