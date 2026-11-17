
import React from "react";
import { Activity, HeartPulse, Lock, ShieldCheck } from "lucide-react";
import siteConfig from "../../config/siteConfig";

const VALUES = [
  {
    icon: HeartPulse,
    title: "Patient first",
    text: "Booking a visit or finding a prescription should take a few taps, not phone calls and paper files.",
  },
  {
    icon: Lock,
    title: "Privacy by design",
    text: "Passwords are stored hashed, sessions use signed tokens, and every record is visible only to the people who need it.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted doctors",
    text: "Every doctor account is reviewed and approved by our team before it can see any patient.",
  },
  {
    icon: Activity,
    title: "Clear and simple",
    text: "A clean interface that works on phones, tablets and desktops, so care information is never out of reach.",
  },
];

const AboutSection = () => (
  <section id="about" className="bg-slate-50 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

      <div className="max-w-3xl mx-auto text-center">

        <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
          About {siteConfig.name}
        </h2>

        <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {siteConfig.name} connects patients and doctors on one secure
          platform, so appointments, reports and prescriptions are never
          scattered across paper files and phone calls.
        </p>
      </div>

      {/* Mission + What you can do */}
      <div className="mt-12 grid gap-6 md:grid-cols-2">

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Our mission
          </h3>

          <p className="mt-3 text-slate-600 dark:text-slate-400 leading-relaxed">
            We want healthcare paperwork to get out of the way. Patients should
            know what is scheduled and what was prescribed. Doctors should see
            the right information before a consultation starts.
          </p>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            What you can do
          </h3>

          <ul className="mt-3 space-y-2 text-slate-600 dark:text-slate-400">
            <li>• Book, view and cancel appointments online</li>
            <li>• Upload medical reports for your doctor to review</li>
            <li>• Keep every prescription with dosage and instructions</li>
            <li>• Follow vitals and visit history over time</li>
          </ul>
        </div>

      </div>

      {/* Values */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
          >
            <span className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-slate-800 text-teal-600 flex items-center justify-center">
              <Icon size={22} />
            </span>

            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              {title}
            </h3>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>

    </div>
  </section>
);

export default AboutSection;
