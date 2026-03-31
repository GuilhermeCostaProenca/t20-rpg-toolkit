import type { ReactNode } from "react";

import { AppSidebar } from "@/components/app-sidebar";
import { Shell } from "@/components/shell";
import { Topbar } from "@/components/topbar";
import { SessionProvider } from "@/components/session/session-context";
import { CortexProvider } from "@/components/ai/cortex-provider";
import { CortexSheet } from "@/components/ai/cortex-sheet";
import { ImmersiveBackdrop } from "@/components/immersive-backdrop";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CortexProvider>
        <div className="app-shell relative min-h-screen">
          <ImmersiveBackdrop />
          <div className="relative z-10 flex min-h-screen">
            <AppSidebar />
            <div className="flex-1">
              <Topbar />
              <main>
                <Shell className="pt-6" fluid>{children}</Shell>
              </main>
            </div>
          </div>
          <CortexSheet />
        </div>
      </CortexProvider>
    </SessionProvider>
  );
}
