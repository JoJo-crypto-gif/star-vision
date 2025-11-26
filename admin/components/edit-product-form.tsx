// components/edit-product-form.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "./product-table"; // Reuse the Product type

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditProductFormProps {
  product: Product; // The product to edit
  onProductUpdated: () => void; // Callback to refresh the list
  onCancel: () => void; // Callback to close the modal
}

export function EditProductForm({ product, onProductUpdated, onCancel }: EditProductFormProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pre-populate the form when the product prop changes
    if (product) {
      setName(product.name);
      setCategory(product.category || "");
      setPrice(product.price.toString());
      setQuantity(product.quantity.toString());
      setDescription(product.description || "");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication failed. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          price: parseFloat(price),
          quantity: parseInt(quantity, 10),
          description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product.");
      }

      alert("Product updated successfully!");
      onProductUpdated(); // Refresh parent list and close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Product Name</Label>
        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-category">Category</Label>
        <Input id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-price">Price ($)</Label>
          <Input id="edit-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-quantity">Quantity</Label>
          <Input id="edit-quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-description">Description (Optional)</Label>
        <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      
      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
