import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import siteConfig from "../../config/siteConfig";

const CATEGORIES = ["All", "Getting started", "Patients", "Doctors", "Security"];

const FAQS = [
  {
    category: "Getting started",
    q: `What is ${siteConfig.name}?`,
    a: `${siteConfig.name} is a healthcare portal where patients and doctors work together. Patients book appointments and keep their reports and prescriptions in one place, and doctors manage their consultations, patient records and prescriptions.`,
  },
  {
    category: "Getting started",
    q: "How do I create an account?",
    a: "Choose Create Account at the top of the page, pick Patient or Doctor, and fill in your details. Patients can log in straight away. Doctor accounts are reviewed and approved by our team before they can log in.",
  },
  {
    category: "Getting started",
    q: "Is it for medical emergencies?",
    a: "No. The portal is for planning and managing care, not for emergencies. If you need urgent help, call your local emergency number (112 in India) or go to the nearest hospital.",
  },
  {
    category: "Patients",
    q: "How do I book an appointment?",
    a: "Log in, open Appointments, and choose Book Appointment. Select a doctor, pick a date and time, and confirm. The appointment appears in your upcoming list and on your calendar.",
  },
  {
    category: "Patients",
    q: "Can I cancel an appointment?",
    a: "Yes. Open Appointments, find the upcoming appointment, and cancel it from there. You can then book a new time with the same or a different doctor.",
  },
  {
    category: "Patients",
    q: "How do I upload a medical report?",
    a: "Go to Reports and choose Upload Report. You can upload PDF, JPG or PNG files up to 5 MB. Your doctor can then open and review the report.",
  },
  {
    category: "Patients",
    q: "Where do I find my prescriptions?",
    a: "Open Prescriptions to see every prescription your doctor has written, with each medicine, dosage, frequency and instructions. You can remove a prescription from your own list at any time, which does not delete your doctor's record.",
  },
  {
    category: "Doctors",
    q: "How do I join as a doctor?",
    a: "Create an account and choose Doctor. Our team reviews it, and you can log in once it is approved. Until then you cannot log in and will not appear in the doctor list for patients.",
  },
  {
    category: "Doctors",
    q: "What can doctors do on the platform?",
    a: "Doctors see their appointments, review patient reports and history, write and update prescriptions (including adding or editing individual medicines), and record patient vitals.",
  },
  {
    category: "Security",
    q: "I forgot my password. What should I do?",
    a: "Choose Forgot Password on the login page and enter your registered email. We send you a reset link that works for 15 minutes and can be used only once.",
  },
  {
    category: "Security",
    q: "Is my information secure?",
    a: "Passwords are stored in hashed form, sessions use signed tokens, and each account only sees the data it needs. Doctors can only open patients assigned to them. No system is perfectly secure, so please never share your password with anyone.",
  },
  {
    category: "Security",
    q: "Who can see my reports and prescriptions?",
    a: "You and the doctor responsible for your care. Authorised platform staff may access records only as needed to run the service. Other patients and other doctors cannot see them.",
  },
];

const FaqSection = () => {
  const [category, setCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(0);

  const visible = FAQS.filter((item) => category === "All" || item.category === category);

  return (
    <section id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">FAQ</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Quick answers about booking, records, accounts and security.
          </p>
        </div>

        {/* Category filter */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCategory(item);
                setOpenIndex(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                category === item
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Questions */}
        <div className="mt-8 space-y-3">
          {visible.map((item, index) => {
            const open = openIndex === index;

            return (
              <div
                key={item.q}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-teal-600 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <p className="px-5 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Still need help */}
        <div className="mt-10 rounded-2xl bg-teal-50 dark:bg-slate-900 border border-teal-100 dark:border-slate-800 p-8 text-center">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Still have questions?</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {siteConfig.supportHours}. Send us a message and we will get back to you.
          </p>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-block mt-5 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition"
          >
            Contact support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
