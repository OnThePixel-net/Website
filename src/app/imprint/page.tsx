import React from "react";
import TopPage from "@/components/page/top";
import { getServerLocale } from "@/lib/i18n/server";

export default async function ImprintPage() {
  const locale = await getServerLocale();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          {locale === "de" ? <ImprintDE /> : <ImprintEN />}
        </div>
      </section>
    </>
  );
}

function SocialLinks() {
  return (
    <>
      <p className="mt-2">
        <a href="https://www.youtube.com/@onthepixel" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://www.youtube.com/@onthepixel
        </a>
      </p>
      <p className="mt-2">
        <a href="https://twitch.tv/onthepixel" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://twitch.tv/onthepixel
        </a>
      </p>
      <p className="mt-2">
        <a href="https://discord.com/invite/Dpx3eK9t3z" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://discord.com/invite/Dpx3eK9t3z
        </a>
      </p>
      <p className="mt-2">
        <a href="https://www.tiktok.com/@onthepixel" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://www.tiktok.com/@onthepixel
        </a>
      </p>
      <p className="mt-2">
        <a href="https://www.instagram.com/onthepixel_net" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://www.instagram.com/onthepixel_net
        </a>
      </p>
      <p className="mt-2">
        <a href="https://x.com/onthepixelnet" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300">
          https://x.com/onthepixelnet
        </a>
      </p>
      {[
        "*.onthepixel.net",
        "*.onthepixel.dev",
        "*.bedwars.net",
        "*.tntrun.de",
        "*.buildffa.net",
        "*.mcwith.me",
        "*.norizz.de",
        "*.thejocraft.monster",
        "*.deinmutter.de",
        "*.gerhart.studio",
        "*.gerhart.dev",
      ].map((d) => (
        <p className="mt-2" key={d}>
          <span className="text-green-400">{d}</span>
        </p>
      ))}
    </>
  );
}

function ImprintEN() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">LEGAL NOTICE</h1>

      <h2 className="text-xl font-semibold mb-4">Service Provider</h2>
      <p>
        Leo Scherr<br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Contact Information</h2>
      <p>
        Email: <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">contact@onthepixel.net</a><br />
        Phone: +49 170 1850492
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Social Media and Other Online Presences</h2>
      <p>This legal notice also applies to the following social media presences and online profiles:</p>
      <SocialLinks />

      <h2 className="text-xl font-semibold mt-8 mb-4">Liability and Copyright Notices</h2>
      <p>
        <strong>Disclaimer:</strong> The contents of this online offering have been created carefully and according to our current
        knowledge. They are provided for information purposes only and do not have any legally binding effect unless they are
        legally required information (e.g., legal notice, privacy policy, terms and conditions, or mandatory consumer information).
        We reserve the right to change or delete the contents in whole or in part, provided that contractual obligations remain
        unaffected. All offers are non-binding and without obligation.
      </p>

      <p className="mt-4">
        <strong>Links to third-party websites:</strong> The content of third-party websites to which we directly or indirectly
        refer is outside our area of responsibility, and we do not adopt them as our own. We do not assume any responsibility
        for any content or disadvantages arising from the use of information accessible via the linked websites.
      </p>

      <p className="mt-4">
        <strong>Copyright and trademarks:</strong> All content displayed on this website, such as texts, photographs,
        graphics, trademarks, and logos, is protected by the respective intellectual property rights (copyrights, trademarks).
        Use, reproduction, etc. are subject to our rights or the rights of the respective authors or rights holders.
      </p>

      <p className="mt-4">
        <strong>Notice of legal violations:</strong> If you notice any legal violations within our website, please inform us.
        We will remove illegal content and links immediately upon becoming aware of them.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Google Analytics</h2>
      <p>
        This website uses Google Analytics, a web analytics service provided by Google Inc. (&apos;Google&apos;). Google Analytics
        uses &apos;cookies&apos;, which are text files placed on your computer to help the website analyze how users use the site.
        The information generated by the cookie about your use of this website (including your IP address) is transmitted
        to and stored by Google on servers in the United States. Google will use this information for the purpose of
        evaluating your use of the website, compiling reports on website activity for website operators, and providing
        other services relating to website activity and internet usage. Google may also transfer this information to
        third parties where required to do so by law, or where such third parties process the information on Google&apos;s
        behalf. Google will not associate your IP address with any other data held by Google. You may refuse the use
        of cookies by selecting the appropriate settings on your browser; however, please note that if you do this,
        you may not be able to use the full functionality of this website. By using this website, you consent to the
        processing of data about you by Google in the manner and for the purposes set out above.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Contact Policy</h2>
      <p>
        The contact options provided on this website are intended <strong>exclusively for legally relevant inquiries</strong>,
        including communication from attorneys or individuals with non-commercial concerns.
        <strong>Commercial advertising, cooperation requests, or any promotional messages are strictly prohibited</strong>
        and will not be answered.
      </p>
      <p className="mt-8 text-gray-400">
        Created with the free <a href="https://datenschutz-generator.de/" target="_blank" rel="noopener noreferrer nofollow" className="text-gray-400 hover:text-gray-300">Datenschutz-Generator.de</a> by Dr. Thomas Schwenke
      </p>
    </>
  );
}

function ImprintDE() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-5">IMPRESSUM</h1>

      <h2 className="text-xl font-semibold mb-4">Diensteanbieter</h2>
      <p>
        Leo Scherr<br />
        c/o Block Services<br />
        Stuttgarter Str. 106<br />
        70736 Fellbach
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Kontaktmöglichkeiten</h2>
      <p>
        E-Mail: <a href="mailto:contact@onthepixel.net" className="text-green-400 hover:text-green-300">contact@onthepixel.net</a><br />
        Telefon: +49 170 1850492
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Social Media und andere Online-Präsenzen</h2>
      <p>
        Dieses Impressum gilt auch für die folgenden Social-Media-Präsenzen und Online-Profile:
      </p>
      <SocialLinks />

      <h2 className="text-xl font-semibold mt-8 mb-4">Haftungs- und Urheberrechtshinweise</h2>
      <p>
        <strong>Haftungsausschluss:</strong> Die Inhalte dieses Onlineangebotes wurden sorgfältig und nach unserem aktuellen
        Kenntnisstand erstellt. Sie dienen ausschließlich der Information und entfalten keine rechtlich bindende Wirkung,
        sofern es sich nicht um gesetzlich vorgeschriebene Angaben handelt (z. B. Impressum, Datenschutzerklärung, AGB oder
        verpflichtende Verbraucherinformationen). Wir behalten uns das Recht vor, die Inhalte ganz oder teilweise zu ändern
        oder zu löschen, soweit vertragliche Verpflichtungen davon unberührt bleiben. Alle Angebote sind freibleibend und
        unverbindlich.
      </p>

      <p className="mt-4">
        <strong>Links auf fremde Webseiten:</strong> Die Inhalte fremder Webseiten, auf die wir direkt oder indirekt
        verweisen, liegen außerhalb unseres Verantwortungsbereichs und werden von uns nicht zu eigen gemacht. Für etwaige
        Inhalte und Nachteile, die aus der Nutzung der über die verlinkten Webseiten zugänglichen Informationen entstehen,
        übernehmen wir keine Verantwortung.
      </p>

      <p className="mt-4">
        <strong>Urheberrechte und Markenrechte:</strong> Alle auf dieser Website dargestellten Inhalte wie Texte,
        Fotografien, Grafiken, Marken und Logos sind durch die jeweiligen Schutzrechte (Urheberrechte, Markenrechte)
        geschützt. Die Verwendung, Vervielfältigung usw. unterliegen unseren Rechten oder den Rechten der jeweiligen
        Urheber bzw. Rechteinhaber.
      </p>

      <p className="mt-4">
        <strong>Hinweise auf Rechtsverstöße:</strong> Solltest du innerhalb unserer Website Rechtsverstöße bemerken,
        bitten wir dich, uns zu informieren. Rechtswidrige Inhalte und Links entfernen wir umgehend nach Kenntnisnahme.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Google Analytics</h2>
      <p>
        Diese Website nutzt Google Analytics, einen Webanalysedienst der Google Inc. („Google"). Google Analytics
        verwendet sogenannte „Cookies", Textdateien, die auf deinem Computer gespeichert werden und die eine Analyse der
        Benutzung der Website durch dich ermöglichen. Die durch das Cookie erzeugten Informationen über deine Benutzung
        dieser Website (einschließlich deiner IP-Adresse) werden an einen Server von Google in den USA übertragen und
        dort gespeichert. Google wird diese Informationen benutzen, um deine Nutzung der Website auszuwerten, Reports
        über die Websiteaktivitäten für die Websitebetreiber zusammenzustellen und weitere mit der Websitenutzung und der
        Internetnutzung verbundene Dienstleistungen zu erbringen. Google wird diese Informationen gegebenenfalls auch an
        Dritte übertragen, sofern dies gesetzlich vorgeschrieben ist oder soweit Dritte diese Daten im Auftrag von Google
        verarbeiten. Google wird in keinem Fall deine IP-Adresse mit anderen Daten von Google in Verbindung bringen. Du
        kannst die Installation der Cookies durch eine entsprechende Einstellung deiner Browser-Software verhindern;
        wir weisen dich jedoch darauf hin, dass du in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser
        Website vollumfänglich nutzen kannst. Durch die Nutzung dieser Website erklärst du dich mit der Bearbeitung der
        über dich erhobenen Daten durch Google in der zuvor beschriebenen Art und Weise und zu dem zuvor benannten Zweck
        einverstanden.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-4">Kontaktrichtlinien</h2>
      <p>
        Die auf dieser Website angegebenen Kontaktmöglichkeiten sind <strong>ausschließlich für rechtlich relevante
        Anfragen</strong> bestimmt, einschließlich Kommunikation von Anwälten oder Personen mit nicht-kommerziellen
        Anliegen.{" "}
        <strong>Kommerzielle Werbung, Kooperationsanfragen oder jegliche Werbebotschaften sind ausdrücklich untersagt</strong>{" "}
        und werden nicht beantwortet.
      </p>
      <p className="mt-8 text-gray-400">
        Erstellt mit dem kostenlosen{" "}
        <a href="https://datenschutz-generator.de/" target="_blank" rel="noopener noreferrer nofollow" className="text-gray-400 hover:text-gray-300">
          Datenschutz-Generator.de
        </a>{" "}
        von Dr. Thomas Schwenke
      </p>
    </>
  );
}
