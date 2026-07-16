"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 bg-bg-card border border-border-default hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-500 text-text-secondary text-[14px] font-heading font-bold rounded-btn transition-colors shadow-sm flex items-center gap-2"
    >
      <span>🚪</span>
      <span>Sign Out</span>
    </button>
  );
}
