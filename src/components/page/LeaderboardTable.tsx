import { LocaleLink } from "@/components/LocaleLink";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/translations";

export interface StatColumn {
  key: string;
  label: string;
}

interface LeaderboardTableProps {
  // Handed down from the page rather than resolved here: the locale is a
  // route segment, and only pages and layouts see the route params.
  locale: Locale;
  title: string;
  description: string;
  endpoint: string;
  statColumns: StatColumn[];
}

interface LeaderboardRow {
  position: number;
  username: string;
  stats: Record<string, number | string>;
}

/**
 * Server-side counterpart of the old client LeaderboardComponent. Fetching the
 * data on the server means the ranking table is present in the initial HTML —
 * crawlers (and users on slow connections) get the real content instead of an
 * empty skeleton, which is what previously made these pages read as "thin".
 * The fetch is cached for 60s so we don't hammer the upstream API per request.
 */
async function fetchLeaderboard(
  endpoint: string,
  statColumns: StatColumn[],
): Promise<{ rows: LeaderboardRow[]; failed: boolean }> {
  try {
    const res = await fetch(`https://api.onthepixel.net/${endpoint}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { rows: [], failed: true };

    const data = await res.json();
    const players: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
        ? data.data
        : [];

    const rows = players.map((item, index) => ({
      position: Number(item.rank) || index + 1,
      username:
        (item.name as string) ||
        (item.player_name as string) ||
        (item.username as string) ||
        `Player${index + 1}`,
      stats: statColumns.reduce<Record<string, number | string>>((acc, col) => {
        acc[col.key] = (item[col.key] as number | string) ?? 0;
        return acc;
      }, {}),
    }));

    return { rows, failed: false };
  } catch {
    return { rows: [], failed: true };
  }
}

function rankBadgeClasses(position: number): string {
  if (position === 1) return "bg-yellow-500 text-black";
  if (position === 2) return "bg-gray-300 text-black";
  if (position === 3) return "bg-amber-700 text-white";
  return "";
}

export default async function LeaderboardTable({
  locale,
  title,
  description,
  endpoint,
  statColumns,
}: LeaderboardTableProps) {
  const t = getDictionary(locale);
  const { rows, failed } = await fetchLeaderboard(endpoint, statColumns);

  return (
    <Card className="w-full border-gray-800 bg-gray-900/50">
      <CardHeader>
        <CardTitle as="h2" className="text-2xl font-bold">
          {title}
        </CardTitle>
        <p className="text-gray-400">{description}</p>
      </CardHeader>
      <CardContent>
        {failed ? (
          <div className="p-4 text-center text-red-500">
            {t.leaderboardTable.loadError}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-2 text-left">
                    {t.leaderboardTable.colHash}
                  </th>
                  <th className="px-4 py-2 text-left">
                    {t.leaderboardTable.colPlayer}
                  </th>
                  {statColumns.map((column) => (
                    <th key={column.key} className="px-4 py-2 text-right">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((item) => (
                    <tr
                      key={item.position}
                      className="border-b border-gray-800 transition-colors hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        {item.position <= 3 ? (
                          <span
                            className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-2 text-sm font-semibold ${rankBadgeClasses(
                              item.position,
                            )}`}
                          >
                            {item.position}
                          </span>
                        ) : (
                          item.position
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://api.mcskin.me/head/${item.username}.png`}
                            alt={item.username}
                            width={32}
                            height={32}
                            loading="lazy"
                            decoding="async"
                            className="h-8 w-8 rounded"
                          />
                          <LocaleLink
                            href={`/stats/${item.username}`}
                            className="font-medium text-white underline decoration-transparent transition-colors hover:text-green-400 hover:decoration-current"
                          >
                            {item.username}
                          </LocaleLink>
                        </div>
                      </td>
                      {statColumns.map((column) => (
                        <td key={column.key} className="px-4 py-3 text-right">
                          {item.stats[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2 + statColumns.length}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      {t.leaderboardTable.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
