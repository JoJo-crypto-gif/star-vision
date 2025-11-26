// backend/routes/productRoutes.js
import express from 'express';
import checkAdmin from '../middleware/checkAdmin.js';

const productRoutes = (supabase) => {
  const router = express.Router();

  // GET /products - List all products
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        console.error("Error fetching products:", error.message);
        return res.status(400).json({ error: error.message });
      }

      res.json(data);
    } catch (err) {
      console.error("Unexpected error in GET /products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // POST /products - Add a new product (Admin only)
  router.post('/', checkAdmin(supabase), async (req, res) => {
    const { name, category, price, quantity, description } = req.body;

    // Basic validation
    if (!name || price === undefined || quantity === undefined) {
      return res.status(400).json({ error: 'Name, price, and quantity are required.' });
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name,
          category,
          price,
          quantity,
          description,
        }])
        .select()
        .single();

      if (error) {
        console.error("Error adding product:", error.message);
        return res.status(400).json({ error: error.message });
      }

      res.status(201).json({ message: 'Product added successfully', product: data });
    } catch (err) {
      console.error("Unexpected error in POST /products:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /products/:id - Update a product (Admin only)
  router.put('/:id', checkAdmin(supabase), async (req, res) => {
    const { id } = req.params;
    const { name, category, price, quantity, description } = req.body;

    // Build update object only with provided fields
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (category !== undefined) updatePayload.category = category;
    if (price !== undefined) updatePayload.price = price;
    if (quantity !== undefined) updatePayload.quantity = quantity;
    if (description !== undefined) updatePayload.description = description;

    // If no fields to update, return a bad request
    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("Error updating product:", error.message);
        return res.status(400).json({ error: error.message });
      }

      if (!data) {
        return res.status(404).json({ error: 'Product not found.' });
      }

      res.json({ message: 'Product updated successfully', product: data });
    } catch (err) {
      console.error("Unexpected error in PUT /products/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE /products/:id - Delete a product (Admin only)
  router.delete('/:id', checkAdmin(supabase), async (req, res) => {
    const { id } = req.params;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        // Check for foreign key constraint violation (product is in use)
        if (error.code === '23503') { // PostgreSQL foreign key violation error code
          console.error("Error deleting product: Product is associated with payment items.", error.message);
          return res.status(409).json({ error: 'Product cannot be deleted because it is associated with existing payment records. Please remove associated payment items first.' });
        }
        console.error("Error deleting product:", error.message);
        return res.status(400).json({ error: error.message });
      }

      // Supabase delete operation doesn't return data for deleted rows directly
      // So, check if any row was affected by trying to fetch it again (or rely on HTTP 204 No Content)
      // For simplicity, we'll assume a successful delete if no error and return 204.
      // If a specific "product not found" message is needed, a select before delete would be required.
      res.status(204).send(); // 204 No Content for successful deletion
    } catch (err) {
      console.error("Unexpected error in DELETE /products/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

export default productRoutes;
