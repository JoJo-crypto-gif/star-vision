"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, LayoutDashboard, LogOut, Menu, Plus, Search, Settings, Users, Hospital } from "lucide-react";
import { useRouter } from "next/navigation"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientTable } from "@/components/patient-table"; // 🚨 Use the new PatientTable
import { CalendarView } from "@/components/calendar-view";
import { AddStaffForm } from "@/components/add-staff-form";
import { StaffTable } from "@/components/staff-table";
import { PatientDetails } from "@/components/patient-details"; 
import { AddClinicForm } from "@/components/add-clinic-form";
import { ClinicsTable } from "@/components/clinic-table";
import { AddDoctorForm } from "./add-doctor-form";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { DoctorTable } from "./doctor-table";

// 🚨 NEW: Patient and PatientDetails interfaces
// This interface now includes all the necessary properties
interface Patient {
  _id: string;
  id: string;
  name: string;
  contact: string;
  gender: string;
  venue: string;
  // Let's add the appointment time
  time: string;
  appointment_date: string;
  created_at: string;
}

interface PatientDetailsData {
  patient: any;
  exams: any[];
  findings: any[];
  diagnoses: any[];
  payments: any[];
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export function DoctorDashboard() {
  const router = useRouter(); 
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<{ email: string } | null>(null); 
  const [staffCount, setStaffCount] = useState<number | null>(null); 
  const [patientDetails, setPatientDetails] = useState<PatientDetailsData | null>(null);
  const [totalPatients, setTotalPatients] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role"); 

    if (!storedUser || !role || role !== "doctor") {
      router.replace("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
    const token = localStorage.getItem("token");
    if (token) {
      // Fetch patient data on load
      fetchPatients(token);
    } else {
      setIsLoading(false);
      setError("Authentication token not found.");
    }
  }, [router]);

  const fetchPatients = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}/patients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            router.replace("/login");
            return;
        }
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setPatients(data);
      setTotalPatients(data.length);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  };

  // 🚨 NEW FUNCTION: Fetch a single patient's detailed record
  const fetchPatientDetails = async (id: string, token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${baseUrl}/patients/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch patient details.");
      }
      const data = await response.json();
      setPatientDetails(data);
    } catch (err) {
      console.error("Error fetching patient details:", err);
      setError(err instanceof Error ? err.message : "Failed to load patient details.");
    } finally {
        setIsLoading(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    router.replace("/login");
  };

  // 🚨 REPLACED: `handleRowClick` to handle patient rows
  const handleRowClick = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab("details");
    const token = localStorage.getItem("token");
    if (token) {
      fetchPatientDetails(id, token);
    }
  };

  // 🚨 REPLACED: `handleBackToList` to go back to the patient list
  const handleBackToList = () => {
    setSelectedPatientId(null);
    setPatientDetails(null);
    setActiveTab("overview");
    const token = localStorage.getItem("token");
    if (token) {
      fetchPatients(token);
    }
  };
  
  const upcomingAppointments = patients.filter(patient => new Date(patient.appointment_date) > new Date()).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex">
          <SidebarHeader className="border-b px-6 py-4">
            <div className="flex items-center gap-2 font-semibold text-xl">
              <Users className="h-6 w-6" />
              <span>Admin</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} className="mb-5 mt-5 text-md">
                  <LayoutDashboard className="h-7 w-7" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("calendar")} className="mb-5 text-md">
                  <Calendar className="h-6 w-6" />
                  <span>Calendar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => setActiveTab("clinics")}  className="mb-5 text-md">
                  <Hospital className="h-5 w-5" />
                  <span>Referral Clinics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* <SidebarMenuItem>
                <SidebarMenuButton className="mb-5 text-md">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>DU</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Sidebar */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden absolute left-4 top-4 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0">
            <div className="border-b px-6 py-4">
              <div className="flex items-center gap-2 font-semibold text-xl">
                <Users className="h-6 w-6" />
                <span>Star Vision</span>
              </div>
            </div>
            <div className="px-2 py-4">
              <div className="flex flex-col gap-1">
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("overview")}>
                  <LayoutDashboard className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("calendar")}>
                  <Calendar className="mr-2 h-5 w-5" />
                  Calendar
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("clinics")}>
                  <Hospital className="mr-2 h-5 w-5" />
                  Clinics
                </Button>
                {/* <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button> */}
              </div>
            </div>
            <div className="border-t p-6 mt-auto">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Doctor</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-background px-6 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">Dashboard</h1>
              <div className="flex items-center gap-4">
                {/* <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search patients..." className="w-[200px] lg:w-[300px] pl-8" />
                </div> */}
                {/* 🚨 NEW: Add Patient button */}
                <Button onClick={() => router.push("/add-patient")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Patient
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* 🚨 UPDATED: TabsList to not show the "Details" tab unless a patient is selected */}
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="clinics">Clinics</TabsTrigger>
                <TabsTrigger value="details" disabled={!selectedPatientId}>
                  Details
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>{error}</span>
                    <Button variant="outline" size="sm" onClick={() => fetchPatients(localStorage.getItem("token") || "")} className="ml-2">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <TabsContent value="overview" className="space-y-6">
                {/* Patient Table */}
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : (
                  <PatientTable patients={patients} onRowClick={handleRowClick} />
                )}
              </TabsContent>

              <TabsContent value="calendar">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-96 w-full" />
                  </div>
                ) : (
                  <CalendarView patients={patients} onPatientClick={handleRowClick} />
                )}
              </TabsContent>

              <TabsContent value="staff" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1">
                        <CardContent className="pt-6">
                            <AddStaffForm />
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardContent className="pt-6">
                            <StaffTable />
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>
              <TabsContent value="doctor" className="space-y-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="col-span-1">
                        <CardContent className="pt-6">
                            <AddDoctorForm onSuccessfulSubmit={() => {
}} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-2">
                        <CardContent className="pt-6">
                            <DoctorTable />
                        </CardContent>
                    </Card>
                </div>
              </TabsContent>

            <TabsContent value="clinics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardContent className="pt-6">
                  <AddClinicForm />
                </CardContent>
              </Card>
              <Card className="col-span-2">
                <CardContent className="pt-6">
                  <ClinicsTable />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

              <TabsContent value="details">
                {selectedPatientId && patientDetails ? (
                  // 🚨 NEW: Render PatientDetails component with fetched data
                  <PatientDetails patientDetails={patientDetails} onBack={handleBackToList} />
                ) : (
                  <div className="text-center py-8">
                    {isLoading ? "Loading patient details..." : "Select a patient to view details."}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}