"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { LogOut, ShoppingBag, User, UtensilsCrossed } from "lucide-react";
import { selectCartCount, useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const { data: session, status } = useSession();
  const cartCount = useCartStore(selectCartCount);

  // localStorage only exists in the browser — suppress the badge until after
  // hydration so server and client markup match.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const itemCount = mounted ? cartCount : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-paper/10 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="FoodDash home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-chip bg-chili text-ink transition group-hover:rotate-[-6deg]">
            <UtensilsCrossed className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-xl uppercase text-paper">
              FoodDash
            </span>
            <span className="mt-0.5 flex items-center gap-1 font-mono text-[10px] text-haze">
              <span className="h-1.5 w-1.5 rounded-round bg-neon motion-reduce:animate-none animate-pulse" />
              open late
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/restaurants"
            className="hidden rounded-chip px-3 py-2 text-sm font-medium text-paper/70 transition hover:text-neon sm:block"
          >
            Stalls
          </Link>

          <Link
            href="/checkout"
            className="relative rounded-chip px-3 py-2 text-paper/70 transition hover:text-paper"
            aria-label={`Cart, ${itemCount} items`}
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-round border border-ink bg-chili px-1 font-mono text-[11px] font-bold text-ink">
                {itemCount > 99 ? "99+" : itemCount}
              </span>
            )}
          </Link>

          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="hidden items-center gap-2 rounded-chip border border-paper/15 px-3 py-1.5 font-mono text-xs text-paper/80 md:flex">
                <User className="h-3.5 w-3.5 text-neon" />
                {session.user.name}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 rounded-chip px-3 py-2 text-sm font-medium text-haze transition hover:bg-charcoal hover:text-paper"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="btn-primary !rounded-chip !px-4 !py-2 !text-sm"
            >
              Sign in
            </Link>
          ) : (
            <span className="h-9 w-20 animate-pulse rounded-chip bg-charcoal motion-reduce:animate-none" />
          )}
        </nav>
      </div>
    </header>
  );
}
