export type PortableMarathonTask = { itemId: string; episode?: number };

export type PortableMarathon = {
  name: string;
  description: string;
  tasks: PortableMarathonTask[];
};

type CompactPayload = {
  v: 1;
  n: string;
  d?: string;
  i: Array<[string] | [string, number]>;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function checksum(bytes: Uint8Array) {
  let hash = 0x811c9dc5;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0");
}

export function encodeMarathonCode(marathon: PortableMarathon) {
  if (!marathon.tasks.length) throw new Error("El maratón está vacío.");
  const payload: CompactPayload = {
    v: 1,
    n: marathon.name.trim().slice(0, 70) || "Maratón Nexus",
    ...(marathon.description.trim() ? { d: marathon.description.trim().slice(0, 160) } : {}),
    i: marathon.tasks.map((task) => task.episode ? [task.itemId, task.episode] : [task.itemId]),
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return `NXS1.${bytesToBase64Url(bytes)}.${checksum(bytes)}`;
}

export function decodeMarathonCode(code: string, validTitleIds?: ReadonlySet<string>): PortableMarathon {
  const clean = code.trim().replace(/\s+/g, "");
  const [prefix, encoded, expectedChecksum, ...extra] = clean.split(".");
  if (prefix !== "NXS1" || !encoded || !expectedChecksum || extra.length) throw new Error("El código no tiene un formato Nexus válido.");
  let bytes: Uint8Array;
  try { bytes = base64UrlToBytes(encoded); } catch { throw new Error("El código contiene caracteres inválidos."); }
  if (checksum(bytes) !== expectedChecksum.toUpperCase()) throw new Error("El código está incompleto o fue modificado.");
  let payload: CompactPayload;
  try { payload = JSON.parse(new TextDecoder().decode(bytes)) as CompactPayload; } catch { throw new Error("No se pudo leer el contenido del código."); }
  if (payload.v !== 1 || typeof payload.n !== "string" || !Array.isArray(payload.i) || !payload.i.length) throw new Error("Esta versión del código no es compatible.");
  if (payload.i.length > 1000) throw new Error("El maratón supera el límite de 1000 elementos.");
  const tasks = payload.i.map((entry) => {
    if (!Array.isArray(entry) || typeof entry[0] !== "string" || !entry[0]) throw new Error("El código contiene un título inválido.");
    if (validTitleIds && !validTitleIds.has(entry[0])) throw new Error(`El título ${entry[0]} no existe en este catálogo.`);
    const episode = entry[1];
    if (episode !== undefined && (!Number.isInteger(episode) || episode < 1 || episode > 1000)) throw new Error("El código contiene un capítulo inválido.");
    return { itemId: entry[0], ...(episode ? { episode } : {}) };
  });
  return { name: payload.n.slice(0, 70), description: (payload.d || "").slice(0, 160), tasks };
}
