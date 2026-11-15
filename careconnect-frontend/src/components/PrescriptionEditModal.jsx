import React, { useState } from "react";
import { X } from "lucide-react";
import api from "../services/api";

const inputClass =
  "w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500";

const labelClass = "block text-sm font-medium text-slate-700 mb-2";

/**
 * Edit popup used by the doctor for:
 *  - a whole prescription  -> target = { type: "prescription", prescription }
 *  - a single medicine     -> target = { type: "medicine", prescription, medicine }
 */
const PrescriptionEditModal = ({ target, onClose, onSaved }) => {
  const isMedicine = target.type === "medicine";
  const { prescription, medicine } = target;

  const [form, setForm] = useState(
    isMedicine
      ? {
          medicine: medicine.medicine || "",
          dosage: medicine.dosage || "",
          frequency: medicine.frequency || "",
          duration: medicine.duration || "",
          instructions: medicine.instructions || "",
        }
      : {
          diagnosis: prescription.diagnosis || "",
          date: String(prescription.date || "").slice(0, 10),
          status: prescription.status || "Active",
        }
  );

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    if (
      isMedicine &&
      (!form.medicine.trim() ||
        !form.dosage.trim() ||
        !form.frequency.trim() ||
        !form.duration.trim())
    ) {
      setError("Medicine, dosage, frequency and duration are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (isMedicine) {
        await api.prescriptions.updateMedicine(
          prescription._id,
          medicine._id,
          form
        );
      } else {
        await api.prescriptions.update(prescription._id, form);
      }

      await onSaved();
      onClose();
    } catch (err) {
      setError(err?.message || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-xl font-bold text-slate-800">
            {isMedicine ? "Edit Medicine" : "Edit Prescription"}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {isMedicine ? (
            <>
              <div>
                <label className={labelClass}>Medicine *</label>
                <input
                  name="medicine"
                  value={form.medicine}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Dosage *</label>
                  <input
                    name="dosage"
                    value={form.dosage}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Frequency *</label>
                  <input
                    name="frequency"
                    value={form.frequency}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Duration *</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Instructions</label>
                <textarea
                  name="instructions"
                  rows="2"
                  value={form.instructions}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelClass}>Diagnosis</label>
                <input
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Date</label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionEditModal;
