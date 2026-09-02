import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import { getRouteTranslations, type LocalePageProps } from "@/lib/i18n/server";
import { buildLocalizedMetadata, SITE_URL } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale, t } = await getRouteTranslations(params);
  return buildLocalizedMetadata({
    locale,
    path: "/api-docs",
    title: t.apiDocs.metaTitle,
    description: t.apiDocs.metaDescription,
  });
}

// Example payloads. The field names mirror the actual responses of the route
// handlers in src/app/api/*; only the values are made up.
const NEWS_LIST_RESPONSE = `{
  "data": [
    {
      "id": 12,
      "title": "Season 4 is live",
      "slug": "season-4-is-live",
      "short_description": "New maps, new kits and a fresh leaderboard.",
      "content": "The new season is here ...",
      "image_url": "https://cdn.onthepixel.net/2f1c8e5a-4b17-4a55-9f0e-1d2c3b4a5e6f",
      "published_at": "2026-04-18",
      "author": "OnThePixel",
      "created_at": "2026-04-18T09:12:44.512Z",
      "updated_at": "2026-04-18T09:12:44.512Z",
      "translations": {
        "de": {
          "title": "Season 4 ist live",
          "short_description": "Neue Maps, neue Kits und eine frische Bestenliste.",
          "content": "Die neue Season ist da ..."
        }
      }
    }
  ],
  "meta": {
    "total": 42,
    "limit": 1,
    "offset": 0
  }
}`;

const NEWS_SINGLE_RESPONSE = `{
  "data": {
    "id": 12,
    "title": "Season 4 is live",
    "slug": "season-4-is-live",
    "short_description": "New maps, new kits and a fresh leaderboard.",
    "content": "The new season is here ...",
    "image_url": "https://cdn.onthepixel.net/2f1c8e5a-4b17-4a55-9f0e-1d2c3b4a5e6f",
    "published_at": "2026-04-18",
    "author": "OnThePixel",
    "created_at": "2026-04-18T09:12:44.512Z",
    "updated_at": "2026-04-18T09:12:44.512Z",
    "translations": {
      "de": {
        "title": "Season 4 ist live",
        "short_description": "Neue Maps, neue Kits und eine frische Bestenliste.",
        "content": "Die neue Season ist da ..."
      }
    }
  }
}`;

const CREATORS_LIST_RESPONSE = `{
  "data": [
    {
      "Minecraft_username": "8667ba71-b85a-4004-af54-457a9734eed7",
      "Name": "ExampleCreator",
      "Platforms": [
        { "Icons": "youtube", "Link": "https://youtube.com/@examplecreator" },
        { "Icons": "twitch", "Link": "https://twitch.tv/examplecreator" }
      ]
    }
  ],
  "meta": {
    "total": 12,
    "limit": 1,
    "offset": 0
  }
}`;

const CREATORS_RAW_RESPONSE = `{
  "data": [
    {
      "id": 3,
      "name": "ExampleCreator",
      "minecraftUuid": "8667ba71-b85a-4004-af54-457a9734eed7",
      "sortOrder": 0,
      "channels": [
        {
          "id": 7,
          "platform": "youtube",
          "url": "https://youtube.com/@examplecreator"
        }
      ]
    }
  ],
  "meta": {
    "total": 12,
    "limit": 1,
    "offset": 0
  }
}`;

const CREATORS_SINGLE_RESPONSE = `{
  "data": {
    "Minecraft_username": "8667ba71-b85a-4004-af54-457a9734eed7",
    "Name": "ExampleCreator",
    "Platforms": [
      { "Icons": "youtube", "Link": "https://youtube.com/@examplecreator" }
    ]
  }
}`;

const APPLY_LIST_RESPONSE = `{
  "data": [
    {
      "id": 1,
      "name": "Builder",
      "slug": "builder",
      "status": "open",
      "sortOrder": 0,
      "descriptionEn": "Create stunning worlds and game maps for our Minecraft server.",
      "descriptionDe": "Erschaffe beeindruckende Welten und Spielkarten für unseren Minecraft-Server."
    },
    {
      "id": 2,
      "name": "Supporter",
      "slug": "supporter",
      "status": "closed",
      "sortOrder": 1,
      "descriptionEn": "Help players with questions and handle support tickets.",
      "descriptionDe": "Hilf Spielern bei Fragen und bearbeite Support-Tickets."
    },
    {
      "id": 3,
      "name": "Java Developer",
      "slug": "developer",
      "status": "closed",
      "sortOrder": 2,
      "descriptionEn": "Develop plugins and features for our Minecraft server.",
      "descriptionDe": "Entwickle Plugins und Funktionen für unseren Minecraft-Server."
    }
  ]
}`;

const APPLY_SINGLE_RESPONSE = `{
  "data": {
    "id": 1,
    "name": "Builder",
    "slug": "builder",
    "status": "open",
    "sortOrder": 0,
    "descriptionEn": "Create stunning worlds and game maps for our Minecraft server.",
    "descriptionDe": "Erschaffe beeindruckende Welten und Spielkarten für unseren Minecraft-Server."
  }
}`;

const ERROR_RESPONSE = `{
  "error": "Not found"
}`;

export default async function ApiDocsPage({ params }: LocalePageProps) {
  const { locale, t } = await getRouteTranslations(params);
  const c = t.apiDocs;
  const l = c.labels;

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            { name: c.metaTitle, path: "/api-docs" },
          ]),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h1 className="text-2xl font-bold mb-5">{c.heading}</h1>
          <p className="mb-8">{c.intro}</p>

          <h2 className="text-xl font-semibold mt-8 mb-4">
            {c.overview.heading}
          </h2>
          <p>
            {c.overview.baseUrlLabel}:{" "}
            <span className="font-mono text-green-400">{SITE_URL}</span>
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {c.overview.authHeading}
          </h3>
          <p>{c.overview.authText}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {c.overview.corsHeading}
          </h3>
          <p>{c.overview.corsText}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {c.overview.fairUseHeading}
          </h3>
          <p>{c.overview.fairUseText}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {c.overview.errorsHeading}
          </h3>
          <p>{c.overview.errorsText}</p>
          <CodeBlock>{ERROR_RESPONSE}</CodeBlock>

          {/* ---------------------------------------------- /api/news --- */}
          <EndpointHeading
            method="GET"
            path="/api/news"
            title={c.news.heading}
          />
          <p>{c.news.description}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.parameters}</h3>
          <ParameterTable
            labels={l}
            rows={[
              {
                name: "limit",
                type: "integer",
                fallback: "50",
                description: c.news.paramLimit,
              },
              {
                name: "offset",
                type: "integer",
                fallback: "0",
                description: c.news.paramOffset,
              },
              {
                name: "slug",
                type: "string",
                fallback: l.none,
                description: c.news.paramSlug,
              },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleRequest}
          </h3>
          <CodeBlock>{`${SITE_URL}/api/news?limit=1&offset=0`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleResponse}
          </h3>
          <CodeBlock>{NEWS_LIST_RESPONSE}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.single}</h3>
          <p>{c.news.singleText}</p>
          <CodeBlock>{`${SITE_URL}/api/news?slug=season-4-is-live`}</CodeBlock>
          <CodeBlock>{NEWS_SINGLE_RESPONSE}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.statusCodes}</h3>
          <StatusTable
            labels={l}
            rows={[
              { code: "200", meaning: c.news.status200 },
              { code: "404", meaning: c.news.status404 },
              { code: "500", meaning: c.news.status500 },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.caching}</h3>
          <p>{c.news.caching}</p>

          {/* ------------------------------------------ /api/creators --- */}
          <EndpointHeading
            method="GET"
            path="/api/creators"
            title={c.creators.heading}
          />
          <p>{c.creators.description}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.parameters}</h3>
          <ParameterTable
            labels={l}
            rows={[
              {
                name: "limit",
                type: "integer",
                fallback: "200",
                description: c.creators.paramLimit,
              },
              {
                name: "offset",
                type: "integer",
                fallback: "0",
                description: c.creators.paramOffset,
              },
              {
                name: "uuid",
                type: "string",
                fallback: l.none,
                description: c.creators.paramUuid,
              },
              {
                name: "name",
                type: "string",
                fallback: l.none,
                description: c.creators.paramName,
              },
              {
                name: "format",
                type: "string",
                fallback: l.none,
                description: c.creators.paramFormat,
              },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleRequest}
          </h3>
          <CodeBlock>{`${SITE_URL}/api/creators?limit=1&offset=0`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleResponse}
          </h3>
          <CodeBlock>{CREATORS_LIST_RESPONSE}</CodeBlock>
          <p>{c.creators.fieldsText}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {c.creators.rawHeading}
          </h3>
          <p>{c.creators.rawText}</p>
          <CodeBlock>{`${SITE_URL}/api/creators?format=raw&limit=1`}</CodeBlock>
          <CodeBlock>{CREATORS_RAW_RESPONSE}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.single}</h3>
          <p>{c.creators.singleText}</p>
          <CodeBlock>{`${SITE_URL}/api/creators?name=ExampleCreator`}</CodeBlock>
          <CodeBlock>{CREATORS_SINGLE_RESPONSE}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.statusCodes}</h3>
          <StatusTable
            labels={l}
            rows={[
              { code: "200", meaning: c.creators.status200 },
              { code: "404", meaning: c.creators.status404 },
              { code: "500", meaning: c.creators.status500 },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.caching}</h3>
          <p>{c.creators.caching}</p>

          {/* --------------------------------------------- /api/apply --- */}
          <EndpointHeading
            method="GET"
            path="/api/apply"
            title={c.apply.heading}
          />
          <p>{c.apply.description}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.parameters}</h3>
          <ParameterTable
            labels={l}
            rows={[
              {
                name: "slug",
                type: "string",
                fallback: l.none,
                description: c.apply.paramSlug,
              },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleRequest}
          </h3>
          <CodeBlock>{`${SITE_URL}/api/apply`}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">
            {l.exampleResponse}
          </h3>
          <CodeBlock>{APPLY_LIST_RESPONSE}</CodeBlock>
          <p>{c.apply.fieldsText}</p>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.single}</h3>
          <p>{c.apply.singleText}</p>
          <CodeBlock>{`${SITE_URL}/api/apply?slug=builder`}</CodeBlock>
          <CodeBlock>{APPLY_SINGLE_RESPONSE}</CodeBlock>

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.statusCodes}</h3>
          <StatusTable
            labels={l}
            rows={[
              { code: "200", meaning: c.apply.status200 },
              { code: "404", meaning: c.apply.status404 },
              { code: "500", meaning: c.apply.status500 },
            ]}
          />

          <h3 className="text-lg font-semibold mt-4 mb-2">{l.caching}</h3>
          <p>{c.apply.caching}</p>
          <p className="mt-4 text-gray-400 text-sm">{c.apply.note}</p>
        </div>
      </section>
    </>
  );
}

/** Section heading of one endpoint: the localized name plus method and path. */
function EndpointHeading({
  method,
  path,
  title,
}: {
  method: string;
  path: string;
  title: string;
}) {
  return (
    <>
      <h2 className="text-xl font-semibold mt-8 mb-4">{title}</h2>
      <p className="mb-4">
        <span className="inline-block bg-gray-800 rounded-md px-3 py-1 text-sm font-mono text-green-400">
          {method} {path}
        </span>
      </p>
    </>
  );
}

/**
 * Request URLs and JSON payloads. Scrolls horizontally instead of forcing the
 * page to, so long URLs stay readable on a phone.
 */
function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-2 mb-4 overflow-x-auto rounded-md border border-white/5 bg-white/[0.03] p-4 text-sm font-mono text-gray-300">
      {children}
    </pre>
  );
}

interface TableLabels {
  colParameter: string;
  colType: string;
  colDefault: string;
  colDescription: string;
  colStatus: string;
  colMeaning: string;
}

const TH_CLASS =
  "px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30";
const TD_CLASS = "px-3 py-3 align-top text-sm";

function ParameterTable({
  labels,
  rows,
}: {
  labels: TableLabels;
  rows: {
    name: string;
    type: string;
    fallback: string;
    description: string;
  }[];
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-white/5">
            <th className={TH_CLASS}>{labels.colParameter}</th>
            <th className={TH_CLASS}>{labels.colType}</th>
            <th className={TH_CLASS}>{labels.colDefault}</th>
            <th className={TH_CLASS}>{labels.colDescription}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-white/5">
              <td className={`${TD_CLASS} font-mono text-green-400`}>
                {row.name}
              </td>
              <td className={`${TD_CLASS} font-mono text-gray-400`}>
                {row.type}
              </td>
              <td className={`${TD_CLASS} font-mono text-gray-400`}>
                {row.fallback}
              </td>
              <td className={TD_CLASS}>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusTable({
  labels,
  rows,
}: {
  labels: TableLabels;
  rows: { code: string; meaning: string }[];
}) {
  return (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full min-w-[420px]">
        <thead>
          <tr className="border-b border-white/5">
            <th className={TH_CLASS}>{labels.colStatus}</th>
            <th className={TH_CLASS}>{labels.colMeaning}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.code} className="border-b border-white/5">
              <td className={`${TD_CLASS} font-mono text-green-400`}>
                {row.code}
              </td>
              <td className={TD_CLASS}>{row.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
