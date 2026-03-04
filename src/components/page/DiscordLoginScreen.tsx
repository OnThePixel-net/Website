import Link from "next/link";
import SignInButton from "./SignInButton";

const DiscordIcon = () => (
  <svg className="w-8 h-8 text-[#5865F2]" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
  </svg>
);

interface DiscordLoginScreenProps {
  position: string;
  callbackUrl: string;
}

export default function DiscordLoginScreen({ position, callbackUrl }: DiscordLoginScreenProps) {
  return (
    <section className="bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <Link
            href="/apply"
            className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← Back to Positions
          </Link>
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-[#5865F2]/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <DiscordIcon />
            </div>
            <h1 className="text-2xl font-bold mb-3">Discord Login erforderlich</h1>
            <p className="text-gray-400 mb-6">
              Um dich als{" "}
              <span className="text-white font-medium">{position}</span> zu bewerben,
              musst du dich zuerst mit deinem Discord-Konto anmelden.
            </p>
            <SignInButton callbackUrl={callbackUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
