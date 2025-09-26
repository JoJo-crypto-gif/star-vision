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
import { AddFindingsForm } from "@/components/forms/add-findings-form";
import { AddDiagnosesForm } from "@/components/forms/add-diagnoses-form";
import { AddPaymentsForm } from "@/components/forms/add-payments-form";
import { AddReferralForm } from "@/components/forms/add-referral-form";

import { addPatientSchema } from "@/components/schema/patient-schemas";

export function AddPatientForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for async operations

  const methods = useForm({
    resolver: zodResolver(addPatientSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      contact: "",
      gender: "Male",
      venue: "",
      guarantor_name: "",
      guarantor_contact: "",
      appointment_date: "",
      appointment_for: "",
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
      chief_complaint: "",
      findings: [],
      diagnoses: [],
      payments: [],
      clinicId: "",
      remark: "",
    },
  });

  const { handleSubmit, trigger, reset } = methods;

  // Step-specific validation
  // CHANGE 1: Accept the React MouseEvent
  const handleNext = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // FIX 1: Explicitly prevent the default form submission action
    e.preventDefault(); 
    
    setIsSubmitting(true); 
    let isValid = false;

    try {
        if (step === 0) {
            isValid = await trigger(["name", "contact", "gender", "venue"] as const);
        } else if (step === 1) {
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
            "chief_complaint",
            ] as const);
        } else if (step === 2) {
            isValid = await trigger(["findings"] as const);
        } else if (step === 3) {
            isValid = await trigger(["diagnoses"] as const);
        } else if (step === 4) {
            isValid = await trigger(["payments"] as const);
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
  const onSubmit = async (data: z.infer<typeof addPatientSchema>) => {
    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    if (!token) {
      alert("❌ Authorization Error: Please log in to add a patient.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { clinicId, remark, ...patientData } = data;

      // 1. Add patient
      const patientResponse = await fetch("http://localhost:5050/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patientData),
      });

      const patientResult = await patientResponse.json();
      console.log("Patient add response:", patientResult);

      if (!patientResponse.ok) {
        throw new Error(
          patientResult.error ||
            patientResult.message ||
            "Failed to add patient"
        );
      }

      const patientId = patientResult.patient.id;

      // 2. Add referral (optional)
      if (clinicId) {
        const referralPayload = {
          patient_id: patientId,
          clinic_id: clinicId,
          remark: remark || "",
        };

        const referralResponse = await fetch(
          "http://localhost:5050/referrals",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(referralPayload),
          }
        );

        const referralResult = await referralResponse.json();
        console.log("Referral add response:", referralResult);

        if (!referralResponse.ok) {
          alert(
            `⚠️ Referral Failed: Patient added, but referral could not be sent. (${
              referralResult.error ||
              referralResult.message ||
              "Unknown error"
            })`
          );
        } else {
          alert("✅ Patient added and referral sent successfully!");
        }
      } else {
        alert("✅ Patient added successfully!");
      }

      reset();
      setStep(0);
      router.push("/patients");
    } catch (error: any) {
      console.error("Submit error:", error);
      alert(`❌ Error: ${error.message || "Something went wrong."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step components
  const stepComponents = [
    <AddPatientDetailsForm key="step0" />,
    <AddExaminationForm key="step1" />,
    <AddFindingsForm key="step2" />,
    <AddDiagnosesForm key="step3" />,
    <AddPaymentsForm key="step4" />,
    <AddReferralForm key="step5" />,
  ];

  return (
    <Card className="max-w-3xl mx-auto w-full">
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

            {step !== stepComponents.length - 1 ? (
              <Button 
                type="button" 
                // CHANGE 2: Pass the event object (e) to handleNext
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