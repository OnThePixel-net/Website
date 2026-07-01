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
  User,
  Languages,
} from "lucide-react";
import AuthGuard from "../auth-guard";

type LangContent = {
  title: string;
  short_description: string;
  content: string;
};

interface NewsItem {
  id?: number;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  image_url: string | null;
  published_at: string;
  author: string;
  translations?: Record<string, LangContent>;
}

const SUPPORTED_LANGS = [
  { code: "en", label: "EN", name: "English" },
  { code: "de", label: "DE", name: "Deutsch" },
] as const;

type LangCode = (typeof SUPPORTED_LANGS)[number]["code"];

const EMPTY_LANG: LangContent = { title: "", short_description: "", content: "" };

const EMPTY: Omit<NewsItem, "id"> = {
  title: "",
  slug: "",
  short_description: "",
  content: "",
  image_url: null,
  published_at: new Date().toISOString().slice(0, 10),
  author: "",
  translations: {},
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

/* ── Language tab bar ─────────────────────────────────────────────────── */
function LangTabs({ active, onChange, translations }: { active: LangCode; onChange: (l: LangCode) => void; translations: Record<string, LangContent> }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-white/8 bg-white/[0.02] p-1">
      {SUPPORTED_LANGS.map((l) => {
        const hasContent = l.code === "en" || !!(translations[l.code]?.title || translations[l.code]?.content);
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              active === l.code
                ? "bg-green-500 text-black shadow"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {l.label}
            {hasContent && active !== l.code && (
              <span className="h-1.5 w-1.5 rounded-full bg-green-500/60" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Editor ──────────────────────────────────────────────────────────── */
function Editor({ initial, onSave, onCancel }: { initial: NewsItem | null; onSave: (data: Omit<NewsItem, "id">, id?: number) => Promise<void>; onCancel: () => void }) {
  const isNew = !initial?.id;

  const initLang = (lang: LangCode): LangContent => {
    if (lang === "en") {
      return {
        title: initial?.title ?? "",
        short_description: initial?.short_description ?? "",
        content: initial?.content ?? "",
      };
    }
    return initial?.translations?.[lang] ?? { ...EMPTY_LANG };
  };

  const [meta, setMeta] = useState({
    slug: initial?.slug ?? "",
    image_url: initial?.image_url ?? null,
    published_at: initial?.published_at?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    author: initial?.author ?? "",
  });

  const [langContent, setLangContent] = useState<Record<LangCode, LangContent>>({
    en: initLang("en"),
    de: initLang("de"),
  });

  const [activeLang, setActiveLang] = useState<LangCode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [imgError, setImgError] = useState(false);

  const setMetaField = <K extends keyof typeof meta>(key: K, value: (typeof meta)[K]) =>
    setMeta((f) => ({ ...f, [key]: value }));

  const setContent = (key: keyof LangContent, value: string) =>
    setLangContent((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], [key]: value } }));

  const handleTitleChange = (v: string) => {
    setContent("title", v);
    if (activeLang === "en" && !slugTouched) setMetaField("slug", slugify(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const enContent = langContent["en"];
    if (!enContent.title.trim()) return setError("English title is required.");
    if (!meta.slug.trim()) return setError("Slug is required.");
    if (!meta.published_at) return setError("Date is required.");
    setLoading(true);

    const translations: Record<string, LangContent> = {};
    for (const l of SUPPORTED_LANGS) {
      if (l.code === "en") continue;
      const c = langContent[l.code];
      if (c.title || c.short_description || c.content) {
        translations[l.code] = c;
      }
    }

    try {
      await onSave(
        {
          title: enContent.title,
          slug: meta.slug,
          short_description: enContent.short_description,
          content: enContent.content,
          image_url: meta.image_url,
          published_at: meta.published_at,
          author: meta.author,
          translations,
        },
        initial?.id,
      );
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  };

  const currentContent = langContent[activeLang];
  const wordCount = currentContent.content.trim() ? currentContent.content.trim().split(/\s+/).length : 0;
  const charCount = currentContent.content.length;

  const translationsForTabs = Object.fromEntries(
    SUPPORTED_LANGS.filter((l) => l.code !== "en").map((l) => [l.code, langContent[l.code]])
  ) as Record<string, LangContent>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/40 hover:border-white/20 hover:text-white transition-all">
            <ChevronLeft size={15} /> Back
          </button>
          <span className="text-white/10">/</span>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {isNew ? "New Article" : "Edit Article"}
          </h1>
          {!isNew && (
            <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
              Editing
            </span>
          )}
        </div>
        <button type="button" onClick={handleSubmit} disabled={loading} className="hidden sm:flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60 transition-colors">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isNew ? "Publish" : "Save changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        {/* Main content area */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Language tabs */}
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Languages size={14} className="text-white/20" />
              <span>Language</span>
            </div>
            <LangTabs active={activeLang} onChange={setActiveLang} translations={translationsForTabs} />
          </div>

          {/* Title card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Headline</p>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/20">
                {SUPPORTED_LANGS.find((l) => l.code === activeLang)?.name}
              </span>
            </div>
            <input
              value={currentContent.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={activeLang === "en" ? "Write an engaging headline…" : "Überschrift auf Deutsch…"}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white outline-none placeholder-white/15 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
            {activeLang !== "en" && !langContent["en"].title && (
              <p className="mt-1.5 text-xs text-yellow-500/60">English title is required before publishing.</p>
            )}
          </div>

          {/* Description card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Teaser</p>
              <span className="text-xs text-white/20">{currentContent.short_description.length} chars</span>
            </div>
            <Textarea
              value={currentContent.short_description}
              onChange={(e) => setContent("short_description", e.target.value)}
              rows={3}
              placeholder={activeLang === "en" ? "Short summary shown on the news list…" : "Kurze Zusammenfassung auf Deutsch…"}
            />
          </div>

          {/* Content card */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Article body</p>
              <div className="flex items-center gap-3 text-xs text-white/20">
                <span>{wordCount} words</span>
                <span className="text-white/10">·</span>
                <span>{charCount} chars</span>
              </div>
            </div>
            <div className="p-6">
              <textarea
                value={currentContent.content}
                onChange={(e) => setContent("content", e.target.value)}
                rows={20}
                placeholder={activeLang === "en" ? "Write the full article here…" : "Vollständigen Artikel auf Deutsch schreiben…"}
                className="w-full rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none placeholder-white/15 focus:border-green-500/30 focus:ring-1 focus:ring-green-500/15 resize-y transition-all"
                style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", lineHeight: "1.7" }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar panels */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Translations status */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="border-b border-white/5 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Translations</p>
            </div>
            <div className="flex flex-col gap-2 p-5">
              {SUPPORTED_LANGS.map((l) => {
                const c = langContent[l.code];
                const filled = !!(c.title || c.content);
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setActiveLang(l.code)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeLang === l.code ? "bg-white/8 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/60"
                    }`}
                  >
                    <span className="font-medium">{l.name}</span>
                    {filled ? (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">Done</span>
                    ) : l.code === "en" ? (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500/70">Required</span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/20">Missing</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publish settings */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="border-b border-white/5 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Publish</p>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <Field label="Author">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                  <User size={13} className="ml-3 shrink-0 text-white/20" />
                  <input
                    type="text"
                    value={meta.author}
                    onChange={(e) => setMetaField("author", e.target.value)}
                    placeholder="Name des Autors…"
                    className="flex-1 bg-transparent py-2 px-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
              </Field>
              <Field label="Publish date *">
                <Input type="date" value={meta.published_at} onChange={(e) => setMetaField("published_at", e.target.value)} />
              </Field>
              <Field label="URL slug *">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                  <span className="shrink-0 border-r border-white/10 bg-white/5 px-3 py-2 text-xs text-white/20">/news/</span>
                  <input
                    type="text"
                    value={meta.slug}
                    onChange={(e) => { setSlugTouched(true); setMetaField("slug", e.target.value); }}
                    placeholder="my-article"
                    className="flex-1 bg-transparent py-2 px-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
                {meta.slug && (
                  <a
                    href={`/news/${meta.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/20 hover:text-green-400 transition-colors"
                  >
                    <ExternalLink size={11} /> Preview URL
                  </a>
                )}
              </Field>
            </div>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="border-b border-white/5 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Cover image</p>
            </div>
            <div className="p-5">
              {meta.image_url && !imgError ? (
                <div className="mb-4 group relative overflow-hidden rounded-xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={meta.image_url}
                    alt="Preview"
                    onError={() => setImgError(true)}
                    className="h-36 w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => { setMetaField("image_url", null); setImgError(false); }}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  </div>
                </div>
              ) : imgError ? (
                <div className="mb-4 flex h-20 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400/60">
                  <AlertCircle size={13} /> Could not load image
                </div>
              ) : null}

              <Field label="Image URL">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                  <LinkIcon size={13} className="ml-3 shrink-0 text-white/20" />
                  <input
                    type="url"
                    value={meta.image_url ?? ""}
                    onChange={(e) => { setMetaField("image_url", e.target.value || null); setImgError(false); }}
                    placeholder="https://…"
                    className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-white outline-none placeholder-white/20"
                  />
                  {meta.image_url && (
                    <button type="button" onClick={() => { setMetaField("image_url", null); setImgError(false); }} className="mr-2 rounded p-1 text-white/20 hover:text-white/60 transition-colors">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </Field>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60 transition-colors shadow-lg shadow-green-500/10">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isNew ? "Publish article" : "Save changes"}
            </button>
            <button type="button" onClick={onCancel} className="flex items-center justify-center gap-2 rounded-xl border border-white/8 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors">
              <X size={14} /> Discard
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Table row ───────────────────────────────────────────────────────── */
function NewsRow({ item, onEdit, onDelete }: { item: NewsItem; onEdit: (i: NewsItem) => void; onDelete: (i: NewsItem) => void }) {
  const langCount = Object.values(item.translations ?? {}).filter((t) => t.title || t.content).length;
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
        {item.author ? (
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <User size={11} className="text-white/25" /> {item.author}
          </div>
        ) : (
          <span className="text-xs text-white/15">—</span>
        )}
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar size={12} /> {formatDate(item.published_at)}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-xs text-white/25">
            <Languages size={11} />
            {1 + langCount}/{SUPPORTED_LANGS.length}
          </span>
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
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Article</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Description</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Author</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Langs</th>
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
