import React from "react";
import TopPage from "@/components/page/top";

export default function Privacy() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10 max-w-4xl">
          <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-8 text-sm">Last Updated: March 2026</p>

          {/* 1. Controller */}
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

          {/* 2. Overview */}
          <h2 className="text-xl font-semibold mt-8 mb-4">2. Overview</h2>
          <p>
            This Privacy Policy outlines how OnThePixel.net ("we", "our", or "us") collects, uses, and protects
            your personal data when you use our Minecraft server, website, or any of our related services. We are
            committed to ensuring that your privacy is protected and that we comply with the EU General Data
            Protection Regulation (GDPR / DSGVO).
          </p>

          {/* 3. Data We Collect */}
          <h2 className="text-xl font-semibold mt-8 mb-4">3. Data We Collect</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">3.1 Website & Server Logs</h3>
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
          <p>When you connect to our Minecraft server (via BungeeCord/Velocity proxy), we process:</p>
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

          <h3 className="text-lg font-semibold mt-4 mb-2">3.4 Chat & Private Messages</h3>
          <p>
            All messages sent on our server are logged. This includes public chat messages, private messages
            between players, and group/clan messages. Each log entry contains the sender's username, the message
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

          <h3 className="text-lg font-semibold mt-4 mb-2">3.6 Discord (Support & Tickets)</h3>
          <p>
            We use Discord (Discord Inc., 444 De Haro Street, Suite 200, San Francisco, CA 94107, USA) for
            community communication and support tickets. When you open a support ticket, we process your Discord
            username, Discord ID, and the contents of your ticket.
          </p>
          <p className="mt-2">
            Discord may transfer data to the USA. This transfer is based on Standard Contractual Clauses (Art.
            46(2)(c) GDPR). Discord's privacy policy is available at:{" "}
            <a href="https://discord.com/privacy" className="text-green-400 hover:text-green-300">
              https://discord.com/privacy
            </a>
          </p>

          {/* 4. Legal Basis */}
          <h2 className="text-xl font-semibold mt-8 mb-4">4. Legal Basis for Processing</h2>
          <p>We process your personal data on the following legal bases under the GDPR:</p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>
              <strong>Art. 6(1)(a) GDPR – Consent:</strong> where you voluntarily provide information (e.g.
              applications)
            </li>
            <li>
              <strong>Art. 6(1)(b) GDPR – Contract performance:</strong> where processing is necessary to
              provide our services
            </li>
            <li>
              <strong>Art. 6(1)(f) GDPR – Legitimate interests:</strong> for server operation, security,
              moderation, and fraud prevention
            </li>
            <li>
              <strong>Art. 6(1)(c) GDPR – Legal obligation:</strong> where required by applicable law
            </li>
          </ul>

          {/* 5. Data Retention */}
          <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Retention</h2>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Server log files: deleted after <strong>7 days</strong></li>
            <li>IP addresses (Minecraft): retained for up to <strong>30 days</strong></li>
            <li>Chat & private messages: automatically deleted after <strong>30 days</strong></li>
            <li>Rejected applications: deleted within <strong>3 months</strong></li>
            <li>Persistent player data (database): retained for as long as you are an active player or until deletion is requested</li>
            <li>Ban/moderation records: retained as long as necessary to enforce server rules</li>
          </ul>

          {/* 6. Hosting */}
          <h2 className="text-xl font-semibold mt-8 mb-4">6. Hosting</h2>
          <p>
            Our website and Minecraft server are hosted on a rented VPS/root server provided by an external
            hosting provider. This provider processes data exclusively on our behalf and is contractually bound
            to comply with GDPR requirements (Data Processing Agreement pursuant to Art. 28 GDPR).
          </p>

          {/* 7. Data Security */}
          <h2 className="text-xl font-semibold mt-8 mb-4">7. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against
            unauthorized or unlawful processing, accidental loss, destruction, or damage. Database access is
            secured by authentication. However, no method of transmission over the Internet is 100% secure.
          </p>

          {/* 8. Your Rights */}
          <h2 className="text-xl font-semibold mt-8 mb-4">8. Your Rights</h2>
          <p>Under the GDPR, you have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 mt-2 mb-4 space-y-2">
            <li>Right of access (Art. 15 GDPR)</li>
            <li>Right to rectification (Art. 16 GDPR)</li>
            <li>Right to erasure / "right to be forgotten" (Art. 17 GDPR)</li>
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

          {/* 9. Supervisory Authority */}
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

          {/* 10. Minors */}
          <h2 className="text-xl font-semibold mt-8 mb-4">10. Minors</h2>
          <p>
            Our services are available to all age groups. However, persons under the age of 16 should not
            submit personal data without the consent of a parent or guardian (Art. 8 GDPR). We do not knowingly
            collect personal data from children under 16. If we become aware of such data being collected, we
            will delete it promptly.
          </p>

          {/* 11. Changes */}
          <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes
            by posting the updated policy on this page and updating the "Last Updated" date above. We recommend
            reviewing this page periodically.
          </p>

          {/* 12. Contact */}
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
            <a
              href="https://discord.com/invite/Dpx3eK9t3z"
              className="text-green-400 hover:text-green-300"
            >
              https://discord.com/invite/Dpx3eK9t3z
            </a>
          </p>

          <p className="mt-10 text-gray-400 text-sm">Last Updated: March 2026</p>
        </div>
      </section>
    </>
  );
}
