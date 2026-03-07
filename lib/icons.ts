import * as BiIcons from "react-icons/bi";
import * as Fa6Icons from "react-icons/fa6";
import * as LuIcons from "react-icons/lu";
import * as MdIcons from "react-icons/md";
import * as RiIcons from "react-icons/ri";
import * as SiIcons from "react-icons/si";
import * as TbIcons from "react-icons/tb";
import type { IconType } from "react-icons";

export type IconPackCode = "SI" | "BI" | "LU" | "FA6" | "MD" | "RI" | "TB";

interface IconPackDefinition {
  code: IconPackCode;
  label: string;
  reactPrefix: string;
  namespace: Record<string, IconType | undefined>;
}

interface IconLookup {
  pack: IconPackDefinition;
  rawName: string;
  Icon: IconType;
}

export interface IconPackOption {
  code: IconPackCode;
  label: string;
}

export interface IconEntry {
  /** Spec string to store: "SI Github", "LU FileText", etc. */
  spec: string;
  /** Human-readable label for search and browsing: "Github", "File Text" */
  label: string;
  /** Raw component suffix used in the stored spec, e.g. "Github" */
  rawName: string;
  /** Library code shown in the picker. */
  pack: IconPackCode;
  /** Human-readable library name. */
  packLabel: string;
  /** Precomputed search text for fuzzy matching. */
  searchText: string;
  /** The component */
  Icon: IconType;
}

const ICON_PACKS: readonly IconPackDefinition[] = [
  {
    code: "SI",
    label: "Simple Icons",
    reactPrefix: "Si",
    namespace: SiIcons as Record<string, IconType | undefined>,
  },
  {
    code: "BI",
    label: "BoxIcons",
    reactPrefix: "Bi",
    namespace: BiIcons as Record<string, IconType | undefined>,
  },
  {
    code: "LU",
    label: "Lucide",
    reactPrefix: "Lu",
    namespace: LuIcons as Record<string, IconType | undefined>,
  },
  {
    code: "FA6",
    label: "Font Awesome 6",
    reactPrefix: "Fa6",
    namespace: Fa6Icons as Record<string, IconType | undefined>,
  },
  {
    code: "MD",
    label: "Material Design",
    reactPrefix: "Md",
    namespace: MdIcons as Record<string, IconType | undefined>,
  },
  {
    code: "RI",
    label: "Remix Icon",
    reactPrefix: "Ri",
    namespace: RiIcons as Record<string, IconType | undefined>,
  },
  {
    code: "TB",
    label: "Tabler",
    reactPrefix: "Tb",
    namespace: TbIcons as Record<string, IconType | undefined>,
  },
];

export const ICON_PACK_OPTIONS: readonly IconPackOption[] = ICON_PACKS.map(({ code, label }) => ({
  code,
  label,
}));

const DEFAULT_ICON_PACK = ICON_PACKS[0];
const PACK_BY_CODE = new Map(ICON_PACKS.map((pack) => [pack.code, pack]));
const ICON_PACKS_BY_CODE_LENGTH = [...ICON_PACKS].sort((a, b) => b.code.length - a.code.length);
const ICON_PACKS_BY_REACT_PREFIX_LENGTH = [...ICON_PACKS].sort(
  (a, b) => b.reactPrefix.length - a.reactPrefix.length,
);

let iconListCache: IconEntry[] | null = null;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function humanizeIconName(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-zA-Z])/g, "$1 $2")
    .replace(/[._-]+/g, " ")
    .trim();
}

function normalizeComponentSuffix(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";

  if (!/[\s/_.-]/.test(trimmed)) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  return trimmed
    .split(/[\s/_.-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function stripKnownPrefixes(name: string, pack: IconPackDefinition): string {
  const withoutCode = name.replace(new RegExp(`^${escapeRegExp(pack.code)}\\s+`, "i"), "").trim();

  if (
    withoutCode.slice(0, pack.reactPrefix.length).toLowerCase() ===
      pack.reactPrefix.toLowerCase() &&
    /^[A-Z0-9]/.test(withoutCode.slice(pack.reactPrefix.length))
  ) {
    return withoutCode.slice(pack.reactPrefix.length).trim();
  }

  return withoutCode;
}

function toComponentKey(pack: IconPackDefinition, name: string): string {
  const suffix = normalizeComponentSuffix(stripKnownPrefixes(name, pack));
  return suffix ? `${pack.reactPrefix}${suffix}` : "";
}

function lookupInPack(pack: IconPackDefinition, name: string): IconLookup | undefined {
  const key = toComponentKey(pack, name);
  if (!key) return undefined;
  const Icon = pack.namespace[key];
  if (typeof Icon !== "function") return undefined;
  return {
    pack,
    rawName: key.slice(pack.reactPrefix.length),
    Icon,
  };
}

function parseIconSpec(
  spec: string,
): { pack: IconPackDefinition; name: string; explicit: boolean } | null {
  const trimmed = spec.trim();
  if (!trimmed) return null;

  const spacedMatch = trimmed.match(/^([a-z0-9]+)\s+(.+)$/i);
  if (spacedMatch) {
    const pack = PACK_BY_CODE.get(spacedMatch[1].toUpperCase() as IconPackCode);
    const name = spacedMatch[2]?.trim();
    if (pack && name) {
      return { pack, name, explicit: true };
    }
  }

  for (const pack of ICON_PACKS_BY_REACT_PREFIX_LENGTH) {
    if (
      trimmed.slice(0, pack.reactPrefix.length).toLowerCase() ===
        pack.reactPrefix.toLowerCase() &&
      /^[A-Z0-9]/.test(trimmed.slice(pack.reactPrefix.length))
    ) {
      return {
        pack,
        name: trimmed.slice(pack.reactPrefix.length),
        explicit: true,
      };
    }
  }

  for (const pack of ICON_PACKS_BY_CODE_LENGTH) {
    if (
      trimmed.slice(0, pack.code.length).toUpperCase() === pack.code &&
      /^[A-Z0-9]/.test(trimmed.slice(pack.code.length))
    ) {
      return {
        pack,
        name: trimmed.slice(pack.code.length),
        explicit: true,
      };
    }
  }

  return { pack: DEFAULT_ICON_PACK, name: trimmed, explicit: false };
}

function buildSearchText(pack: IconPackDefinition, rawName: string, label: string, spec: string): string {
  return [label, rawName, spec, pack.code, pack.label].join(" ").toLowerCase();
}

/**
 * Returns the full list of available icons across supported free packs.
 * Result is cached after first call.
 */
export function getAllIcons(): IconEntry[] {
  if (iconListCache) return iconListCache;

  const list: IconEntry[] = [];

  for (const pack of ICON_PACKS) {
    const packEntries = Object.entries(pack.namespace)
      .filter(
        ([key, component]) => typeof component === "function" && key.startsWith(pack.reactPrefix),
      )
      .sort(([a], [b]) => a.localeCompare(b));

    for (const [key, component] of packEntries) {
      const rawName = key.slice(pack.reactPrefix.length);
      if (!rawName) continue;
      const spec = `${pack.code} ${rawName}`;
      const label = humanizeIconName(rawName) || rawName;
      const Icon = component as IconType;
      list.push({
        spec,
        label,
        rawName,
        pack: pack.code,
        packLabel: pack.label,
        searchText: buildSearchText(pack, rawName, label, spec),
        Icon,
      });
    }
  }

  iconListCache = list;
  return list;
}

export function getIconPackCode(spec: string): IconPackCode | undefined {
  return resolveIcon(spec)?.pack.code ?? parseIconSpec(spec)?.pack.code;
}

function resolveIcon(spec: string): IconLookup | undefined {
  const parsed = parseIconSpec(spec);
  if (!parsed) return undefined;

  const candidates = parsed.explicit
    ? [parsed.pack, ...ICON_PACKS.filter((pack) => pack.code !== parsed.pack.code)]
    : ICON_PACKS;

  for (const pack of candidates) {
    const match = lookupInPack(pack, parsed.name);
    if (match) return match;
  }

  return undefined;
}

export function getCanonicalIconSpec(spec: string): string | undefined {
  const resolved = resolveIcon(spec);
  return resolved ? `${resolved.pack.code} ${resolved.rawName}` : undefined;
}

/**
 * Resolve a user icon spec to a react-icons component.
 * Supported formats include:
 * - "SI Github" / "SIGithub" / "Github"
 * - "LU FileText" / "LuFileText"
 * - "FA6 FilePdf" / "Fa6FilePdf"
 *
 * If a specific pack is requested but the icon does not exist there, we
 * fall back to the remaining supported packs with the same icon name so
 * older saved specs like "SI FileText" can still resolve.
 */
export function getIcon(spec: string): IconType | undefined {
  return resolveIcon(spec)?.Icon;
}
