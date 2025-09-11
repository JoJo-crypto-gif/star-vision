// components/add-patient-form.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AddPatientDetailsForm } from "@/components/forms/add-patient-details";
import { AddExaminationForm } from "@/components/forms/add-examination-form";
import { AddFindingsForm } from "@/components/forms/add-findings-form";
import { AddDiagnosesForm } from "@/components/forms/add-diagnoses-form";
import { AddPaymentsForm } from "@/components/forms/add-payments-form";
import { addPatientSchema } from "@/components/schema/patient-schemas";

export function AddPatientForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    let isValid = false;
    if (step === 0) {
      isValid = await trigger(["name", "contact", "gender", "venue", "appointment_date"]);
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
      ]);
    } else if (step === 2) {
      isValid = await trigger(["findings"]);
    } else if (step === 3) {
      isValid = await trigger(["diagnoses"]);
    } else if (step === 4) {
      isValid = await trigger(["payments"]);
    }

    if (isValid) {
      setStep((prev) => prev + 1);
    } else {
      alert("⚠️ Validation Error: Please fill out all required fields.");
    }
  };

const onSubmit = async (data: z.infer<typeof addPatientSchema>) => {
  setIsSubmitting(true);
  const token = localStorage.getItem("token");

  console.log("🔑 Token being sent:", token);
  console.log("📦 Submitting data:", data);

  if (!token) {
    alert("❌ Authorization Error: Please log in to add a patient.");
    setIsSubmitting(false);
    return;
  }

  try {
    // ✅ Remove empty string date
    const payload = { ...data };
    if (!payload.appointment_date) {
      delete payload.appointment_date;
    }

    console.log("📦 Final payload being sent:", payload);

    const response = await fetch("http://localhost:5000/patients", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    console.log("📥 Server response:", result);
    console.log("📊 Response status:", response.status);

    if (!response.ok) throw new Error(result.message || "Failed to add patient.");

    alert("✅ Patient Added: The new patient has been successfully registered.");

    methods.reset();
    setStep(0);

  } catch (error: any) {
    console.error("❌ Submit error:", error);
    alert(`❌ Error: ${error.message || "Something went wrong. Please try again."}`);
  } finally {
    setIsSubmitting(false);
  }
};


  const stepComponents = [
    <AddPatientDetailsForm key="step0" />,
    <AddExaminationForm key="step1" />,
    <AddFindingsForm key="step2" />,
    <AddDiagnosesForm key="step3" />,
    <AddPaymentsForm key="step4" />,
  ];

  return (
    <Card className="max-w-3xl mx-auto w-full">
      <CardHeader>
        <CardTitle>Register New Patient</CardTitle>
      </CardHeader>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">{stepComponents[step]}</CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            {step < stepComponents.length - 1 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleNext();
                }}
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
