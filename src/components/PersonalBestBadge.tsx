import { memo } from "react";
import { Trophy } from "lucide-react";

export const PersonalBestBadge = memo(function PersonalBestBadge({ wpm }: { wpm: number }) {
  if (wpm <= 0) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]">
      <Trophy className="h-3.5 w-3.5" />
      PB: {wpm} WPM
    </div>
  );
});
