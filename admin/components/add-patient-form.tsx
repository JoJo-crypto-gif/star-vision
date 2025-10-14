// components/add-patient-form.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AddPatientDetailsForm } from "@/components/forms/add-patient-details";
import { AddExaminationForm } from "@/components/forms/add-examination-form";

import { addPatientSchema } from "@/components/schema/patient-schemas";

// Define the expected shape of the schema manually since the original schema is complex
type AddPatientData = z.infer<typeof addPatientSchema>;
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
export function AddPatientForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const methods = useForm<AddPatientData>({
    resolver: zodResolver(addPatientSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      contact: "",
      gender: "Male",
      age: "",
      occupation: "",
      venue: "",
      guarantor_name: "",
      guarantor_contact: "",

      profile_picture: null,
      visual_acuity_left: "",
      visual_acuity_right: "",
      pinhole_left: "",
      pinhole_right: "",
      auto_refraction_left_sphere: "",
      auto_refraction_left_cylinder: "",
      auto_refraction_left_axis: "",
      auto_refraction_right_sphere: "",
      auto_refraction_right_cylinder: "",
      auto_refraction_right_axis: "",
      // ✅ ADDED Subjective Refraction
      subjective_refraction_left_sphere: "",
      subjective_refraction_left_cylinder: "",
      subjective_refraction_left_axis: "",
      subjective_refraction_right_sphere: "",
      subjective_refraction_right_cylinder: "",
      subjective_refraction_right_axis: "",
      // ----------------------------------
      chief_complaint: "",
    } as any, // Cast to any because the schema will be simplified next
  });

  const { handleSubmit, trigger, reset } = methods;

  // Step components are simplified
  const stepComponents = [
    <AddPatientDetailsForm key="step0" />,
    <AddExaminationForm key="step1" />,
  ];

  // Step-specific validation
  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); 
    
    setIsSubmitting(true); 
    let isValid = false;

    try {
        if (step === 0) {
            isValid = await trigger(["name", "contact", "gender", "venue"] as const);
        } else if (step === 1) {
            // Final validation step (Examination details)
            isValid = await trigger([
            "visual_acuity_left",
            "visual_acuity_right",
            "pinhole_left",
            "pinhole_right",
            "auto_refraction_left_sphere",
            "auto_refraction_left_cylinder",
            "auto_refraction_left_axis",
            "auto_refraction_right_sphere",
            "auto_refraction_right_cylinder",
            "auto_refraction_right_axis",
            // ✅ Include Subjective Refraction for validation
            "subjective_refraction_left_sphere",
            "subjective_refraction_left_cylinder",
            "subjective_refraction_left_axis",
            "subjective_refraction_right_sphere",
            "subjective_refraction_right_cylinder",
            "subjective_refraction_right_axis",
            "chief_complaint",
            ] as const);
        }   


        if (isValid) {
            setStep((prev) => prev + 1);
        } else {
            alert("⚠️ Please fix validation errors before continuing.");
        }
    } catch (error) {
        console.error("Validation error during next step:", error);
        alert("An error occurred during validation.");
    } finally {
        setIsSubmitting(false); 
    }
  };


  // Final submit
const onSubmit = async (data: AddPatientData) => {
  setIsSubmitting(true);
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ Authorization Error: Please log in to add a patient.");
    setIsSubmitting(false);
    return;
  }
  
  const payload = { ...data };

  try {
    // 1. Add patient & examination (Backend handles both)
    const patientResponse = await fetch(`${baseUrl}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload), // Send the entire simplified form data
    });

    const patientResult = await patientResponse.json();
    console.log("Patient add response:", patientResult);

    if (!patientResponse.ok) {
      throw new Error(
        patientResult.error || patientResult.message || "Failed to add patient"
      );
    }
    
    alert("✅ Patient and Examination added successfully!");

    reset();
    setStep(0);
    router.push("/staff/add-patient");
  } catch (error: any) {
    console.error("Submit error:", error);
    alert(`❌ Error: ${error.message || "Something went wrong."}`);
  } finally {
    setIsSubmitting(false);
  }
};

const handleLogout = () => { 
  localStorage.removeItem("token"); 
  localStorage.removeItem("user"); 
  localStorage.removeItem("role"); 
  router.replace("/login"); 
};

const handleRoleAction = () => {
  const role = localStorage.getItem("role");
  if (role === "admin" || role === "doctor") {
    router.back(); // Go to previous page
  } else if (role === "staff") {
    handleLogout(); // Sign out
  }
};



  return (
    <Card className="max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-4">
  <Button onClick={handleRoleAction} variant="destructive">
    <ChevronLeft className="mr-2 h-4 w-4" />
    Go Back / Logout
  </Button>
</div>

      <CardHeader>
        <CardTitle>Register New Patient</CardTitle>
      </CardHeader>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={(e) => {
            // prevent accidental "Enter" submit before last step
            if (e.key === "Enter" && step < stepComponents.length - 1) {
              e.preventDefault();
            }
          }}
        >
          <CardContent className="space-y-4">
            {stepComponents[step]}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            {/* stepComponents.length is 2. Submit button appears when step === 1 */}
            {step !== stepComponents.length - 1 ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                disabled={isSubmitting} 
              >
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            )}
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}