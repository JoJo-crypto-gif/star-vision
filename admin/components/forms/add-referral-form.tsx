// components/forms/add-referral-form.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface Clinic {
  id: string;
  name: string;
}

export function AddReferralForm() {
  const { control } = useFormContext();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Fix: fetch clinics, not referrals
        const response = await axios.get<Clinic[]>(
          "http://localhost:5050/referrals/clinics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setClinics(response.data);
      } catch (err) {
        const errorMessage = axios.isAxiosError(err)
          ? err.response?.data?.error || err.message
          : "Failed to load clinics.";
        setError(errorMessage);
        console.error("Error fetching clinics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Clinic</Label>
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Label>Remarks</Label>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Referral Information (Optional)
      </h2>
      <div className="space-y-2">
        <Label htmlFor="clinicId">Select Clinic</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 inline-block ml-2 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Select a clinic to refer the patient to.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Controller
          name="clinicId"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select a clinic" />
              </SelectTrigger>
              <SelectContent>
                {clinics.map((clinic) => (
                  <SelectItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="remark">Remarks</Label>
        <Controller
          name="remark"
          control={control}
          render={({ field }) => (
            <Textarea
              id="remark"
              placeholder="Add any additional remarks or notes for the clinic..."
              {...field}
            />
          )}
        />
      </div>
    </div>
  );
}
