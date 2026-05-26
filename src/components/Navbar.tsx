"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import RippleLogo from "./RippleLogo";

const navItems = [
  { href: "/scripture", label: "경전" },
  { href: "/join", label: "입교" },
  { href: "/testimony", label: "간증" },
  { href: "/about", label: "소개" },
];

export default function Navbar() {
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

        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`text-sm transition-colors hover:text-accent ${
                  pathname === item.href ? "font-medium text-accent" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="메뉴 열기"
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
      </nav>

      {open && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block text-base ${
                    pathname === item.href ? "font-medium text-accent" : "text-muted"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
