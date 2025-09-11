// components/forms/add-diagnoses-form.tsx

"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function AddDiagnosesForm() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "diagnoses",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Diagnoses</CardTitle>
        <CardDescription>Add the patient's diagnoses and treatment plans.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-gray-500">No diagnoses added yet.</p>
        )}
        {fields.map((item, index) => (
          <div key={item.id} className="relative p-4 border rounded-md">
            <h4 className="text-md font-semibold mb-2">Diagnosis {index + 1}</h4>
            <div className="grid gap-2 mb-2">
              <Label htmlFor={`diagnoses[${index}].diagnosis`}>Diagnosis</Label>
              <Controller
                name={`diagnoses.${index}.diagnosis`}
                control={control}
                render={({ field }) => <Input id={`diagnoses[${index}].diagnosis`} {...field} />}
              />
              {errors.diagnoses?.[index]?.diagnosis && (
                <p className="text-sm text-destructive">{errors.diagnoses[index].diagnosis.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`diagnoses[${index}].plan`}>Treatment Plan</Label>
              <Controller
                name={`diagnoses.${index}.plan`}
                control={control}
                render={({ field }) => <Textarea id={`diagnoses[${index}].plan`} {...field} />}
              />
              {errors.diagnoses?.[index]?.plan && (
                <p className="text-sm text-destructive">{errors.diagnoses[index].plan.message as string}</p>
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
          onClick={() => append({ diagnosis: "", plan: "" })}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Diagnosis
        </Button>
      </CardContent>
    </Card>
  );
}