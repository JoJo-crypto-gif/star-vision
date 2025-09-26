"use client";

import React, { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, XCircle, X } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Edit Modal Component
interface EditModalProps {
  staff: StaffMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: { name: string; phone: string }) => Promise<void>;
}

function EditStaffModal({ staff, isOpen, onClose, onSave }: EditModalProps) {
  const [name, setName] = useState(staff.name);
  const [phone, setPhone] = useState(staff.phone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when staff changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(staff.name);
      setPhone(staff.phone);
      setError(null);
    }
  }, [staff, isOpen]);

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
      await onSave(staff.id, { name: name.trim(), phone: phone.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update staff");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Staff Member</h3>
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
              value={staff.email}
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
              placeholder="Enter staff name"
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
              {isLoading ? "Updating..." : "Update Staff"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StaffTable() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Enhanced function to fetch staff data with better error handling
  const fetchStaff = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsLoading(false);
      return;
    }

    console.log("Token being sent:", token.substring(0, 20) + "..."); // Debug log

    try {
      const response = await fetch("http://localhost:5050/users/staff", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status); // Debug log

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
      console.log("Fetched data:", data); // Debug log
      
      if (!data.staff) {
        throw new Error("Invalid response format: staff data not found");
      }
      
      setStaff(data.staff);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle staff editing
  const handleEditStaff = async (staffId: string, updatedData: { name: string; phone: string }) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found.");
    }

    console.log("Updating staff:", staffId, updatedData); // Debug log

    const response = await fetch(`http://localhost:5050/users/staff/${staffId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    console.log("Edit response status:", response.status); // Debug log

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

    const result = await response.json();
    console.log("Edit result:", result); // Debug log
    
    setSuccess("Staff member updated successfully!");
    // Re-fetch the list to update the table
    fetchStaff();
  };

  // Fetch staff data on component mount
  useEffect(() => {
    fetchStaff();
  }, []);

  // Enhanced function to handle staff deletion
  const handleDelete = async (staffId: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member? This action is irreversible.")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    console.log("Deleting staff with ID:", staffId); // Debug log

    try {
      const response = await fetch(`http://localhost:5050/users/staff/${staffId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Delete response status:", response.status); // Debug log

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

      const result = await response.json();
      console.log("Delete result:", result); // Debug log
      
      setSuccess("Staff member deleted successfully!");
      fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  // Function to validate token format
  const validateToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found");
      return false;
    }
    
    console.log("Token length:", token.length);
    console.log("Token starts with:", token.substring(0, 10));
    
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log("Token doesn't appear to be a valid JWT format");
      return false;
    }
    
    return true;
  };

  const handleDebugToken = () => {
    validateToken();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading staff data...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="space-x-2">
          <Button onClick={fetchStaff}>Retry</Button>
          <Button variant="outline" onClick={handleDebugToken}>Debug Token</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Staff Members</h3>
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
          {staff.length > 0 ? (
            staff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setEditingStaff(member)}
                      title="Edit staff member"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(member.id)}
                      title="Delete staff member"
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
                No staff members found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Modal */}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          onSave={handleEditStaff}
        />
      )}
    </div>
  );
}