// components/payment-table.tsx
"use client";

import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Define the type for a single payment record
export type Payment = {
  id: string;
  created_at: string;
  patient_id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  // Assuming patient data is embedded/joined
  patient?: {
    id: string;
    name: string;
    contact: string;
  };
};

interface PaymentTableProps {
  payments: Payment[];
  onViewDetails: (paymentId: string) => void;
}

export function PaymentTable({ payments, onViewDetails }: PaymentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Patient Name</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="font-medium">{payment.patient?.name || 'N/A'}</TableCell>
            <TableCell className="text-right">
              ${payment.total_amount.toFixed(2)}
            </TableCell>
            <TableCell>{payment.payment_method}</TableCell>
            <TableCell>
              <Badge variant={payment.status === 'paid' ? 'default' : 'outline'}>
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onViewDetails(payment.id)}>
                    View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}