const CMS = "https://cms.onthepixel.net";

function adminHeaders(): HeadersInit {
  const token = process.env.DIRECTUS_ADMIN_TOKEN;
  if (!token) throw new Error("DIRECTUS_ADMIN_TOKEN is not set");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface NewsItem {
  id?: number;
  title: string;
  date: string;
  short_description: string;
  text: string;
  url: string;
  icon: string | null;
}

export async function listNews(): Promise<NewsItem[]> {
  const res = await fetch(`${CMS}/items/News?sort=-date&limit=200`, {
    headers: adminHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  const data = await res.json();
  return data.data ?? [];
}

export async function getNewsItem(url: string): Promise<NewsItem | null> {
  const res = await fetch(
    `${CMS}/items/News?filter[url][_eq]=${encodeURIComponent(url)}&limit=1`,
    { headers: adminHeaders(), cache: "no-store" },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0] ?? null;
}

export async function createNews(payload: Omit<NewsItem, "id">): Promise<NewsItem> {
  const res = await fetch(`${CMS}/items/News`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0]?.message ?? "Failed to create news");
  }
  const data = await res.json();
  return data.data;
}

export async function updateNews(id: number, payload: Partial<NewsItem>): Promise<NewsItem> {
  const res = await fetch(`${CMS}/items/News/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.errors?.[0]?.message ?? "Failed to update news");
  }
  const data = await res.json();
  return data.data;
}

export async function deleteNews(id: number): Promise<void> {
  const res = await fetch(`${CMS}/items/News/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete news");
}
