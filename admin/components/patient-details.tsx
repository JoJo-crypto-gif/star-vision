"use client";

import { ArrowLeft, Calendar, User, Phone, MapPin, Stethoscope, FileText, Wallet, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";


// 🚨 Define the props interface to match your backend data
interface PatientDetailsProps {
  patientDetails: {
    patient: {
      id: string;
      name: string;
      contact: string;
      gender: string;
      venue: string;
      guarantor_name: string;
      guarantor_contact: string;
      profile_picture: string;
      appointment_date: string;
      created_at: string;
      staff: {
        id: string;
        name: string;
        role: string;
        phone: string;
      }
    };
    exams: any[];
    findings: any[];
    diagnoses: any[];
    payments: any[];
  };
  onBack: () => void;
}

export function PatientDetails({ patientDetails, onBack }: PatientDetailsProps) {
  const { patient, exams, findings, diagnoses, payments } = patientDetails;
  // const latestExam = exams.length > 0 ? exams[0] : null;
  const [latestExam, setLatestExam] = useState<any>(exams.length > 0 ? exams[0] : null);

  const [showEditPatient, setShowEditPatient] = useState(false);
const [form, setForm] = useState({
  name: patient.name,
  contact: patient.contact,
  gender: patient.gender,
  venue: patient.venue,
  guarantor_name: patient.guarantor_name,
  guarantor_contact: patient.guarantor_contact,
});

const [showEditExam, setShowEditExam] = useState(false);
const [examForm, setExamForm] = useState({
  visual_acuity_left: latestExam?.visual_acuity_left || "",
  visual_acuity_right: latestExam?.visual_acuity_right || "",
  pinhole_left: latestExam?.pinhole_left || "",
  pinhole_right: latestExam?.pinhole_right || "",
  auto_refraction_left_sphere: latestExam?.auto_refraction_left_sphere || "",
  auto_refraction_left_cylinder: latestExam?.auto_refraction_left_cylinder || "",
  auto_refraction_left_axis: latestExam?.auto_refraction_left_axis || "",
  auto_refraction_right_sphere: latestExam?.auto_refraction_right_sphere || "",
  auto_refraction_right_cylinder: latestExam?.auto_refraction_right_cylinder || "",
  auto_refraction_right_axis: latestExam?.auto_refraction_right_axis || "",
  chief_complaint: latestExam?.chief_complaint || "",
});

useEffect(() => {
  if (latestExam) {
    setExamForm({
      visual_acuity_left: latestExam.visual_acuity_left || "",
      visual_acuity_right: latestExam.visual_acuity_right || "",
      pinhole_left: latestExam.pinhole_left || "",
      pinhole_right: latestExam.pinhole_right || "",
      auto_refraction_left_sphere: latestExam.auto_refraction_left_sphere || "",
      auto_refraction_left_cylinder: latestExam.auto_refraction_left_cylinder || "",
      auto_refraction_left_axis: latestExam.auto_refraction_left_axis || "",
      auto_refraction_right_sphere: latestExam.auto_refraction_right_sphere || "",
      auto_refraction_right_cylinder: latestExam.auto_refraction_right_cylinder || "",
      auto_refraction_right_axis: latestExam.auto_refraction_right_axis || "",
      chief_complaint: latestExam.chief_complaint || "",
    });
  }
}, [latestExam]); 

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
const handleUpdatePatient = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token"); // get your stored JWT
    if (!token) {
      alert("You are not logged in");
      return;
    }
    const res = await axios.put(
      `http://localhost:5050/patients/${patient.id}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ attach token
        },
      }
    );
    console.log("Update response:", res.data);
    alert("Patient updated ✅");
    setShowEditPatient(false);
  } catch (err: any) {
    console.error("Update error:", err.response?.data || err.message);
    alert("Failed to update patient ❌");
  }
};

const handleExamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setExamForm({ ...examForm, [e.target.name]: e.target.value });
};
const handleUpdateExam = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `http://localhost:5050/patients/examinations/${latestExam.id}`,
      examForm,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("Exam updated ✅");
    setLatestExam(response.data); // 👈 update state with fresh data
    setShowEditExam(false);
  } catch (err: any) {
    console.error("Exam update error:", err.response?.data || err.message);
    alert("Failed to update exam ❌");
  }
};


  return (
    <div className="space-y-6">
      {/* 🚨 UPDATED: Top section for patient and staff info */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{patient.name}</h2>
          <p className="text-muted-foreground text-sm">
            Registered by {patient.staff?.name ?? "N/A"} on {format(new Date(patient.created_at), "PPP")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 🚨 UPDATED: Patient Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Gender</p>
                <p className="text-sm text-muted-foreground">{patient.gender}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-sm text-muted-foreground">{patient.contact}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-muted-foreground">{patient.venue}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="font-medium mb-1">Guarantor</p>
              <p className="text-sm text-muted-foreground">{patient.guarantor_name ?? "N/A"}</p>
              <p className="text-sm text-muted-foreground">{patient.guarantor_contact ?? "N/A"}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={() => setShowEditPatient(true)}>Edit Patient</Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {/* 🚨 UPDATED: Examinations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Examinations</CardTitle>
              <CardDescription>Visual acuity, refraction, and chief complaint</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestExam ? (
                <>
                  <div>
                    <p className="font-medium">Visual Acuity</p>
                    <p className="text-sm text-muted-foreground">
                      Left: {latestExam.visual_acuity_left ?? "N/A"} / Right: {latestExam.visual_acuity_right ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Pinhole</p>
                    <p className="text-sm text-muted-foreground">
                      Left: {latestExam.pinhole_left ?? "N/A"} / Right: {latestExam.pinhole_right ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Auto Refraction</p>
                    <p className="text-sm text-muted-foreground">
                      Left: SPH {latestExam.auto_refraction_left_sphere ?? "N/A"}, CYL {latestExam.auto_refraction_left_cylinder ?? "N/A"}, Axis {latestExam.auto_refraction_left_axis ?? "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Right: SPH {latestExam.auto_refraction_right_sphere ?? "N/A"}, CYL {latestExam.auto_refraction_right_cylinder ?? "N/A"}, Axis {latestExam.auto_refraction_right_axis ?? "N/A"}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium mb-1">Chief Complaint</p>
                    <p className="text-sm text-muted-foreground">{latestExam.chief_complaint ?? "N/A"}</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No examination data found.
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" onClick={() => setShowEditExam(true)}>
                Edit Exams
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      {/* 🚨 NEW: Findings and Diagnoses section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Findings</CardTitle>
            <CardDescription>Observations from the examination</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {findings.length > 0 ? (
              findings.map((finding: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{finding.type}</p>
                    <p className="text-sm text-muted-foreground">{finding.finding}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No findings recorded.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
              <Button variant="outline">
                Edit Findings
              </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnoses & Plan</CardTitle>
            <CardDescription>Diagnoses and recommended plan of action</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {diagnoses.length > 0 ? (
              diagnoses.map((diagnosis: any, index: number) => (
                <div key={index} className="space-y-1">
                  <p className="font-medium">{diagnosis.diagnosis}</p>
                  <p className="text-sm text-muted-foreground">Categoty: {diagnosis.category}</p>
                  <p className="text-sm text-muted-foreground">Plan: {diagnosis.plan}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No diagnoses recorded.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
              <Button variant="outline">
                Edit Diagnosis
              </Button>
          </CardFooter>
        </Card>
      </div>

      {/* 🚨 NEW: Payments section */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
          <CardDescription>Payment history for the patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.length > 0 ? (
            payments.map((payment: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{payment.item}</p>
                  <p className="text-sm text-muted-foreground">
                    GHC {payment.amount}
                  </p>
                </div>
                <Badge variant={payment.status === "paid" ? "default" : "secondary"}>
                  {payment.status}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No payments recorded.
            </div>
          )}
        </CardContent>
        {/* <CardFooter className="flex justify-end">
          <Button variant="outline">Add Payment</Button>
        </CardFooter> */}
      </Card>

<Dialog open={showEditPatient} onOpenChange={setShowEditPatient}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Patient</DialogTitle>
      <DialogDescription>Update patient personal details.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleUpdatePatient} className="space-y-3">
      <Input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full Name"
      />
      <Input
        name="contact"
        value={form.contact}
        onChange={handleChange}
        placeholder="Contact"
      />
      <Input
        name="gender"
        value={form.gender}
        onChange={handleChange}
        placeholder="Gender"
      />
      <Input
        name="venue"
        value={form.venue}
        onChange={handleChange}
        placeholder="Venue"
      />
      <Input
        name="guarantor_name"
        value={form.guarantor_name}
        onChange={handleChange}
        placeholder="Guarantor Name"
      />
      <Input
        name="guarantor_contact"
        value={form.guarantor_contact}
        onChange={handleChange}
        placeholder="Guarantor Contact"
      />

      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<Dialog open={showEditExam} onOpenChange={setShowEditExam}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit Exam</DialogTitle>
      <DialogDescription>Update exam details.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleUpdateExam} className="space-y-3">
      <Label htmlFor="visual_acuity_left" className="mt-0">Visual Acuity Left</Label>
      <Input name="visual_acuity_left" value={examForm.visual_acuity_left} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="visual_acuity_right" className="mt-0">Visual Acuity Right</Label>
      <Input name="visual_acuity_right" value={examForm.visual_acuity_right} onChange={handleExamChange} className="mb-3"/>
      
      <Label htmlFor="pinhole_left" className="mt-0">Pinhole Left</Label>
      <Input name="pinhole_left" value={examForm.pinhole_left} onChange={handleExamChange} className="mb-3"/>
      
      <Label htmlFor="pinhole_right" className="mt-0">Pinhole Right</Label>
      <Input name="pinhole_right" value={examForm.pinhole_right} onChange={handleExamChange} className="mb-3"/>
      
      <Label htmlFor="auto_refraction_left_sphere" className="mt-0">Auto Refraction Left SPH</Label>
      <Input name="auto_refraction_left_sphere" value={examForm.auto_refraction_left_sphere} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="auto_refraction_left_cylinder" className="mt-0">Auto Refraction Left CYL</Label>
      <Input name="auto_refraction_left_cylinder" value={examForm.auto_refraction_left_cylinder} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="auto_refraction_left_axis" className="mt-0">Auto Refraction Left AXIS</Label>
      <Input name="auto_refraction_left_axis" value={examForm.auto_refraction_left_axis} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="auto_refraction_right_sphere" className="mt-0">Auto Refraction Right SPH</Label>
      <Input name="auto_refraction_right_sphere" value={examForm.auto_refraction_right_sphere} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="auto_refraction_right_cylinder" className="mt-0">Auto Refraction Right CYL</Label>
      <Input name="auto_refraction_right_cylinder" value={examForm.auto_refraction_right_cylinder} onChange={handleExamChange} className="mb-3"/>

      <Label htmlFor="auto_refraction_right_axis" className="mt-0">Auto Refraction Right Axis</Label>
      <Input name="auto_refraction_right_axis" value={examForm.auto_refraction_right_axis} onChange={handleExamChange} className="mb-3"/>


      <Label htmlFor="chief_complaint" className="mt-0">Chief Complaint</Label>
      <Input name="chief_complaint" value={examForm.chief_complaint} onChange={handleExamChange} className="mb-3"/>
      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

    </div>
  );
}