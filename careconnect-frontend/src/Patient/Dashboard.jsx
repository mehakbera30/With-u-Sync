import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import QuickSearch from "../components/QuickSearch";
import api, { getStoredUser } from "../services/api";
import {
  ChevronRight,
  HeartPulse,
  Heart,
  Activity,
  Droplets,
  Thermometer,
  Clock3,
  UserRound,
  FileText,
  Pill,
  CalendarDays,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser() || { name: "Patient", email: "" });
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalAppointments: 0,
      upcomingAppointmentsCount: 0,
      activePrescriptionsCount: 0,
      totalReportsCount: 0,
    },
    upcomingAppointments: [],
    activePrescriptions: [],
    recentReports: [],
    vitals: {},
  });

  const [vitalHistory, setVitalHistory] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const [dashboardRes, vitalsRes] = await Promise.all([
          api.dashboard.getPatient(),
          api.vitals.getPatient(user?._id),
        ]);

        if (dashboardRes?.success) {
          setDashboardData(dashboardRes);
        }

        const history =
          vitalsRes?.vitals ||
          vitalsRes?.data ||
          [];

        setVitalHistory(
          Array.isArray(history) ? history : []
        );
      } catch (err) {
        console.error("Error fetching patient dashboard/vitals:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboard();
    }
  }, [user?._id]);

  const vitals = dashboardData.vitals || {};
  const nextAppointment = dashboardData.upcomingAppointments?.[0];

  const getInitials = (name) => {
    if (!name) return "PT";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ================= SIDEBAR ================= */}
      <Sidebar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between bg-teal-100 border-b border-teal-200 px-8 backdrop-blur">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
            <p className="hidden text-sm text-slate-500 sm:block">
              Here's an overview of your health.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <QuickSearch />

            <NotificationBell />

            {/* Profile menu - opens when clicking the patient name/avatar */}
            <ProfileMenu />
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="p-5 sm:p-6 lg:p-8">
          {/* ================= WELCOME BANNER ================= */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-500 p-6 text-white shadow-sm sm:p-8">
            <div className="relative z-10 max-w-xl">
              <p className="mb-2 text-sm text-teal-100">
                Welcome back, {user?.name?.split(" ")[0] || "Patient"} 👋
              </p>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Take care of your health today.
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-teal-50">
                Keep track of your health information, monitor your vital signs,
                and stay updated with your medical records.
              </p>

              <button
                onClick={() => navigate("/patient/appointments")}
                className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
              >
                Book Appointment
              </button>
            </div>

            {/* Decorative Heart */}
            <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block">
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white/10">
                <HeartPulse size={85} strokeWidth={1.3} className="text-white/80" />
              </div>
            </div>
          </section>

          {/* ================= VITAL CARDS ================= */}
          <section className="mt-7">

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Health Overview
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest recorded vital signs
                </p>
              </div>

              {loading && (
                <span className="text-xs text-teal-600">
                  Updating...
                </span>
              )}

            </div>


            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">

              {/* Hemoglobin */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <Droplets size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.hemoglobin?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">Hemoglobin</p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.hemoglobin?.value ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.hemoglobin?.unit || "g/dL"}
                  </span>
                </div>
              </div>


              {/* Blood Pressure */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Activity size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.bloodPressure?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">Blood Pressure</p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.bloodPressure?.reading ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.bloodPressure?.unit || "mmHg"}
                  </span>
                </div>
              </div>


              {/* Blood Sugar */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                    <Activity size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.bloodSugar?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">Blood Sugar</p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.bloodSugar?.value ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.bloodSugar?.unit || "mg/dL"}
                  </span>
                </div>
              </div>


              {/* Heart Rate */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-500">
                    <HeartPulse size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.heartRate?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">Heart Rate</p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.heartRate?.value ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.heartRate?.unit || "bpm"}
                  </span>
                </div>
              </div>


              {/* Oxygen Saturation */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-500">
                    <Heart size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.oxygenSaturation?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">
                  Oxygen Saturation
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.oxygenSaturation?.value ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.oxygenSaturation?.unit || "%"}
                  </span>
                </div>
              </div>


              {/* Temperature */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Thermometer size={21} />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                    {vitals.temperature?.status || "Not recorded"}
                  </span>
                </div>

                <p className="mt-5 text-sm text-slate-500">Temperature</p>

                <div className="mt-1 flex items-end gap-2">
                  <h3 className="text-2xl font-bold text-slate-800">
                    {vitals.temperature?.value ?? "--"}
                  </h3>
                  <span className="mb-1 text-xs text-slate-400">
                    {vitals.temperature?.unit || "°F"}
                  </span>
                </div>
              </div>

            </div>


            {/* ================= VITAL HISTORY ================= */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">

              <div className="border-b border-slate-200 px-6 py-5">
                <h3 className="font-bold text-slate-800">
                  Vital History
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Previous vital readings recorded by your doctor
                </p>
              </div>

              {vitalHistory.length > 0 ? (

                <div className="overflow-x-auto">

                  <div className="overflow-x-auto"><table className="w-full text-sm">

                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-semibold text-slate-500">
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Hemoglobin</th>
                        <th className="px-6 py-3">BP</th>
                        <th className="px-6 py-3">Heart Rate</th>
                        <th className="px-6 py-3">Oxygen</th>
                        <th className="px-6 py-3">Sugar</th>
                        <th className="px-6 py-3">Temperature</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {vitalHistory.map((vital, index) => (

                        <tr key={vital._id || index}>

                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {vital.recordedAt || vital.createdAt
                              ? new Date(
                                  vital.recordedAt || vital.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.hemoglobin?.value ?? "—"} g/dL
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.bloodPressure?.reading || "—"}
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.heartRate?.value ?? "—"} bpm
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.oxygenSaturation?.value ?? "—"}%
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.bloodSugar?.value ?? "—"} mg/dL
                          </td>

                          <td className="px-6 py-4 font-medium text-slate-800">
                            {vital.temperature?.value ?? "—"} °F
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table></div>

                </div>

              ) : (

                <div className="p-6 text-center text-sm text-slate-500">
                  No vital history available yet.
                </div>

              )}

            </div>

          </section>


          {/* ================= CALENDAR + APPOINTMENT ================= */}
          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Upcoming Appointment */}
            <div className="rounded-2xl border border-slate-200 bg-white xl:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-800">Upcoming Appointment</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your next scheduled consultation
                  </p>
                </div>
                <button
                  onClick={() => navigate("/patient/appointments")}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All
                </button>
              </div>

              <div className="p-6">
                {nextAppointment ? (
                  <div className="flex flex-col justify-between gap-5 rounded-2xl bg-teal-50 p-5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                        <UserRound size={25} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide text-teal-600">
                          {nextAppointment.date} • {nextAppointment.time}
                        </span>
                        <h4 className="mt-1 font-bold text-slate-800">
                          {nextAppointment.type || "General Consultation"}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          {nextAppointment.doctorName || "Assigned Doctor"} •{" "}
                          {nextAppointment.specialization || "General"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                        {nextAppointment.status}
                      </span>
                      <button
                        onClick={() => navigate("/patient/appointments")}
                        className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        View Details
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl">
                    <p className="text-sm">No upcoming appointments scheduled.</p>
                    <button
                      onClick={() => navigate("/patient/appointments")}
                      className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700"
                    >
                      Book Your Visit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Mini Calendar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">Quick Calendar</h3>
                  <p className="mt-1 text-xs text-slate-400">Current Month</p>
                </div>
                <CalendarDays size={20} className="text-teal-600" />
              </div>

              <div className="mt-6 grid grid-cols-7 gap-y-3 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                  <span key={index} className="text-xs font-semibold text-slate-400">
                    {day}
                  </span>
                ))}

                {Array.from({ length: 30 }, (_, index) => index + 1).map((date) => (
                  <button
                    key={date}
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition ${
                      date === new Date().getDate()
                        ? "bg-teal-600 font-semibold text-white shadow-sm"
                        : "text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ================= REPORTS + PRESCRIPTIONS ================= */}
          <section className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Recent Reports */}
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-800">Recent Reports</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your latest medical diagnostic reports
                  </p>
                </div>
                <button
                  onClick={() => navigate("/patient/reports")}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {dashboardData.recentReports && dashboardData.recentReports.length > 0 ? (
                  dashboardData.recentReports.slice(0, 3).map((report, idx) => (
                    <div
                      key={report._id || idx}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {report.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {report.date} • {report.doctorName || "Doctor Review"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            report.status === "Reviewed"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {report.status}
                        </span>
                        <button
                          onClick={() => navigate("/patient/reports")}
                          className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                        >
                          View
                          <ChevronRight size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No reports found.
                  </div>
                )}
              </div>
            </div>

            {/* Prescriptions */}
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h3 className="font-bold text-slate-800">My Prescriptions</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Your current medications
                  </p>
                </div>
                <button
                  onClick={() => navigate("/patient/prescriptions")}
                  className="text-sm font-semibold text-teal-600 hover:text-teal-700"
                >
                  View All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {dashboardData.activePrescriptions &&
                dashboardData.activePrescriptions.length > 0 ? (
                  dashboardData.activePrescriptions.slice(0, 3).map((rx, idx) => (
                    <div
                      key={rx._id || idx}
                      className="flex items-center justify-between px-6 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                          <Pill size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {rx.medicine}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {rx.dosage} • {rx.duration} ({rx.doctorName || "Prescribed"})
                          </p>
                        </div>
                      </div>

                      <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
                        {rx.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-slate-500">
                    No active prescriptions currently.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Last Updated */}
          <div className="mt-6 flex items-center justify-end gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            WithUSync Live Sync
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;