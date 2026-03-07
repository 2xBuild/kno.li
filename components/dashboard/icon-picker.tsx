"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Code } from "lucide-react";
import {
  getAllIcons,
  getCanonicalIconSpec,
  getIconPackCode,
  ICON_PACK_OPTIONS,
  type IconPackCode,
} from "@/lib/icons";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const ALL_LIBRARIES = "ALL";
const MAX_VISIBLE = 120;

interface IconPickerProps {
  value: string;
  onChange: (spec: string) => void;
  placeholder?: string;
}

export function IconPicker({ value, onChange, placeholder = "Pick icon…" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activePack, setActivePack] = useState<IconPackCode | typeof ALL_LIBRARIES>(
    () => getIconPackCode(value) ?? ALL_LIBRARIES,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const allIcons = useMemo(() => getAllIcons(), []);
  const countsByPack = useMemo(() => {
    const counts = new Map<IconPackCode, number>();
    for (const entry of allIcons) {
      counts.set(entry.pack, (counts.get(entry.pack) ?? 0) + 1);
    }
    return counts;
  }, [allIcons]);

  const filtered = useMemo(() => {
    if (!search.trim() && activePack === ALL_LIBRARIES) return [];

    const q = search.toLowerCase();
    const matches: typeof allIcons = [];
    for (const entry of allIcons) {
      if (activePack !== ALL_LIBRARIES && entry.pack !== activePack) continue;
      if (q && !entry.searchText.includes(q)) continue;
      matches.push(entry);
      if (matches.length >= MAX_VISIBLE) break;
    }
    return matches;
  }, [activePack, allIcons, search]);

  const canonicalValue = useMemo(
    () => getCanonicalIconSpec(value) ?? value.trim(),
    [value],
  );
  const selectedEntry = useMemo(
    () => allIcons.find((entry) => entry.spec === canonicalValue),
    [allIcons, canonicalValue],
  );
  const ResolvedIcon = selectedEntry?.Icon;
  const activePackLabel =
    activePack === ALL_LIBRARIES
      ? "All libraries"
      : ICON_PACK_OPTIONS.find((pack) => pack.code === activePack)?.label ?? activePack;

  const handleSelect = useCallback(
    (spec: string) => {
      onChange(spec);
      setActivePack(getIconPackCode(spec) ?? ALL_LIBRARIES);
      setOpen(false);
      setSearch("");
    },
    [onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {ResolvedIcon ? (
            <ResolvedIcon className="size-4 shrink-0" />
          ) : (
            <Code className="size-4 shrink-0 text-muted-foreground" />
          )}
          <span className={value ? "" : "text-muted-foreground"}>
            {value || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[26rem] p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="border-b border-border p-2">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icons or brands…"
            className="h-8 text-xs"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-border p-2">
          <button
            type="button"
            onClick={() => setActivePack(ALL_LIBRARIES)}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              activePack === ALL_LIBRARIES
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            All
          </button>
          {ICON_PACK_OPTIONS.map((pack) => (
            <button
              key={pack.code}
              type="button"
              onClick={() => setActivePack(pack.code)}
              title={pack.label}
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                activePack === pack.code
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {pack.code}
              <span className="ml-1 text-[10px] opacity-70">
                {countsByPack.get(pack.code) ?? 0}
              </span>
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between border-b border-border px-3 py-2 text-[11px] text-muted-foreground">
          <span>{activePackLabel}</span>
          <span>
            {filtered.length >= MAX_VISIBLE ? `First ${MAX_VISIBLE} matches` : `${filtered.length} matches`}
          </span>
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto p-2">
          {!search.trim() && activePack === ALL_LIBRARIES && (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              Search across every supported pack, or choose a library above to browse.
            </p>
          )}
          {filtered.map((entry) => {
            const isSelected = entry.spec === canonicalValue;
            return (
              <button
                key={entry.spec}
                type="button"
                title={entry.spec}
                onClick={() => handleSelect(entry.spec)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-accent",
                  isSelected && "bg-accent ring-1 ring-ring",
                )}
              >
                <entry.Icon className="size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{entry.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{entry.spec}</p>
                </div>
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {entry.pack}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (search.trim() || activePack !== ALL_LIBRARIES) && (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No icons found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
