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
  Youtube,
  Type,
  Minus,
  Info,
  ChevronUp,
  ChevronDown,
  LayoutTemplate,
} from "lucide-react";
import AuthGuard from "../auth-guard";

/* ── Block types ──────────────────────────────────────────────────────── */
export type Block =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: 2 | 3; content: string }
  | { id: string; type: "youtube"; url: string }
  | { id: string; type: "image"; url: string; caption: string }
  | { id: string; type: "callout"; variant: "info" | "warning" | "tip" | "success"; title: string; content: string }
  | { id: string; type: "divider" };

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function blocksToString(blocks: Block[]): string {
  return JSON.stringify(blocks);
}

function stringToBlocks(content: string): Block[] {
  if (!content.trim()) return [{ id: makeId(), type: "paragraph", content: "" }];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) {
      return parsed as Block[];
    }
  } catch { /* not JSON */ }
  // Legacy plain-text → single paragraph block
  return [{ id: makeId(), type: "paragraph", content }];
}

/* ── Types ────────────────────────────────────────────────────────────── */
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-white/40">{label}</label>
      {children}
    </div>
  );
}

/* ── Block editor ─────────────────────────────────────────────────────── */
const BLOCK_TYPES: { type: Block["type"]; label: string; icon: React.ReactNode; description: string }[] = [
  { type: "paragraph", label: "Paragraph", icon: <Type size={14} />, description: "Fließtext mit Links" },
  { type: "heading", label: "Überschrift", icon: <span className="text-xs font-black">H</span>, description: "H2 oder H3 Überschrift" },
  { type: "youtube", label: "YouTube", icon: <Youtube size={14} />, description: "YouTube-Video einbetten" },
  { type: "image", label: "Bild", icon: <ImageIcon size={14} />, description: "Bild mit Bildunterschrift" },
  { type: "callout", label: "Kachel", icon: <Info size={14} />, description: "Info-, Tipp- oder Warnbox" },
  { type: "divider", label: "Trennlinie", icon: <Minus size={14} />, description: "Horizontale Trennlinie" },
];

function newBlock(type: Block["type"]): Block {
  const id = makeId();
  switch (type) {
    case "paragraph": return { id, type: "paragraph", content: "" };
    case "heading": return { id, type: "heading", level: 2, content: "" };
    case "youtube": return { id, type: "youtube", url: "" };
    case "image": return { id, type: "image", url: "", caption: "" };
    case "callout": return { id, type: "callout", variant: "info", title: "", content: "" };
    case "divider": return { id, type: "divider" };
  }
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

const CALLOUT_VARIANTS = [
  { value: "info", label: "Info", color: "text-blue-400" },
  { value: "tip", label: "Tipp", color: "text-green-400" },
  { value: "warning", label: "Warnung", color: "text-yellow-400" },
  { value: "success", label: "Erfolg", color: "text-emerald-400" },
] as const;

function BlockEditor({ blocks, onChange }: { blocks: Block[]; onChange: (b: Block[]) => void }) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const update = (id: string, patch: Partial<Block>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));

  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const arr = [...blocks];
    [arr[idx], arr[next]] = [arr[next], arr[idx]];
    onChange(arr);
  };

  const add = (type: Block["type"]) => {
    onChange([...blocks, newBlock(type)]);
    setShowAddMenu(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, idx) => (
        <div key={block.id} className="group relative rounded-xl border border-white/8 bg-black/20 p-4">
          {/* Block controls */}
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button type="button" onClick={() => move(block.id, -1)} disabled={idx === 0} className="rounded p-1 text-white/30 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-colors">
              <ChevronUp size={13} />
            </button>
            <button type="button" onClick={() => move(block.id, 1)} disabled={idx === blocks.length - 1} className="rounded p-1 text-white/30 hover:bg-white/10 hover:text-white disabled:opacity-20 transition-colors">
              <ChevronDown size={13} />
            </button>
            <button type="button" onClick={() => remove(block.id)} className="rounded p-1 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>

          {/* Block type label */}
          <div className="mb-3 flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/25">
              {BLOCK_TYPES.find((t) => t.type === block.type)?.icon}
              {BLOCK_TYPES.find((t) => t.type === block.type)?.label}
            </span>
          </div>

          {block.type === "paragraph" && (
            <textarea
              value={block.content}
              onChange={(e) => update(block.id, { content: e.target.value })}
              rows={5}
              placeholder="Text schreiben… [Linktext](https://…) für Links"
              className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder-white/20 focus:border-green-500/30 focus:ring-1 focus:ring-green-500/15 resize-y transition-all"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          )}

          {block.type === "heading" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                {([2, 3] as const).map((lvl) => (
                  <button key={lvl} type="button" onClick={() => update(block.id, { level: lvl })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${block.level === lvl ? "bg-green-500 text-black" : "border border-white/10 bg-white/5 text-white/40 hover:text-white"}`}>
                    H{lvl}
                  </button>
                ))}
              </div>
              <input
                value={block.content}
                onChange={(e) => update(block.id, { content: e.target.value })}
                placeholder="Überschrift…"
                className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 font-semibold text-white outline-none placeholder-white/20 focus:border-green-500/30 focus:ring-1 focus:ring-green-500/15 transition-all"
                style={{ fontSize: block.level === 2 ? "1.25rem" : "1.05rem" }}
              />
            </div>
          )}

          {block.type === "youtube" && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                <Youtube size={14} className="ml-3 shrink-0 text-red-400" />
                <input
                  type="url"
                  value={block.url}
                  onChange={(e) => update(block.id, { url: e.target.value })}
                  placeholder="https://youtube.com/watch?v=… oder https://youtu.be/…"
                  className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-white outline-none placeholder-white/20"
                />
              </div>
              {block.url && extractYoutubeId(block.url) && (
                <div className="overflow-hidden rounded-lg border border-white/5 bg-black">
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYoutubeId(block.url)}`}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="YouTube preview"
                    />
                  </div>
                </div>
              )}
              {block.url && !extractYoutubeId(block.url) && (
                <p className="text-xs text-red-400/70">Keine gültige YouTube-URL erkannt.</p>
              )}
            </div>
          )}

          {block.type === "image" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                <LinkIcon size={13} className="ml-3 shrink-0 text-white/20" />
                <input
                  type="url"
                  value={block.url}
                  onChange={(e) => update(block.id, { url: e.target.value })}
                  placeholder="Bild-URL (https://…)"
                  className="flex-1 bg-transparent py-2 pl-2 pr-3 text-sm text-white outline-none placeholder-white/20"
                />
              </div>
              {block.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={block.url} alt="preview" className="max-h-48 w-full rounded-lg object-contain border border-white/5 bg-black/30" />
              )}
              <input
                value={block.caption}
                onChange={(e) => update(block.id, { caption: e.target.value })}
                placeholder="Bildunterschrift (optional)"
                className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/70 outline-none placeholder-white/20 focus:border-green-500/30 transition-all"
              />
            </div>
          )}

          {block.type === "callout" && (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                {CALLOUT_VARIANTS.map((v) => (
                  <button key={v.value} type="button" onClick={() => update(block.id, { variant: v.value })}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${block.variant === v.value ? "bg-white/15 " + v.color : "border border-white/10 bg-white/5 text-white/30 hover:text-white"}`}>
                    {v.label}
                  </button>
                ))}
              </div>
              <input
                value={block.title}
                onChange={(e) => update(block.id, { title: e.target.value })}
                placeholder="Titel der Kachel (optional)"
                className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm font-semibold text-white outline-none placeholder-white/20 focus:border-green-500/30 transition-all"
              />
              <textarea
                value={block.content}
                onChange={(e) => update(block.id, { content: e.target.value })}
                rows={3}
                placeholder="Inhalt der Kachel…"
                className="w-full rounded-lg border border-white/8 bg-white/5 px-3 py-2 text-sm text-white/80 outline-none placeholder-white/20 focus:border-green-500/30 resize-y transition-all"
              />
            </div>
          )}

          {block.type === "divider" && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-white/20">Trennlinie</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          )}
        </div>
      ))}

      {/* Add block button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 py-3 text-sm text-white/30 transition-colors hover:border-green-500/30 hover:text-green-400"
        >
          <Plus size={15} />
          Block hinzufügen
        </button>
        {showAddMenu && (
          <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl">
            <div className="grid grid-cols-2 gap-1 p-2 sm:grid-cols-3">
              {BLOCK_TYPES.map((bt) => (
                <button key={bt.type} type="button" onClick={() => add(bt.type)}
                  className="flex flex-col items-start gap-1 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/8">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white/80">
                    <span className="text-white/40">{bt.icon}</span>
                    {bt.label}
                  </span>
                  <span className="text-[10px] text-white/25">{bt.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
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
            <p className="font-semibold text-white">Artikel löschen</p>
            <p className="text-xs text-white/40">Das kann nicht rückgängig gemacht werden.</p>
          </div>
        </div>
        <p className="mb-6 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">&quot;{item.title}&quot;</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-white/10 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors">Abbrechen</button>
          <button onClick={onConfirm} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Löschen
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
          <button key={l.code} type="button" onClick={() => onChange(l.code)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${active === l.code ? "bg-green-500 text-black shadow" : "text-white/40 hover:text-white/70"}`}>
            {l.label}
            {hasContent && active !== l.code && <span className="h-1.5 w-1.5 rounded-full bg-green-500/60" />}
          </button>
        );
      })}
    </div>
  );
}

/* ── Editor ──────────────────────────────────────────────────────────── */
function Editor({ initial, onSave, onCancel }: { initial: NewsItem | null; onSave: (data: Omit<NewsItem, "id">, id?: number) => Promise<void>; onCancel: () => void }) {
  const isNew = !initial?.id;

  const initBlocks = (lang: LangCode): Block[] => {
    if (lang === "en") return stringToBlocks(initial?.content ?? "");
    return stringToBlocks(initial?.translations?.[lang]?.content ?? "");
  };

  const [meta, setMeta] = useState({ slug: initial?.slug ?? "", image_url: initial?.image_url ?? null });

  const [langMeta, setLangMeta] = useState<Record<LangCode, { title: string; short_description: string }>>({
    en: { title: initial?.title ?? "", short_description: initial?.short_description ?? "" },
    de: { title: initial?.translations?.de?.title ?? "", short_description: initial?.translations?.de?.short_description ?? "" },
  });

  const [langBlocks, setLangBlocks] = useState<Record<LangCode, Block[]>>({
    en: initBlocks("en"),
    de: initBlocks("de"),
  });

  const [activeLang, setActiveLang] = useState<LangCode>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [imgError, setImgError] = useState(false);

  const setMetaField = <K extends keyof typeof meta>(key: K, value: (typeof meta)[K]) =>
    setMeta((f) => ({ ...f, [key]: value }));

  const handleTitleChange = (v: string) => {
    setLangMeta((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], title: v } }));
    if (activeLang === "en" && !slugTouched) setMetaField("slug", slugify(v));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!langMeta.en.title.trim()) return setError("Englischer Titel ist erforderlich.");
    if (!meta.slug.trim()) return setError("URL-Slug ist erforderlich.");
    setLoading(true);

    const translations: Record<string, LangContent> = {};
    for (const l of SUPPORTED_LANGS) {
      if (l.code === "en") continue;
      const m = langMeta[l.code];
      const blocks = langBlocks[l.code];
      const hasContent = m.title || blocks.some((b) => b.type !== "paragraph" || (b as Extract<Block, { type: "paragraph" }>).content);
      if (hasContent) {
        translations[l.code] = { title: m.title, short_description: m.short_description, content: blocksToString(blocks) };
      }
    }

    try {
      await onSave(
        {
          title: langMeta.en.title,
          slug: meta.slug,
          short_description: langMeta.en.short_description,
          content: blocksToString(langBlocks.en),
          image_url: meta.image_url,
          published_at: initial?.published_at ?? new Date().toISOString().slice(0, 10),
          author: initial?.author ?? "",
          translations,
        },
        initial?.id,
      );
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  };

  const translationsForTabs = Object.fromEntries(
    SUPPORTED_LANGS.filter((l) => l.code !== "en").map((l) => [
      l.code,
      { title: langMeta[l.code].title, short_description: langMeta[l.code].short_description, content: blocksToString(langBlocks[l.code]) },
    ])
  ) as Record<string, LangContent>;

  const currentMeta = langMeta[activeLang];
  const currentBlocks = langBlocks[activeLang];
  const setCurrentBlocks = (blocks: Block[]) => setLangBlocks((prev) => ({ ...prev, [activeLang]: blocks }));

  const blockCount = currentBlocks.length;
  const wordCount = currentBlocks
    .filter((b): b is Extract<Block, { type: "paragraph" | "heading" }> => ["paragraph", "heading"].includes(b.type))
    .reduce((n, b) => n + b.content.trim().split(/\s+/).filter(Boolean).length, 0);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white/40 hover:border-white/20 hover:text-white transition-all">
            <ChevronLeft size={15} /> Zurück
          </button>
          <span className="text-white/10">/</span>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
            {isNew ? "Neuer Artikel" : "Artikel bearbeiten"}
          </h1>
          {!isNew && <span className="rounded-full border border-yellow-500/20 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-400">Bearbeiten</span>}
        </div>
        <button type="button" onClick={() => handleSubmit()} disabled={loading} className="hidden sm:flex items-center gap-2 rounded-xl bg-green-500 px-5 py-2 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60 transition-colors">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {isNew ? "Veröffentlichen" : "Speichern"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          {/* Language tabs */}
          <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Languages size={14} className="text-white/20" />
              <span>Sprache</span>
            </div>
            <LangTabs active={activeLang} onChange={setActiveLang} translations={translationsForTabs} />
          </div>

          {/* Title */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Überschrift</p>
              <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/20">
                {SUPPORTED_LANGS.find((l) => l.code === activeLang)?.name}
              </span>
            </div>
            <input
              value={currentMeta.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={activeLang === "en" ? "Write an engaging headline…" : "Überschrift auf Deutsch…"}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white outline-none placeholder-white/15 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 transition-all"
            />
          </div>

          {/* Teaser */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Teaser</p>
              <span className="text-xs text-white/20">{currentMeta.short_description.length} Zeichen</span>
            </div>
            <textarea
              value={currentMeta.short_description}
              onChange={(e) => setLangMeta((prev) => ({ ...prev, [activeLang]: { ...prev[activeLang], short_description: e.target.value } }))}
              rows={3}
              placeholder={activeLang === "en" ? "Short summary shown on the news list…" : "Kurze Zusammenfassung auf Deutsch…"}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder-white/20 focus:border-green-500/40 focus:ring-1 focus:ring-green-500/20 resize-y"
            />
          </div>

          {/* Block editor */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-3">
              <div className="flex items-center gap-2">
                <LayoutTemplate size={14} className="text-white/20" />
                <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Inhalt</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/20">
                <span>{blockCount} Blöcke</span>
                <span className="text-white/10">·</span>
                <span>{wordCount} Wörter</span>
              </div>
            </div>
            <div className="p-6">
              <BlockEditor blocks={currentBlocks} onChange={setCurrentBlocks} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
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
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Übersetzungen</p>
            </div>
            <div className="flex flex-col gap-2 p-5">
              {SUPPORTED_LANGS.map((l) => {
                const m = langMeta[l.code];
                const filled = !!(m.title || langBlocks[l.code].some((b) => b.type !== "paragraph" || (b as Extract<Block, { type: "paragraph" }>).content));
                return (
                  <button key={l.code} type="button" onClick={() => setActiveLang(l.code)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${activeLang === l.code ? "bg-white/8 text-white" : "text-white/40 hover:bg-white/5 hover:text-white/60"}`}>
                    <span className="font-medium">{l.name}</span>
                    {filled ? (
                      <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">Fertig</span>
                    ) : l.code === "en" ? (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-500/70">Pflicht</span>
                    ) : (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/20">Fehlt</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Publish settings */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="border-b border-white/5 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Veröffentlichen</p>
            </div>
            <div className="flex flex-col gap-4 p-5">
              <Field label="URL Slug *">
                <div className="flex items-center overflow-hidden rounded-lg border border-white/10 bg-white/5 focus-within:border-green-500/40 focus-within:ring-1 focus-within:ring-green-500/20 transition-all">
                  <span className="shrink-0 border-r border-white/10 bg-white/5 px-3 py-2 text-xs text-white/20">/news/</span>
                  <input
                    type="text"
                    value={meta.slug}
                    onChange={(e) => { setSlugTouched(true); setMetaField("slug", e.target.value); }}
                    placeholder="mein-artikel"
                    className="flex-1 bg-transparent py-2 px-3 text-sm text-white outline-none placeholder-white/20"
                  />
                </div>
                {meta.slug && (
                  <a href={`/news/${meta.slug}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-white/20 hover:text-green-400 transition-colors">
                    <ExternalLink size={11} /> Vorschau-URL
                  </a>
                )}
              </Field>
            </div>
          </div>

          {/* Cover image */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden shadow-sm">
            <div className="border-b border-white/5 px-5 py-3.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/25">Titelbild</p>
            </div>
            <div className="p-5">
              {meta.image_url && !imgError ? (
                <div className="mb-4 group relative overflow-hidden rounded-xl border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={meta.image_url} alt="Preview" onError={() => setImgError(true)} className="h-36 w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => { setMetaField("image_url", null); setImgError(false); }}
                      className="flex items-center gap-1.5 rounded-lg bg-red-500/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-500 transition-colors">
                      <X size={12} /> Entfernen
                    </button>
                  </div>
                </div>
              ) : imgError ? (
                <div className="mb-4 flex h-20 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400/60">
                  <AlertCircle size={13} /> Bild konnte nicht geladen werden
                </div>
              ) : null}
              <Field label="Bild-URL">
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

          <div className="flex flex-col gap-2">
            <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-60 transition-colors shadow-lg shadow-green-500/10">
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {isNew ? "Artikel veröffentlichen" : "Änderungen speichern"}
            </button>
            <button type="button" onClick={onCancel} className="flex items-center justify-center gap-2 rounded-xl border border-white/8 py-2.5 text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors">
              <X size={14} /> Verwerfen
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
        <span className="flex items-center gap-1 text-xs text-white/25">
          <Languages size={11} />
          {1 + langCount}/{SUPPORTED_LANGS.length}
        </span>
      </td>
      <td className="py-3 pl-3 pr-4">
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white transition-colors">
            <Pencil size={12} /> Bearbeiten
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
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? "Speichern fehlgeschlagen"); }
    await load();
    setView("list"); setEditing(null);
    showToast(id ? "Artikel aktualisiert." : "Artikel veröffentlicht.");
  };

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/dashboard/news/${deleteTarget.id}`, { method: "DELETE" });
      await load(); showToast("Artikel gelöscht.");
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
          <p className="mt-0.5 text-sm text-white/40">{items.length} Artikel</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Suchen…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/40 sm:w-56" />
          </div>
          <button onClick={load} disabled={loading} className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => { setEditing(null); setView("editor"); }} className="flex h-9 items-center gap-2 rounded-lg bg-green-500 px-4 text-sm font-semibold text-black hover:bg-green-400 transition-colors">
            <Plus size={15} /> Neuer Artikel
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
            <p className="text-sm text-white/30">Noch keine Artikel.</p>
            <button onClick={() => { setEditing(null); setView("editor"); }} className="flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors">
              <Plus size={14} /> Ersten Artikel schreiben
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Artikel</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Beschreibung</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Autor</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Datum</th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Sprachen</th>
                  <th className="py-3 pl-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Aktionen</th>
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
