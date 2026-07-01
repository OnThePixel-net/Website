import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "Privacy Policy",
    description:
      "How OnThePixel.net collects, uses and protects your personal data — GDPR-compliant privacy policy.",
  },
  de: {
    title: "Datenschutz",
    description:
      "Wie OnThePixel.net deine personenbezogenen Daten erhebt, nutzt und schützt — DSGVO-konforme Datenschutzerklärung.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/privacy", title, description });
}

export default async function Privacy() {
  const locale = await getServerLocale();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          {locale === "de" ? <PrivacyDE /> : <PrivacyEN />}
        </div>
      </section>
    </>
  );
}

function PrivacyEN() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-gray-400 mb-8 text-sm">Last Updated: July 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">1. Controller (Verantwortlicher)</h2>
      <p>
        The controller responsible for data processing on this website and the associated Minecraft server
        is the operator of OnThePixel.net. Full contact details are available in our{" "}
        <a href="/imprint" className="text-green-400 hover:text-green-300">Imprint (Impressum)</a>.
      </p>
      <p className="mt-2">
        Email:{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">2. Overview</h2>
      <p>
        This Privacy Policy outlines how OnThePixel.net (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects
        your personal data when you use our Minecraft server, website, or any of our related services. We are
        committed to ensuring that your privacy is protected and that we comply with the EU General Data
        Protection Regulation (GDPR / DSGVO).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">3. Data We Collect</h2>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Website &amp; Server Logs</h3>
      <p>When you visit our website, our hosting provider automatically records:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>IP address of the requesting device</li>
        <li>Date and time of access</li>
        <li>Requested URL and file name</li>
        <li>Referrer URL</li>
        <li>Browser and operating system</li>
      </ul>
      <p>These logs are automatically deleted after 7 days.</p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Minecraft Server</h3>
      <p>When you connect to our Minecraft server we process:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft username and UUID</li>
        <li>IP address (retained for up to 30 days for security purposes)</li>
        <li>Connection and disconnection timestamps</li>
        <li>Selected sub-server (proxy routing)</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Persistent Player Data (Database)</h3>
      <p>
        Player data is stored permanently in a MySQL database to provide a consistent gameplay experience.
        This includes:
      </p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft username and UUID</li>
        <li>Game progress, inventory, and statistics</li>
        <li>Playtime and activity data</li>
        <li>Player settings and rank/permissions</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Chat &amp; Private Messages</h3>
      <p>
        All messages sent on our server are logged. This includes public chat messages, private messages
        between players, and group/clan messages. Each log entry contains the sender&apos;s username, the message
        content, and a timestamp.
      </p>
      <p className="mt-2">
        <strong>All chat and message data is automatically and permanently deleted after 30 days.</strong>{" "}
        This data is only accessible to the moderation team for rule enforcement purposes.
      </p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.5 Apply System</h3>
      <p>When you submit an application through our apply system, we collect:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft username / UUID</li>
        <li>Discord username / tag (if provided)</li>
        <li>Any additional information you voluntarily provide (e.g. experience, motivation)</li>
      </ul>
      <p>
        Applications are processed solely for the purpose of reviewing your application. Rejected
        applications are deleted within 3 months.
      </p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.6 Discord (Support &amp; Tickets)</h3>
      <p>
        We use Discord (Discord Inc., 444 De Haro Street, Suite 200, San Francisco, CA 94107, USA) for
        community communication and support tickets. When you open a support ticket, we process your Discord
        username, Discord ID, and the contents of your ticket.
      </p>
      <p className="mt-2">
        Discord may transfer data to the USA. This transfer is based on Standard Contractual Clauses (Art.
        46(2)(c) GDPR). Discord&apos;s privacy policy is available at:{" "}
        <a href="https://discord.com/privacy" className="text-green-400 hover:text-green-300">
          https://discord.com/privacy
        </a>
      </p>

      <h3 id="youtube" className="text-lg font-semibold mt-4 mb-2">3.7 YouTube Embedded Videos</h3>
      <p>
        Some pages on this website may embed YouTube videos. YouTube is a service of Google Ireland Limited,
        Gordon House, Barrow Street, Dublin 4, Ireland (&quot;Google&quot;). Embedded videos are only loaded after
        you explicitly consent by clicking the &quot;Load video &amp; accept cookies&quot; button shown in place of the
        video player.
      </p>
      <p className="mt-2">
        Once you consent, the video is loaded via the privacy-enhanced domain{" "}
        <strong>youtube-nocookie.com</strong>, which reduces — but does not eliminate — data sent to Google.
        Google may still set cookies and receive your IP address, browser information, and the URL of the
        page you are visiting. This data may be transferred to Google servers in the USA.
      </p>
      <p className="mt-2">
        The legal basis for this processing is your consent (Art. 6(1)(a) GDPR). You can withdraw your
        consent at any time via the Cookie Settings button in the footer. Google&apos;s privacy policy is
        available at:{" "}
        <a href="https://policies.google.com/privacy" className="text-green-400 hover:text-green-300">
          https://policies.google.com/privacy
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">4. Legal Basis for Processing</h2>
      <p>We process your personal data on the following legal bases under the GDPR:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>
          <strong>Art. 6(1)(a) GDPR – Consent:</strong> where you voluntarily provide information (e.g. applications)
        </li>
        <li>
          <strong>Art. 6(1)(b) GDPR – Contract performance:</strong> where processing is necessary to provide our services
        </li>
        <li>
          <strong>Art. 6(1)(f) GDPR – Legitimate interests:</strong> for server operation, security, moderation, and fraud prevention
        </li>
        <li>
          <strong>Art. 6(1)(c) GDPR – Legal obligation:</strong> where required by applicable law
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Retention</h2>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Server log files: deleted after <strong>7 days</strong></li>
        <li>IP addresses (Minecraft): retained for up to <strong>30 days</strong></li>
        <li>Chat &amp; private messages: automatically deleted after <strong>30 days</strong></li>
        <li>Rejected applications: deleted within <strong>3 months</strong></li>
        <li>Persistent player data (database): retained for as long as you are an active player or until deletion is requested</li>
        <li>Ban/moderation records: retained as long as necessary to enforce server rules</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">6. Hosting</h2>
      <p>
        Our website and Minecraft server are hosted on a rented VPS/root server provided by an external
        hosting provider. This provider processes data exclusively on our behalf and is contractually bound
        to comply with GDPR requirements (Data Processing Agreement pursuant to Art. 28 GDPR).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your personal data against
        unauthorized or unlawful processing, accidental loss, destruction, or damage. Database access is
        secured by authentication. However, no method of transmission over the Internet is 100% secure.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">8. Your Rights</h2>
      <p>Under the GDPR, you have the following rights regarding your personal data:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Right of access (Art. 15 GDPR)</li>
        <li>Right to rectification (Art. 16 GDPR)</li>
        <li>Right to erasure / &quot;right to be forgotten&quot; (Art. 17 GDPR)</li>
        <li>Right to restriction of processing (Art. 18 GDPR)</li>
        <li>Right to data portability (Art. 20 GDPR)</li>
        <li>Right to object to processing (Art. 21 GDPR)</li>
        <li>Right to withdraw consent at any time (Art. 7(3) GDPR)</li>
      </ul>
      <p>
        To exercise any of these rights, please contact us at{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">9. Right to Lodge a Complaint</h2>
      <p>
        You have the right to lodge a complaint with a data protection supervisory authority. The competent
        authority for North Rhine-Westphalia, Germany is:
      </p>
      <p className="mt-2">
        <strong>
          Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)
        </strong>
        <br />
        Kavalleriestraße 2-4, 40213 Düsseldorf
        <br />
        <a href="https://www.ldi.nrw.de" className="text-green-400 hover:text-green-300">
          https://www.ldi.nrw.de
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">10. Minors</h2>
      <p>
        Our services are available to all age groups. However, persons under the age of 16 should not
        submit personal data without the consent of a parent or guardian (Art. 8 GDPR). We do not knowingly
        collect personal data from children under 16. If we become aware of such data being collected, we
        will delete it promptly.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of any significant changes
        by posting the updated policy on this page and updating the &quot;Last Updated&quot; date above. We recommend
        reviewing this page periodically.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">12. Contact</h2>
      <p>If you have any questions about this Privacy Policy, please contact us:</p>
      <p className="mt-2">
        Email:{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
      </p>
      <p className="mt-2">
        Discord:{" "}
        <a href="https://discord.com/invite/Dpx3eK9t3z" className="text-green-400 hover:text-green-300">
          https://discord.com/invite/Dpx3eK9t3z
        </a>
      </p>

      <p className="mt-10 text-gray-400 text-sm">Last Updated: July 2026</p>
    </>
  );
}

function PrivacyDE() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Datenschutzerklärung</h1>
      <p className="text-gray-400 mb-8 text-sm">Zuletzt aktualisiert: Juli 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-4">1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website und dem zugehörigen Minecraft-Server ist
        der Betreiber von OnThePixel.net. Die vollständigen Kontaktdaten findest du in unserem{" "}
        <a href="/imprint" className="text-green-400 hover:text-green-300">Impressum</a>.
      </p>
      <p className="mt-2">
        E-Mail:{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">2. Überblick</h2>
      <p>
        Diese Datenschutzerklärung beschreibt, wie OnThePixel.net („wir") personenbezogene Daten erhebt,
        verwendet und schützt, wenn du unseren Minecraft-Server, unsere Website oder verwandte Dienste
        nutzt. Wir sind verpflichtet, deine Privatsphäre zu schützen und die Anforderungen der
        EU-Datenschutz-Grundverordnung (DSGVO) einzuhalten.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">3. Welche Daten wir erheben</h2>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Website- und Server-Logs</h3>
      <p>Wenn du unsere Website besuchst, protokolliert unser Hosting-Anbieter automatisch:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>IP-Adresse des anfragenden Geräts</li>
        <li>Datum und Uhrzeit des Zugriffs</li>
        <li>Aufgerufene URL und Dateiname</li>
        <li>Referrer-URL</li>
        <li>Browser und Betriebssystem</li>
      </ul>
      <p>Diese Logs werden nach 7 Tagen automatisch gelöscht.</p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.2 Minecraft-Server</h3>
      <p>Wenn du dich mit unserem Minecraft-Server verbindest, verarbeiten wir:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft-Benutzername und UUID</li>
        <li>IP-Adresse (zu Sicherheitszwecken bis zu 30 Tage gespeichert)</li>
        <li>Verbindungs- und Trennzeitstempel</li>
        <li>Ausgewählter Sub-Server (Proxy-Routing)</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.3 Dauerhafte Spielerdaten (Datenbank)</h3>
      <p>
        Spielerdaten werden dauerhaft in einer MySQL-Datenbank gespeichert, um ein konsistentes Spielerlebnis
        zu ermöglichen. Dazu gehören:
      </p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft-Benutzername und UUID</li>
        <li>Spielfortschritt, Inventar und Statistiken</li>
        <li>Spielzeit und Aktivitätsdaten</li>
        <li>Spielereinstellungen und Rang/Berechtigungen</li>
      </ul>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Chat- und Privatnachrichten</h3>
      <p>
        Alle auf unserem Server gesendeten Nachrichten werden protokolliert. Dazu zählen öffentliche
        Chatnachrichten, Privatnachrichten zwischen Spielern sowie Gruppen- und Clannachrichten. Jeder
        Logeintrag enthält den Benutzernamen des Absenders, den Nachrichteninhalt und einen Zeitstempel.
      </p>
      <p className="mt-2">
        <strong>Alle Chat- und Nachrichtendaten werden nach 30 Tagen automatisch und endgültig gelöscht.</strong>{" "}
        Diese Daten sind ausschließlich für das Moderationsteam zur Durchsetzung der Serverregeln zugänglich.
      </p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.5 Bewerbungssystem</h3>
      <p>
        Wenn du eine Bewerbung über unser Bewerbungssystem einreichst, erheben wir:
      </p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Minecraft-Benutzername / UUID</li>
        <li>Discord-Benutzername / -Tag (sofern angegeben)</li>
        <li>Weitere freiwillig gemachte Angaben (z. B. Erfahrung, Motivation)</li>
      </ul>
      <p>
        Bewerbungen werden ausschließlich zur Prüfung verarbeitet. Abgelehnte Bewerbungen werden innerhalb
        von 3 Monaten gelöscht.
      </p>

      <h3 className="text-lg font-semibold mt-4 mb-2">3.6 Discord (Support &amp; Tickets)</h3>
      <p>
        Wir nutzen Discord (Discord Inc., 444 De Haro Street, Suite 200, San Francisco, CA 94107, USA) für
        Community-Kommunikation und Support-Tickets. Wenn du ein Support-Ticket eröffnest, verarbeiten wir
        deinen Discord-Benutzernamen, deine Discord-ID und den Inhalt deines Tickets.
      </p>
      <p className="mt-2">
        Discord kann Daten in die USA übermitteln. Diese Übermittlung erfolgt auf Grundlage der
        Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Die Datenschutzerklärung von Discord ist
        verfügbar unter:{" "}
        <a href="https://discord.com/privacy" className="text-green-400 hover:text-green-300">
          https://discord.com/privacy
        </a>
      </p>

      <h3 id="youtube" className="text-lg font-semibold mt-4 mb-2">3.7 Eingebettete YouTube-Videos</h3>
      <p>
        Einige Seiten dieser Website können YouTube-Videos einbetten. YouTube ist ein Dienst der Google Ireland
        Limited, Gordon House, Barrow Street, Dublin 4, Irland („Google"). Eingebettete Videos werden erst
        geladen, nachdem du explizit durch Klicken auf den Button „Video laden &amp; Cookies akzeptieren" im
        Videoplatzhalter zugestimmt hast.
      </p>
      <p className="mt-2">
        Nach deiner Zustimmung wird das Video über die datenschutzfreundlichere Domain{" "}
        <strong>youtube-nocookie.com</strong> geladen, was die Datenweitergabe an Google reduziert – aber
        nicht vollständig verhindert. Google kann weiterhin Cookies setzen und deine IP-Adresse,
        Browser-Informationen sowie die URL der aufgerufenen Seite erhalten. Diese Daten können auf
        Google-Server in den USA übertragen werden.
      </p>
      <p className="mt-2">
        Rechtsgrundlage dieser Verarbeitung ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst
        deine Einwilligung jederzeit über den Button „Cookie-Einstellungen" im Footer widerrufen. Die
        Datenschutzerklärung von Google ist verfügbar unter:{" "}
        <a href="https://policies.google.com/privacy" className="text-green-400 hover:text-green-300">
          https://policies.google.com/privacy
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">4. Rechtsgrundlagen der Verarbeitung</h2>
      <p>Wir verarbeiten deine personenbezogenen Daten auf folgenden Rechtsgrundlagen der DSGVO:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>
          <strong>Art. 6 Abs. 1 lit. a DSGVO – Einwilligung:</strong> bei freiwilligen Angaben (z. B. Bewerbungen)
        </li>
        <li>
          <strong>Art. 6 Abs. 1 lit. b DSGVO – Vertragserfüllung:</strong> sofern die Verarbeitung zur Erbringung unserer Dienste erforderlich ist
        </li>
        <li>
          <strong>Art. 6 Abs. 1 lit. f DSGVO – Berechtigte Interessen:</strong> für Serverbetrieb, Sicherheit, Moderation und Betrugsprävention
        </li>
        <li>
          <strong>Art. 6 Abs. 1 lit. c DSGVO – Rechtliche Verpflichtung:</strong> sofern dies gesetzlich vorgeschrieben ist
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">5. Speicherdauer</h2>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Server-Logdateien: gelöscht nach <strong>7 Tagen</strong></li>
        <li>IP-Adressen (Minecraft): gespeichert bis zu <strong>30 Tagen</strong></li>
        <li>Chat- und Privatnachrichten: automatisch gelöscht nach <strong>30 Tagen</strong></li>
        <li>Abgelehnte Bewerbungen: gelöscht innerhalb von <strong>3 Monaten</strong></li>
        <li>Dauerhafte Spielerdaten (Datenbank): gespeichert, solange du aktiver Spieler bist oder bis du eine Löschung verlangst</li>
        <li>Bann-/Moderationsdaten: gespeichert, solange dies zur Durchsetzung der Serverregeln nötig ist</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-4">6. Hosting</h2>
      <p>
        Unsere Website und der Minecraft-Server werden auf einem gemieteten VPS/Root-Server eines externen
        Hosting-Anbieters betrieben. Dieser Anbieter verarbeitet die Daten ausschließlich in unserem Auftrag
        und ist vertraglich zur Einhaltung der DSGVO verpflichtet (Auftragsverarbeitung gemäß Art. 28 DSGVO).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">7. Datensicherheit</h2>
      <p>
        Wir setzen geeignete technische und organisatorische Maßnahmen ein, um deine personenbezogenen Daten
        vor unbefugter oder rechtswidriger Verarbeitung sowie vor unbeabsichtigtem Verlust, Zerstörung oder
        Beschädigung zu schützen. Der Zugriff auf die Datenbank ist durch Authentifizierung gesichert.
        Eine vollständige Sicherheit bei der Übertragung über das Internet kann jedoch nicht garantiert werden.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">8. Deine Rechte</h2>
      <p>Nach der DSGVO stehen dir folgende Rechte bezüglich deiner personenbezogenen Daten zu:</p>
      <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
        <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
        <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
        <li>Recht auf Löschung / „Recht auf Vergessenwerden" (Art. 17 DSGVO)</li>
        <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        <li>Recht auf Widerruf einer Einwilligung jederzeit (Art. 7 Abs. 3 DSGVO)</li>
      </ul>
      <p>
        Um diese Rechte auszuüben, kontaktiere uns bitte unter{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">9. Beschwerderecht bei der Aufsichtsbehörde</h2>
      <p>
        Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständige Behörde
        für Nordrhein-Westfalen ist:
      </p>
      <p className="mt-2">
        <strong>
          Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW)
        </strong>
        <br />
        Kavalleriestraße 2-4, 40213 Düsseldorf
        <br />
        <a href="https://www.ldi.nrw.de" className="text-green-400 hover:text-green-300">
          https://www.ldi.nrw.de
        </a>
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">10. Minderjährige</h2>
      <p>
        Unsere Dienste stehen Personen aller Altersgruppen offen. Personen unter 16 Jahren sollten jedoch
        keine personenbezogenen Daten ohne die Zustimmung eines Erziehungsberechtigten übermitteln
        (Art. 8 DSGVO). Wir erheben wissentlich keine personenbezogenen Daten von Kindern unter 16 Jahren.
        Sollten wir von einer solchen Erhebung Kenntnis erhalten, löschen wir die Daten umgehend.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">11. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir können diese Datenschutzerklärung von Zeit zu Zeit aktualisieren. Über wesentliche Änderungen
        informieren wir dich, indem wir die aktualisierte Erklärung auf dieser Seite veröffentlichen und
        das Datum „Zuletzt aktualisiert" oben anpassen. Wir empfehlen, diese Seite regelmäßig zu prüfen.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">12. Kontakt</h2>
      <p>Bei Fragen zu dieser Datenschutzerklärung kontaktiere uns bitte:</p>
      <p className="mt-2">
        E-Mail:{" "}
        <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">
          contact@onthepixel.net
        </a>
      </p>
      <p className="mt-2">
        Discord:{" "}
        <a href="https://discord.com/invite/Dpx3eK9t3z" className="text-green-400 hover:text-green-300">
          https://discord.com/invite/Dpx3eK9t3z
        </a>
      </p>

      <p className="mt-10 text-gray-400 text-sm">Zuletzt aktualisiert: Juli 2026</p>
    </>
  );
}
