"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddExaminationForm() {
  const { control, formState: { errors } } = useFormContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Examination Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Visual Acuity</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* VA right */}
            <div className="grid gap-2">
              <Label htmlFor="visual_acuity_right">Right Eye</Label>
              <Controller
                name="visual_acuity_right"
                control={control}
                render={({ field }) => <Input id="visual_acuity_right" placeholder="e.g., 6/12" {...field} />}
              />
              {errors.visual_acuity_right && (
                <p className="text-sm text-destructive">{errors.visual_acuity_right.message as string}</p>
              )}
            </div>
            {/* va right end */}
            {/* VA left */}
            <div className="grid gap-2">
              <Label htmlFor="visual_acuity_left">Left Eye</Label>
              <Controller
                name="visual_acuity_left"
                control={control}
                render={({ field }) => <Input id="visual_acuity_left" placeholder="e.g., 6/6" {...field} />}
              />
              {errors.visual_acuity_left && (
                <p className="text-sm text-destructive">{errors.visual_acuity_left.message as string}</p>
              )}
            </div>
            {/* va left end */}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pinhole_right">Pinhole Right</Label>
              <Controller
                name="pinhole_right"
                control={control}
                render={({ field }) => <Input id="pinhole_right" {...field} />}
              />
              {errors.pinhole_right && (
                <p className="text-sm text-destructive">{errors.pinhole_right.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pinhole_left">Pinhole Left</Label>
              <Controller
                name="pinhole_left"
                control={control}
                render={({ field }) => <Input id="pinhole_left" {...field} />}
              />
              {errors.pinhole_left && (
                <p className="text-sm text-destructive">{errors.pinhole_left.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Auto Refraction Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Auto Refraction</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_right_sphere">Right Sphere (Sph)</Label>
              <Controller
                name="auto_refraction_right_sphere"
                control={control}
                render={({ field }) => <Input id="auto_refraction_right_sphere" {...field} />}
              />
              {errors.auto_refraction_right_sphere && (
                <p className="text-sm text-destructive">{errors.auto_refraction_right_sphere.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_right_cylinder">Right Cylinder (Cyl)</Label>
              <Controller
                name="auto_refraction_right_cylinder"
                control={control}
                render={({ field }) => <Input id="auto_refraction_right_cylinder" {...field} />}
              />
              {errors.auto_refraction_right_cylinder && (
                <p className="text-sm text-destructive">{errors.auto_refraction_right_cylinder.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_right_axis">Right Axis (Axis)</Label>
              <Controller
                name="auto_refraction_right_axis"
                control={control}
                render={({ field }) => <Input id="auto_refraction_right_axis" {...field} />}
              />
              {errors.auto_refraction_right_axis && (
                <p className="text-sm text-destructive">{errors.auto_refraction_right_axis.message as string}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_left_sphere">Left Sphere (Sph)</Label>
              <Controller
                name="auto_refraction_left_sphere"
                control={control}
                render={({ field }) => <Input id="auto_refraction_left_sphere" {...field} />}
              />
              {errors.auto_refraction_left_sphere && (
                <p className="text-sm text-destructive">{errors.auto_refraction_left_sphere.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_left_cylinder">Left Cylinder (Cyl)</Label>
              <Controller
                name="auto_refraction_left_cylinder"
                control={control}
                render={({ field }) => <Input id="auto_refraction_left_cylinder" {...field} />}
              />
              {errors.auto_refraction_left_cylinder && (
                <p className="text-sm text-destructive">{errors.auto_refraction_left_cylinder.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="auto_refraction_left_axis">Left Axis (Axis)</Label>
              <Controller
                name="auto_refraction_left_axis"
                control={control}
                render={({ field }) => <Input id="auto_refraction_left_axis" {...field} />}
              />
              {errors.auto_refraction_left_axis && (
                <p className="text-sm text-destructive">{errors.auto_refraction_left_axis.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Subjective Refraction Section */}
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Subjective Refraction</h4>
          <div className="grid grid-cols-3 gap-4">
            {/* Right Eye */}
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_right_sphere">Right Sphere (Sph)</Label>
              <Controller
                name="subjective_refraction_right_sphere"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_right_sphere" {...field} />}
              />
              {errors.subjective_refraction_right_sphere && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_right_sphere.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_right_cylinder">Right Cylinder (Cyl)</Label>
              <Controller
                name="subjective_refraction_right_cylinder"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_right_cylinder" {...field} />}
              />
              {errors.subjective_refraction_right_cylinder && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_right_cylinder.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_right_axis">Right Axis (Axis)</Label>
              <Controller
                name="subjective_refraction_right_axis"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_right_axis" {...field} />}
              />
              {errors.subjective_refraction_right_axis && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_right_axis.message as string}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Left Eye */}
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_left_sphere">Left Sphere (Sph)</Label>
              <Controller
                name="subjective_refraction_left_sphere"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_left_sphere" {...field} />}
              />
              {errors.subjective_refraction_left_sphere && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_left_sphere.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_left_cylinder">Left Cylinder (Cyl)</Label>
              <Controller
                name="subjective_refraction_left_cylinder"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_left_cylinder" {...field} />}
              />
              {errors.subjective_refraction_left_cylinder && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_left_cylinder.message as string}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subjective_refraction_left_axis">Left Axis (Axis)</Label>
              <Controller
                name="subjective_refraction_left_axis"
                control={control}
                render={({ field }) => <Input id="subjective_refraction_left_axis" {...field} />}
              />
              {errors.subjective_refraction_left_axis && (
                <p className="text-sm text-destructive">{errors.subjective_refraction_left_axis.message as string}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Chief Complaint (KEPT AS IS) */}
        <div className="grid gap-2">
          <Label htmlFor="chief_complaint">Chief Complaint</Label>
          <Controller
            name="chief_complaint"
            control={control}
            render={({ field }) => <Textarea id="chief_complaint" {...field} />}
          />
          {errors.chief_complaint && (
            <p className="text-sm text-destructive">{errors.chief_complaint.message as string}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}