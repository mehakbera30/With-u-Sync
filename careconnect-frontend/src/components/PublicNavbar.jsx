import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { getStoredToken, getStoredUser } from "../services/api";
import siteConfig from "../config/siteConfig";

// These scroll to sections of the single Home page
const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About Us" },
  { id: "faq", label: "FAQ" },
];

const dashboardFor = (role) =>
  role === "admin"
    ? "/admin/dashboard"
    : role === "doctor"
    ? "/doctor/dashboard"
    : "/patient/dashboard";

const PublicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");

  // Highlight the link of the section currently on screen
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // If someone is already logged in, show a Dashboard button instead
  const user = getStoredToken() ? getStoredUser() : null;

  const linkClass = (id) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      active === id
        ? "text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-slate-800"
        : "text-slate-600 hover:text-teal-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* ============ Logo (left) ============ */}
        <a
          href="#home"
          className="flex items-center gap-3 min-w-0"
          onClick={() => setOpen(false)}
        >
          <span className="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-white border border-teal-200 flex items-center justify-center">
            <img
              src="/withusync-logo.png"
              alt={siteConfig.name}
              className="w-full h-full object-contain"
            />
          </span>

          {/* the name is hidden on very narrow phones to keep the buttons on screen */}
          <span className="hidden min-[400px]:block text-xl font-bold text-slate-800 dark:text-white">
            {siteConfig.name}
          </span>
        </a>

        {/* ============ Page links (centre, desktop) ============ */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((item) => (
            <a key={item.id} href={`#${item.id}`} className={linkClass(item.id)}>
              {item.label}
            </a>
          ))}
        </div>

        {/* ============ Login / Register (top right) ============ */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:block">
            <ThemeToggle />
          </div>

          {user ? (
            <Link
              to="/register"
              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition whitespace-nowrap"
            >
              Register
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition whitespace-nowrap"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition whitespace-nowrap"
              >
                <span className="sm:hidden">Sign up</span>
                <span className="hidden sm:inline">Create Account</span>
              </Link>
            </>
          )}

          {/* Menu button (phones and tablets only) */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="md:hidden w-10 h-10 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ============ Mobile menu panel ============ */}
      {open && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 space-y-1">
          {LINKS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-medium ${
                active === item.id
                  ? "text-teal-700 bg-teal-50 dark:text-teal-300 dark:bg-slate-800"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {item.label}
            </a>
          ))}

          <div className="pt-2 flex items-center justify-between px-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
