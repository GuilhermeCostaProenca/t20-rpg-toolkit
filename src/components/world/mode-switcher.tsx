"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Paintbrush, Presentation } from "lucide-react";

import { cn } from "@/lib/utils";

type ModeSwitcherProps = {
  worldId: string;
};

const modes = [
  {
    id: "normal",
    label: "Normal",
    href: (worldId: string) => `/app/worlds/${worldId}`,
    icon: LayoutDashboard,
  },
  {
    id: "lousa",
    label: "Lousa",
    href: (worldId: string) => `/app/worlds/${worldId}/lousa`,
    icon: Paintbrush,
  },
  {
    id: "quadro",
    label: "Quadro",
    href: (worldId: string) => `/app/worlds/${worldId}/quadro`,
    icon: Presentation,
  },
] as const;

export function ModeSwitcher({ worldId }: ModeSwitcherProps) {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-1 rounded-2xl border border-white/10 bg-black/35 p-1 backdrop-blur-xl">
      {modes.map((mode) => {
        const Icon = mode.icon;
        const href = mode.href(worldId);
        const isActive = pathname === href;

        return (
          <Link
            key={mode.id}
            href={href}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border border-primary/30 bg-primary/15 text-primary shadow-[0_0_16px_rgba(188,74,63,0.16)]"
                : "border border-transparent text-muted-foreground hover:border-white/10 hover:bg-white/8 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
