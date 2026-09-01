export interface DeviceMetadata {
  ip: string | null;
  asn: string | null;
  os: string | null;
  timezone: string | null;
  pais: string | null;
  region: string | null;
  ciudad: string | null;
  locale: string | null;
}

interface IpifyResponse {
  ip: string;
}

interface IpAddressResponse {
  success: boolean;
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  asn: string;
  isp: string;
  proxy: boolean;
  tor: boolean;
  hosting: boolean;
}

function parseOS(userAgent: string): string | null {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod"))
    return "iOS";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macos")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return null;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function fetchIpInfo(): Promise<Partial<DeviceMetadata>> {
  try {
    const ipRes = await fetchWithTimeout("https://api.ipify.org/?format=json", 5000);
    if (!ipRes.ok) throw new Error(`IP fetch failed: ${ipRes.status}`);
    const { ip }: IpifyResponse = await ipRes.json();

    const geoRes = await fetchWithTimeout(`https://ipaddress.to/api/lookup/${ip}`, 5000);
    if (!geoRes.ok) throw new Error(`Geo fetch failed: ${geoRes.status}`);
    const geo: IpAddressResponse = await geoRes.json();

    if (!geo.success) throw new Error("Geo lookup failed");

    return {
      ip,
      asn: geo.asn ?? null,
      pais: geo.country ?? null,
      region: geo.region ?? null,
      ciudad: geo.city ?? null,
      timezone: geo.timezone ?? null,
    };
  } catch (_err) {
    return { ip: null, asn: null, pais: null, region: null, ciudad: null };
  }
}

export async function getDeviceMetadata(): Promise<DeviceMetadata> {
  const [ipInfo] = await Promise.all([fetchIpInfo()]);

  return {
    ...ipInfo,
    os: parseOS(navigator.userAgent),
    timezone: ipInfo.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    locale: navigator.language,
  };
}
