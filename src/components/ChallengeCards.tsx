import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StockLogo } from "@/components/StockLogo";
import { useWallet } from "@/contexts/WalletContext";
import { differenceInDays, differenceInHours } from "date-fns";
import { EmailGateModal } from "@/components/EmailGateModal";

interface Challenge {
  id: string;
  name: string;
  description: string;
  tickers: string[];
  prize: string;
  challenge_type: string;
  starts_at: string;
  ends_at: string;
  progress: string[];
  snapPhotos: Record<string, string>;
  completedCount: number;
  enrolled: boolean;
}

// Badge colors match design: weekly=green, food=orange, fashion=pink, grand=purple
const TYPE_CONFIG: Record<string, { label: string; badgeBg: string; badgeText: string; icon: string }> = {
  weekly:  { label: "Weekly",          badgeBg: "bg-green-50",  badgeText: "text-green-700",  icon: "⚡" },
  food:    { label: "Food & Drink",    badgeBg: "bg-orange-50", badgeText: "text-orange-700", icon: "🍔" },
  fashion: { label: "Fashion & Shoes", badgeBg: "bg-pink-50",   badgeText: "text-pink-700",   icon: "👟" },
  grand:   { label: "Grand Challenge", badgeBg: "bg-purple-50", badgeText: "text-purple-700", icon: "⭐" },
};

function timeLeft(endsAt: string): string {
  const end = new Date(endsAt);
  const days = differenceInDays(end, new Date());
  if (days > 0) return `${days}`;
  const hours = differenceInHours(end, new Date());
  return hours > 0 ? `${hours}h` : "—";
}

function timeLeftUnit(endsAt: string): string {
  const days = differenceInDays(new Date(endsAt), new Date());
  return days > 0 ? "days left" : "hours left";
}

function ChallengeCard({
  challenge,
  onEnroll,
  index,
}: {
  challenge: Challenge;
  onEnroll: (c: Challenge) => void;
  index: number;
}) {
  const config = TYPE_CONFIG[challenge.challenge_type] ?? TYPE_CONFIG.weekly;
  const found = challenge.progress.length;
  const total = challenge.tickers.length;
  const completed = found >= total;
  const pct = total > 0 ? (found / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="overflow-hidden rounded-[20px] bg-white shadow-sm"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* ── Card header ── */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${config.badgeBg} ${config.badgeText}`}>
          {config.icon} {config.label}
        </span>
        <span className="text-[16px] font-bold text-gray-900">{challenge.name}</span>
        {completed && (
          <span className="ml-auto shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
            🎉 In draw
          </span>
        )}
      </div>

      {/* ── 3-stat row — exact design spec ── */}
      {/* gap-px + bg-gray-100 creates 1px dividers between cells */}
      <div className="grid grid-cols-3 gap-px bg-gray-100 border-t border-b border-gray-100">
        {/* Days left */}
        <div className="flex flex-col items-center bg-white px-2.5 py-3 text-center">
          <span className="text-[15px] leading-none mb-0.5">⏱</span>
          <span className="text-[15px] font-bold text-gray-900 leading-tight">{timeLeft(challenge.ends_at)}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">{timeLeftUnit(challenge.ends_at)}</span>
        </div>
        {/* Found */}
        <div className="flex flex-col items-center bg-white px-2.5 py-3 text-center">
          <span className="text-[15px] leading-none mb-0.5">◎</span>
          <span className="text-[15px] font-bold text-gray-900 leading-tight">{found} / {total}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">Found</span>
        </div>
        {/* Prize — warm amber tint */}
        <div className="flex flex-col items-center bg-amber-50 px-2.5 py-3 text-center">
          <span className="text-[15px] leading-none mb-0.5">🏅</span>
          <span className="text-[15px] font-bold text-amber-700 leading-tight">{challenge.prize}</span>
          <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">Prize</span>
        </div>
      </div>

      {/* ── Brand chips ── */}
      <div className="flex flex-wrap gap-2 px-3.5 pt-3.5 pb-2">
        {challenge.tickers.map((ticker) => {
          const done = challenge.progress.includes(ticker);
          return (
            <div
              key={ticker}
              className={`flex items-center gap-1.5 rounded-full border-[1.5px] pl-1.5 pr-3 py-1 text-[13px] font-semibold transition-all select-none
                ${done
                  ? "border-green-400 bg-green-50 text-green-800"
                  : "border-gray-200 bg-white text-gray-700"
                }`}
            >
              <div className="h-[26px] w-[26px] shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                <StockLogo ticker={ticker} size="sm" className="h-[22px] w-[22px]" />
              </div>
              {ticker}
            </div>
          );
        })}
      </div>

      {/* ── Progress bar + label ── */}
      <div className="px-4 pb-1 pt-1">
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <p className="mt-1.5 text-[12px] text-gray-400">{found} / {total} found</p>
      </div>

      {/* ── Snap thumbnails ── */}
      {challenge.tickers.some((t) => challenge.snapPhotos?.[t]) && (
        <div className="px-3.5 pb-3 pt-1">
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {challenge.tickers
              .filter((t) => challenge.snapPhotos?.[t])
              .map((ticker) => (
                <div
                  key={ticker}
                  className="relative shrink-0 h-[68px] w-[68px] rounded-[12px] overflow-hidden"
                  style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.10)" }}
                >
                  <img
                    src={challenge.snapPhotos[ticker]}
                    alt={ticker}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent pt-4 pb-[5px] px-[5px]">
                    <span className="block text-[9px] font-bold text-white leading-none">{ticker}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      {!completed && (
        <div className="px-3.5 pb-4 pt-2">
          {challenge.enrolled ? (
            <div className="w-full rounded-[14px] bg-gray-50 border border-gray-200 py-3.5 text-center text-[15px] font-semibold text-gray-500">
              Tracking progress
            </div>
          ) : (
            <button
              onClick={() => onEnroll(challenge)}
              className="w-full rounded-[14px] bg-gray-900 py-[15px] text-[15px] font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              Join &amp; Track Progress
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function ChallengeCards() {
  const { address } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollTarget, setEnrollTarget] = useState<Challenge | null>(null);

  const load = () => {
    const url = address
      ? `/api/challenges?userId=${encodeURIComponent(address)}`
      : "/api/challenges";

    fetch(url)
      .then((r) => r.json())
      .then((data) => setChallenges(data.challenges ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [address]);

  if (loading) return (
    <div className="w-full max-w-md px-4 space-y-3.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-44 rounded-[20px] bg-white animate-pulse" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }} />
      ))}
    </div>
  );

  if (challenges.length === 0) return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-[20px] bg-white px-4 py-6 text-center text-sm text-gray-400" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        No active challenges right now — check back soon!
      </div>
    </div>
  );

  return (
    <>
      {/* Cards use mx-4 to match design's margin: 0 16px */}
      <div className="w-full max-w-md space-y-3.5 px-4">
        {challenges.map((c, i) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            onEnroll={setEnrollTarget}
            index={i}
          />
        ))}
      </div>

      {enrollTarget && (
        <EmailGateModal
          challenge={enrollTarget}
          onClose={() => setEnrollTarget(null)}
          onSuccess={() => {
            setEnrollTarget(null);
            load();
          }}
        />
      )}
    </>
  );
}
