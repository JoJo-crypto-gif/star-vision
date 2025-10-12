// components/add-doctor-form.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Lock, CheckCircle, XCircle, User, Phone, Stethoscope } from "lucide-react";

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function AddDoctorForm({ onSuccessfulSubmit }: { onSuccessfulSubmit: () => void }) { // 🛑 RENAME + Added optional callback
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      // 🛑 KEY CHANGE: Targeting the new /users/add-doctor endpoint
      const response = await fetch(`${baseUrl}/users/add-doctor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, name, phone }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add doctor."); // 🛑 UPDATED TEXT
        } else {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();

      setSuccess("Doctor added successfully!"); // 🛑 UPDATED TEXT
      setEmail("");
      setPassword("");
      setName("");
      setPhone("");
      console.log("Doctor added:", data);

      // Call the callback to close the modal or refresh the table
      onSuccessfulSubmit(); 
      
    } catch (err) {
      console.error("Failed to add doctor:", err); // 🛑 UPDATED TEXT
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Add New Doctor</h2> {/* 🛑 UPDATED TEXT */}
        <p className="text-sm text-gray-500">
          Enter the details for the new doctor. {/* 🛑 UPDATED TEXT */}
        </p>
      </div>

      {success && (
        <Alert variant="default" className="bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="name"
              type="text"
              placeholder="Dr. Jane Doe" // 🛑 UPDATED PLACEHOLDER
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              placeholder="+233..."
              className="pl-10"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>
        
        {/* Optional: Add a role display for clarity, using Stethoscope icon */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <div className="relative">
            <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
                id="role"
                value="Doctor"
                readOnly
                className="pl-10 bg-gray-50 cursor-default"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="doctor@example.com" // 🛑 UPDATED PLACEHOLDER
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Adding Doctor..." : "Add Doctor"} {/* 🛑 UPDATED TEXT */}
        </Button>
      </form>
    </div>
  );
}