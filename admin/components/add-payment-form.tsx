// components/add-payment-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

// Mock types - we'll likely want to create a central types file later
type Patient = { id: string; name: string; };
type Product = { id: string; name: string; price: number; quantity: number; };
type CartItem = { productId: string; name: string; quantity: number; price: number; };

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AddPaymentFormProps {
  onPaymentAdded: () => void; // Callback to refresh the payment list
}

export function AddPaymentForm({ onPaymentAdded }: AddPaymentFormProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch initial data (patients and products)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchInitialData = async () => {
      try {
        const [patientsRes, productsRes] = await Promise.all([
          fetch(`${baseUrl}/patients`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${baseUrl}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);
        if (!patientsRes.ok || !productsRes.ok) {
          throw new Error("Failed to fetch initial data.");
        }
        const patientsData = await patientsRes.json();
        const productsData = await productsRes.json();
        setPatients(patientsData);
        setProducts(productsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      }
    };
    fetchInitialData();
  }, []);

  const handleAddProductToCart = () => {
    if (!selectedProduct) return;
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Check if product is already in cart
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      // Increment quantity
      setCart(cart.map(item => 
        item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Add new item
      setCart([...cart, { productId: product.id, name: product.name, quantity: 1, price: product.price }]);
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };
  
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || cart.length === 0) {
      setError("Please select a patient and add at least one item.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication failed. Please log in again.");
      setIsLoading(false);
      return;
    }

    const payload = {
      patient_id: selectedPatient,
      payment_method: paymentMethod,
      items: cart.map(item => ({ product_id: item.productId, quantity: item.quantity })),
    };

    try {
      const response = await fetch(`${baseUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record payment.");
      }

      setSuccess("Sale recorded successfully!");
      // Reset form state
      setCart([]);
      setSelectedPatient(null);
      // We might want a way to reset the Select trigger text here, but for now this is fine.

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record New Sale</CardTitle>
        <CardDescription>Select a patient and add products to create a new payment record.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <Select onValueChange={setSelectedPatient} required>
              <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
              <SelectContent>
                {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>Add Product to Sale</Label>
            <div className="flex gap-2">
              <Select onValueChange={setSelectedProduct}>
                <SelectTrigger><SelectValue placeholder="Select a product..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" onClick={handleAddProductToCart} disabled={!selectedProduct}>Add</Button>
            </div>
          </div>
          
          {/* Cart Table */}
          <Card>
            <CardHeader><CardTitle>Items for Sale</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead><span className="sr-only">Remove</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center">No items added</TableCell></TableRow>
                  ) : (
                    cart.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)}><X className="h-4 w-4" /></Button></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Payment Method & Total */}
          <div className="flex justify-between items-center pt-4">
            <div className="w-1/3 space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">Total Amount</p>
              <p className="text-3xl font-bold">${totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-500">{success}</p>}

          <Button type="submit" disabled={isLoading || cart.length === 0 || !selectedPatient} className="w-full">
            {isLoading ? "Processing..." : "Record Sale"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
