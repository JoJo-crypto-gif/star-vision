// routes/referralRoutes.js
import express from 'express';
import { sendReferralEmail } from '../utils/email.js';
import checkDoctor from '../middleware/checkDoctor.js'; // Middleware for authentication and role check

const referralRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // ----------------------------------------------------------------------
  // POST route to add a new referral clinic
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // PUT route to update a referral clinic
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // GET route to fetch all referral clinics
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // GET route to fetch all referrals with clinic details
  // ----------------------------------------------------------------------
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

  // ----------------------------------------------------------------------
  // POST route to send a new referral (Requires Doctor/Admin Role)
  // ----------------------------------------------------------------------
  router.post("/", checkDoctor(supabase), async (req, res) => {
    const { patient_id, clinic_id, remark, ...patientData } = req.body;

    // Get the ID of the user creating the referral from the middleware
    const referring_doctor_id = req.user.id; 

    if (!patient_id || !clinic_id || !referring_doctor_id) {
      return res.status(400).json({ error: "patient_id, clinic_id, and authentication are required." });
    }

    try {
      // 1. Fetch clinic email and name from the database
      const { data: clinic, error: clinicErr } = await supabase
        .from('referral_clinics')
        .select('email, name') 
        .eq('id', clinic_id)
        .single();
        
      if (clinicErr || !clinic) {
        return res.status(404).json({ error: 'Referral clinic not found.' });
      }

      // 2. Log the referral in the database (including the doctor ID)
      const { data: referral, error: referralErr } = await supabase
        .from('referrals')
        .insert([
          { 
            patient_id, 
            clinic_id, 
            remark,
            referring_doctor_id, // Inserting the authenticated user's ID
          }
        ])
        .select()
        .single();
      
      if (referralErr) {
        console.error("Error logging referral:", referralErr.message);
        return res.status(500).json({ error: referralErr.message || "Failed to log referral in database." });
      }
      
      // 3. Send the referral email
      await sendReferralEmail(clinic.email, patientData, clinic.name); 

      return res.json({ message: 'Referral successful. Email sent.', referral });

    } catch (err) {
      console.error("Referral processing error:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // routes/referralRoutes.js (Add this new route)

  // 🛑 NEW: GET route to fetch all referrals for a specific patient
  router.get("/patient/:patientId", async (req, res) => {
    const { patientId } = req.params;

    try {
      const { data: referrals, error } = await supabase
        .from('referrals')
        .select(`
          id,
          patient_id,
          remark,
          referred_at,
          referral_clinics (id, name, email)
        `)
        .eq('patient_id', patientId)
        .order('referred_at', { ascending: false }); // Show newest referrals first

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.json(referrals);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
  
// ... (The rest of your file continues)

  return router;
};

export default referralRoutes;