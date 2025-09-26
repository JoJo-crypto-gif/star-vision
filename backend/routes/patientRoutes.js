// backend/routes/patientRoutes.js
import express from "express";
import checkStaff from "../middleware/checkStaff.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";

const patientRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // Create a full patient record (patient + exam + findings + diagnoses + payments)
  
  router.post("/", checkStaff(supabaseAdmin), async (req, res) => {
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
      payments
    } = req.body;

    const staff_id = req.user.id;

    if (appointment_date) {
      const date = new Date(appointment_date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({ error: "Invalid appointment_date format. Please use a valid date string." });
      }
    }

    try {
      // 1. Create patient
      const { data: patient, error: pErr } = await supabase
        .from("patients")
        .insert([{
          name,
          contact,
          gender,
          venue,
          guarantor_name,
          guarantor_contact,
          profile_picture,
          appointment_date,
          appointment_for, // ✅ Added
          staff_id,
        }])
        .select()
        .single();

      if (pErr) return res.status(400).json({ error: pErr.message });
      // send WhatsApp thank you message
      if (patient.contact) {
        // Make sure contact is in full international format, e.g. 233XXXXXXXXX
        sendWhatsAppMessage(patient.contact, "hello_world")
          .then(() => console.log("✅ WhatsApp message sent"))
          .catch((err) => console.error("❌ WhatsApp error:", err));
      }

      // 2. Create exam
      const { data: exam, error: eErr } = await supabase
        .from("examinations")
        .insert([{
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
        }])
        .select()
        .single();

      if (eErr) return res.status(400).json({ error: eErr.message });

      // 3. Insert findings
      if (Array.isArray(findings) && findings.length > 0) {
        const findingsPayload = findings.map((f) => ({
          exam_id: exam.id,
          type: f.type,
          finding: f.finding,
        }));
        const { data: findingsData, error: fErr } = await supabase
          .from("examination_findings")
          .insert(findingsPayload)
          .select();

        if (fErr) {
          console.error("Error inserting findings:", fErr.message);
        }
      }

      // 4. Insert diagnoses
      if (Array.isArray(diagnoses) && diagnoses.length > 0) {
        const diagPayload = diagnoses.map((d) => ({
          exam_id: exam.id,
          diagnosis: d.diagnosis,
          plan: d.plan ?? "",
          category: d.category ?? null,
        }));
        const { data: diagData, error: dErr } = await supabase
          .from("diagnoses")
          .insert(diagPayload);

        if (dErr) {
          console.error("Error inserting diagnoses:", dErr.message);
        }
      }

      // 5. Insert payments
      if (Array.isArray(payments) && payments.length > 0) {
        const paymentPayload = payments.map((p) => ({
          patient_id: patient.id,
          item: p.item,
          amount: p.amount,
          status: p.status ?? "pending",
        }));
        const { data: paymentData, error: payErr } = await supabase
          .from("payments")
          .insert(paymentPayload);

        if (payErr) {
          console.error("Error inserting payments:", payErr.message);
        }
      }

      return res.json({
        message: "Patient registered successfully",
        patient,
        exam,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
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
        .select("id, name, contact, gender, venue, appointment_date, appointment_for, created_at"); // ✅ Added

      if (error) return res.status(400).json({ error: error.message });

      return res.json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
    
  /**
   * GET /patients/:id
   * Get full details of a patient (patient + exam + findings + diagnoses + payments + staff)
   */
  router.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
      // 1. Patient info with staff details
 const { data: patient, error: pErr } = await supabase
  .from("patients")
  .select("*, staff:staff_id(id,name,phone,role)") // The wildcard `*` will include appointment_for
  .eq("id", id)
  .single();

      if (pErr) return res.status(400).json({ error: pErr.message });

      // 2. Examinations
      const { data: exams, error: eErr } = await supabase
        .from("examinations")
        .select("*")
        .eq("patient_id", id);

      if (eErr) return res.status(400).json({ error: eErr.message });

      // 3. Findings (linked to exams)
      const { data: findings, error: fErr } = await supabase
        .from("examination_findings")
        .select("*")
        .in("exam_id", exams.map((e) => e.id));

      if (fErr) return res.status(400).json({ error: fErr.message });

      // 4. Diagnoses (linked to exams)
      const { data: diagnoses, error: dErr } = await supabase
        .from("diagnoses")
        .select("*")
        .in("exam_id", exams.map((e) => e.id));

      if (dErr) return res.status(400).json({ error: dErr.message });

      // 5. Payments (linked to patient)
      const { data: payments, error: payErr } = await supabase
        .from("payments")
        .select("*")
        .eq("patient_id", id);

      if (payErr) return res.status(400).json({ error: payErr.message });

      return res.json({
        patient,
        exams,
        findings,
        diagnoses,
        payments,
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });


  return router;
};

export default patientRoutes;