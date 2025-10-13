// components/forms/add-patient-details.tsx
"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function AddPatientDetailsForm() {
  const { control, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Patient Name <span className="text-red-500">*</span></Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => <Input id="name" placeholder="Enter full name" {...field} />}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message as string}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="contact">Contact Number <span className="text-red-500">*</span></Label>
          <Controller
            name="contact"
            control={control}
            render={({ field }) => <Input id="contact" placeholder="e.g., +233555123456" {...field} />}
          />
          {errors.contact && (
            <p className="text-sm text-destructive">{errors.contact.message as string}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message as string}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
<div className="grid gap-2">
  <Label htmlFor="age">Age</Label>
  <Controller
    name="age"
    control={control}
    render={({ field }) => (
      <Input id="age" type="number" placeholder="e.g., 32" {...field} />
    )}
  />
  {errors.age && (
    <p className="text-sm text-destructive">{errors.age.message as string}</p>
  )}
</div>
<div className="grid gap-2">
  <Label htmlFor="occupation">Occupation</Label>
  <Controller
    name="occupation"
    control={control}
    render={({ field }) => (
      <Input id="occupatio" placeholder="e.g., Engineer" {...field} />
    )}
  />
  {errors.occupation && (
    <p className="text-sm text-destructive">{errors.occupation.message as string}</p>
  )}
</div>
</div>


      <div className="grid gap-2">
        <Label htmlFor="venue">Venue <span className="text-red-500">*</span></Label>
        <Controller
          name="venue"
          control={control}
          render={({ field }) => <Input id="venue" placeholder="e.g., Accra, Ghana" {...field} />}
        />
        {errors.venue && (
          <p className="text-sm text-destructive">{errors.venue.message as string}</p>
        )}
      </div>

      {/* <div className="grid gap-2">
        <Label htmlFor="appointment_date">Appointment Date (optional)</Label>
        <Controller
          name="appointment_date"
          control={control}
          render={({ field }) => <Input type="date" id="appointment_date" {...field} />}
        />
        {errors.appointment_date && (
          <p className="text-sm text-destructive">{errors.appointment_date.message as string}</p>
        )}
      </div> */}

      <div className="grid gap-2">
        <h3 className="text-lg font-semibold mt-6">Guarantor Details (Optional)</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="guarantor_name">Guarantor Name</Label>
          <Controller
            name="guarantor_name"
            control={control}
            render={({ field }) => <Input id="guarantor_name" {...field} />}
          />
          {errors.guarantor_name && (
            <p className="text-sm text-destructive">{errors.guarantor_name.message as string}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="guarantor_contact">Guarantor Contact</Label>
          <Controller
            name="guarantor_contact"
            control={control}
            render={({ field }) => <Input id="guarantor_contact" {...field} />}
          />
          {errors.guarantor_contact && (
            <p className="text-sm text-destructive">{errors.guarantor_contact.message as string}</p>
          )}
        </div>
      </div>
    </div>
  );
}