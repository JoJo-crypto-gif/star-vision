"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, User, Phone, MapPin, Stethoscope, FileText, Wallet, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

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
  const latestExam = exams.length > 0 ? exams[0] : null;

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
          {/* <CardFooter className="flex justify-end">
            <Button variant="outline">Edit Patient</Button>
          </CardFooter> */}
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
            {/* <CardFooter>
              <Button variant="outline" className="w-full">
                View All Exams
              </Button>
            </CardFooter> */}
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
                  <p className="text-sm text-muted-foreground">Plan: {diagnosis.plan}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No diagnoses recorded.
              </div>
            )}
          </CardContent>
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
    </div>
  );
}