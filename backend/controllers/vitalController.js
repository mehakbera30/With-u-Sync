const Vital = require("../models/Vital");
const User = require("../models/User");

const toNumber = (value) => {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isNaN(number) ? null : number;
};

const getValue = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value.value;
  }
  return value;
};

const getBloodPressure = (value) => {
  if (value && typeof value === "object") {
    return {
      systolic: toNumber(value.systolic),
      diastolic: toNumber(value.diastolic),
      reading:
        value.reading ||
        (value.systolic !== undefined && value.diastolic !== undefined
          ? `${value.systolic}/${value.diastolic}`
          : ""),
      unit: value.unit || "mmHg",
      status: value.status || "Normal",
    };
  }

  const reading = String(value || "").trim();
  const match = reading.match(/^(\d+)\s*\/\s*(\d+)$/);

  return {
    systolic: match ? Number(match[1]) : null,
    diastolic: match ? Number(match[2]) : null,
    reading,
    unit: "mmHg",
    status: "Normal",
  };
};

const buildVitalFields = (body) => ({
  hemoglobin: {
    value: toNumber(getValue(body.hemoglobin)),
    unit: body.hemoglobin?.unit || "g/dL",
    status: body.hemoglobin?.status || "Normal",
  },

  bloodPressure: getBloodPressure(body.bloodPressure),

  bloodSugar: {
    value: toNumber(getValue(body.bloodSugar)),
    unit: body.bloodSugar?.unit || "mg/dL",
    status: body.bloodSugar?.status || "Normal",
  },

  heartRate: {
    value: toNumber(getValue(body.heartRate)),
    unit: body.heartRate?.unit || "bpm",
    status: body.heartRate?.status || "Normal",
  },

  oxygenSaturation: {
    value: toNumber(getValue(body.oxygenSaturation)),
    unit: body.oxygenSaturation?.unit || "%",
    status: body.oxygenSaturation?.status || "Normal",
  },

  temperature: {
    value: toNumber(getValue(body.temperature)),
    unit: body.temperature?.unit || "°F",
    status: body.temperature?.status || "Normal",
  },

  weight: {
    value: toNumber(getValue(body.weight)),
    unit: body.weight?.unit || "kg",
  },

  height: {
    value: toNumber(getValue(body.height)),
    unit: body.height?.unit || "cm",
  },
});

const checkPatientAccess = async (req, patientId) => {
  const patient = await User.findOne({
    _id: patientId,
    role: "patient",
  });

  if (!patient) return { error: { status: 404, message: "Patient not found" } };

  if (
    req.user.role === "doctor" &&
    (!patient.assignedDoctor ||
      patient.assignedDoctor.toString() !== req.user._id.toString())
  ) {
    return {
      error: {
        status: 403,
        message: "This patient is not assigned to you",
      },
    };
  }

  if (
    req.user.role === "patient" &&
    patient._id.toString() !== req.user._id.toString()
  ) {
    return {
      error: {
        status: 403,
        message: "You are not authorized to view these vitals",
      },
    };
  }

  return { patient };
};

// ================= GET PATIENT VITAL HISTORY =================
const getPatientVitals = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const access = await checkPatientAccess(req, patientId);

    if (access.error) {
      return res.status(access.error.status).json({
        success: false,
        message: access.error.message,
      });
    }

    const vitals = await Vital.find({ patient: patientId })
      .populate("recordedBy", "name role")
      .sort({ recordedAt: -1 });

    res.json({
      success: true,
      count: vitals.length,
      vitals,
    });
  } catch (error) {
    next(error);
  }
};

// ================= CREATE VITALS =================
const createVital = async (req, res, next) => {
  try {
    const { patientId, notes } = req.body;

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    const access = await checkPatientAccess(req, patientId);

    if (access.error) {
      return res.status(access.error.status).json({
        success: false,
        message: access.error.message,
      });
    }

    if (req.user.role !== "doctor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can record vitals",
      });
    }

    const vital = await Vital.create({
      patient: patientId,
      ...buildVitalFields(req.body),
      recordedAt: new Date(),
      recordedBy: req.user._id,
      notes: notes || "",
    });

    res.status(201).json({
      success: true,
      message: "Vitals saved successfully",
      vital,
    });
  } catch (error) {
    next(error);
  }
};

// ================= UPDATE VITALS =================
const updateVital = async (req, res, next) => {
  try {
    const vital = await Vital.findById(req.params.id);

    if (!vital) {
      return res.status(404).json({
        success: false,
        message: "Vital record not found",
      });
    }

    const access = await checkPatientAccess(req, vital.patient);

    if (access.error) {
      return res.status(access.error.status).json({
        success: false,
        message: access.error.message,
      });
    }

    if (req.user.role !== "doctor" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only doctors can update vitals",
      });
    }

    const fields = buildVitalFields(req.body);

    Object.assign(vital, fields);

    if (req.body.notes !== undefined) {
      vital.notes = req.body.notes;
    }

    vital.recordedAt = new Date();
    vital.recordedBy = req.user._id;

    await vital.save();

    res.json({
      success: true,
      message: "Vitals updated successfully",
      vital,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientVitals,
  createVital,
  updateVital,
};
