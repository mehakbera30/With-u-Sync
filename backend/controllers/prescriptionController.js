const mongoose = require("mongoose");
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const createNotification = require("../utils/createNotification");

// Create a new prescription
const createPrescription = async (req, res, next) => {
  try {
    const {
      patientId,
      diagnosis,
      medicines,
      date,
      status = "Active",
    } = req.body;

    // Check required fields
    if (!patientId || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient and at least one medicine are required",
      });
    }

    // Find patient
    const patient = await User.findById(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    if (
      req.user.role === "doctor" &&
      (!patient.assignedDoctor ||
        patient.assignedDoctor.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "This patient is not assigned to you",
      });
    }

    // Doctor is the logged-in user
    const doctor = await User.findById(req.user._id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Create prescription
    const prescription = await Prescription.create({
      patient: patient._id,
      doctor: doctor._id,

      patientName: patient.name,
      doctorName: doctor.name,

      date: date || new Date().toISOString().split("T")[0],

      diagnosis: diagnosis || "",

      medicines,

      status,
    });

    // Create notification for patient
    await createNotification({
      userId: patient._id,
      title: "New Prescription",
      message: `Dr. ${doctor.name} has added a new prescription for you.`,
      type: "prescription",
      link: "/patient/prescriptions",
    });

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// Get prescriptions
const getPrescriptions = async (req, res, next) => {
  try {
    let filter = {};

    // Patient can see only their prescriptions
    if (req.user.role === "patient") {
      filter.patient = req.user._id;
      filter.hiddenForPatient = { $ne: true };
    }

    // Doctor can see prescriptions created by them
    if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }

    // Doctor / admin can narrow the list to one patient
    if (req.user.role !== "patient" && req.query.patientId) {
      if (!mongoose.isValidObjectId(req.query.patientId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid patient id",
        });
      }
      filter.patient = req.query.patientId;
    }

    // Admin can see all prescriptions

    const prescriptions = await Prescription.find(filter)
      .populate("patient", "name email")
      .populate(
        "doctor",
        "name email specialization qualifications"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: prescriptions.length,
      prescriptions,
    });
  } catch (error) {
    next(error);
  }
};


// Get one complete prescription
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("patient", "name email")
      .populate(
        "doctor",
        "name email specialization qualifications"
      );

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Patient can only view their own prescription
    if (
      req.user.role === "patient" &&
      prescription.patient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    if (req.user.role === "patient" && prescription.hiddenForPatient) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Doctor can only view prescriptions created by them
    if (
      req.user.role === "doctor" &&
      prescription.doctor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this prescription",
      });
    }

    res.json({
      success: true,
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// Update prescription status
const updatePrescriptionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Only the doctor who created it can update it
    if (
      req.user.role === "doctor" &&
      prescription.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    prescription.status = status;

    await prescription.save();

    res.json({
      success: true,
      message: "Prescription status updated successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// Add one or more medicines to an existing prescription
const addMedicines = async (req, res, next) => {
  try {
    const { medicines } = req.body;

    if (!Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one medicine is required",
      });
    }

    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    // Only the doctor who created it (or an admin) can change it
    if (
      req.user.role === "doctor" &&
      prescription.doctor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    // Only keep the fields the schema defines
    medicines.forEach((m) => {
      prescription.medicines.push({
        medicine: m.medicine,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions || "",
      });
    });

    await prescription.save(); // schema validation checks required fields

    await createNotification({
      userId: prescription.patient,
      title: "Prescription Updated",
      message: `Dr. ${req.user.name} added ${medicines.length} medicine${
        medicines.length > 1 ? "s" : ""
      } to your prescription.`,
      type: "prescription",
      link: "/patient/prescriptions",
    });

    res.json({
      success: true,
      message: "Medicines added successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


// ---------------------------------------------------------
// EDIT / DELETE
// ---------------------------------------------------------

// Admin, or the doctor who wrote the prescription
const canManage = (req, prescription) =>
  req.user.role === "admin" ||
  (req.user.role === "doctor" &&
    prescription.doctor.toString() === req.user._id.toString());

const notifyPatient = (prescription, req, message) =>
  createNotification({
    userId: prescription.patient,
    title: "Prescription Updated",
    message,
    type: "prescription",
    link: "/patient/prescriptions",
  });

// Edit diagnosis / date / status
const updatePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }

    if (!canManage(req, prescription)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    const { diagnosis, date, status } = req.body;

    if (diagnosis !== undefined) {
      prescription.diagnosis = String(diagnosis).trim();
    }

    if (date) {
      prescription.date = date;
    }

    if (status) {
      if (!["Active", "Completed", "Discontinued"].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid status" });
      }
      prescription.status = status;
    }

    await prescription.save();

    await notifyPatient(
      prescription,
      req,
      `Dr. ${req.user.name} updated one of your prescriptions.`
    );

    res.json({
      success: true,
      message: "Prescription updated successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

// Doctor/admin: permanently delete.
// Patient: only hides it from their own list (the medical record stays).
const deletePrescription = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }

    if (req.user.role === "patient") {
      if (prescription.patient.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to remove this prescription",
        });
      }

      prescription.hiddenForPatient = true;
      await prescription.save();

      return res.json({
        success: true,
        message: "Prescription removed from your list",
      });
    }

    if (!canManage(req, prescription)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this prescription",
      });
    }

    await prescription.deleteOne();

    await notifyPatient(
      prescription,
      req,
      `Dr. ${req.user.name} removed a prescription from your records.`
    );

    res.json({
      success: true,
      message: "Prescription deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Edit one medicine inside a prescription
const updateMedicine = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }

    if (!canManage(req, prescription)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    const item = prescription.medicines.id(req.params.medicineId);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }

    for (const key of ["medicine", "dosage", "frequency", "duration"]) {
      if (req.body[key] !== undefined) {
        const value = String(req.body[key]).trim();

        if (!value) {
          return res.status(400).json({
            success: false,
            message: `${key} cannot be empty`,
          });
        }

        item[key] = value;
      }
    }

    if (req.body.instructions !== undefined) {
      item.instructions = String(req.body.instructions).trim();
    }

    await prescription.save();

    await notifyPatient(
      prescription,
      req,
      `Dr. ${req.user.name} updated a medicine in your prescription.`
    );

    res.json({
      success: true,
      message: "Medicine updated successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};

// Remove one medicine from a prescription
const deleteMedicine = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }

    if (!canManage(req, prescription)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this prescription",
      });
    }

    const item = prescription.medicines.id(req.params.medicineId);

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }

    if (prescription.medicines.length <= 1) {
      return res.status(400).json({
        success: false,
        message:
          "A prescription needs at least one medicine. Delete the whole prescription instead.",
      });
    }

    prescription.medicines.pull(item._id);
    await prescription.save();

    await notifyPatient(
      prescription,
      req,
      `Dr. ${req.user.name} removed a medicine from your prescription.`
    );

    res.json({
      success: true,
      message: "Medicine removed successfully",
      prescription,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  updatePrescription,
  deletePrescription,
  updateMedicine,
  deleteMedicine,
  addMedicines,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
};