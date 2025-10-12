// components/doctor-table.tsx

"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface DoctorMember { // 🛑 RENAMED TYPE
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Edit Modal Component (Copied and modified from EditStaffModal)
interface EditModalProps {
  doctor: DoctorMember; // 🛑 RENAMED PROP
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: { name: string; phone: string }) => Promise<void>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
function EditDoctorModal({ doctor, isOpen, onClose, onSave }: EditModalProps) { // 🛑 RENAMED COMPONENT/PROP
  const [name, setName] = useState(doctor.name);
  const [phone, setPhone] = useState(doctor.phone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when doctor changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(doctor.name);
      setPhone(doctor.phone);
      setError(null);
    }
  }, [doctor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    
    if (!phone.trim()) {
      setError("Phone is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSave(doctor.id, { name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update doctor");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Doctor Details</h3> {/* 🛑 UPDATED TEXT */}
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
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={doctor.email} // 🛑 UPDATED VALUE
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter doctor name" // 🛑 UPDATED TEXT
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Doctor"} {/* 🛑 UPDATED TEXT */}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DoctorTable() { // 🛑 RENAMED COMPONENT
  const [doctors, setDoctors] = useState<DoctorMember[]>([]); // 🛑 RENAMED STATE
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingDoctor, setEditingDoctor] = useState<DoctorMember | null>(null); // 🛑 RENAMED STATE

  // Enhanced function to fetch doctor data
  const fetchDoctors = async () => { // 🛑 RENAMED FUNCTION
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
      // 🛑 KEY CHANGE: Targeting the new /users/doctors endpoint
      const response = await fetch(`${baseUrl}/users/doctors`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.log("Response body is not JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // 🛑 KEY CHANGE: Checking for 'doctors' property
      if (!data.doctors) {
        throw new Error("Invalid response format: doctor data not found");
      }
      
      setDoctors(data.doctors); // 🛑 UPDATED STATE SETTER
    } catch (err) {
      console.error("Error fetching doctors:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle doctor editing
  const handleEditDoctor = async (doctorId: string, updatedData: { name: string; phone: string }) => { // 🛑 RENAMED FUNCTION
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    // 🛑 KEY CHANGE: Targeting the new /users/doctors/:id endpoint
    const response = await fetch(`${baseUrl}/users/doctors/${doctorId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (jsonError) {
        console.log("Edit response body is not JSON:", jsonError);
      }
      throw new Error(errorMessage);
    }

    setSuccess("Doctor updated successfully!"); // 🛑 UPDATED TEXT
    fetchDoctors(); // 🛑 UPDATED FUNCTION CALL
  };

  // Fetch doctor data on component mount
  useEffect(() => {
    fetchDoctors(); // 🛑 UPDATED FUNCTION CALL
  }, []);

  // Enhanced function to handle doctor deletion
  const handleDelete = async (doctorId: string) => { // 🛑 RENAMED VARIABLE
    if (!window.confirm("Are you sure you want to delete this doctor? This action is irreversible.")) { // 🛑 UPDATED TEXT
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      // 🛑 KEY CHANGE: Targeting the new /users/doctors/:id DELETE endpoint
      const response = await fetch(`${baseUrl}/users/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          console.log("Delete response body is not JSON:", jsonError);
        }
        throw new Error(errorMessage);
      }
      
      setSuccess("Doctor deleted successfully!"); // 🛑 UPDATED TEXT
      fetchDoctors(); // 🛑 UPDATED FUNCTION CALL
    } catch (err) {
      console.error("Error deleting doctor:", err); // 🛑 UPDATED TEXT
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading doctor data...</div>; // 🛑 UPDATED TEXT
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDoctors}>Retry</Button> {/* 🛑 UPDATED FUNCTION CALL */}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Doctors</h3> {/* 🛑 UPDATED TEXT */}
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
            <TableHead>Phone</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.length > 0 ? ( // 🛑 UPDATED STATE CHECK
            doctors.map((member) => ( // 🛑 UPDATED STATE MAP
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingDoctor(member)} // 🛑 UPDATED STATE SETTER
                      title="Edit doctor details"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(member.id)}
                      title="Delete doctor"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No doctors found. {/* 🛑 UPDATED TEXT */}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      {editingDoctor && ( // 🛑 UPDATED STATE CHECK
        <EditDoctorModal // 🛑 UPDATED COMPONENT
          doctor={editingDoctor}
          isOpen={!!editingDoctor}
          onClose={() => setEditingDoctor(null)}
          onSave={handleEditDoctor}
        />
      )}
    </div>
  );
}