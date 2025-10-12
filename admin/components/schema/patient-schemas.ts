// frontend/schema/patient-schemas.js

import * as z from "zod";

export const addPatientSchema = z.object({
  // Step 1: Patient Details (KEEP)
  name: z.string().min(2, { message: "Name is required." }),
  contact: z.string().min(10, { message: "Contact must be at least 10 characters." }),
  gender: z.string().nonempty({ message: "Gender is required." }),
  age: z.preprocess(val => Number(val), z.number().optional()),
  venue: z.string().nonempty({ message: "Venue is required." }),
  guarantor_name: z.string().optional().or(z.literal("")),
  guarantor_contact: z.string().optional().or(z.literal("")),
  profile_picture: z.any().optional(),

  // Step 2: Examination Details (KEEP)
  visual_acuity_left: z.string().optional().or(z.literal("")),
  visual_acuity_right: z.string().optional().or(z.literal("")),

  pinhole_left: z.string().optional().or(z.literal("")),
  pinhole_right: z.string().optional().or(z.literal("")),

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
  
  // ✅ ADDED Subjective Refraction
  subjective_refraction_left_sphere: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left SPH must be a number.",
  }),
  subjective_refraction_left_cylinder: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left CYL must be a number.",
  }),
  subjective_refraction_left_axis: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Left AXIS must be a number.",
  }),
  subjective_refraction_right_sphere: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right SPH must be a number.",
  }),
  subjective_refraction_right_cylinder: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right CYL must be a number.",
  }),
  subjective_refraction_right_axis: z.string().optional().refine(val => val === "" || !isNaN(Number(val)), {
    message: "Right AXIS must be a number.",
  }),
  // ------------------------------

  chief_complaint: z.string().optional().or(z.literal("")),
  
});