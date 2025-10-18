import React from "react";

const DashboardLayout = ({ sidebar, children }) => {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none absolute -right-32 top-0 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl dark:bg-teal-500/20" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />
      {sidebar}
      <div className="relative ml-64 flex min-h-screen w-full flex-col">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
