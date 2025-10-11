// utils/email.js
import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

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
    <h4>Visual Acuity & Pinhole</h4>
    <ul>
      <li><b>Visual Acuity (Left):</b> ${visual_acuity_left || 'N/A'}</li>
      <li><b>Visual Acuity (Right):</b> ${visual_acuity_right || 'N/A'}</li>
      <li><b>Pinhole (Left):</b> ${pinhole_left || 'N/A'}</li>
      <li><b>Pinhole (Right):</b> ${pinhole_right || 'N/A'}</li>
    </ul>

    <h4>Auto Refraction</h4>
    <ul>
      <li><b>Left (Sphere/Cylinder/Axis):</b> ${auto_refraction_left_sphere || 'N/A'} / ${auto_refraction_left_cylinder || 'N/A'} / ${auto_refraction_left_axis || 'N/A'}</li>
      <li><b>Right (Sphere/Cylinder/Axis):</b> ${auto_refraction_right_sphere || 'N/A'} / ${auto_refraction_right_cylinder || 'N/A'} / ${auto_refraction_right_axis || 'N/A'}</li>
    </ul>

    <h4>Subjective Refraction</h4>
    <ul>
      <li><b>Left (Sphere/Cylinder/Axis):</b> ${subjective_refraction_left_sphere || 'N/A'} / ${subjective_refraction_left_cylinder || 'N/A'} / ${subjective_refraction_left_axis || 'N/A'}</li>
      <li><b>Right (Sphere/Cylinder/Axis):</b> ${subjective_refraction_right_sphere || 'N/A'} / ${subjective_refraction_right_cylinder || 'N/A'} / ${subjective_refraction_right_axis || 'N/A'}</li>
    </ul>
  `; 

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
    subject: `Patient Referral from ${referringClinicName}: ${name || 'N/A'}`,
    html: `
      <h2>New Patient Referral from ${referringClinicName}</h2>
      <p>Dear ${referredClinicName || 'Referral Clinic'},</p>
      <p>We are referring our patient, <b>${name || 'N/A'}</b>, to your clinic for specialized care. Please find their details and examination results below.</p>
      
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
        <p>${remark}</p>
      ` : ''}
      
      <p>Please contact the patient at ${contact || 'N/A'} to schedule the next steps.</p>
      <p>Regards,<br>${referringClinicName} Team</p>
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