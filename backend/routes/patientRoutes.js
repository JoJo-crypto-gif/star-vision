// backend/routes/patientRoutes.js
import express from "express";
import checkStaff from "../middleware/checkStaff.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const patientRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // Create a full patient record (patient + exam + findings)
  router.post("/", checkStaff(supabaseAdmin), async (req, res) => {
    let {
      name,
      contact,
      gender,
      age,
      venue,
      guarantor_name,
      guarantor_contact,
      profile_picture,

      // exam
      visual_acuity_left,
      visual_acuity_right,
      pinhole_left,
      pinhole_right,
      auto_refraction_left_sphere,
      auto_refraction_left_cylinder,
      auto_refraction_left_axis,
      auto_refraction_right_sphere,
      auto_refraction_right_cylinder,
      auto_refraction_right_axis,

      // -- NEW SUBJECTIVE REFRACTION FIELDS --
      subjective_refraction_left_sphere,
      subjective_refraction_left_cylinder,
      subjective_refraction_left_axis,
      subjective_refraction_right_sphere,
      subjective_refraction_right_cylinder,
      subjective_refraction_right_axis,

      chief_complaint,
    } = req.body;

    const staff_id = req.user.id;
    console.log("➡️ POST /patients by staff:", staff_id, "| patient:", name);

    try {
      // 1) Create patient
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert([
          {
            name,
            contact,
            gender,
            age,
            venue,
            guarantor_name,
            guarantor_contact,
            profile_picture,
            staff_id,
          },
        ])
        .select()
        .single();

      if (pErr) {
        console.error("❌ Patient insert error:", pErr.message);
        return res.status(400).json({ error: pErr.message });
      }
      console.log("✅ Patient created:", patient?.id);

      // Send WhatsApp thank you message
      if (patient?.contact) {
        sendWhatsAppMessage(patient.contact, "hello_world")
          .then(() => console.log("📨 WhatsApp sent"))
          .catch((err) => console.error("❌ WhatsApp error:", err?.message || err));
      }

      // 2) Create exam only if any exam data provided
const examFields = {
  patient_id: patient.id,
  staff_id,
  visual_acuity_left,
  visual_acuity_right,
  pinhole_left,
  pinhole_right,
  auto_refraction_left_sphere,
  auto_refraction_left_cylinder,
  auto_refraction_left_axis,
  auto_refraction_right_sphere,
  auto_refraction_right_cylinder,
  auto_refraction_right_axis,
  subjective_refraction_left_sphere,
  subjective_refraction_left_cylinder,
  subjective_refraction_left_axis,
  subjective_refraction_right_sphere,
  subjective_refraction_right_cylinder,
  subjective_refraction_right_axis,
  chief_complaint,
};

// Check if exam contains ANY real values (ignore empty / null / undefined)
const hasExamData = Object.values(examFields).some(
  (v) => v !== undefined && v !== null && v !== ""
);

let exam = null;
if (hasExamData) {
  console.log("➡️ Exam data detected — creating exam");
  const { data, error: eErr } = await supabase
    .from("examinations")
    .insert([examFields])
    .select()
    .single();

  if (eErr) {
    console.error("❌ Exam insert error:", eErr.message);
    return res.status(400).json({ error: eErr.message });
  }
  exam = data;
  console.log("✅ Exam created:", exam?.id);
} else {
  console.log("⚠️ No exam data provided — skipping exam creation");
}

return res.json({
  message: hasExamData
    ? "Patient and Examination registered successfully"
    : "Patient registered successfully (No exam data provided)",
  patient,
  exam,
});

    } catch (err) {
      console.error("🔥 POST /patients error:", err?.message || err);
      return res.status(500).json({ error: err?.message || "Server error" });
    }
  });

  /**
   * GET /patients
   * Get list of all patients (basic info only)
   */
  router.get("/", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from("patients")
        .select(
          "id, name, contact, gender, venue, appointment_date, appointment_for, created_at"
        );

      if (error) {
        console.error("❌ GET /patients error:", error.message);
        return res.status(400).json({ error: error.message });
      }

      console.log("✅ GET /patients:", Array.isArray(data) ? data.length : 0);
      return res.json(data);
    } catch (err) {
      console.error("🔥 GET /patients error:", err?.message || err);
      return res.status(500).json({ error: err?.message || "Server error" });
    }
  });

  /**
   * GET /patients/:id
   * Get full details of a patient (patient + exam + findings + diagnoses + payments + staff)
   */
  router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      // 1) Patient info with staff details
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .select("*, staff:staff_id(id,name,phone,role)")
        .eq("id", id)
        .single();

      if (pErr) {
        console.error("❌ GET /patients/:id patient error:", pErr.message);
        return res.status(400).json({ error: pErr.message });
      }

      // 2) Examinations
      const { data: exams, error: eErr } = await supabase
        .from("examinations")
        .select("*")
        .eq("patient_id", id);

      if (eErr) {
        console.error("❌ GET /patients/:id exams error:", eErr.message);
        return res.status(400).json({ error: eErr.message });
      }

      console.log("ℹ️ Exams found:", Array.isArray(exams) ? exams.length : 0);

      // 3) Findings & Diagnoses (only if exams exist)
      let findings = [];
      let diagnoses = [];

      if (Array.isArray(exams) && exams.length > 0) {
        const examIds = exams.map((e) => e.id);

        const { data: findingsData, error: fErr } = await supabase
          .from("examination_findings")
          .select("*")
          .in("exam_id", examIds);

        if (fErr) {
          console.error("❌ GET /patients/:id findings error:", fErr.message);
          return res.status(400).json({ error: fErr.message });
        }
        findings = findingsData || [];
        console.log("ℹ️ Findings found:", findings.length);

        const { data: diagnosesData, error: dErr } = await supabase
          .from("diagnoses")
          .select("*")
          .in("exam_id", examIds);

        if (dErr) {
          console.error("❌ GET /patients/:id diagnoses error:", dErr.message);
          return res.status(400).json({ error: dErr.message });
        }
        diagnoses = diagnosesData || [];
        console.log("ℹ️ Diagnoses found:", diagnoses.length);
      } else {
        console.log("⚠️ Skipped findings/diagnoses queries: no exams");
      }

      // 5) Payments
      const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("*")
        .eq("patient_id", id);

      if (payErr) {
        console.error("❌ GET /patients/:id payments error:", payErr.message);
        return res.status(400).json({ error: payErr.message });
      }
      console.log("ℹ️ Payments found:", Array.isArray(payments) ? payments.length : 0);

      return res.json({
        patient,
        exams,
        findings,
        diagnoses,
        payments,
      });
    } catch (err) {
      console.error("🔥 GET /patients/:id error:", err?.message || err);
      return res.status(500).json({ error: err?.message || "Server error" });
    }
  });

  // PUT /patients/:id - Edit patients details
router.put("/:id", checkStaff(supabaseAdmin), async (req, res) => {
  const { id } = req.params;
  const {
    name,
    contact,
    gender,
    age,
    venue,
    guarantor_name,
    guarantor_contact,
    profile_picture,
    appointment_date,
    appointment_for,
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("patients")
      .update({
        name,
        contact,
        gender,
        age,
        venue,
        guarantor_name,
        guarantor_contact,
        profile_picture,
        appointment_date: appointment_date || null,
        appointment_for,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Patient not found" });

    res.json({ message: "Patient updated", patient: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /examinations/:id - Edit examination
router.put("/examinations/:id", checkStaff(supabaseAdmin), async (req, res) => {
  const { id } = req.params;
  const {
    visual_acuity_left,
    visual_acuity_right,
    pinhole_left,
    pinhole_right,
    auto_refraction_left_sphere,
    auto_refraction_left_cylinder,
    auto_refraction_left_axis,
    auto_refraction_right_sphere,
    auto_refraction_right_cylinder,
    auto_refraction_right_axis,
    subjective_refraction_left_sphere,
    subjective_refraction_left_cylinder,
    subjective_refraction_left_axis,
    subjective_refraction_right_sphere,
    subjective_refraction_right_cylinder,
    subjective_refraction_right_axis,
    // -------------------------------------
    chief_complaint
  } = req.body;

  try {
    const { data, error } = await supabase
      .from("examinations")
      .update({
        visual_acuity_left,
        visual_acuity_right,
        pinhole_left,
        pinhole_right,
        auto_refraction_left_sphere,
        auto_refraction_left_cylinder,
        auto_refraction_left_axis,
        auto_refraction_right_sphere,
        auto_refraction_right_cylinder,
        auto_refraction_right_axis,
        subjective_refraction_left_sphere,
        subjective_refraction_left_cylinder,
        subjective_refraction_left_axis,
        subjective_refraction_right_sphere,
        subjective_refraction_right_cylinder,
        subjective_refraction_right_axis,
        // -------------------------------------------
        chief_complaint,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Examination not found" });

    res.json({ message: "Examination updated", exam: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PUT /examination_findings/:id - Edit exam findings
router.put("/examination_findings/:id", checkStaff(supabaseAdmin), async (req, res) => {
  const { id } = req.params;
  console.log("Incoming PUT /examination_findings:", req.params, req.body);
  const { type, finding } = req.body; // 👈 match the actual table columns

  try {
    const { data, error } = await supabase
      .from("examination_findings")
      .update({
        type,
        finding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Finding not found" });

    res.json({ message: "Finding updated", finding: data });
  } catch (err) {
    console.error("🔥 PUT /examination_findings error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// PUT /diagnoses/:id - Edit diagnosis
router.put("/diagnoses/:id", checkStaff(supabaseAdmin), async (req, res) => {
  const { id } = req.params;
  const { diagnosis, plan, category } = req.body; // 👈 match actual table columns

  try {
    const { data, error } = await supabase
      .from("diagnoses")
      .update({
        diagnosis,
        plan,
        category,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Diagnosis not found" });

    res.json({ message: "Diagnosis updated", diagnosis: data });
  } catch (err) {
    console.error("🔥 PUT /diagnoses error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


// POST /examination_findings - Add new finding
router.post("/:patientId/findings", checkStaff(supabaseAdmin), async (req, res) => {
  const { exam_id, type, finding } = req.body;

  try {
    const { data, error } = await supabase
      .from("examination_findings")
      .insert([
        {
          exam_id,
          type,
          finding,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Finding added", finding: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /diagnoses - Add new diagnosis
router.post("/:patientId/diagnoses", checkStaff(supabaseAdmin), async (req, res) => {
  const { exam_id, diagnosis, category, plan } = req.body; 

  try {
    const { data, error } = await supabase
      .from("diagnoses")
      .insert([
        {
          exam_id,
          diagnosis,
          category,
          plan,
          updated_at: new Date().toISOString(), 
        },
      ])
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: "Diagnosis added", diagnosis: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  return router;
};

export default patientRoutes;
