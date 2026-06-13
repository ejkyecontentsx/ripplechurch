"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/routing";
import RippleLogo from "./RippleLogo";
import LanguageSwitcher from "./LanguageSwitcher";

const navItems = [
  { href: "/scripture" as const, key: "scripture" as const },
  { href: "/weekly" as const, key: "weekly" as const },
  { href: "/testimony" as const, key: "testimony" as const },
  { href: "/join" as const, key: "join" as const },
  { href: "/about" as const, key: "about" as const },
];

export default function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <RippleLogo className="h-10 w-auto" showText={false} animated={false} />
          <span className="hidden text-sm font-semibold tracking-wide text-foreground sm:inline">
            RIPPLE CHURCH
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => {
              const isActive =
                item.href === "/weekly"
                  ? pathname === "/weekly" || pathname.startsWith("/weekly/")
                  : pathname === item.href;

              return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm transition-colors hover:text-accent ${
                    isActive ? "font-medium text-accent" : "text-muted"
                  }`}
                >
                  {t(item.key)}
                </Link>
              </li>
              );
            })}
          </ul>
          <LanguageSwitcher />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher compact />
          <button
            type="button"
            className="flex flex-col gap-1.5 p-2"
            aria-label={t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            <span
              className={`block h-0.5 w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
            />
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/weekly"
                  ? pathname === "/weekly" || pathname.startsWith("/weekly/")
                  : pathname === item.href;

              return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block text-base ${
                    isActive ? "font-medium text-accent" : "text-muted"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {t(item.key)}
                </Link>
              </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
