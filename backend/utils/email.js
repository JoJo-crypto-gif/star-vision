// utils/email.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Helper function to escape HTML special characters
const escapeHtml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return 'N/A';
  return unsafe
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReferralEmail = async (to, data, referredClinicName) => {
  const { 
    name, contact, gender, venue, appointment_date, appointment_for,
    visual_acuity_left, visual_acuity_right, pinhole_left, pinhole_right,
    auto_refraction_left_sphere, auto_refraction_left_cylinder, auto_refraction_left_axis,
    auto_refraction_right_sphere, auto_refraction_right_cylinder, auto_refraction_right_axis,
    chief_complaint, findings, diagnoses, payments, remark,
    
    // 🛑 NEW: Subjective Refraction Fields
    subjective_refraction_left_sphere, subjective_refraction_left_cylinder, subjective_refraction_left_axis,
    subjective_refraction_right_sphere, subjective_refraction_right_cylinder, subjective_refraction_right_axis,
  } = data;
  
  const referringClinicName = "Star Vision"; 

  const patientInfoHtml = `
    <li><b>Name:</b> ${escapeHtml(name)}</li>
    <li><b>Contact:</b> ${escapeHtml(contact)}</li>
    <li><b>Gender:</b> ${escapeHtml(gender)}</li>
    <li><b>Venue:</b> ${escapeHtml(venue)}</li>
    <li><b>Appointment Date:</b> ${escapeHtml(appointment_date)}</li>
    <li><b>Reason for Appointment:</b> ${escapeHtml(appointment_for)}</li>
    <li><b>Chief Complaint:</b> ${escapeHtml(chief_complaint)}</li>
  `;

  const examInfoHtml = `
    <h3>Examination Details</h3>
    <h4>Visual Acuity & Pinhole</h4>
    <ul>
      <li><b>Visual Acuity (Left):</b> ${escapeHtml(visual_acuity_left)}</li>
      <li><b>Visual Acuity (Right):</b> ${escapeHtml(visual_acuity_right)}</li>
      <li><b>Pinhole (Left):</b> ${escapeHtml(pinhole_left)}</li>
      <li><b>Pinhole (Right):</b> ${escapeHtml(pinhole_right)}</li>
    </ul>

    <h4>Auto Refraction</h4>
    <ul>
      <li><b>Left (Sphere/Cylinder/Axis):</b> ${escapeHtml(auto_refraction_left_sphere)} / ${escapeHtml(auto_refraction_left_cylinder)} / ${escapeHtml(auto_refraction_left_axis)}</li>
      <li><b>Right (Sphere/Cylinder/Axis):</b> ${escapeHtml(auto_refraction_right_sphere)} / ${escapeHtml(auto_refraction_right_cylinder)} / ${escapeHtml(auto_refraction_right_axis)}</li>
    </ul>

    <h4>Subjective Refraction</h4>
    <ul>
      <li><b>Left (Sphere/Cylinder/Axis):</b> ${escapeHtml(subjective_refraction_left_sphere)} / ${escapeHtml(subjective_refraction_left_cylinder)} / ${escapeHtml(subjective_refraction_left_axis)}</li>
      <li><b>Right (Sphere/Cylinder/Axis):</b> ${escapeHtml(subjective_refraction_right_sphere)} / ${escapeHtml(subjective_refraction_right_cylinder)} / ${escapeHtml(subjective_refraction_right_axis)}</li>
    </ul>
  `; 

  const findingsInfoHtml = (findings?.length ?? 0) > 0 ? `
    <h3>Findings</h3>
    <ul>
      ${findings.map(f => `<li>${escapeHtml(f.finding)}</li>`).join('')}
    </ul>
  ` : '';

  const diagnosesInfoHtml = (diagnoses?.length ?? 0) > 0 ? `
    <h3>Diagnoses & Treatment Plans</h3>
    <ul>
      ${diagnoses.map(d => `
        <li>
          <b>Diagnosis:</b> ${escapeHtml(d.diagnosis)} <br>
          <b>Category:</b> ${escapeHtml(d.category)} <br>
          <b>Treatment Plan:</b> ${escapeHtml(d.plan)}
        </li>
      `).join('')}
    </ul>
  ` : '';
  
  const paymentsInfoHtml = (payments?.length ?? 0) > 0 ? `
    <h3>Payments</h3>
    <ul>
      ${payments.map(p => `
        <li>
          <b>Description:</b> ${escapeHtml(p.description)} <br>
          <b>Amount:</b> ${escapeHtml(p.amount)}
        </li>
      `).join('')}
    </ul>
  ` : '';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: `Patient Referral from ${escapeHtml(referringClinicName)}: ${escapeHtml(name)}`,
    html: `
      <h2>New Patient Referral from ${escapeHtml(referringClinicName)}</h2>
      <p>Dear ${escapeHtml(referredClinicName)},</p>
      <p>We are referring our patient, <b>${escapeHtml(name)}</b>, to your clinic for specialized care. Please find their details and examination results below.</p>
      
      <h3>Patient Details</h3>
      <ul>
        ${patientInfoHtml}
      </ul>

      ${examInfoHtml}

      ${findingsInfoHtml}

      ${diagnosesInfoHtml}

      ${paymentsInfoHtml}

      ${remark ? `
        <h3>Referring Doctor's Remarks</h3>
        <p>${escapeHtml(remark)}</p>
      ` : ''}
      
      <p>Please contact the patient at ${escapeHtml(contact)} to schedule the next steps.</p>
      <p>Regards,<br>${escapeHtml(referringClinicName)} Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Referral email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending referral email to ${to}:`, error);
    throw new Error('Failed to send referral email.');
  }
};