const express = require("express");

const router = express.Router();

const {
  getPatientVitals,
  createVital,
  updateVital,
} = require("../controllers/vitalController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");

router.use(protect);

router.get("/patient/:patientId", getPatientVitals);

router.post("/", authorize("doctor", "admin"), createVital);

router.put("/:id", authorize("doctor", "admin"), updateVital);

module.exports = router;
