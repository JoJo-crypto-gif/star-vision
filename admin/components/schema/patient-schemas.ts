import * as z from "zod";

export const addPatientSchema = z.object({
  // Step 1: Patient Details
  name: z.string().min(2, { message: "Name is required." }),
  contact: z.string().min(10, { message: "Contact must be at least 10 characters." }),
  gender: z.string().nonempty({ message: "Gender is required." }),
  venue: z.string().nonempty({ message: "Venue is required." }),
  guarantor_name: z.string().optional().or(z.literal("")),
  guarantor_contact: z.string().optional().or(z.literal("")),
  profile_picture: z.any().optional(),

  // Step 2: Examination Details
  visual_acuity_left: z.string().optional().or(z.literal("")),   // keep as string if stored as text (like "6/6")
  visual_acuity_right: z.string().optional().or(z.literal("")),
  
  // ✅ numeric-only fields
  pinhole_left: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Pinhole (Left) must be a number.",
  }),
  pinhole_right: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Pinhole (Right) must be a number.",
  }),

  auto_refraction_left_sphere: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left Sphere must be a number.",
  }),
  auto_refraction_left_cylinder: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left Cylinder must be a number.",
  }),
  auto_refraction_left_axis: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left Axis must be a number.",
  }),
  auto_refraction_right_sphere: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right Sphere must be a number.",
  }),
  auto_refraction_right_cylinder: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right Cylinder must be a number.",
  }),
  auto_refraction_right_axis: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right Axis must be a number.",
  }),

  chief_complaint: z.string().optional().or(z.literal("")),
  appointment_date: z.string().optional(),

  // Step 3: Findings
  findings: z.array(z.object({
    type: z.string().nonempty({ message: "Type is required." }),
    finding: z.string().nonempty({ message: "Finding is required." }),
  })).optional(),

  // Step 4: Diagnoses
  diagnoses: z.array(z.object({
    diagnosis: z.string().nonempty({ message: "Diagnosis is required." }),
    plan: z.string().optional().or(z.literal("")),
  })).optional(),

  // Step 5: Payments
  payments: z.array(z.object({
    item: z.string().nonempty({ message: "Item is required." }),
    amount: z.string()
      .transform(val => Number(val))
      .refine(val => !isNaN(val) && val > 0, { message: "Amount must be a positive number." }),
    status: z.string().optional().or(z.literal("")),
  })).optional(),
});
