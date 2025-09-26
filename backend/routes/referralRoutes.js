// routes/referralRoutes.js
import express from 'express';
import { sendReferralEmail } from '../utils/email.js';

const referralRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // POST route to add a new referral clinic
  router.post('/add-clinic', async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required to add a clinic.' });
    }

    try {
      const { data, error } = await supabase
        .from('referral_clinics')
        .insert([{ name, email }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'A clinic with this email already exists.' });
        }
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ message: 'Clinic added successfully', clinic: data });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // PUT route to update a referral clinic
  router.put('/clinic/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required for the update.' });
    }

    try {
      const { data, error } = await supabase
        .from('referral_clinics')
        .update({ name, email })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'A clinic with this email already exists.' });
        }
        return res.status(500).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Clinic not found.' });
      }

      return res.status(200).json({ message: 'Clinic updated successfully', clinic: data });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ✅ GET route to fetch all referral clinics
  router.get("/clinics", async (req, res) => {
    try {
      const { data: clinics, error } = await supabase
        .from('referral_clinics')
        .select('id, name, email');

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(clinics);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ✅ GET route to fetch all referrals with clinic details
  router.get("/referrals", async (req, res) => {
    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          id,
          patient_id,
          remark,
          referred_at,
          referral_clinics (id, name, email)
        `);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(referrals);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // POST route to send a new referral
  router.post("/", async (req, res) => {
    const { patient_id, clinic_id, remark, ...patientData } = req.body;

    if (!patient_id || !clinic_id) {
      return res.status(400).json({ error: "patient_id and clinic_id are required." });
    }

    try {
      // Fetch clinic email from the database
      const { data: clinic, error: clinicErr } = await supabase
        .from('referral_clinics')
        .select('email')
        .eq('id', clinic_id)
        .single();
        
      if (clinicErr || !clinic) {
        return res.status(404).json({ error: 'Referral clinic not found.' });
      }

      // Log the referral in the database
      const { data: referral, error: referralErr } = await supabase
        .from('referrals')
        .insert([{ patient_id, clinic_id, remark }])
        .select()
        .single();
      
      if (referralErr) {
        console.error("Error logging referral:", referralErr.message);
      }
      
      // Send the referral email with all collected data from the frontend
      await sendReferralEmail(clinic.email, patientData);

      return res.json({ message: 'Referral successful.', referral });

    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
};

export default referralRoutes;
