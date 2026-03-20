import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
  className?: string;
  fluid?: boolean;
};

export function Shell({ children, className, fluid }: ShellProps) {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-4 rounded-[36px] border border-white/5 bg-gradient-to-b from-white/5 via-transparent to-transparent opacity-60 blur-3xl" />
      <div
        className={cn(
          "relative mx-auto w-full px-5 pb-14 pt-6 sm:px-6 xl:px-8 2xl:px-10",
          fluid ? "max-w-[1840px]" : "max-w-[1440px]",
          "backdrop-blur-xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
