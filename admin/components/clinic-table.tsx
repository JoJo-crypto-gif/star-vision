"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import axios from "axios";

// Interface for a Clinic record
interface Clinic {
  id: string;
  name: string;
  email: string;
}

// Edit Modal Component for Clinics
interface EditModalProps {
  clinic: Clinic;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: { name: string; email: string }) => Promise<void>;
}

function EditClinicModal({ clinic, isOpen, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState(clinic.name);
  const [email, setEmail] = useState(clinic.email);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(clinic.name);
      setEmail(clinic.email);
      setError(null);
    }
  }, [clinic, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(clinic.id, { name: name.trim(), email: email.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update clinic");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Clinic</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter clinic name"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter clinic email"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Clinic"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Clinics Table Component
export function ClinicsTable() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);

  const fetchClinics = async () => {
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
      const response = await axios.get("http://localhost:5050/referrals/clinics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setClinics(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error || err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClinic = async (clinicId: string, updatedData: { name: string; email: string }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    try {
      await axios.put(`http://localhost:5050/referrals/clinic/${clinicId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Clinic updated successfully!");
      fetchClinics(); // Re-fetch data to update the table
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error || err.message : "An unknown error occurred.";
      throw new Error(errorMessage);
    }
  };

  const handleDelete = async (clinicId: string) => {
    if (!window.confirm("Are you sure you want to delete this clinic? This action is irreversible.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      await axios.delete(`http://localhost:5050/referrals/clinic/${clinicId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuccess("Clinic deleted successfully!");
      fetchClinics();
    } catch (err) {
      const errorMessage = axios.isAxiosError(err) ? err.response?.data?.error || err.message : "An unknown error occurred.";
      setError(errorMessage);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  if (isLoading) {
    return <div className="text-center py-8">Loading clinics...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchClinics}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Referral Clinics</h3>
      {success && (
        <Alert variant="default" className="bg-green-100 text-green-700">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clinics.length > 0 ? (
            clinics.map((clinic) => (
              <TableRow key={clinic.id}>
                <TableCell className="font-medium">{clinic.name}</TableCell>
                <TableCell>{clinic.email}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingClinic(clinic)}
                      title="Edit clinic"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(clinic.id)}
                      title="Delete clinic"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                No clinics found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {editingClinic && (
        <EditClinicModal
          clinic={editingClinic}
          isOpen={!!editingClinic}
          onClose={() => setEditingClinic(null)}
          onSave={handleEditClinic}
        />
      )}
    </div>
  );
}