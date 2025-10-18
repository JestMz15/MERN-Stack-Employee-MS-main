import React from "react";

const colorTokens = {
  teal: {
    icon: "bg-teal-500/20 text-teal-600 dark:bg-teal-500/20 dark:text-teal-200",
    halo: "bg-teal-500/10",
  },
  amber: {
    icon: "bg-amber-400/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-200",
    halo: "bg-amber-400/10",
  },
  rose: {
    icon: "bg-rose-500/20 text-rose-600 dark:bg-rose-500/20 dark:text-rose-200",
    halo: "bg-rose-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200",
    halo: "bg-emerald-500/10",
  },
  sky: {
    icon: "bg-sky-500/20 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200",
    halo: "bg-sky-500/10",
  },
  violet: {
    icon: "bg-violet-500/20 text-violet-600 dark:bg-violet-500/20 dark:text-violet-200",
    halo: "bg-violet-500/10",
  },
};

const SummaryCard = ({ icon, text, number, accent = "teal" }) => {
  const palette = colorTokens[accent] ?? colorTokens.teal;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/70 dark:shadow-none">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full ${palette.halo}`} />
      <div className={`absolute -bottom-12 -left-16 h-36 w-36 rounded-full ${palette.halo}`} />
      <div className="relative flex flex-col gap-4">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold ${palette.icon}`}
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {text}
          </p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{number}</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
