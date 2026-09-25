/**
 * The dashboard API, written down.
 *
 * This catalogue is the source of the reference rendered on
 * `/dashboard/api-keys`. It lives inside the dashboard route group on purpose:
 * everything about the dashboard API — that it exists, what it exposes, how to
 * authenticate against it — is for the team, not for the public `/api-docs/`
 * page, which documents the read-only public endpoints and stays as it is.
 *
 * It is a hand-maintained list, not something derived from the route handlers,
 * because a route handler cannot say what a field means. When an endpoint under
 * `src/app/api/dashboard/**` changes, change its entry here too — the level in
 * each entry is the one its `requirePermission()` call asks for, and a wrong
 * one here sends somebody hunting for a bug in their key.
 */

import {
  LEVEL_READ,
  LEVEL_WRITE,
  LEVEL_DELETE,
  type PermissionArea,
  type PermissionLevel,
} from "@/lib/permissions";

/** One request parameter — a body field or a query parameter. */
export interface EndpointParam {
  name: string;
  /** `string`, `number`, `boolean`, `string[]`, … — as JSON spells it. */
  type: string;
  required?: boolean;
  description: string;
}

/** One documented endpoint. */
export interface EndpointDoc {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Path with `{id}` for the dynamic segment, exactly as it is called. */
  path: string;
  summary: string;
  /** The level `requirePermission()` asks for in this endpoint's area. */
  level: PermissionLevel;
  /** Query parameters, for the endpoints that take any. */
  query?: EndpointParam[];
  /** JSON body fields. */
  body?: EndpointParam[];
  /** What comes back on success, in words plus the status code. */
  returns: string;
  /** Anything a caller would otherwise find out the hard way. */
  note?: string;
  /** True for the endpoints an API key can never reach (key management). */
  sessionOnly?: boolean;
}

/** The endpoints of one dashboard area, in the order they are documented. */
export interface EndpointGroup {
  area: PermissionArea;
  title: string;
  description: string;
  endpoints: EndpointDoc[];
}

/** Shared by every translated field on a news article. */
const TRANSLATIONS_PARAM: EndpointParam = {
  name: "translations",
  type: "object",
  description:
    'Per language, keyed by language code: { "de": { title, short_description, content } }. `en` is ignored — the columns on the article itself are the English version.',
};

export const ENDPOINT_GROUPS: EndpointGroup[] = [
  {
    area: "news",
    title: "News",
    description:
      "Die Artikel auf /news/. Ein mit einem Key angelegter Artikel trägt den Namen des Keys als Autor.",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/news",
        summary: "Alle Artikel, neueste zuerst, inklusive Übersetzungen.",
        level: LEVEL_READ,
        returns: "200 · { data: Article[] }",
      },
      {
        method: "POST",
        path: "/api/dashboard/news",
        summary: "Einen Artikel anlegen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "title",
            type: "string",
            required: true,
            description: "Titel (englische Fassung).",
          },
          {
            name: "slug",
            type: "string",
            required: true,
            description:
              "URL-Segment, eindeutig. Ein doppelter Slug endet in 500.",
          },
          {
            name: "short_description",
            type: "string",
            description: "Teaser auf der Übersicht.",
          },
          { name: "content", type: "string", description: "Artikeltext." },
          {
            name: "image_url",
            type: "string",
            description: "Titelbild, absolute URL.",
          },
          TRANSLATIONS_PARAM,
        ],
        returns: "201 · { data: Article }",
        note: "`author` und `published_at` setzt der Server: Autor ist der Name des Keys bzw. des angemeldeten Accounts, Datum ist heute.",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/news/{id}",
        summary: "Einen Artikel ändern. Nur gesendete Felder werden angefasst.",
        level: LEVEL_WRITE,
        body: [
          { name: "title", type: "string", description: "Titel." },
          { name: "slug", type: "string", description: "URL-Segment." },
          { name: "short_description", type: "string", description: "Teaser." },
          { name: "content", type: "string", description: "Artikeltext." },
          {
            name: "image_url",
            type: "string | null",
            description: "Titelbild.",
          },
          {
            name: "published_at",
            type: "string",
            description: "Veröffentlichungsdatum, YYYY-MM-DD.",
          },
          { name: "author", type: "string", description: "Autorenzeile." },
          TRANSLATIONS_PARAM,
        ],
        returns: "200 · { data: Article } · 404 wenn es die ID nicht gibt",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/news/{id}",
        summary: "Einen Artikel löschen, samt seiner Übersetzungen.",
        level: LEVEL_DELETE,
        returns: "204 · kein Body",
      },
    ],
  },
  {
    area: "creators",
    title: "Creators",
    description:
      "Die Creator-Liste auf /creators/. Schreibende Aufrufe fassen auch die Discord-Rolle des Creators an, sofern ein Bot eingerichtet ist.",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/creators",
        summary:
          "Alle Creators mit ihren Kanälen, in der gespeicherten Reihenfolge.",
        level: LEVEL_READ,
        returns:
          "200 · { data: Creator[], discord: { configured, creatorRank, notice } }",
      },
      {
        method: "POST",
        path: "/api/dashboard/creators",
        summary: "Einen Creator anlegen und ihm die Creator-Rolle geben.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Anzeigename.",
          },
          {
            name: "minecraftUuid",
            type: "string",
            required: true,
            description:
              "Minecraft-UUID, mit oder ohne Bindestriche. Eindeutig.",
          },
          {
            name: "discordId",
            type: "string",
            description:
              'Discord-Snowflake (17–20 Ziffern) oder "" für keinen Account. Muss Mitglied des OTP-Servers sein.',
          },
          {
            name: "channels",
            type: "{ platform, url }[]",
            description: "Kanäle in Anzeigereihenfolge.",
          },
        ],
        returns: "201 · { data: Creator, warning?: string }",
        note: "Lässt sich die Discord-Rolle nicht vergeben, wird der Creator wieder entfernt und die Antwort ist 502 — es gibt dann keinen halb angelegten Creator.",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/creators/{id}",
        summary: "Einen Creator ändern. Nur gesendete Felder werden angefasst.",
        level: LEVEL_WRITE,
        body: [
          { name: "name", type: "string", description: "Anzeigename." },
          {
            name: "minecraftUuid",
            type: "string",
            description: "Minecraft-UUID.",
          },
          {
            name: "discordId",
            type: "string",
            description:
              'Discord-ID; "" nimmt die Rolle ab und löst die Verknüpfung.',
          },
          {
            name: "channels",
            type: "{ platform, url }[]",
            description: "Ersetzt die Kanalliste vollständig.",
          },
        ],
        returns: "200 · { data: Creator, warning?: string }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/creators/{id}",
        summary: "Einen Creator löschen und ihm die Rolle abnehmen.",
        level: LEVEL_DELETE,
        returns:
          "204 · kein Body — oder 200 mit { warning } wenn die Rolle blieb",
      },
      {
        method: "PUT",
        path: "/api/dashboard/creators/order",
        summary: "Die Reihenfolge der Creator-Liste setzen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "ids",
            type: "number[]",
            required: true,
            description: "Alle Creator-IDs in der gewünschten Reihenfolge.",
          },
        ],
        returns: "200 · { data: { ids } }",
      },
    ],
  },
  {
    area: "apply",
    title: "Bewerbungen",
    description:
      "Positionen und ihre Fragen auf /apply/ sowie der Eingang der abgeschickten Bewerbungen.",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/apply/positions",
        summary: "Alle Positionen, jeweils mit ihren Fragen.",
        level: LEVEL_READ,
        returns: "200 · { data: Position[] }",
      },
      {
        method: "POST",
        path: "/api/dashboard/apply/positions",
        summary: "Eine Position anlegen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Anzeigename, eindeutig.",
          },
          {
            name: "slug",
            type: "string",
            required: true,
            description: "URL-Segment, eindeutig.",
          },
          {
            name: "status",
            type: "string",
            description: '"open" oder "closed" (Standard).',
          },
          {
            name: "sortOrder",
            type: "number",
            description: "Platz in der Liste.",
          },
          {
            name: "descriptionEn",
            type: "string",
            description: "Kartentext, Englisch.",
          },
          {
            name: "descriptionDe",
            type: "string",
            description: "Kartentext, Deutsch.",
          },
        ],
        returns: "201 · { data: Position }",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/apply/positions/{id}",
        summary: "Eine Position ändern — auch das Öffnen und Schließen.",
        level: LEVEL_WRITE,
        body: [
          { name: "name", type: "string", description: "Anzeigename." },
          { name: "slug", type: "string", description: "URL-Segment." },
          {
            name: "status",
            type: "string",
            description: '"open" oder "closed".',
          },
          {
            name: "sortOrder",
            type: "number",
            description: "Platz in der Liste.",
          },
          {
            name: "descriptionEn",
            type: "string",
            description: "Kartentext, Englisch.",
          },
          {
            name: "descriptionDe",
            type: "string",
            description: "Kartentext, Deutsch.",
          },
        ],
        returns: "200 · { data: Position }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/apply/positions/{id}",
        summary: "Eine Position samt ihrer Fragen löschen.",
        level: LEVEL_DELETE,
        returns: "204 · kein Body",
        note: "Bereits abgeschickte Bewerbungen bleiben erhalten und lesbar — sie tragen ihre Fragen und Antworten selbst.",
      },
      {
        method: "POST",
        path: "/api/dashboard/apply/questions",
        summary: "Einer Position eine Frage hinzufügen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "positionId",
            type: "number",
            required: true,
            description: "Zu welcher Position.",
          },
          {
            name: "fieldKey",
            type: "string",
            required: true,
            description:
              "Schlüssel der Antwort, pro Position eindeutig, z. B. minecraft_username.",
          },
          {
            name: "type",
            type: "string",
            description: '"text" oder "textarea".',
          },
          {
            name: "required",
            type: "boolean",
            description: "Pflichtfeld, Standard true.",
          },
          {
            name: "sortOrder",
            type: "number",
            description: "Platz im Formular.",
          },
          {
            name: "labelEn",
            type: "string",
            description: "Beschriftung, Englisch.",
          },
          {
            name: "labelDe",
            type: "string",
            description: "Beschriftung, Deutsch.",
          },
          {
            name: "placeholderEn",
            type: "string",
            description: "Platzhalter, Englisch.",
          },
          {
            name: "placeholderDe",
            type: "string",
            description: "Platzhalter, Deutsch.",
          },
          {
            name: "descriptionEn",
            type: "string",
            description: "Hinweis unter dem Feld, Englisch.",
          },
          {
            name: "descriptionDe",
            type: "string",
            description: "Hinweis unter dem Feld, Deutsch.",
          },
        ],
        returns: "201 · { data: Question }",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/apply/questions/{id}",
        summary: "Eine Frage ändern. Nur gesendete Felder werden angefasst.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "fieldKey",
            type: "string",
            description: "Antwortschlüssel.",
          },
          {
            name: "type",
            type: "string",
            description: '"text" oder "textarea".',
          },
          { name: "required", type: "boolean", description: "Pflichtfeld." },
          {
            name: "sortOrder",
            type: "number",
            description: "Platz im Formular.",
          },
          {
            name: "labelEn / labelDe",
            type: "string",
            description: "Beschriftung.",
          },
          {
            name: "placeholderEn / placeholderDe",
            type: "string",
            description: "Platzhalter.",
          },
          {
            name: "descriptionEn / descriptionDe",
            type: "string",
            description: "Hinweis.",
          },
        ],
        returns: "200 · { data: Question }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/apply/questions/{id}",
        summary: "Eine Frage löschen.",
        level: LEVEL_DELETE,
        returns: "204 · kein Body",
      },
      {
        method: "PUT",
        path: "/api/dashboard/apply/questions/order",
        summary: "Die Reihenfolge der Fragen einer Position setzen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "positionId",
            type: "number",
            required: true,
            description: "Welche Position.",
          },
          {
            name: "ids",
            type: "number[]",
            required: true,
            description: "Fragen-IDs in der gewünschten Reihenfolge.",
          },
        ],
        returns: "200 · { data: Question[] }",
      },
      {
        method: "GET",
        path: "/api/dashboard/apply/submissions",
        summary: "Der Bewerbungseingang, neueste zuerst, seitenweise.",
        level: LEVEL_READ,
        query: [
          {
            name: "positionId",
            type: "number",
            description: "Nur eine Position; leer heißt alle.",
          },
          {
            name: "status",
            type: "string",
            description: '"new", "accepted" oder "rejected".',
          },
          {
            name: "limit",
            type: "number",
            description: "Seitengröße, serverseitig gedeckelt.",
          },
          {
            name: "offset",
            type: "number",
            description: "Versatz für die nächste Seite.",
          },
        ],
        returns: "200 · { data: Submission[], total, limit, offset }",
        note: "`limit=1` liefert nur `total` mit — genau das, was ein „wie viele neue Bewerbungen?“-Check braucht.",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/apply/submissions/{id}",
        summary: "Status oder interne Notiz einer Bewerbung setzen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "status",
            type: "string",
            description: '"new", "accepted" oder "rejected".',
          },
          {
            name: "internalNote",
            type: "string",
            description: "Teaminterne Notiz.",
          },
        ],
        returns: "200 · { data: Submission }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/apply/submissions/{id}",
        summary: "Eine Bewerbung löschen.",
        level: LEVEL_DELETE,
        returns: "204 · kein Body",
      },
    ],
  },
  {
    area: "team",
    title: "Team & Rollen",
    description:
      "Accounts und Ränge in PocketID. Dieser Bereich verwaltet auch die Rechte selbst — ein Key hierfür ist praktisch ein Vollzugriff.",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/team",
        summary: "Alle Teammitglieder und alle OTP-Gruppen.",
        level: LEVEL_READ,
        returns:
          "200 · { users: Member[], groups: Group[], discord: { configured } }",
      },
      {
        method: "POST",
        path: "/api/dashboard/team",
        summary: "Ein Teammitglied anlegen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "username",
            type: "string",
            required: true,
            description: "PocketID-Benutzername.",
          },
          {
            name: "groupId",
            type: "string",
            required: true,
            description: "ID der OTP-Gruppe (des Rangs).",
          },
          {
            name: "email",
            type: "string",
            description: "Standard: <username>@onthepixel.net.",
          },
          {
            name: "discordId",
            type: "string",
            description: "Discord-Snowflake für den Rollensync.",
          },
          {
            name: "minecraftUuid",
            type: "string",
            description: "Minecraft-UUID für den Skin.",
          },
        ],
        returns: "201 · { data: Member, warning?: string }",
      },
      {
        method: "PUT",
        path: "/api/dashboard/team/{id}",
        summary: "Ein Teammitglied ändern.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "groupIds",
            type: "string[]",
            description: "Gruppenzugehörigkeit, ersetzt die bisherige.",
          },
          { name: "email", type: "string", description: "E-Mail-Adresse." },
          { name: "displayName", type: "string", description: "Anzeigename." },
          {
            name: "disabled",
            type: "boolean",
            description: "Account sperren.",
          },
          { name: "discordId", type: "string", description: "Discord-ID." },
          {
            name: "minecraftUuid",
            type: "string",
            description: "Minecraft-UUID.",
          },
        ],
        returns: "200 · { data: Member, warning?: string }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/team/{id}",
        summary: "Ein Teammitglied löschen.",
        level: LEVEL_DELETE,
        returns: "204 · kein Body",
      },
      {
        method: "POST",
        path: "/api/dashboard/team/groups",
        summary: "Einen Rang anlegen — inklusive seiner Dashboard-Rechte.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Anzeigename des Rangs.",
          },
          {
            name: "prefix",
            type: "string",
            description: "Chat-Prefix, z. B. &7[Mod].",
          },
          {
            name: "weight",
            type: "string",
            description: "Gewicht; der höchste Rang gewinnt.",
          },
          {
            name: "discordRoleId",
            type: "string",
            description: "Discord-Rolle des Rangs.",
          },
          {
            name: "isCreatorRank",
            type: "boolean",
            description: "Markiert den Creator-Rang; genau einer.",
          },
          {
            name: "inheritsFrom",
            type: "string",
            description:
              "ID des Rangs, von dem dieser erbt. Wird nur gespeichert und ausgeliefert — Dashboard-Rechte vererbt er nicht.",
          },
          {
            name: "permissions",
            type: "{ news, creators, team, apply }",
            description: "Level 0–3 je Bereich.",
          },
        ],
        returns: "201 · { data: Group, warning?: string }",
      },
      {
        method: "PUT",
        path: "/api/dashboard/team/groups/{id}",
        summary: "Einen Rang ändern.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Anzeigename.",
          },
          { name: "prefix", type: "string", description: "Chat-Prefix." },
          { name: "weight", type: "string", description: "Gewicht." },
          {
            name: "discordRoleId",
            type: "string",
            description: "Discord-Rolle.",
          },
          {
            name: "isCreatorRank",
            type: "boolean",
            description: "Creator-Rang.",
          },
          {
            name: "inheritsFrom",
            type: "string",
            description:
              "ID des Rangs, von dem dieser erbt; leer hebt die Vererbung auf. Ein Kreis wird mit 400 abgelehnt.",
          },
          {
            name: "permissions",
            type: "{ news, creators, team, apply }",
            description: "Level 0–3 je Bereich.",
          },
        ],
        returns: "200 · { data: Group, warning?: string }",
      },
      {
        method: "GET",
        path: "/api/dashboard/discord/roles",
        summary: "Die Rollen des OTP-Discords, für die Rang-Zuordnung.",
        level: LEVEL_READ,
        returns: "200 · { configured, roles: Role[], error }",
        note: "Antwortet auch ohne Bot mit 200 — dann mit configured: false und leerer Liste.",
      },
      {
        method: "GET",
        path: "/api/dashboard/api-keys",
        summary: "Alle API-Keys (ohne Token — den gibt es nur einmal).",
        level: LEVEL_READ,
        returns: "200 · { data: ApiKey[], grantable: Permissions }",
        sessionOnly: true,
      },
      {
        method: "POST",
        path: "/api/dashboard/api-keys",
        summary: "Einen Key anlegen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Label, z. B. „Discord-Bot“.",
          },
          {
            name: "permissions",
            type: "{ news, creators, team, apply }",
            description:
              "Level 0–3 je Bereich, gedeckelt auf die eigenen Rechte.",
          },
          {
            name: "expiresAt",
            type: "string | null",
            description: "Ablauf als ISO-Datum; null heißt unbegrenzt.",
          },
        ],
        returns: "201 · { data: ApiKey, token }",
        sessionOnly: true,
      },
      {
        method: "PATCH",
        path: "/api/dashboard/api-keys/{id}",
        summary: "Einen Key umbenennen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "Neues Label.",
          },
        ],
        returns: "200 · { data: ApiKey }",
        sessionOnly: true,
      },
      {
        method: "DELETE",
        path: "/api/dashboard/api-keys/{id}",
        summary: "Einen Key zurückziehen. Er gilt ab sofort nicht mehr.",
        level: LEVEL_WRITE,
        returns: "200 · { data: ApiKey }",
        note: "Der Eintrag bleibt in der Liste stehen — Name, Prefix und letzte Nutzung sind nach einem Leak genau das, was man braucht.",
        sessionOnly: true,
      },
    ],
  },
  {
    area: "bugs",
    title: "Bug-Reports",
    description:
      "Die über /bug-report/ eingegangenen Fehlermeldungen: lesen, Status setzen, löschen.",
    endpoints: [
      {
        method: "GET",
        path: "/api/dashboard/bugs",
        summary: "Bug-Reports, neueste zuerst.",
        level: LEVEL_READ,
        query: [
          {
            name: "status",
            type: "string",
            description: '"new", "in_progress", "fixed" oder "rejected".',
          },
          {
            name: "category",
            type: "string",
            description: '"server", "website", "discord" oder "other".',
          },
          {
            name: "limit",
            type: "number",
            description: "Einträge pro Seite, Standard 25, höchstens 100.",
          },
          {
            name: "offset",
            type: "number",
            description: "Wie viele Einträge übersprungen werden.",
          },
        ],
        returns: "200 · { data: BugReport[], total, limit, offset }",
      },
      {
        method: "PATCH",
        path: "/api/dashboard/bugs/{id}",
        summary: "Status und/oder interne Notiz eines Reports setzen.",
        level: LEVEL_WRITE,
        body: [
          {
            name: "status",
            type: "string",
            description: '"new", "in_progress", "fixed" oder "rejected".',
          },
          {
            name: "internalNote",
            type: "string",
            description: "Nur im Dashboard sichtbar, höchstens 4000 Zeichen.",
          },
        ],
        returns: "200 · { data: BugReport }",
      },
      {
        method: "DELETE",
        path: "/api/dashboard/bugs/{id}",
        summary: "Einen Report endgültig löschen.",
        level: LEVEL_DELETE,
        returns: "204",
      },
    ],
  },
];

/** Every documented endpoint, flattened — for the “n Endpunkte” counter. */
export const ENDPOINT_COUNT = ENDPOINT_GROUPS.reduce(
  (total, group) => total + group.endpoints.length,
  0,
);

/** The error responses every endpoint can produce, documented once. */
export const ERROR_RESPONSES: { status: string; meaning: string }[] = [
  {
    status: "400",
    meaning:
      "Die Anfrage selbst stimmt nicht — Pflichtfeld fehlt, ID ist keine Zahl, Datum liegt in der Vergangenheit. `error` sagt, was.",
  },
  {
    status: "401",
    meaning:
      "Kein Key mitgeschickt, oder der Key ist unbekannt, zurückgezogen oder abgelaufen. Ein erneuter Versuch mit demselben Key hilft nicht.",
  },
  {
    status: "403",
    meaning:
      "Der Key ist gültig, hat aber für diesen Bereich nicht das nötige Level — oder versucht, Keys zu verwalten.",
  },
  { status: "404", meaning: "Die ID gibt es nicht (mehr)." },
  {
    status: "409",
    meaning:
      "Eindeutigkeit verletzt — z. B. eine Minecraft-UUID, die schon einem anderen Creator gehört.",
  },
  {
    status: "500 / 502",
    meaning:
      "Serverseitig schiefgegangen; bei 502 hat ein Upstream (Discord, PocketID) abgelehnt. `error` und ggf. `detail` enthalten die Meldung.",
  },
];
