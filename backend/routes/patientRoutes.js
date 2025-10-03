// backend/routes/patientRoutes.js
import express from "express";
import checkStaff from "../middleware/checkStaff.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const patientRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // Create a full patient record (patient + exam + findings + diagnoses + payments)
  router.post("/", checkStaff(supabaseAdmin), async (req, res) => {
    let {
      name,
      contact,
      gender,
      venue,
      guarantor_name,
      guarantor_contact,
      profile_picture,
      appointment_date,
      appointment_for,

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
      chief_complaint,

      // findings & diagnoses
      findings,
      diagnoses,

      // payments
      payments,
    } = req.body;

    const staff_id = req.user.id;
    console.log("➡️ POST /patients by staff:", staff_id, "| patient:", name);

    // Appointment date handling: silent fallback to null if missing/invalid
    if (appointment_date) {
      const d = new Date(appointment_date);
      if (isNaN(d.getTime())) {
        console.log("⚠️ Invalid appointment_date received. Saving as null.");
        appointment_date = null;
      }
    } else {
      console.log("ℹ️ No appointment_date provided. Saving as null.");
      appointment_date = null;
    }

    try {
      // 1) Create patient
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert([
          {
            name,
            contact,
            gender,
            venue,
            guarantor_name,
            guarantor_contact,
            profile_picture,
            appointment_date,
            appointment_for,
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

      // Send WhatsApp thank you message (best effort)
      if (patient?.contact) {
        sendWhatsAppMessage(patient.contact, "hello_world")
          .then(() => console.log("📨 WhatsApp sent"))
          .catch((err) => console.error("❌ WhatsApp error:", err?.message || err));
      }

      // 2) Create exam
      const { data: exam, error: eErr } = await supabase
        .from("examinations")
        .insert([
          {
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
            chief_complaint,
          },
        ])
        .select()
        .single();

      if (eErr) {
        console.error("❌ Exam insert error:", eErr.message);
        return res.status(400).json({ error: eErr.message });
      }
      console.log("✅ Exam created:", exam?.id);

      // 3) Insert findings (if any)
      if (Array.isArray(findings) && findings.length > 0) {
        const findingsPayload = findings.map((f) => ({
          exam_id: exam.id,
          type: f.type,
          finding: f.finding,
        }));
        const { error: fErr } = await supabase
          .from("examination_findings")
          .insert(findingsPayload);

        if (fErr) {
          console.error("❌ Findings insert error:", fErr.message);
        } else {
          console.log("✅ Inserted findings:", findingsPayload.length);
        }
      } else {
        console.log("⚠️ Skipped findings: empty array");
      }

      // 4) Insert diagnoses (if any)
      if (Array.isArray(diagnoses) && diagnoses.length > 0) {
        const diagPayload = diagnoses.map((d) => ({
          exam_id: exam.id,
          diagnosis: d.diagnosis,
          plan: d.plan ?? "",
          category: d.category ?? null,
        }));
        const { error: dErr } = await supabase
          .from("diagnoses")
          .insert(diagPayload);

        if (dErr) {
          console.error("❌ Diagnoses insert error:", dErr.message);
        } else {
          console.log("✅ Inserted diagnoses:", diagPayload.length);
        }
      } else {
        console.log("⚠️ Skipped diagnoses: empty array");
      }

      // 5) Insert payments (if any)
      if (Array.isArray(payments) && payments.length > 0) {
        const paymentPayload = payments.map((p) => ({
          patient_id: patient.id,
          item: p.item,
          amount: p.amount,
          status: p.status ?? "pending",
        }));
        const { error: payErr } = await supabase
          .from("payments")
          .insert(paymentPayload);

        if (payErr) {
          console.error("❌ Payments insert error:", payErr.message);
        } else {
          console.log("✅ Inserted payments:", paymentPayload.length);
        }
      } else {
        console.log("⚠️ Skipped payments: empty array");
      }

      return res.json({
        message: "Patient registered successfully",
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
  const { description, eye } = req.body;

  try {
    const { data, error } = await supabase
      .from("examination_findings")
      .update({
        description,
        eye,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Finding not found" });

    res.json({ message: "Finding updated", finding: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /diagnoses/:id. - Edit diagnosis
router.put("/diagnoses/:id", checkStaff(supabaseAdmin), async (req, res) => {
  const { id } = req.params;
  const { condition, severity, notes } = req.body;

  try {
    const { data, error } = await supabase
      .from("diagnoses")
      .update({
        condition,
        severity,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Diagnosis not found" });

    res.json({ message: "Diagnosis updated", diagnosis: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




  return router;
};

export default patientRoutes;
