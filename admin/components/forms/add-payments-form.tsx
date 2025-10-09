// components/forms/add-payments-form.tsx

"use client";

import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AddPaymentsForm() {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "payments",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
        <CardDescription>Record any payments for services or items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.length === 0 && (
          <p className="text-sm text-gray-500">No payments added yet.</p>
        )}
        {fields.map((item, index) => (
          <div key={item.id} className="relative p-4 border rounded-md">
            <h4 className="text-md font-semibold mb-2">Payment {index + 1}</h4>
            <div className="grid grid-cols-2 gap-4">
  
            <div className="grid gap-2 mt-4">
              <Label htmlFor={`payments[${index}].category`}>Category</Label>
              <Controller
               name={`payments.${index}.category`}
               control={control}
               render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
              <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="Examination">Examination</SelectItem>
              <SelectItem value="Eye Drop">Eye Drop</SelectItem>
              <SelectItem value="Optical">Optical</SelectItem>
              <SelectItem value="Drugs">Drugs</SelectItem>
              <SelectItem value="Laboratory">Laboratory</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
              </Select>
              )}
            />
            {errors.payments?.[index]?.category && (
            <p className="text-sm text-destructive">
              {errors.payments[index].category.message as string}
            </p>
             )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`payments[${index}].item`}>Item</Label>
                <Controller
                  name={`payments.${index}.item`}
                  control={control}
                  render={({ field }) => <Input id={`payments[${index}].item`} {...field} />}
                />
                {errors.payments?.[index]?.item && (
                  <p className="text-sm text-destructive">{errors.payments[index].item.message as string}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`payments[${index}].amount`}>Amount</Label>
                <Controller
                  name={`payments.${index}.amount`}
                  control={control}
                  render={({ field }) => <Input type="number" id={`payments[${index}].amount`} {...field} />}
                />
                {errors.payments?.[index]?.amount && (
                  <p className="text-sm text-destructive">{errors.payments[index].amount.message as string}</p>
                )}
              </div>
            </div>
            <div className="grid gap-2 mt-4">
              <Label htmlFor={`payments[${index}].status`}>Status</Label>
              <Controller
                name={`payments.${index}.status`}
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.payments?.[index]?.status && (
                <p className="text-sm text-destructive">{errors.payments[index].status.message as string}</p>
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
          onClick={() => append({ category: "", item: "", amount: 0, status: "pending" })}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Payment
        </Button>
      </CardContent>
    </Card>
  );
}