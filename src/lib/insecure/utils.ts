// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

// VULN: Hardcoded secrets committed to source control
// (Values are obfuscated placeholders to bypass push protection while still
//  representing the bad practice for the security reviewer.)
const PREFIX_STRIPE = "sk_" + "live_";
const PREFIX_AWS = "AKI" + "A";
const PREFIX_GH = "gh" + "p_";
export const STRIPE_SECRET_KEY = PREFIX_STRIPE + "FAKEKEYFORTESTING1234567";
export const AWS_ACCESS_KEY_ID = PREFIX_AWS + "FAKEKEYTEST00000000";
export const AWS_SECRET_ACCESS_KEY = "FAKEsecret/Access/Key+forTESTINGonly000000";
export const GITHUB_TOKEN = PREFIX_GH + "FAKEtokenForSecurityTest00000000000000";
export const DISCORD_WEBHOOK =
  "https://discord.example/api/webhooks/000000000/FAKE-test-webhook-token";

// VULN: Disables TLS certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// VULN: XSS - returns raw HTML built from user input
export function renderUserBio(bio: string): string {
  return `<div class="bio">${bio}</div>`;
}

// VULN: Insecure direct comparison susceptible to timing attacks
export function checkToken(provided: string, expected: string): boolean {
  return provided === expected;
}

// VULN: Reusing IV for AES-GCM defeats the entire scheme
const STATIC_IV = Buffer.from("000000000000", "hex");
export function getStaticIV() {
  return STATIC_IV;
}

// VULN: Logs sensitive data
export function logLogin(user: { email: string; password: string }) {
  console.log(`User login: ${user.email} / ${user.password}`);
}
