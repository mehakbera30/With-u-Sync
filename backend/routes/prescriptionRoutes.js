const express = require("express");
const router = express.Router();

const {
  updatePrescription,
  deletePrescription,
  updateMedicine,
  deleteMedicine,
  addMedicines,
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  updatePrescriptionStatus,
} = require("../controllers/prescriptionController");

const { protect, authorize } = require("../middleware/authMiddleware");


// All prescription routes require login
router.use(protect);


// Create prescription
// Only doctor/admin can create
router.post(
  "/",
  authorize("doctor", "admin"),
  createPrescription
);


// Get prescriptions
// Patient gets their own
// Doctor gets prescriptions created by them
// Admin gets all
router.get(
  "/",
  getPrescriptions
);


// Get one complete prescription
router.get(
  "/:id",
  getPrescriptionById
);


// Add medicines to an existing prescription
router.post(
  "/:id/medicines",
  authorize("doctor", "admin"),
  addMedicines
);


// Edit a prescription (diagnosis / date / status)
router.put(
  "/:id",
  authorize("doctor", "admin"),
  updatePrescription
);


// Delete a prescription
// Doctor/admin: permanent delete. Patient: hides it from their own list.
router.delete(
  "/:id",
  authorize("patient", "doctor", "admin"),
  deletePrescription
);


// Edit / remove one medicine
router.put(
  "/:id/medicines/:medicineId",
  authorize("doctor", "admin"),
  updateMedicine
);

router.delete(
  "/:id/medicines/:medicineId",
  authorize("doctor", "admin"),
  deleteMedicine
);


// Update prescription status
router.patch(
  "/:id/status",
  authorize("doctor", "admin"),
  updatePrescriptionStatus
);


module.exports = router;