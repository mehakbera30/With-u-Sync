import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Pill,
  Settings,
  LogOut,
} from "lucide-react";

const DoctorSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-5 left-3 z-40 w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-md"
      >
        <Menu size={22} />
      </button>

      {/* Dark backdrop behind the open drawer (mobile only) */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50"
          onClick={() => setOpen(false)}
        />
      )}

    <aside
      onClick={(e) => {
        // close the drawer after tapping a link
        if (e.target.closest("a")) setOpen(false);
      }}
      className={`w-64 bg-slate-900 text-white fixed left-0 top-0 h-screen flex flex-col z-50 overflow-y-auto transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >

      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="lg:hidden absolute top-4 right-3 w-9 h-9 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center justify-center"
      >
        <X size={20} />
      </button>


      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-11 h-11 rounded-xl overflow-hidden bg-white flex items-center justify-center border border-teal-200 shadow-sm">
          <img src="/withusync-logo.png" alt="WithUSync" className="w-full h-full object-contain" />
        </div>

        <div>
          <h1 className="text-xl font-bold">WithUSync</h1>
          <p className="text-xs text-slate-400">
            Healthcare Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">

        <NavLink
          to="/doctor/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        <NavLink
          to="/doctor/patients"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <Users size={20} />
          My Patients
        </NavLink>

        <NavLink
          to="/doctor/appointments"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <CalendarDays size={20} />
          Appointments
        </NavLink>

        <NavLink
          to="/doctor/reports"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <FileText size={20} />
          Patient Reports
        </NavLink>

        

        <NavLink
          to="/doctor/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg ${
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      {/* Logout */}
      <div className="px-4 pb-3 flex justify-center">
</div>

      <div className="px-4 pb-6">
        <NavLink
          to="/login"
          onClick={() => {
            localStorage.removeItem("careconnect_token");
            localStorage.removeItem("careconnect_user");
          }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800"
        >
          <LogOut size={20} />
          Logout
        </NavLink>
      </div>

    </aside>
    </>
  );
};

export default DoctorSidebar;