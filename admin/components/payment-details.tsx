// components/payment-details.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Payment } from "./payment-table"; // Re-use Payment type

// Extend Payment type to include items for detailed view
interface DetailedPayment extends Payment {
    items: Array<{
        product_id: string;
        quantity: number;
        price_at_time_of_sale: number;
        product: {
            id: string;
            name: string;
            category: string;
            price: number;
        }
    }>;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface PaymentDetailsProps {
    paymentId: string;
    onBack: () => void;
}

export function PaymentDetails({ paymentId, onBack }: PaymentDetailsProps) {
    const [paymentDetails, setPaymentDetails] = useState<DetailedPayment | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Authentication token not found.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${baseUrl}/payments/${paymentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch payment details.");
                }
                const data = await response.json();
                setPaymentDetails(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        if (paymentId) {
            fetchDetails();
        }
    }, [paymentId]);

    if (isLoading) {
        return (
            <Card className="p-4">
                <p>Loading payment details...</p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-4">
                <p className="text-red-500">{error}</p>
                <Button onClick={onBack} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Payments
                </Button>
            </Card>
        );
    }

    if (!paymentDetails) {
        return (
            <Card className="p-4">
                <p>No payment details found.</p>
                <Button onClick={onBack} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Payments
                </Button>
            </Card>
        );
    }

    const totalItemsAmount = paymentDetails.items.reduce((sum, item) => sum + (item.price_at_time_of_sale * item.quantity), 0);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Details for payment ID: {paymentDetails.id}</CardDescription>
                </div>
                <Button variant="outline" onClick={onBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back to Payments
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2">Patient Information</h4>
                        <p><strong>Name:</strong> {paymentDetails.patient?.name || 'N/A'}</p>
                        <p><strong>Contact:</strong> {paymentDetails.patient?.contact || 'N/A'}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Payment Overview</h4>
                        <p><strong>Total Amount:</strong> ${paymentDetails.total_amount.toFixed(2)}</p>
                        <p><strong>Method:</strong> {paymentDetails.payment_method}</p>
                        <div className="flex items-center gap-2">
                            <strong>Status:</strong> <Badge>{paymentDetails.status}</Badge>
                        </div>
                        <p><strong>Date:</strong> {new Date(paymentDetails.created_at).toLocaleString()}</p>
                    </div>
                </div>

                <h4 className="font-semibold mb-2">Items Purchased</h4>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Price/Unit</TableHead>
                            <TableHead className="text-center">Quantity</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paymentDetails.items.map(item => (
                            <TableRow key={item.product_id}>
                                <TableCell className="font-medium">{item.product.name}</TableCell>
                                <TableCell>{item.product.category}</TableCell>
                                <TableCell className="text-right">${item.price_at_time_of_sale.toFixed(2)}</TableCell>
                                <TableCell className="text-center">{item.quantity}</TableCell>
                                <TableCell className="text-right">${(item.price_at_time_of_sale * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                 <div className="flex justify-end pt-4 border-t mt-4">
                    <p className="text-lg font-semibold">Total Amount (Items): ${totalItemsAmount.toFixed(2)}</p>
                </div>
            </CardContent>
        </Card>
    );
}
