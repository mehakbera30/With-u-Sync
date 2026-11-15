import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, FileText, Pill, Search } from "lucide-react";
import api from "../services/api";
import { displayDoctorName } from "../utils/formatters";

const KIND = {
  appointment: { label: "Appointment", icon: CalendarDays, path: "/patient/appointments" },
  prescription: { label: "Prescription", icon: Pill, path: "/patient/prescriptions" },
  report: { label: "Report", icon: FileText, path: "/patient/reports" },
};

const MAX_RESULTS = 8;

/**
 * Patient dashboard quick-search.
 * Loads the patient's appointments, prescriptions and reports once (on first
 * focus), filters them in the browser, and jumps to the matching page with the
 * search already filled in (the pages read ?search=).
 */
const QuickSearch = () => {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load the three lists the first time the box is used
  const loadItems = async () => {
    if (loaded || loading) return;

    setLoading(true);

    const [appointments, prescriptions, reports] = await Promise.allSettled([
      api.appointments.getAll(),
      api.prescriptions.getAll(),
      api.reports.getAll(),
    ]);

    const list = [];

    if (appointments.status === "fulfilled") {
      const data = appointments.value || {};
      [...(data.upcoming || []), ...(data.past || [])].forEach((apt) => {
        const doctor = displayDoctorName(apt.doctorName);
        list.push({
          kind: "appointment",
          key: `a-${apt._id}`,
          title: doctor,
          subtitle: [apt.date, apt.specialization, apt.status]
            .filter(Boolean)
            .join(" • "),
          term: doctor,
          haystack: [doctor, apt.doctorName, apt.specialization, apt.status, apt.date, apt.type],
        });
      });
    }

    if (prescriptions.status === "fulfilled") {
      (prescriptions.value?.prescriptions || []).forEach((rx) => {
        const medicines = (rx.medicines || []).map((m) => m.medicine).filter(Boolean);
        const doctor = displayDoctorName(rx.doctorName || rx.doctor?.name);
        const title = rx.diagnosis || medicines[0] || "Prescription";
        list.push({
          kind: "prescription",
          key: `p-${rx._id}`,
          title,
          subtitle: [doctor, medicines.slice(0, 3).join(", ")]
            .filter(Boolean)
            .join(" • "),
          term: title,
          haystack: [title, doctor, rx.status, rx.date, ...medicines],
        });
      });
    }

    if (reports.status === "fulfilled") {
      (reports.value?.reports || []).forEach((report) => {
        list.push({
          kind: "report",
          key: `r-${report._id}`,
          title: report.name || "Report",
          subtitle: [report.type, report.doctor?.name && displayDoctorName(report.doctor.name)]
            .filter(Boolean)
            .join(" • "),
          term: report.name || "",
          haystack: [report.name, report.type, report.doctor?.name, report.status],
        });
      });
    }

    setItems(list);
    setLoaded(true);
    setLoading(false);
  };

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return [];

    return items
      .filter((item) =>
        item.haystack
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(text))
      )
      .slice(0, MAX_RESULTS);
  }, [items, query]);

  // Close the dropdown when clicking elsewhere
  useEffect(() => {
    const handleClick = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const goTo = (item) => {
    setOpen(false);
    setQuery("");
    navigate(`${KIND[item.kind].path}?search=${encodeURIComponent(item.term)}`);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }

    if (event.key === "Enter" && results.length > 0) {
      event.preventDefault();
      goTo(results[0]);
    }
  };

  const showDropdown = open && query.trim().length > 0;

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <div className="flex items-center rounded-xl bg-white border border-teal-100 px-3 py-2 focus-within:ring-2 focus-within:ring-teal-200">
        <Search size={17} className="text-teal-600" />
        <input
          type="text"
          value={query}
          placeholder="Search appointments, reports..."
          onFocus={() => {
            setOpen(true);
            loadItems();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-60 bg-transparent px-2 text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-40">
          {loading && (
            <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
          )}

          {!loading && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-slate-500">
              No matches found.
            </p>
          )}

          {!loading &&
            results.map((item) => {
              const { icon: Icon, label } = KIND[item.kind];

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goTo(item)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                >
                  <span className="mt-0.5 w-8 h-8 shrink-0 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Icon size={16} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-800 truncate">
                      {item.title}
                    </span>
                    <span className="block text-xs text-slate-500 truncate">
                      {label}
                      {item.subtitle ? ` • ${item.subtitle}` : ""}
                    </span>
                  </span>
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;
