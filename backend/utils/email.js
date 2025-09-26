// utils/email.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

console.log("📧 EMAIL_USER:", process.env.EMAIL_USER);
console.log("📧 EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ loaded" : "❌ missing");


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendReferralEmail = async (to, data) => {
  const { 
    name, contact, gender, venue, appointment_date, appointment_for,
    visual_acuity_left, visual_acuity_right, pinhole_left, pinhole_right,
    auto_refraction_left_sphere, auto_refraction_left_cylinder, auto_refraction_left_axis,
    auto_refraction_right_sphere, auto_refraction_right_cylinder, auto_refraction_right_axis,
    chief_complaint, findings, diagnoses, payments, remark
  } = data;

  const patientInfoHtml = `
    <li><b>Name:</b> ${name || 'N/A'}</li>
    <li><b>Contact:</b> ${contact || 'N/A'}</li>
    <li><b>Gender:</b> ${gender || 'N/A'}</li>
    <li><b>Venue:</b> ${venue || 'N/A'}</li>
    <li><b>Appointment Date:</b> ${appointment_date || 'N/A'}</li>
    <li><b>Reason for Appointment:</b> ${appointment_for || 'N/A'}</li>
    <li><b>Chief Complaint:</b> ${chief_complaint || 'N/A'}</li>
  `;

  const examInfoHtml = `
    <h3>Examination Details</h3>
    <ul>
      <li><b>Visual Acuity (Left):</b> ${visual_acuity_left || 'N/A'}</li>
      <li><b>Visual Acuity (Right):</b> ${visual_acuity_right || 'N/A'}</li>
      <li><b>Pinhole (Left):</b> ${pinhole_left || 'N/A'}</li>
      <li><b>Pinhole (Right):</b> ${pinhole_right || 'N/A'}</li>
      <li><b>Left Refraction (Sphere):</b> ${auto_refraction_left_sphere || 'N/A'}</li>
      <li><b>Left Refraction (Cylinder):</b> ${auto_refraction_left_cylinder || 'N/A'}</li>
      <li><b>Left Refraction (Axis):</b> ${auto_refraction_left_axis || 'N/A'}</li>
      <li><b>Right Refraction (Sphere):</b> ${auto_refraction_right_sphere || 'N/A'}</li>
      <li><b>Right Refraction (Cylinder):</b> ${auto_refraction_right_cylinder || 'N/A'}</li>
      <li><b>Right Refraction (Axis):</b> ${auto_refraction_right_axis || 'N/A'}</li>
    </ul>
  `;

  // ✅ CORRECTED: Use optional chaining and nullish coalescing for safety
  const findingsInfoHtml = (findings?.length ?? 0) > 0 ? `
    <h3>Findings</h3>
    <ul>
      ${findings.map(f => `<li>${f.finding || 'N/A'}</li>`).join('')}
    </ul>
  ` : '';

  const diagnosesInfoHtml = (diagnoses?.length ?? 0) > 0 ? `
    <h3>Diagnoses & Treatment Plans</h3>
    <ul>
      ${diagnoses.map(d => `
        <li>
          <b>Diagnosis:</b> ${d.diagnosis || 'N/A'} <br>
          <b>Category:</b> ${d.category || 'N/A'} <br>
          <b>Treatment Plan:</b> ${d.plan || 'N/A'}
        </li>
      `).join('')}
    </ul>
  ` : '';
  
  const paymentsInfoHtml = (payments?.length ?? 0) > 0 ? `
    <h3>Payments</h3>
    <ul>
      ${payments.map(p => `
        <li>
          <b>Description:</b> ${p.description || 'N/A'} <br>
          <b>Amount:</b> ${p.amount || 'N/A'}
        </li>
      `).join('')}
    </ul>
  ` : '';

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: `Patient Referral: ${name || 'N/A'}`,
    html: `
      <h2>New Patient Referral</h2>
      <p>Please find the details for a new patient referral below.</p>
      
      <h3>Patient Details</h3>
      <ul>
        ${patientInfoHtml}
      </ul>

      ${examInfoHtml}

      ${findingsInfoHtml}

      ${diagnosesInfoHtml}

      ${paymentsInfoHtml}

      ${remark ? `
        <h3>Remarks</h3>
        <p>${remark}</p>
      ` : ''}
      
      <p>This patient was referred by Star Vision.</p>
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