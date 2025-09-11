// components/forms/add-findings-form.tsx

"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function AddFindingsForm() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "findings",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Findings</CardTitle>
        <CardDescription>Add the findings from the examination.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Findings Section */}
        <div className="space-y-4">
          {fields.length === 0 && (
            <p className="text-sm text-gray-500">No findings added yet.</p>
          )}
          {fields.map((item, index) => (
            <div key={item.id} className="relative p-4 border rounded-md">
              <h4 className="text-md font-semibold mb-2">Finding {index + 1}</h4>
              <div className="grid gap-2 mb-2">
                <Label htmlFor={`findings[${index}].type`}>Type</Label>
                <Controller
                  name={`findings.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <Input id={`findings[${index}].type`} {...field} />
                  )}
                />
                {errors.findings?.[index]?.type && (
                  <p className="text-sm text-destructive">
                    {errors.findings[index].type.message as string}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`findings[${index}].finding`}>Finding</Label>
                <Controller
                  name={`findings.${index}.finding`}
                  control={control}
                  render={({ field }) => (
                    <Textarea id={`findings[${index}].finding`} {...field} />
                  )}
                />
                {errors.findings?.[index]?.finding && (
                  <p className="text-sm text-destructive">
                    {errors.findings[index].finding.message as string}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => append({ type: "", finding: "" })}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Finding
          </Button>
        </div>

        {/* Appointment Date Section */}
        <div className="grid gap-2">
          <Label htmlFor="appointment_date">Appointment Date (optional)</Label>
          <Controller
            name="appointment_date"
            control={control}
            render={({ field }) => (
              <Input type="date" id="appointment_date" {...field} />
            )}
          />
          {errors.appointment_date && (
            <p className="text-sm text-destructive">
              {errors.appointment_date.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
