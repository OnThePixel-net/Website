import { LocaleLink } from "@/components/LocaleLink";
import Image from "next/image";
import BackToTopButton from "@/components/page/BackToTopButton";
import CookieSettingsButton from "@/components/cookie-settings-button";
import { LanguageSwitcher } from "@/components/page/LanguageSwitcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/lib/i18n/translations";
// Tabler brand glyphs, re-published by react-icons. Same artwork as
// @tabler/icons-react, but from the icon package the rest of the site already
// ships, so the footer no longer drags a fourth icon library into the layout
// bundle.
import {
  TbBrandX,
  TbBrandDiscord,
  TbBrandTwitch,
  TbBrandYoutube,
} from "react-icons/tb";

// Server component. Everything here is static markup around three client
// islands (LanguageSwitcher, CookieSettingsButton, BackToTopButton), so none
// of it needs to be shipped to the browser.
export default async function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  return (
    <footer className="px-4 py-12 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
          <div className="hidden md:col-span-2 md:block">
            <div className="mb-4 flex items-center">
              <LocaleLink href={"/"}>
                <Image
                  className="mr-2 text-3xl font-bold"
                  src={"/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"}
                  alt="OnThePixel.net"
                  width={40}
                  height={40}
                  sizes="40px"
                />
              </LocaleLink>
            </div>
            <h2 className="mb-2 text-xl font-bold">OnThePixel.net®</h2>
            <div className="mb-4 text-sm">{t.footer.followUs}</div>
            <div className="flex space-x-4">
              <LocaleLink
                href="https://x.com/onthepixelnet"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
                aria-label="Twitter"
              >
                <TbBrandX size={20} aria-hidden="true" />
              </LocaleLink>
              <LocaleLink
                href="https://discord.com/invite/Dpx3eK9t3z"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
                aria-label="Discord"
              >
                <TbBrandDiscord size={20} aria-hidden="true" />
              </LocaleLink>
              <LocaleLink
                href="https://twitch.tv/onthepixel"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
                aria-label="Twitch"
              >
                <TbBrandTwitch size={20} aria-hidden="true" />
              </LocaleLink>
              <LocaleLink
                href="https://youtube.com/@thebestminecraftserver"
                rel="noopener noreferrer"
                target="_blank"
                className="text-gray-400 hover:text-green-500"
                aria-label="YouTube"
              >
                <TbBrandYoutube size={20} aria-hidden="true" />
              </LocaleLink>
            </div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">{t.footer.sectionOnThePixel}</h3>
            <ul className="space-y-2">
              <li>
                <LocaleLink
                  href="/about"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.aboutUs}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/team"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.meetTheTeam}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/creators"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.creators}
                </LocaleLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">{t.footer.sectionGames}</h3>
            <ul className="space-y-2">
              <li>
                <LocaleLink
                  href="/bedwars"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.bedWars}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/buildffa"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.buildFFA}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/tntrun"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.tntRun}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/sidequests"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.sideQuests}
                </LocaleLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">{t.footer.sectionResources}</h3>
            <ul className="space-y-2">
              <li>
                <LocaleLink
                  href="/leaderboard"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.leaderboard}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/stats"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.statistics}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://status.onthepixel.net"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.status}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/api-docs/"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.api}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/imprint"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.imprint}
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="/privacy"
                  className="text-gray-400 hover:text-green-500"
                >
                  {t.footer.privacy}
                </LocaleLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">{t.footer.sectionFollowUs}</h3>
            <ul className="space-y-2">
              <li>
                <LocaleLink
                  href="https://youtube.com/@thebestminecraftserver"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  YouTube
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://twitch.tv/onthepixel"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Twitch
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://discord.com/invite/Dpx3eK9t3z"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Discord
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://www.tiktok.com/@onthepixel"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  TikTok
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://www.instagram.com/onthepixel_net"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Instagram
                </LocaleLink>
              </li>
              <li>
                <LocaleLink
                  href="https://x.com/onthepixelnet"
                  rel="noopener noreferrer"
                  target="_blank"
                  className="text-gray-400 hover:text-green-500"
                >
                  Twitter
                </LocaleLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 block md:col-span-2 md:hidden">
          <div className="mb-4 flex items-center">
            <LocaleLink href={"/"}>
              <Image
                className="mr-2 text-3xl font-bold"
                src={"/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"}
                alt="OnThePixel.net"
                width={40}
                height={40}
                sizes="40px"
              />
            </LocaleLink>
          </div>
          <h2 className="mb-2 text-xl font-bold">OnThePixel.net®</h2>
          <div className="mb-4 text-sm">Follow Us</div>
          <div className="flex space-x-4">
            <LocaleLink
              href="https://x.com/onthepixelnet"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
              aria-label="Twitter"
            >
              <TbBrandX size={20} aria-hidden="true" />
            </LocaleLink>
            <LocaleLink
              href="https://discord.com/invite/Dpx3eK9t3z"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
              aria-label="Discord"
            >
              <TbBrandDiscord size={20} aria-hidden="true" />
            </LocaleLink>
            <LocaleLink
              href="https://twitch.tv/onthepixel"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
              aria-label="Twitch"
            >
              <TbBrandTwitch size={20} aria-hidden="true" />
            </LocaleLink>
            <LocaleLink
              href="https://youtube.com/@thebestminecraftserver"
              rel="noopener noreferrer"
              target="_blank"
              className="text-gray-400 hover:text-green-500"
              aria-label="YouTube"
            >
              <TbBrandYoutube size={20} aria-hidden="true" />
            </LocaleLink>
          </div>
        </div>
        <div className="mt-8 flex w-full flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 md:flex-row">
          <p className="mb-4 text-sm text-gray-400 md:mb-0">
            Copyright &copy; 2022-{new Date().getFullYear()} OnThePixel.net® -{" "}
            {t.footer.copyright}
            <CookieSettingsButton />
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <BackToTopButton label={t.footer.backToTop} />
          </div>
        </div>
      </div>
    </footer>
  );
}
