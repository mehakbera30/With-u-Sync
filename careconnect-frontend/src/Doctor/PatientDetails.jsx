
import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  UserRound,
  HeartPulse,
  FileText,
  Edit3,
  Save,
  Eye,
  Activity,
  Droplets,
  Thermometer,
  Heart,
  X,
  Pill,
  Plus,
  Trash2,
  Pencil,
  CalendarDays,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";
import DoctorSidebar from "../components/DoctorSidebar";
import NotificationBell from "../components/NotificationBell";
import ProfileMenu from "../components/ProfileMenu";
import PrescriptionEditModal from "../components/PrescriptionEditModal";
import api from "../services/api";


// ======================================================
// ADDRESS HELPERS
// ======================================================

const emptyAddress = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
};


// Convert backend address into an object
const normalizeAddress = (address) => {
  if (!address) {
    return { ...emptyAddress };
  }

  // If backend somehow returns a string
  if (typeof address === "string") {
    return {
      street: address,
      city: "",
      state: "",
      zipCode: "",
    };
  }

  return {
    street: address.street || "",
    city: address.city || "",
    state: address.state || "",
    zipCode: address.zipCode || "",
  };
};


// Convert address object into readable text
const formatAddress = (address) => {
  const normalized = normalizeAddress(address);

  return [
    normalized.street,
    normalized.city,
    normalized.state,
    normalized.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
};


// ======================================================
// COMPONENT
// ======================================================

const PatientDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();


  // ======================================================
  // MAIN STATES
  // ======================================================

  const [patient, setPatient] = useState(null);
  const [reports, setReports] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPatient, setEditingPatient] = useState(false);


  // ======================================================
  // PATIENT FORM
  // ======================================================

  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    age: "",
    bloodGroup: "",
    address: { ...emptyAddress },
  });


  // ======================================================
  // VITALS MODAL
  // ======================================================

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [editingVitalId, setEditingVitalId] = useState(null);

  const [vitalsForm, setVitalsForm] = useState({
    hemoglobin: "",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    bloodSugar: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  });


  // ======================================================
  // PRESCRIPTION MODAL
  // ======================================================

  const [showPrescriptionModal, setShowPrescriptionModal] =
    useState(false);

  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: "",
    date: new Date().toISOString().split("T")[0],
  });


  // Medicines array
  const [medicines, setMedicines] = useState([]);


  // Edit popup: { type: "prescription" | "medicine", prescription, medicine? }
  const [editTarget, setEditTarget] = useState(null);

  // null = creating a new prescription, otherwise the id being added to
  const [editingPrescriptionId, setEditingPrescriptionId] =
    useState(null);

  // Errors are shown inside the modal (the page-level error sits behind it)
  const [modalError, setModalError] = useState("");

  const [savingPrescription, setSavingPrescription] =
    useState(false);


  // Temporary medicine form
  const [medicineForm, setMedicineForm] = useState({
    medicine: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });


  // ======================================================
  // LOAD PATIENT DATA
  // ======================================================

  const loadPatientData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        patientRes,
        reportsRes,
        vitalsRes,
        prescriptionsRes,
      ] = await Promise.all([
        api.users.getPatientById(id),
        api.reports.getAll({ patientId: id }),
        api.vitals.getPatient(id),
        api.prescriptions.getAll({ patientId: id }),
      ]);


      // ==================================================
      // PATIENT
      // ==================================================

      const patientData =
        patientRes?.patient ||
        patientRes?.user ||
        patientRes?.data ||
        patientRes;

      setPatient(patientData);

      setPatientForm({
        name: patientData?.name || "",
        email: patientData?.email || "",
        phone: patientData?.phone || "",
        gender: patientData?.gender || "",
        age: patientData?.age || "",
        bloodGroup: patientData?.bloodGroup || "",
        address: normalizeAddress(patientData?.address),
      });


      // ==================================================
      // REPORTS
      // ==================================================

      const reportsData =
        reportsRes?.reports ||
        reportsRes?.data ||
        [];

      setReports(Array.isArray(reportsData) ? reportsData : []);


      // ==================================================
      // VITALS
      // ==================================================

      const vitalsData =
        vitalsRes?.vitals ||
        vitalsRes?.data ||
        [];

      setVitals(Array.isArray(vitalsData) ? vitalsData : []);


      // ==================================================
      // PRESCRIPTIONS
      // ==================================================

      const prescriptionsData =
        prescriptionsRes?.prescriptions ||
        prescriptionsRes?.data ||
        [];

      setPrescriptions(
        Array.isArray(prescriptionsData)
          ? prescriptionsData
          : []
      );

    } catch (err) {
      console.error("Error loading patient:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load patient details."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      loadPatientData();
    }
  }, [id]);


  // ======================================================
  // PATIENT FORM CHANGE
  // ======================================================

  const handlePatientChange = (e) => {
    const { name, value } = e.target;

    setPatientForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Address change
  const handleAddressChange = (field, value) => {
    setPatientForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };


  // ======================================================
  // SAVE PATIENT DETAILS
  // ======================================================

  const savePatientDetails = async () => {
    try {
      setError("");

      const response =
        await api.users.updatePatientDetails(
          id,
          patientForm
        );

      const updatedPatient =
        response?.patient ||
        response?.user ||
        response?.data ||
        response;

      setPatient(updatedPatient);

      setPatientForm({
        name: updatedPatient?.name || "",
        email: updatedPatient?.email || "",
        phone: updatedPatient?.phone || "",
        gender: updatedPatient?.gender || "",
        age: updatedPatient?.age || "",
        bloodGroup: updatedPatient?.bloodGroup || "",
        address: normalizeAddress(
          updatedPatient?.address
        ),
      });

      setEditingPatient(false);

    } catch (err) {
      console.error("Error updating patient:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update patient details."
      );
    }
  };


  // ======================================================
  // VITALS FORM CHANGE
  // ======================================================

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;

    setVitalsForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // ADD VITALS
  // ======================================================

  const addVitals = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (editingVitalId) {
        await api.vitals.update(editingVitalId, {
          ...vitalsForm,
        });
      } else {
        await api.vitals.record({
          patientId: id,
          ...vitalsForm,
        });
      }

      setShowVitalsModal(false);
      setEditingVitalId(null);

      setVitalsForm({
        hemoglobin: "",
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        bloodSugar: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        notes: "",
      });

      await loadPatientData();

    } catch (err) {
      console.error("Error saving vitals:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save vitals."
      );
    }
  };

  const openEditVitals = (vital) => {
    setEditingVitalId(vital._id);

    setVitalsForm({
      hemoglobin: vital.hemoglobin?.value ?? "",
      bloodPressure: vital.bloodPressure?.reading ?? "",
      heartRate: vital.heartRate?.value ?? "",
      temperature: vital.temperature?.value ?? "",
      bloodSugar: vital.bloodSugar?.value ?? "",
      oxygenSaturation: vital.oxygenSaturation?.value ?? "",
      weight: vital.weight?.value ?? "",
      height: vital.height?.value ?? "",
      notes: vital.notes || "",
    });

    setShowVitalsModal(true);
  };

  // ======================================================
  // MEDICINE FORM CHANGE
  // ======================================================

  const handleMedicineChange = (e) => {
    const { name, value } = e.target;

    setMedicineForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // ADD MEDICINE TO LIST
  // ======================================================

  const addMedicine = () => {
    if (
      !medicineForm.medicine ||
      !medicineForm.dosage ||
      !medicineForm.frequency ||
      !medicineForm.duration
    ) {
      setModalError(
        "Medicine, dosage, frequency and duration are required."
      );

      return;
    }

    setMedicines((prev) => [
      ...prev,
      {
        medicine: medicineForm.medicine.trim(),
        dosage: medicineForm.dosage.trim(),
        frequency: medicineForm.frequency.trim(),
        duration: medicineForm.duration.trim(),
        instructions: medicineForm.instructions.trim(),
      },
    ]);

    setMedicineForm({
      medicine: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });

    setModalError("");
  };


  // ======================================================
  // REMOVE MEDICINE
  // ======================================================

  const removeMedicine = (index) => {
    setMedicines((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };


  // ======================================================
  // PRESCRIPTION FORM CHANGE
  // ======================================================

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;

    setPrescriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // ======================================================
  // CREATE PRESCRIPTION
  // ======================================================

  const emptyMedicineForm = {
    medicine: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  };

  const resetPrescriptionModal = () => {
    setPrescriptionForm({
      diagnosis: "",
      date: new Date().toISOString().split("T")[0],
    });
    setMedicines([]);
    setMedicineForm(emptyMedicineForm);
    setModalError("");
    setEditingPrescriptionId(null);
  };

  const openNewPrescription = () => {
    resetPrescriptionModal();
    setShowPrescriptionModal(true);
  };

  const openAddToPrescription = (prescription) => {
    resetPrescriptionModal();
    setEditingPrescriptionId(prescription._id);
    setShowPrescriptionModal(true);
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    resetPrescriptionModal();
  };

  const deletePrescription = async (prescription) => {
    if (
      !window.confirm(
        "Delete this entire prescription? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.prescriptions.remove(prescription._id);
      await loadPatientData();
    } catch (err) {
      setError(err?.message || "Failed to delete prescription.");
    }
  };

  const deleteMedicine = async (prescription, medicine) => {
    if (
      !window.confirm(
        `Remove ${medicine.medicine} from this prescription?`
      )
    ) {
      return;
    }

    try {
      await api.prescriptions.removeMedicine(
        prescription._id,
        medicine._id
      );
      await loadPatientData();
    } catch (err) {
      setError(err?.message || "Failed to remove medicine.");
    }
  };

  const createPrescription = async (e) => {
    e.preventDefault();

    if (savingPrescription) return;

    setModalError("");

    // A medicine typed into the form but not yet added to the list
    const draft = medicineForm;
    const draftStarted =
      draft.medicine ||
      draft.dosage ||
      draft.frequency ||
      draft.duration ||
      draft.instructions;
    const draftComplete =
      draft.medicine.trim() &&
      draft.dosage.trim() &&
      draft.frequency.trim() &&
      draft.duration.trim();

    const finalMedicines = [...medicines];

    if (draftStarted) {
      if (!draftComplete) {
        setModalError(
          "Finish the medicine you are typing (medicine, dosage, frequency and duration), or clear it, then try again."
        );
        return;
      }

      finalMedicines.push({
        medicine: draft.medicine.trim(),
        dosage: draft.dosage.trim(),
        frequency: draft.frequency.trim(),
        duration: draft.duration.trim(),
        instructions: draft.instructions.trim(),
      });
    }

    if (finalMedicines.length === 0) {
      setModalError("Please add at least one medicine.");
      return;
    }

    try {
      setSavingPrescription(true);

      if (editingPrescriptionId) {
        await api.prescriptions.addMedicines(
          editingPrescriptionId,
          finalMedicines
        );
      } else {
        await api.prescriptions.create({
          patientId: id,
          diagnosis: prescriptionForm.diagnosis,
          date: prescriptionForm.date,
          status: "Active",
          medicines: finalMedicines,
        });
      }

      closePrescriptionModal();

      // Reload data
      await loadPatientData();
    } catch (err) {
      console.error("Error saving prescription:", err);

      setModalError(
        err?.message || "Failed to save prescription."
      );
    } finally {
      setSavingPrescription(false);
    }
  };


  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">

        <DoctorSidebar />

        <main className="flex-1 ml-64 p-8">

          <div className="flex items-center justify-center min-h-[70vh]">

            <div className="text-center">

              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>

              <p className="text-slate-500">
                Loading patient details...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }


  // ======================================================
  // PATIENT NOT FOUND
  // ======================================================

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex">

        <DoctorSidebar />

        <main className="flex-1 ml-64 p-8">

          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">

            <UserRound
              size={48}
              className="mx-auto text-slate-300 mb-4"
            />

            <h2 className="text-xl font-bold text-slate-800">
              Patient not found
            </h2>

            <button
              onClick={() =>
                navigate("/doctor/patients")
              }
              className="mt-5 px-5 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Back to Patients
            </button>

          </div>

        </main>

      </div>
    );
  }


  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ==================================================
          SIDEBAR
      ================================================== */}

      <DoctorSidebar />


      {/* ==================================================
          MAIN CONTENT
      ================================================== */}

      <main className="flex-1 ml-64">

        {/* ==================================================
            TOP HEADER
        ================================================== */}

        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <button
              onClick={() =>
                navigate("/doctor/patients")
              }
              className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-teal-600 transition"
            >
              <ArrowLeft size={20} />
            </button>

            <div>

              <h1 className="text-2xl font-bold text-slate-800">
                Patient Details
              </h1>

              <p className="text-sm text-slate-500">
                View and manage patient information
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <NotificationBell />

            <ProfileMenu />

            <button
              onClick={() => {
                setEditingVitalId(null);
                setVitalsForm({
                  hemoglobin: "",
                  bloodPressure: "",
                  heartRate: "",
                  temperature: "",
                  bloodSugar: "",
                  oxygenSaturation: "",
                  weight: "",
                  height: "",
                  notes: "",
                });
                setShowVitalsModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition"
            >
              <Activity size={18} />
              Add Vitals
            </button>

            <button
              onClick={openNewPrescription}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <Pill size={18} />
              Add Prescription
            </button>

          </div>

        </header>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="p-8">

          {/* Error */}
          {error && (

            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">

              <p className="text-sm">
                {error}
              </p>

              <button
                onClick={() => setError("")}
                className="text-red-500 hover:text-red-700"
              >
                <X size={18} />
              </button>

            </div>

          )}


          {/* ==================================================
              PATIENT PROFILE
          ================================================== */}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 mb-8">

            <div className="flex items-center justify-between mb-6">

              <div className="flex items-center gap-4">

                <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                  <UserRound size={32} />
                </div>

                <div>

                  <h2 className="text-xl font-bold text-slate-800">
                    {patient.name}
                  </h2>

                  <p className="text-sm text-slate-500">
                    Patient
                  </p>

                </div>

              </div>


              {!editingPatient ? (

                <button
                  onClick={() =>
                    setEditingPatient(true)
                  }
                  className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  <Edit3 size={17} />
                  Edit Details
                </button>

              ) : (

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      setEditingPatient(false)
                    }
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={savePatientDetails}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                  >
                    <Save size={17} />
                    Save
                  </button>

                </div>

              )}

            </div>


            {!editingPatient ? (

              /* ==================================================
                 PATIENT INFORMATION VIEW
              ================================================== */

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Full Name
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.name || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Email
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.email || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Phone
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.phone || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Gender
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.gender || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Age
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.age || "Not available"}
                  </p>
                </div>


                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    Blood Group
                  </p>

                  <p className="font-medium text-slate-800">
                    {patient.bloodGroup || "Not available"}
                  </p>
                </div>


                <div className="md:col-span-2 lg:col-span-3">

                  <p className="text-xs text-slate-500 mb-1">
                    Address
                  </p>

                  <p className="font-medium text-slate-800">
                    {formatAddress(patient.address) ||
                      "Not available"}
                  </p>

                </div>

              </div>

            ) : (

              /* ==================================================
                 PATIENT INFORMATION EDIT
              ================================================== */

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={patientForm.name}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={patientForm.email}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={patientForm.phone}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={patientForm.gender}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Gender
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={patientForm.age}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Group
                  </label>

                  <select
                    name="bloodGroup"
                    value={patientForm.bloodGroup}
                    onChange={handlePatientChange}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">
                      Select Blood Group
                    </option>

                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>

                  </select>

                </div>


                {/* STREET */}

                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Street Address
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.street}
                    onChange={(e) =>
                      handleAddressChange(
                        "street",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* CITY */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.city}
                    onChange={(e) =>
                      handleAddressChange(
                        "city",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* STATE */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.state}
                    onChange={(e) =>
                      handleAddressChange(
                        "state",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                {/* ZIP */}

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ZIP Code
                  </label>

                  <input
                    type="text"
                    value={patientForm.address.zipCode}
                    onChange={(e) =>
                      handleAddressChange(
                        "zipCode",
                        e.target.value
                      )
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>

            )}

          </section>


          {/* ==================================================
              VITALS
          ================================================== */}

          <section className="mb-8">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Vitals
                </h2>

                <p className="text-sm text-slate-500">
                  Patient's recorded health measurements and history
                </p>

              </div>

              <button
                onClick={() => setShowVitalsModal(true)}
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Plus size={17} />
                Add Vitals
              </button>

            </div>

            {vitals.length === 0 ? (

              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">

                <Activity
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500">
                  No vitals recorded yet.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {vitals.map((vital, index) => (

                  <div
                    key={vital._id || index}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
                  >

                    <div className="flex items-center justify-between mb-4">

                      <div className="flex items-center gap-2">

                        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                          <HeartPulse size={19} />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Recorded
                          </p>

                          <p className="text-sm font-medium text-slate-700">
                            {vital.recordedAt || vital.createdAt
                              ? new Date(
                                  vital.recordedAt || vital.createdAt
                                ).toLocaleString()
                              : "—"}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-3">

                        <span className="text-xs text-slate-400">
                          {vital.recordedBy?.name
                            ? `By ${vital.recordedBy.name}`
                            : "Doctor recorded"}
                        </span>

                        <button
                          type="button"
                          onClick={() => openEditVitals(vital)}
                          className="flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-700"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Hemoglobin</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.hemoglobin?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            {vital.hemoglobin?.unit || "g/dL"}
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Blood Pressure</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.bloodPressure?.reading || "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            mmHg
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Heart Rate</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.heartRate?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            bpm
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Oxygen Saturation</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.oxygenSaturation?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            %
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Blood Sugar</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.bloodSugar?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            mg/dL
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Temperature</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.temperature?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            °F
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Weight</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.weight?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            kg
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Height</p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {vital.height?.value ?? "—"}{" "}
                          <span className="text-xs font-normal text-slate-400">
                            cm
                          </span>
                        </p>
                      </div>

                    </div>

                    {vital.notes && (
                      <p className="mt-4 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">Notes:</span>{" "}
                        {vital.notes}
                      </p>
                    )}

                  </div>

                ))}

              </div>

            )}

          </section>


          {/* ==================================================
              PRESCRIPTIONS
          ================================================== */}

          <section className="mb-8">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Prescriptions
                </h2>

                <p className="text-sm text-slate-500">
                  Medicines prescribed for this patient
                </p>

              </div>

              <button
                onClick={openNewPrescription}
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Plus size={17} />
                Add Prescription
              </button>

            </div>


            {prescriptions.length === 0 ? (

              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">

                <Pill
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500">
                  No prescriptions found.
                </p>

              </div>

            ) : (

              <div className="space-y-4">

                {prescriptions.map(
                  (prescription, index) => (

                    <div
                      key={
                        prescription._id ||
                        index
                      }
                      className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
                    >

                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                        <div>

                          <div className="flex items-center gap-3">

                            <h3 className="font-semibold text-slate-800">
                              {prescription.diagnosis ||
                                "Prescription"}
                            </h3>

                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                                prescription.status ===
                                "Active"
                                  ? "bg-green-50 text-green-700"
                                  : prescription.status ===
                                    "Completed"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-red-50 text-red-700"
                              }`}
                            >
                              {prescription.status ||
                                "Active"}
                            </span>

                          </div>


                          <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">

                            <CalendarDays
                              size={15}
                            />

                            {prescription.date ||
                              "No date"}

                          </div>

                        </div>


                        <div className="text-sm text-slate-500">

                          Doctor:{" "}

                          <span className="font-medium text-slate-700">
                            {prescription.doctorName ||
                              prescription.doctor?.name ||
                              "—"}
                          </span>

                        </div>

                      </div>


                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setEditTarget({
                              type: "prescription",
                              prescription,
                            })
                          }
                          className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50"
                        >
                          <Pencil size={15} />
                          Edit Prescription
                        </button>

                        <button
                          type="button"
                          onClick={() => deletePrescription(prescription)}
                          className="flex items-center gap-2 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                          Delete Prescription
                        </button>
                      </div>


                      {/* Medicines */}

                      <div className="mt-5 space-y-3">

                        {prescription.medicines?.map(
                          (medicine, medicineIndex) => (

                            <div
                              key={
                                medicine._id ||
                                medicineIndex
                              }
                              className="bg-slate-50 border border-slate-100 rounded-lg p-4"
                            >

                              <div className="flex justify-end gap-1 mb-2">
                                <button
                                  type="button"
                                  title="Edit medicine"
                                  onClick={() =>
                                    setEditTarget({
                                      type: "medicine",
                                      prescription,
                                      medicine,
                                    })
                                  }
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200"
                                >
                                  <Pencil size={15} />
                                </button>

                                {prescription.medicines.length > 1 && (
                                  <button
                                    type="button"
                                    title="Remove medicine"
                                    onClick={() =>
                                      deleteMedicine(prescription, medicine)
                                    }
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                <div>

                                  <p className="text-xs text-slate-500 mb-1">
                                    Medicine
                                  </p>

                                  <p className="font-medium text-slate-800">
                                    {
                                      medicine.medicine
                                    }
                                  </p>

                                </div>


                                <div>

                                  <p className="text-xs text-slate-500 mb-1">
                                    Dosage
                                  </p>

                                  <p className="font-medium text-slate-800">
                                    {
                                      medicine.dosage
                                    }
                                  </p>

                                </div>


                                <div>

                                  <p className="text-xs text-slate-500 mb-1">
                                    Frequency
                                  </p>

                                  <p className="font-medium text-slate-800">
                                    {
                                      medicine.frequency
                                    }
                                  </p>

                                </div>


                                <div>

                                  <p className="text-xs text-slate-500 mb-1">
                                    Duration
                                  </p>

                                  <p className="font-medium text-slate-800">
                                    {
                                      medicine.duration
                                    }
                                  </p>

                                </div>

                              </div>


                              {medicine.instructions && (

                                <div className="mt-3">

                                  <p className="text-xs text-slate-500 mb-1">
                                    Instructions
                                  </p>

                                  <p className="text-sm text-slate-700">
                                    {
                                      medicine.instructions
                                    }
                                  </p>

                                </div>

                              )}

                            </div>

                          )
                        )}

                      </div>

                      {prescription.status === "Active" && (
                        <button
                          type="button"
                          onClick={() =>
                            openAddToPrescription(prescription)
                          }
                          className="mt-4 flex items-center gap-2 px-4 py-2 border border-teal-200 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50"
                        >
                          <Plus size={16} />
                          Add Medicine
                        </button>
                      )}

                    </div>

                  )
                )}

              </div>

            )}

          </section>


          {/* ==================================================
              REPORTS
          ================================================== */}

          <section>

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-slate-800">
                  Reports
                </h2>

                <p className="text-sm text-slate-500">
                  Patient medical reports
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/doctor/patients/${id}/reports`
                  )
                }
                className="flex items-center gap-2 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                <Eye size={17} />
                View All Reports
              </button>

            </div>


            {reports.length === 0 ? (

              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">

                <FileText
                  size={40}
                  className="mx-auto text-slate-300 mb-3"
                />

                <p className="text-slate-500">
                  No reports found.
                </p>

              </div>

            ) : (

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">

                {reports.slice(0, 5).map(
                  (report, index) => (

                    <div
                      key={
                        report._id ||
                        index
                      }
                      className={`px-6 py-5 flex items-center justify-between ${
                        index !==
                        Math.min(
                          reports.length,
                          5
                        ) -
                          1
                          ? "border-b border-slate-200"
                          : ""
                      }`}
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                          <FileText size={20} />
                        </div>

                        <div>

                          <p className="font-medium text-slate-800">
                            {report.title ||
                              report.name ||
                              report.reportName ||
                              "Medical Report"}
                          </p>

                          <p className="text-sm text-slate-500">

                            {report.createdAt
                              ? new Date(
                                  report.createdAt
                                ).toLocaleDateString()
                              : report.date ||
                                "No date"}

                          </p>

                        </div>

                      </div>


                      <button
                        onClick={() =>
                          navigate(
                            `/doctor/reports/${report._id}`
                          )
                        }
                        className="text-sm font-medium text-teal-600 hover:text-teal-700"
                      >
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        </div>

      </main>


      {/* ======================================================
          VITALS MODAL
      ====================================================== */}

      {showVitalsModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  {editingVitalId ? "Update Patient Vitals" : "Add Patient Vitals"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Record the patient's current health measurements.
                </p>

              </div>

              <button
                onClick={() => {
                  setShowVitalsModal(false);
                  setEditingVitalId(null);
                }}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={21} />
              </button>

            </div>


            <form
              onSubmit={addVitals}
              className="p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Hemoglobin
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="hemoglobin"
                    value={vitalsForm.hemoglobin}
                    onChange={handleVitalsChange}
                    placeholder="13.5"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Pressure
                  </label>

                  <input
                    type="text"
                    name="bloodPressure"
                    value={
                      vitalsForm.bloodPressure
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="120/80"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Heart Rate
                  </label>

                  <input
                    type="number"
                    name="heartRate"
                    value={
                      vitalsForm.heartRate
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="72"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Temperature
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="temperature"
                    value={
                      vitalsForm.temperature
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="98.6"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Blood Sugar
                  </label>

                  <input
                    type="number"
                    name="bloodSugar"
                    value={
                      vitalsForm.bloodSugar
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="100"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Oxygen Saturation
                  </label>

                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={
                      vitalsForm.oxygenSaturation
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="98"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Weight
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="weight"
                    value={
                      vitalsForm.weight
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="65"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Height
                  </label>

                  <input
                    type="number"
                    step="0.1"
                    name="height"
                    value={
                      vitalsForm.height
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="170"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div className="md:col-span-2">

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    rows="3"
                    value={
                      vitalsForm.notes
                    }
                    onChange={
                      handleVitalsChange
                    }
                    placeholder="Additional notes..."
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>


              <div className="flex justify-end gap-3 mt-6">

                <button
                  type="button"
                  onClick={() => {
                    setShowVitalsModal(false);
                    setEditingVitalId(null);
                  }}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  {editingVitalId ? "Update Vitals" : "Save Vitals"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* ======================================================
          PRESCRIPTION MODAL
      ====================================================== */}

      {editTarget && (
        <PrescriptionEditModal
          target={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={loadPatientData}
        />
      )}

      {showPrescriptionModal && (

        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center px-4">

          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] overflow-y-auto">

            {/* Header */}

            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">

              <div>

                <h3 className="text-xl font-bold text-slate-800">
                  {editingPrescriptionId
                    ? "Add Medicines to Prescription"
                    : "Add Prescription"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {editingPrescriptionId
                    ? `Add more medicines to this prescription for ${patient.name}.`
                    : `Create a prescription for ${patient.name}. You can add several medicines to the same prescription.`}
                </p>

              </div>

              <button
                type="button"
                onClick={closePrescriptionModal}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={21} />
              </button>

            </div>


            <form
              onSubmit={
                createPrescription
              }
              className="p-6"
            >

              {/* ==========================================
                  DIAGNOSIS + DATE
              ========================================== */}

              {modalError && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {!editingPrescriptionId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Diagnosis
                  </label>

                  <input
                    type="text"
                    name="diagnosis"
                    value={
                      prescriptionForm.diagnosis
                    }
                    onChange={
                      handlePrescriptionChange
                    }
                    placeholder="Enter diagnosis"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>


                <div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={
                      prescriptionForm.date
                    }
                    onChange={
                      handlePrescriptionChange
                    }
                    className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                  />

                </div>

              </div>
              )}


              {/* ==========================================
                  ADD MEDICINE
              ========================================== */}

              <div className="border border-slate-200 rounded-xl p-5">

                <div className="flex items-center justify-between mb-5">

                  <div>

                    <h4 className="font-semibold text-slate-800">
                      Add Medicine
                    </h4>

                    <p className="text-sm text-slate-500">
                      Fill in one medicine, click "Add to list", and repeat for more. Everything in the list is saved as one prescription.
                    </p>

                  </div>

                  <Pill
                    size={20}
                    className="text-teal-600"
                  />

                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Medicine */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Medicine *
                    </label>

                    <input
                      type="text"
                      name="medicine"
                      value={
                        medicineForm.medicine
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Paracetamol"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Dosage */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Dosage *
                    </label>

                    <input
                      type="text"
                      name="dosage"
                      value={
                        medicineForm.dosage
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. 500 mg"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Frequency */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Frequency *
                    </label>

                    <input
                      type="text"
                      name="frequency"
                      value={
                        medicineForm.frequency
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Twice a day"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Duration */}

                  <div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Duration *
                    </label>

                    <input
                      type="text"
                      name="duration"
                      value={
                        medicineForm.duration
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. 5 days"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>


                  {/* Instructions */}

                  <div className="md:col-span-2">

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Instructions
                    </label>

                    <textarea
                      name="instructions"
                      rows="2"
                      value={
                        medicineForm.instructions
                      }
                      onChange={
                        handleMedicineChange
                      }
                      placeholder="e.g. Take after food"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none resize-none focus:ring-2 focus:ring-teal-500"
                    />

                  </div>

                </div>


                <button
                  type="button"
                  onClick={addMedicine}
                  className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                >
                  <Plus size={17} />
                  Add to list
                </button>

              </div>


              {/* ==========================================
                  MEDICINES LIST
              ========================================== */}

              {medicines.length > 0 && (

                <div className="mt-6">

                  <h4 className="font-semibold text-slate-800 mb-3">
                    Medicines Added
                  </h4>


                  <div className="space-y-3">

                    {medicines.map(
                      (medicine, index) => (

                        <div
                          key={index}
                          className="border border-slate-200 rounded-xl p-4 bg-slate-50"
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex-1">

                              <div className="flex items-center gap-2 mb-2">

                                <Pill
                                  size={18}
                                  className="text-teal-600"
                                />

                                <p className="font-semibold text-slate-800">
                                  {
                                    medicine.medicine
                                  }
                                </p>

                              </div>


                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">

                                <div>

                                  <span className="text-slate-500">
                                    Dosage:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.dosage
                                    }
                                  </span>

                                </div>


                                <div>

                                  <span className="text-slate-500">
                                    Frequency:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.frequency
                                    }
                                  </span>

                                </div>


                                <div>

                                  <span className="text-slate-500">
                                    Duration:
                                  </span>{" "}

                                  <span className="font-medium text-slate-700">
                                    {
                                      medicine.duration
                                    }
                                  </span>

                                </div>

                              </div>


                              {medicine.instructions && (

                                <p className="text-sm text-slate-500 mt-2">

                                  <span className="font-medium text-slate-600">
                                    Instructions:
                                  </span>{" "}

                                  {
                                    medicine.instructions
                                  }

                                </p>

                              )}

                            </div>


                            <button
                              type="button"
                              onClick={() =>
                                removeMedicine(
                                  index
                                )
                              }
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              )}


              {/* ==========================================
                  FORM BUTTONS
              ========================================== */}

              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-slate-200">

                <button
                  type="button"
                  onClick={closePrescriptionModal}
                  className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingPrescription}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {savingPrescription
                    ? "Saving..."
                    : editingPrescriptionId
                    ? "Save Medicines"
                    : "Create Prescription"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};


export default PatientDetails;

