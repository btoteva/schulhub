/**
 * Защита на секцията "Седмична програма" с парола.
 * В кода се пази само SHA-256 хешът на паролата (не самата парола).
 * При "Запомни ме" се записва бисквитка в браузъра.
 *
 * За нова парола: генерирай хеш и го сложи в PASSWORD_HASH по-долу.
 * В терминал: node -e "const c=require('crypto');console.log(c.createHash('sha256').update('ТВОЯТА_ПАРОЛА').digest('hex'));"
 */

const PASSWORD_HASH =
  "b115f2aed27a5197d00eb6ecb1ff211f6bc18f0801546c194cbea47868901781";
const COOKIE_NAME = "weekly_program_auth";
const COOKIE_TOKEN = "wp_ok";
const COOKIE_DAYS = 365;

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function setCookie(name: string, value: string, days: number): void {
  const maxAge = days <= 0 ? "" : "; max-age=" + days * 24 * 60 * 60;
  const path = "; path=/";
  document.cookie =
    name + "=" + encodeURIComponent(value) + path + maxAge + "; SameSite=Lax";
}

function deleteCookie(name: string): void {
  document.cookie = name + "=; path=/; max-age=0";
}

export const weeklyProgramAuth = {
  isUnlocked(): boolean {
    return getCookie(COOKIE_NAME) === COOKIE_TOKEN;
  },

  /** Потребителят въвежда обикновената (некриптирана) парола; тук я хешираме и сравняваме с PASSWORD_HASH. */
  async checkPassword(password: string): Promise<boolean> {
    const hash = await sha256(password);
    return hash === PASSWORD_HASH;
  },

  setUnlocked(remember: boolean): void {
    if (remember) {
      setCookie(COOKIE_NAME, COOKIE_TOKEN, COOKIE_DAYS);
    }
  },

  clearUnlocked(): void {
    deleteCookie(COOKIE_NAME);
  },
};
