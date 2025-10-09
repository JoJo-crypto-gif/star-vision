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

// Define the standardized list of categories
const DIAGNOSIS_CATEGORIES = [
  "Refractive error",
  "Anterior segment diseases",
  "Allergy",
  "Posterior segment diseases",
  "Glaucoma",
  "Ocular deviations",
  "Amblyopia",
  "Low vision",
  "Retinopathies",
];

export function PatientDetails({ patientDetails: initialDetails, onBack }: PatientDetailsProps) {
  const [patientDetails, setPatientDetails] = useState(initialDetails);
  const { patient, exams, findings, diagnoses, payments } = patientDetails;

  const [latestExam, setLatestExam] = useState<any>(exams.length > 0 ? exams[0] : null);
  // For editing all findings at once
  const [showEditFindings, setShowEditFindings] = useState(false);
  const [findingsForm, setFindingsForm] = useState<any[]>(findings || []);
  // For editing all diagnosis at once
  const [showEditDiagnosis, setShowEditDiagnosis] = useState(false);
  const [diagnosisForm, setDiagnosisForm] = useState<any[]>(diagnoses || []);
  //For addig new findings
  const [newFinding, setNewFinding] = useState({ type: "", finding: "" });
  const [showAddFinding, setShowAddFinding] = useState(false);
  // For adding new diagnoses
  const [newDiagnosis, setNewDiagnosis] = useState({ diagnosis: "", category: "", plan: "" });
  const [showAddDiagnosis, setShowAddDiagnosis] = useState(false);



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

  subjective_refraction_left_sphere: latestExam?.subjective_refraction_left_sphere || "",
  subjective_refraction_left_cylinder: latestExam?.subjective_refraction_left_cylinder || "",
  subjective_refraction_left_axis: latestExam?.subjective_refraction_left_axis || "",
  subjective_refraction_right_sphere: latestExam?.subjective_refraction_right_sphere || "",
  subjective_refraction_right_cylinder: latestExam?.subjective_refraction_right_cylinder || "",
  subjective_refraction_right_axis: latestExam?.subjective_refraction_right_axis || "",

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
  
      subjective_refraction_left_sphere: latestExam.subjective_refraction_left_sphere || "",
      subjective_refraction_left_cylinder: latestExam.subjective_refraction_left_cylinder || "",
      subjective_refraction_left_axis: latestExam.subjective_refraction_left_axis || "",
      subjective_refraction_right_sphere: latestExam.subjective_refraction_right_sphere || "",
      subjective_refraction_right_cylinder: latestExam.subjective_refraction_right_cylinder || "",
      subjective_refraction_right_axis: latestExam.subjective_refraction_right_axis || "",
    
      chief_complaint: latestExam.chief_complaint || "",
    });
  }
}, [latestExam]); 

useEffect(() => {
  setFindingsForm(findings || []);
}, [findings]);

useEffect(() => {
  setDiagnosisForm(diagnoses || []);
}, [diagnoses]);



const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setForm({ ...form, [e.target.name]: e.target.value });
};
const handleUpdatePatient = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in");
      return;
    }
    const res = await axios.put(
      `http://localhost:5050/patients/${patient.id}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setPatientDetails((prev: any) => ({
      ...prev,
      patient: res.data.patient,
    }));

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

    const updatedExam = response.data.exam; // ✅ backend returns updated exam

    // Update patientDetails.exams state
    setPatientDetails((prev: any) => ({
      ...prev,
      exams: prev.exams.map((exam: any) =>
        exam.id === updatedExam.id ? updatedExam : exam
      ),
    }));

    // Update latestExam too
    setLatestExam(updatedExam);

    alert("Exam updated ✅");
    setShowEditExam(false);
  } catch (err: any) {
    console.error("Exam update error:", err.response?.data || err.message);
    alert("Failed to update exam ❌");
  }
};

const handleFindingFieldChange = (index: number, field: string, value: string) => {
  setFindingsForm((prev) =>
    prev.map((f, i) => (i === index ? { ...f, [field]: value } : f))
  );
};

const handleUpdateFindings = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not logged in");

    // Update each finding
await Promise.all(
  findingsForm.map((f) => {
    console.log("Sending finding update:", f.id, { type: f.type, finding: f.finding });
    return axios.put(
      `http://localhost:5050/patients/examination_findings/${f.id}`,
      { type: f.type, finding: f.finding },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  })
);

    // Update UI instantly
    setPatientDetails((prev: any) => ({
      ...prev,
      findings: findingsForm,
    }));

    alert("All findings updated ✅");
    setShowEditFindings(false);
  } catch (err: any) {
    console.error("Findings update error:", err.response?.data || err.message);
    alert("Failed to update findings ❌");
  }
};

const handleDiagnosisFieldChange = (index: number, field: string, value: string) => {
  setDiagnosisForm((prev) =>
    prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
  );
};

const handleUpdateDiagnoses = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not logged in");

    // Update each diagnosis entry
    await Promise.all(
      diagnosisForm.map((d) => {
        return axios.put(
          `http://localhost:5050/patients/diagnoses/${d.id}`,
          {
            diagnosis: d.diagnosis,
            plan: d.plan,
            category: d.category,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      })
    );

    // Update UI instantly
    setPatientDetails((prev: any) => ({
      ...prev,
      diagnoses: diagnosisForm,
    }));

    alert("All diagnoses updated ✅");
    setShowEditDiagnosis(false);
  } catch (err: any) {
    console.error("Diagnosis update error:", err.response?.data || err.message);
    alert("Failed to update diagnoses ❌");
  }
};


const handleAddFinding = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in");

    // 🛑 1. Check for the exam ID, as it's required for the database relationship
    if (!latestExam || !latestExam.id) {
      alert("Error: Cannot add finding. No latest examination ID found.");
      console.error("Missing latestExam or latestExam.id");
      return;
    }

    // 🛑 2. CONSTRUCT THE PAYLOAD: Merge the new finding data with the required exam_id
    const payload = {
      exam_id: latestExam.id, 
      ...newFinding,
    };

    const res = await axios.post(
      `http://localhost:5050/patients/${patient.id}/findings`,
      payload, // <-- Send the new, complete payload
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const addedFinding = res.data.finding; 

    // Update state instantly
    setPatientDetails((prev: any) => ({
      ...prev,
      findings: [...prev.findings, addedFinding],
    }));

    setNewFinding({ type: "", finding: "" });
    setShowAddFinding(false);
    alert("Finding added ✅");
  } catch (err: any) {
    console.error("Add finding error:", err.response?.data || err.message);
    alert("Failed to add finding ❌");
  }
};

// New handler function for adding a diagnosis

const handleAddDiagnosis = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not logged in");

    // 🛑 CRITICAL FIX: Ensure an examination ID exists
    if (!latestExam || !latestExam.id) {
      alert("Error: Cannot add diagnosis. No latest examination ID found.");
      console.error("Missing latestExam or latestExam.id");
      return;
    }

    // CONSTRUCT PAYLOAD: Include the required exam_id
    const payload = {
      exam_id: latestExam.id, // <--- THIS ENSURES PERSISTENCE
      ...newDiagnosis,
    };

    // 🛑 API CALL: Use the new, consistent nested path
    const res = await axios.post(
      `http://localhost:5050/patients/${patient.id}/diagnoses`,
      payload, 
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const addedDiagnosis = res.data.diagnosis; 

    // Update state instantly
    setPatientDetails((prev: any) => ({
      ...prev,
      diagnoses: [...prev.diagnoses, addedDiagnosis],
    }));

    setNewDiagnosis({ diagnosis: "", category: "", plan: "" });
    setShowAddDiagnosis(false);
    alert("Diagnosis added ✅");
  } catch (err: any) {
    console.error("Add diagnosis error:", err.response?.data || err.message);
    alert("Failed to add diagnosis ❌");
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
                  <div>
                     <p className="font-medium">Subjective Refraction</p>
                     <p className="text-sm text-muted-foreground">
                      Right: SPH {latestExam.subjective_refraction_right_sphere ?? "N/A"}, CYL {latestExam.subjective_refraction_right_cylinder ?? "N/A"}, Axis {latestExam.subjective_refraction_right_axis ?? "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                    Left: SPH {latestExam.subjective_refraction_left_sphere ?? "N/A"}, CYL {latestExam.subjective_refraction_left_cylinder ?? "N/A"}, Axis {latestExam.subjective_refraction_left_axis ?? "N/A"}
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
  <Button onClick={() => setShowAddFinding(true)}>Add Finding</Button>
  <Button variant="outline" onClick={() => setShowEditFindings(true)}>
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
          <CardFooter className="flex justify-end gap-2"> {/* Added gap-2 here */}
    <Button onClick={() => setShowAddDiagnosis(true)}>Add Diagnosis</Button> {/* NEW BUTTON */}
    <Button variant="outline" onClick={() => setShowEditDiagnosis(true)}>
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
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto"> {/* 🛑 WIDER & SCROLLABLE DIALOG */}
    <DialogHeader>
      <DialogTitle>Edit Exam</DialogTitle>
      <DialogDescription>Update patient examination details.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleUpdateExam} className="space-y-6"> {/* 🛑 INCREASED SPACE */}
      
      {/* 1. VISUAL ACUITY / PINHOLE SECTION (2 COLUMNS) */}
      <div className="grid grid-cols-2 gap-4"> 
        <div>
          <Label htmlFor="visual_acuity_left">Visual Acuity Left</Label>
          <Input name="visual_acuity_left" value={examForm.visual_acuity_left} onChange={handleExamChange} />
          
          <Label htmlFor="pinhole_left" className="mt-3 block">Pinhole Left</Label>
          <Input name="pinhole_left" value={examForm.pinhole_left} onChange={handleExamChange} />
        </div>
        
        <div>
          <Label htmlFor="visual_acuity_right">Visual Acuity Right</Label>
          <Input name="visual_acuity_right" value={examForm.visual_acuity_right} onChange={handleExamChange} />
          
          <Label htmlFor="pinhole_right" className="mt-3 block">Pinhole Right</Label>
          <Input name="pinhole_right" value={examForm.pinhole_right} onChange={handleExamChange} />
        </div>
      </div>
      
      {/* 2. AUTO REFRACTION SECTION (2 Columns, 3 Inputs each) */}
      <div className="space-y-3 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Auto Refraction</h3>
        
        <div className="grid grid-cols-2 gap-4">
          
          {/* LEFT AUTO REFRACTION (3 column group) */}
          <div>
            <Label className="block mb-1 font-medium">Left Eye (SPH/CYL/AXIS)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input name="auto_refraction_left_sphere" placeholder="SPH" value={examForm.auto_refraction_left_sphere} onChange={handleExamChange} />
              <Input name="auto_refraction_left_cylinder" placeholder="CYL" value={examForm.auto_refraction_left_cylinder} onChange={handleExamChange} />
              <Input name="auto_refraction_left_axis" placeholder="AXIS" value={examForm.auto_refraction_left_axis} onChange={handleExamChange} />
            </div>
          </div>
          
          {/* RIGHT AUTO REFRACTION (3 column group) */}
          <div>
            <Label className="block mb-1 font-medium">Right Eye (SPH/CYL/AXIS)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input name="auto_refraction_right_sphere" placeholder="SPH" value={examForm.auto_refraction_right_sphere} onChange={handleExamChange} />
              <Input name="auto_refraction_right_cylinder" placeholder="CYL" value={examForm.auto_refraction_right_cylinder} onChange={handleExamChange} />
              <Input name="auto_refraction_right_axis" placeholder="AXIS" value={examForm.auto_refraction_right_axis} onChange={handleExamChange} />
            </div>
          </div>
        </div>
      </div>
      
      {/* 3. SUBJECTIVE REFRACTION SECTION (2 Columns, 3 Inputs each) */}
      <div className="space-y-3 p-4 border rounded-lg">
        <h3 className="font-semibold text-lg mb-3">Subjective Refraction</h3>
        
        <div className="grid grid-cols-2 gap-4">
          
          {/* LEFT SUBJECTIVE REFRACTION (3 column group) */}
          <div>
            <Label className="block mb-1 font-medium">Left Eye (SPH/CYL/AXIS)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input name="subjective_refraction_left_sphere" placeholder="SPH" value={examForm.subjective_refraction_left_sphere} onChange={handleExamChange} />
              <Input name="subjective_refraction_left_cylinder" placeholder="CYL" value={examForm.subjective_refraction_left_cylinder} onChange={handleExamChange} />
              <Input name="subjective_refraction_left_axis" placeholder="AXIS" value={examForm.subjective_refraction_left_axis} onChange={handleExamChange} />
            </div>
          </div>
          
          {/* RIGHT SUBJECTIVE REFRACTION (3 column group) */}
          <div>
            <Label className="block mb-1 font-medium">Right Eye (SPH/CYL/AXIS)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input name="subjective_refraction_right_sphere" placeholder="SPH" value={examForm.subjective_refraction_right_sphere} onChange={handleExamChange} />
              <Input name="subjective_refraction_right_cylinder" placeholder="CYL" value={examForm.subjective_refraction_right_cylinder} onChange={handleExamChange} />
              <Input name="subjective_refraction_right_axis" placeholder="AXIS" value={examForm.subjective_refraction_right_axis} onChange={handleExamChange} />
            </div>
          </div>
        </div>
      </div>

      {/* 4. CHIEF COMPLAINT (Full Width) */}
      <div>
        <Label htmlFor="chief_complaint">Chief Complaint</Label>
        <Input name="chief_complaint" value={examForm.chief_complaint} onChange={handleExamChange} />
      </div>

      <DialogFooter>
        <Button type="submit">Save Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<Dialog open={showEditFindings} onOpenChange={setShowEditFindings}>
  <DialogContent className="max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit All Findings</DialogTitle>
      <DialogDescription>Modify all findings for this patient.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleUpdateFindings} className="space-y-4">
      {findingsForm.map((f, i) => (
        <div key={f.id} className="space-y-2 border p-3 rounded-lg">
          <Label className="text-sm font-medium">Type</Label>
          <Input
            value={f.type}
            onChange={(e) => handleFindingFieldChange(i, "type", e.target.value)}
          />

          <Label className="text-sm font-medium">Finding</Label>
          <Input
            value={f.finding}
            onChange={(e) => handleFindingFieldChange(i, "finding", e.target.value)}
          />
        </div>
      ))}

      <DialogFooter>
        <Button type="submit">Save All Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

<Dialog open={showEditDiagnosis} onOpenChange={setShowEditDiagnosis}>
  <DialogContent className="max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Edit Diagnoses</DialogTitle>
      <DialogDescription>Modify all diagnoses and plans for this patient.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleUpdateDiagnoses} className="space-y-4">
      {diagnosisForm.map((d, i) => (
        <div key={d.id} className="space-y-2 border p-3 rounded-lg">
          <Label className="text-sm font-medium">Diagnosis</Label>
          <Input
            value={d.diagnosis}
            onChange={(e) => handleDiagnosisFieldChange(i, "diagnosis", e.target.value)}
          />

          <Label className="text-sm font-medium">Category</Label>
    <select
      value={d.category}
      onChange={(e) => handleDiagnosisFieldChange(i, "category", e.target.value)}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
    >
      <option value="">No Category</option> {/* Allow clearing the category */}
      {DIAGNOSIS_CATEGORIES.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>

          <Label className="text-sm font-medium">Plan</Label>
          <Input
            value={d.plan}
            onChange={(e) => handleDiagnosisFieldChange(i, "plan", e.target.value)}
          />
        </div>
      ))}

      <DialogFooter>
        <Button type="submit">Save All Changes</Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>


<Dialog open={showAddFinding} onOpenChange={setShowAddFinding}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Finding</DialogTitle>
      <DialogDescription>Add a new examination finding for this patient.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleAddFinding} className="space-y-3">
      <Input
        name="type"
        placeholder="Finding Type"
        value={newFinding.type}
        onChange={(e) => setNewFinding({ ...newFinding, type: e.target.value })}
      />
      <Input
        name="finding"
        placeholder="Finding Details"
        value={newFinding.finding}
        onChange={(e) => setNewFinding({ ...newFinding, finding: e.target.value })}
      />
      <Button type="submit" className="w-full">Add Finding</Button>
    </form>
  </DialogContent>
</Dialog>

{/* New Dialog for adding a diagnosis */}

<Dialog open={showAddDiagnosis} onOpenChange={setShowAddDiagnosis}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add Diagnosis</DialogTitle>
      <DialogDescription>Add a new diagnosis and plan for this patient.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleAddDiagnosis} className="space-y-3">
      <Input
        name="diagnosis"
        placeholder="Diagnosis"
        value={newDiagnosis.diagnosis}
        onChange={(e) => setNewDiagnosis({ ...newDiagnosis, diagnosis: e.target.value })}
      />
  <select
    name="category"
    value={newDiagnosis.category}
    onChange={(e) => setNewDiagnosis({ ...newDiagnosis, category: e.target.value })}
    // Apply basic styling to look like an Input (you might use a custom <Select> component here)
    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <option value="" disabled>Select Category</option>
    {DIAGNOSIS_CATEGORIES.map((cat) => (
      <option key={cat} value={cat}>
        {cat}
      </option>
    ))}
  </select>
      <Input
        name="plan"
        placeholder="Plan/Treatment"
        value={newDiagnosis.plan}
        onChange={(e) => setNewDiagnosis({ ...newDiagnosis, plan: e.target.value })}
      />
      <Button type="submit" className="w-full">Add Diagnosis</Button>
    </form>
  </DialogContent>
</Dialog>

    </div>
  );
}