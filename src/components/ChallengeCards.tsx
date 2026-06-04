import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Zap, Trophy, Star, Utensils, ShoppingBag } from "lucide-react";
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
  completedCount: number;
  enrolled: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; accent: string; iconBg: string; icon: typeof Zap }> = {
  weekly:  { label: "Weekly",          accent: "text-emerald-600", iconBg: "bg-emerald-50", icon: Zap },
  food:    { label: "Food & Drink",    accent: "text-orange-600",  iconBg: "bg-orange-50",  icon: Utensils },
  fashion: { label: "Fashion & Shoes", accent: "text-pink-600",    iconBg: "bg-pink-50",    icon: ShoppingBag },
  grand:   { label: "Grand Challenge", accent: "text-purple-600",  iconBg: "bg-purple-50",  icon: Star },
};

function timeLeft(endsAt: string): string {
  const end = new Date(endsAt);
  const days = differenceInDays(end, new Date());
  if (days > 1) return `${days}d`;
  const hours = differenceInHours(end, new Date());
  if (hours > 0) return `${hours}h`;
  return "ending";
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
  const Icon = config.icon;
  const found = challenge.progress.length;
  const total = challenge.tickers.length;
  const completed = found >= total;
  const pct = total > 0 ? (found / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${config.iconBg}`}>
          <Icon className={`h-4 w-4 ${config.accent}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{config.label}</p>
          <p className="text-sm font-bold text-gray-900 leading-tight">{challenge.name}</p>
        </div>
        {completed && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
            🎉 In draw
          </span>
        )}
      </div>

      {/* ── 3-stat row ── */}
      <div className="mx-4 mb-3 grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-gray-50">
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-medium text-gray-400 mb-0.5">Prize</span>
          <span className={`text-xs font-bold ${config.accent} text-center leading-tight`}>{challenge.prize}</span>
        </div>
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-medium text-gray-400 mb-0.5">Time left</span>
          <span className="text-sm font-bold text-gray-900">{timeLeft(challenge.ends_at)}</span>
        </div>
        <div className="flex flex-col items-center py-2.5 px-2">
          <span className="text-[10px] font-medium text-gray-400 mb-0.5">Completed</span>
          <span className="text-sm font-bold text-gray-900">{challenge.completedCount}</span>
        </div>
      </div>

      {/* ── Ticker pills ── */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {challenge.tickers.map((ticker) => {
          const done = challenge.progress.includes(ticker);
          return (
            <div
              key={ticker}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border transition-colors
                ${done
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                  : "bg-gray-50 border-gray-200 text-gray-400"
                }`}
            >
              {done
                ? <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                : <Circle className="h-3 w-3 text-gray-300 shrink-0" />
              }
              <StockLogo ticker={ticker} size="sm" className="h-3 w-3" />
              {ticker}
            </div>
          );
        })}
      </div>

      {/* ── Progress + action ── */}
      <div className="px-4 pb-4">
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-gray-400">
          <span>{found} / {total} found</span>
          {challenge.enrolled && !completed && (
            <span className="text-emerald-600 font-medium">Tracking</span>
          )}
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {!challenge.enrolled && !completed && (
          <button
            onClick={() => onEnroll(challenge)}
            className="mt-3 w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 active:scale-[0.98] transition-all"
          >
            Join & Track
          </button>
        )}
      </div>
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
    <div className="w-full max-w-md px-4 space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-40 rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse" />
      ))}
    </div>
  );

  if (challenges.length === 0) return (
    <div className="w-full max-w-md px-4">
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-6 text-center text-sm text-gray-400">
        No active challenges right now — check back soon!
      </div>
    </div>
  );

  return (
    <>
      <div className="w-full max-w-md px-4 space-y-3">
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
