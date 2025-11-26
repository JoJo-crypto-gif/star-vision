"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, DollarSign, LayoutDashboard, LogOut, Menu, Plus, Package, Search, Settings, Users, Hospital } from "lucide-react";
import { useRouter } from "next/navigation"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientTable } from "@/components/patient-table";
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
import { ProductTable, Product } from "./product-table";
import { AddProductForm } from "./product-form";
import { EditProductForm } from "./edit-product-form";
import { AddPaymentForm } from "./add-payment-form";
import { PaymentTable, Payment } from "./payment-table"; // Import PaymentTable and Payment type
import { PaymentDetails as SinglePaymentDetails } from "./payment-details"; // Import PaymentDetails and alias it

// Interfaces
interface Patient {
  id: string;
  name: string;
  contact: string;
  gender: string;
  venue: string;
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

export function AdminDashboard() {
  const router = useRouter(); 
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]); // State for payments
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null); // For patient details
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null); // For payment details
  const [user, setUser] = useState<{ email: string } | null>(null); 
  const [staffCount, setStaffCount] = useState<number | null>(null); 
  const [patientDetails, setPatientDetails] = useState<PatientDetailsData | null>(null);
  const [totalPatients, setTotalPatients] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [activeTab, setActiveTab] = useState("overview");
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      setError("Authentication token not found.");
      router.replace("/login");
      return;
    }

    try {
      await Promise.all([
        fetchPatients(token),
        fetchStaffCount(token),
        fetchProducts(token),
        fetchPayments(token), // Add this line
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during data fetch.";
      console.error("Failed to fetch initial data:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const role = localStorage.getItem("role"); 

    if (!storedUser || !role || role !== "admin") {
      router.replace("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, [router]);

  const fetchPatients = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/patients`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch patients');
      const data = await response.json();
      setPatients(data);
      setTotalPatients(data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/products`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPayments = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/payments`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStaffCount = async (token: string) => {
    try {
      const response = await fetch(`${baseUrl}/users/staff-count`, { headers: { "Authorization": `Bearer ${token}` } });
      if (!response.ok) throw new Error("Failed to fetch staff count.");
      const data = await response.json();
      setStaffCount(data.staffCount);
    } catch (err) {
      console.error(err);
    }
  };
  
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
    localStorage.clear();
    router.replace("/login");
  };

  const handleRowClick = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab("details");
    const token = localStorage.getItem("token");
    if (token) fetchPatientDetails(id, token);
  };

  const handleBackToList = () => {
    setSelectedPatientId(null);
    setPatientDetails(null);
    setActiveTab("overview");
  };

  // --- Product Handlers ---
  const handleProductAdded = () => {
    const token = localStorage.getItem("token");
    if (token) fetchProducts(token);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };
  
  const handleProductUpdated = () => {
    setEditingProduct(null);
    const token = localStorage.getItem("token");
    if (token) fetchProducts(token);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication error. Please log in again.");
      return;
    }

    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
        try {
            const response = await fetch(`${baseUrl}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.status === 204) {
                alert('Product deleted successfully.');
                fetchProducts(token);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete product.');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            console.error("Delete product error:", errorMessage);
            alert(`Error: ${errorMessage}`);
        }
    }
  };

  // --- Payment Handlers ---
  const handlePaymentAdded = () => {
    const token = localStorage.getItem("token");
    if (token) fetchPayments(token); // Refresh payments list
  };

  const handleViewPaymentDetails = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setActiveTab("payment_details"); // Switch to a new tab for payment details
  };

  const handleBackToPayments = () => {
    setSelectedPaymentId(null);
    setActiveTab("payments"); // Switch back to the payments list tab
  };
  
  const upcomingAppointments = patients.filter(patient => new Date(patient.appointment_date) > new Date()).length;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="hidden lg:flex">
            <SidebarHeader className="border-b px-6 py-4">
                <div className="flex items-center gap-2 font-semibold text-xl">
                    <Users className="h-6 w-6" />
                    <span>Admin</span>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem><SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")} className="mb-5 mt-5 text-md"><LayoutDashboard className="h-7 w-7" /><span>Dashboard</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("calendar")} className="mb-5 text-md"><Calendar className="h-6 w-6" /><span>Calendar</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("staff")}  className="mb-5 text-md"><Users className="h-5 w-5" /><span>Staff</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("doctor")}  className="mb-5 text-md"><Users className="h-5 w-5" /><span>Doctor</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("clinics")}  className="mb-5 text-md"><Hospital className="h-5 w-5" /><span>Referral Clinics</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("products")} className="mb-5 text-md"><Package className="h-5 w-5" /><span>Products</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton onClick={() => setActiveTab("payments")} className="mb-5 text-md"><DollarSign className="h-5 w-5" /><span>Payments</span></SidebarMenuButton></SidebarMenuItem>
                    <SidebarMenuItem><SidebarMenuButton className="mb-5 text-md"><Settings className="h-5 w-5" /><span>Settings</span></SidebarMenuButton></SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="border-t p-6">
                {/* Footer content */}
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
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("staff")}>
                  <Users className="mr-2 h-5 w-5" />
                  Staff
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("doctor")}>
                  <Users className="mr-2 h-5 w-5" />
                  Doctor
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("clinics")}>
                  <Hospital className="mr-2 h-5 w-5" />
                  Clinics
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("products")}>
                  <Package className="mr-2 h-5 w-5" />
                  Products
                </Button>
                <Button variant="ghost" className="justify-start" onClick={() => setActiveTab("payments")}>
                  <DollarSign className="mr-2 h-5 w-5" />
                  Payments
                </Button>
                <Button variant="ghost" className="justify-start">
                  <Settings className="mr-2 h-5 w-5" />
                  Settings
                </Button>
              </div>
            </div>
            <div className="border-t p-6 mt-auto">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Admin User</p>
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
                        <Button onClick={() => router.push("/staff/add-patient")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Patient
                        </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-9">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="calendar">Calendar</TabsTrigger>
                        <TabsTrigger value="staff">Staff</TabsTrigger>
                        <TabsTrigger value="doctor">Doctor</TabsTrigger>
                        <TabsTrigger value="clinics">Clinics</TabsTrigger>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="payment_details" disabled={!selectedPaymentId}>Payment Details</TabsTrigger>
                        <TabsTrigger value="details" disabled={!selectedPatientId}>Patient Details</TabsTrigger>
                    </TabsList>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                <span>{error}</span>
                                <Button variant="outline" size="sm" onClick={fetchData} className="ml-2">
                                    <RefreshCcw className="mr-2 h-4 w-4" />
                                    Retry
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{staffCount ?? '...'}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{upcomingAppointments}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{totalPatients ?? '...'}</div>}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">TBD</div>
                                    <p className="text-xs text-muted-foreground">Payment logic not yet integrated</p>
                                </CardContent>
                            </Card>
                        </div>
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
                                    <AddDoctorForm onSuccessfulSubmit={() => {}} />
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
                            
                    <TabsContent value="products" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-1">
                                <AddProductForm onProductAdded={handleProductAdded} />
                            </div>
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Product List</CardTitle>
                                    <CardDescription>All products in your inventory.</CardDescription>
                                    <div className="relative pt-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Search by product name..." className="pl-10" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductSearch(e.target.value)} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-96 w-full" />
                                    ) : (
                                        <ProductTable products={filteredProducts} onEdit={handleEditProduct} onDelete={handleDeleteProduct} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Card className="col-span-1">
                                <CardContent className="pt-6">
                                    <AddPaymentForm onPaymentAdded={handlePaymentAdded} />
                                </CardContent>
                            </Card>
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Payment History</CardTitle>
                                    <CardDescription>List of all sales and payments.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoading ? (
                                        <Skeleton className="h-96 w-full" />
                                    ) : (
                                        <PaymentTable payments={payments} onViewDetails={handleViewPaymentDetails} />
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                
                    <TabsContent value="payment_details">
                      {selectedPaymentId ? (
                        <SinglePaymentDetails paymentId={selectedPaymentId} onBack={handleBackToPayments} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">Select a payment to view details.</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="details">
                        {selectedPatientId && patientDetails ? (
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

      {/* Edit Product Modal */}
      <Dialog open={editingProduct !== null} onOpenChange={(isOpen) => !isOpen && setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <EditProductForm
              product={editingProduct}
              onProductUpdated={handleProductUpdated}
              onCancel={handleCancelEdit}
            />
          )}
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}