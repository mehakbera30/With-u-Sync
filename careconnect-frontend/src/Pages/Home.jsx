import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  FileText,
  Lock,
  Pill,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import PublicNavbar from "../components/PublicNavbar";
import Footer from "../components/Footer";
import siteConfig from "../config/siteConfig";
import AboutSection from "./sections/AboutSection";
import FaqSection from "./sections/FaqSection";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Easy appointment booking",
    text: "Pick a doctor, choose a date and time, and keep track of upcoming and past visits in one place.",
  },
  {
    icon: FileText,
    title: "Medical reports",
    text: "Upload lab results and scans, and let your doctor review them without paper copies.",
  },
  {
    icon: Pill,
    title: "Digital prescriptions",
    text: "See every medicine, dosage and instruction your doctor has prescribed, always up to date.",
  },
  {
    icon: Activity,
    title: "Health vitals",
    text: "Doctors can record vitals such as blood pressure and heart rate so progress is easy to follow.",
  },
  {
    icon: Bell,
    title: "Timely notifications",
    text: "Get notified when an appointment is confirmed or a prescription is added or updated.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Patients and doctors each see only what they need, and nothing more.",
  },
];

const STEPS = [
  {
    title: "Create your account",
    text: "Sign up as a patient in a minute. Doctors register too and are approved by our team.",
  },
  {
    title: "Book and consult",
    text: "Choose a doctor, book a slot, and share any reports your doctor should see before the visit.",
  },
  {
    title: "Follow your care",
    text: "Find prescriptions, reports and appointment history together whenever you need them.",
  },
];

const ROLES = [
  {
    icon: UserRound,
    title: "For patients",
    points: [
      "Book, view and cancel appointments",
      "Upload and manage your reports",
      "View prescriptions from your doctor",
      "Track everything on a calendar",
    ],
    cta: { to: "/register", label: "Sign up as a patient" },
  },
  {
    icon: Stethoscope,
    title: "For doctors",
    points: [
      "See today's appointments at a glance",
      "Review patient reports and history",
      "Write and update prescriptions",
      "Record patient vitals",
    ],
    cta: { to: "/register", label: "Join as a doctor" },
  },
];

const Home = () => {
  const { hash } = useLocation();

  // Opening /#about or /#faq scrolls straight to that section
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView();
  }, [hash]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100">
      <PublicNavbar />

      <main>
        {/* ================= HERO ================= */}
        <section id="home" className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 text-sm font-medium">
                Healthcare portal
              </span>

              <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-slate-900 dark:text-white">
                {siteConfig.tagline}
              </h1>

              <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                {siteConfig.description} Patients and doctors work together on one
                connected platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register" className="px-7 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm transition">
                  Create free account
                </Link>

                <Link to="/login" className="px-7 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-slate-800 transition">
                  Login
                </Link>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
                {["No paperwork", "Works on phone and desktop", "Role-based security"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-teal-600" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Visual */}
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-teal-100 dark:border-slate-800 shadow-xl p-5 sm:p-8">
                <img
                  src="/withusync-logo.png"
                  alt={siteConfig.name}
                  className="w-36 h-36 sm:w-48 sm:h-48 mx-auto object-contain"
                />

                <div className="mt-6 grid grid-cols-1 min-[380px]:grid-cols-3 gap-3 text-center">
                  {[
                    { icon: CalendarDays, label: "Appointments" },
                    { icon: FileText, label: "Reports" },
                    { icon: Pill, label: "Prescriptions" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-teal-50 dark:bg-slate-800 py-4 px-2"
                    >
                      <Icon size={22} className="mx-auto text-teal-600" />
                      <p className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEATURES ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Everything you need, in one place
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              From the first booking to the latest prescription, {siteConfig.name} keeps your care organised.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md transition"
              >
                <span className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 flex items-center justify-center">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white">
              How it works
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title} className="text-center md:text-left">
                  <span className="inline-flex w-12 h-12 rounded-full bg-teal-600 text-white text-lg font-bold items-center justify-center">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= ROLES ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-900 dark:text-white">
            One platform, two sides of care
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {ROLES.map(({ icon: Icon, title, points, cta }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col"
              >
                <span className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Icon size={24} />
                </span>

                <h3 className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">
                  {title}
                </h3>

                <ul className="mt-4 space-y-3 flex-1">
                  {points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle2 size={18} className="text-teal-600 mt-0.5 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>

                <Link to={cta.to} className="mt-6 inline-block text-center px-5 py-3 rounded-xl border border-teal-600 text-teal-700 dark:text-teal-300 font-semibold hover:bg-teal-50 dark:hover:bg-slate-800 transition">{cta.label}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* ================= ABOUT + FAQ (same page) ================= */}
        <AboutSection />
        <FaqSection />

        {/* ================= CTA ================= */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
          <div className="rounded-3xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 sm:px-12 py-12 text-center">
            <Lock size={30} className="mx-auto opacity-90" />

            <h2 className="mt-4 text-3xl font-bold">Ready to get started?</h2>

            <p className="mt-3 max-w-2xl mx-auto text-teal-50">
              Create an account to book your first appointment, or read the
              frequently asked questions to learn more.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="px-7 py-3.5 rounded-xl bg-white text-teal-700 font-semibold hover:bg-teal-50 transition">
                Create free account
              </Link>

              <a href="#faq" className="px-7 py-3.5 rounded-xl border border-white/70 text-white font-semibold hover:bg-white/10 transition">Read the FAQ</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
