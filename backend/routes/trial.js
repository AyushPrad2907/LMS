const express = require("express");
const Trial = require("../models/Trial");

const router = express.Router();

/*
==========================================
POST : Book Trial Class
Route : /api/trial
==========================================
*/

router.post("/", async (req, res) => {
  try {
    const {
      name,
      mobile,
      whatsapp,
      class: studentClass,
      medium,
    } = req.body;

    // Validation
    if (
      !name ||
      !mobile ||
      !whatsapp ||
      !studentClass ||
      !medium
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the fields.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid Mobile Number.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(whatsapp)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid WhatsApp Number.",
      });
    }

    const trial = await Trial.create({
      name,
      mobile,
      whatsapp,
      class: studentClass,
      medium,
    });

    res.status(201).json({
      success: true,
      message: "Trial Class Booked Successfully!",
      data: trial,
    });

  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: Object.values(error.errors).map((val) => val.message)[0] || "Validation Error.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
});

/*
==========================================
GET : All Trial Requests
(Admin)
Route : /api/trial
==========================================
*/

router.get("/", async (req, res) => {
  try {

    const trials = await Trial.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: trials.length,
      data: trials,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }
});

/*
==========================================
GET : Single Trial
Route : /api/trial/:id
==========================================
*/

router.get("/:id", async (req, res) => {
  try {

    const trial = await Trial.findById(req.params.id);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: "Trial Request Not Found.",
      });
    }

    res.json({
      success: true,
      data: trial,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }
});

/*
==========================================
PUT : Update Trial Status
Route : /api/trial/:id
==========================================
*/

router.put("/:id", async (req, res) => {

  try {

    const { status, remarks } = req.body;

    const trial = await Trial.findById(req.params.id);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: "Trial Request Not Found.",
      });
    }

    if (status) {
      trial.status = status;
    }

    if (remarks !== undefined) {
      trial.remarks = remarks;
    }

    await trial.save();

    res.json({
      success: true,
      message: "Trial Updated Successfully.",
      data: trial,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }

});

/*
==========================================
DELETE : Delete Trial
Route : /api/trial/:id
==========================================
*/

router.delete("/:id", async (req, res) => {

  try {

    const trial = await Trial.findById(req.params.id);

    if (!trial) {
      return res.status(404).json({
        success: false,
        message: "Trial Request Not Found.",
      });
    }

    await Trial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Trial Request Deleted Successfully.",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });

  }

});

module.exports = router;