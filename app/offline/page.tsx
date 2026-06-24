import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-xl font-bold text-foreground">You're offline</h1>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Glint needs an internet connection to load your latest trades and AI
        insights. Reconnect and try again.
      </p>
    </div>
  );
}
