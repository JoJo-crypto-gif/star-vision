// backend/routes/paymentRoutes.js
import express from 'express';
import checkStaff from '../middleware/checkStaff.js'; // Import checkStaff middleware

const paymentRoutes = (supabase) => {
  const router = express.Router();

  // Helper function to manage stock updates and conceptual rollbacks
  // In a true production environment, consider robust database transactions or queues
  const updateProductStock = async (productId, quantityChange) => {
    const { error: updateError } = await supabase
      .rpc('update_product_quantity', {
        product_id_param: productId,
        quantity_change_param: quantityChange
      });

    if (updateError) {
      console.error(`Error updating stock for product ${productId}:`, updateError.message);
      throw new Error(`Failed to update stock for product ${productId}.`);
    }
  };

  // POST /payments - Record a new sale (Staff/Admin)
  router.post('/', checkStaff(supabase), async (req, res) => {
    const { patient_id, payment_method, items } = req.body; // items: [{ product_id, quantity }]
    let newPaymentId = null; // To track payment for potential rollback
    let committedStockChanges = []; // To track stock changes for rollback

    // 1. Input Validation
    if (!patient_id || !payment_method || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Patient ID, payment method, and items array are required.' });
    }

    try {
      let totalAmount = 0;
      const paymentItemsToCreate = []; // Data to insert into payment_items table
      const productsToUpdate = []; // Data for product stock updates

      // 2. Fetch product details, check stock, and prepare data
      for (const item of items) {
        if (!item.product_id || item.quantity <= 0) {
          return res.status(400).json({ error: 'Each item must have a valid product_id and quantity > 0.' });
        }

        const { data: product, error: productError } = await supabase
          .from('products')
          .select('id, name, price, quantity')
          .eq('id', item.product_id)
          .single();

        if (productError || !product) {
          return res.status(404).json({ error: `Product with ID ${item.product_id} not found.` });
        }

        if (product.quantity < item.quantity) {
          return res.status(409).json({ error: `Not enough stock for ${product.name}. Available: ${product.quantity}, Requested: ${item.quantity}.` });
        }

        totalAmount += product.price * item.quantity;
        
        paymentItemsToCreate.push({
          product_id: product.id,
          quantity: item.quantity,
          price_at_time_of_sale: product.price,
        });

        // Prepare for stock decrement
        productsToUpdate.push({
          id: product.id,
          quantity_change: -item.quantity // Negative for decrement
        });
      }

      // 3. Start a conceptual transaction (using a custom RPC function for atomicity)
      // Call an RPC function that encapsulates:
      //   - Creating payments record
      //   - Creating payment_items records
      //   - Updating product stock
      // This is the most robust way to handle transactions with Supabase from client-side code.
      const { data: transactionResult, error: transactionError } = await supabase.rpc('create_full_payment_transaction', {
        patient_id_param: patient_id,
        payment_method_param: payment_method,
        total_amount_param: totalAmount,
        payment_items_params: paymentItemsToCreate,
        products_to_update_params: productsToUpdate
      });

      if (transactionError) {
        console.error("Error in create_full_payment_transaction:", transactionError.message);
        return res.status(400).json({ error: transactionError.message });
      }

      res.status(201).json({ message: 'Payment recorded and stock updated successfully', payment: transactionResult });

    } catch (err) {
      console.error("Unexpected error in POST /payments:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /payments - List all payments
  router.get('/', checkStaff(supabase), async (req, res) => { // Protected route
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*, patient:patient_id(id, name, contact)'); // Fetch patient name and contact

      if (error) {
        console.error("Error fetching payments:", error.message);
        return res.status(400).json({ error: error.message });
      }

      res.json(data);
    } catch (err) {
      console.error("Unexpected error in GET /payments:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // GET /payments/:id - Retrieve details of a specific payment
  router.get('/:id', checkStaff(supabase), async (req, res) => { // Protected route
    const { id } = req.params;

    try {
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*, patient:patient_id(id, name, contact)')
        .eq('id', id)
        .single();

      if (paymentError || !payment) {
        console.error("Error fetching payment details:", paymentError?.message || "Payment not found.");
        return res.status(404).json({ error: 'Payment not found.' });
      }

      const { data: paymentItems, error: paymentItemsError } = await supabase
        .from('payment_items')
        .select('*, product:product_id(id, name, category, price)') // Fetch product details
        .eq('payment_id', id);

      if (paymentItemsError) {
        console.error("Error fetching payment items:", paymentItemsError.message);
        return res.status(400).json({ error: paymentItemsError.message });
      }

      res.json({ ...payment, items: paymentItems });
    } catch (err) {
      console.error("Unexpected error in GET /payments/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });


  // DELETE /payments/:id - Cancel a payment and restock products (Admin only)
  router.delete('/:id', checkStaff(supabase), async (req, res) => { // Protected route
    const { id } = req.params;

    try {
      // 1. Get payment items before deleting the payment
      const { data: paymentItems, error: getItemsError } = await supabase
        .from('payment_items')
        .select('product_id, quantity')
        .eq('payment_id', id);

      if (getItemsError || !paymentItems || paymentItems.length === 0) {
        console.error("Error fetching payment items for deletion:", getItemsError?.message || "Payment items not found.");
        // If payment doesn't exist, we still want to return 404 for the payment
        const { data: existingPayment } = await supabase.from('payments').select('id').eq('id', id).single();
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found.' });
        }
        // If payment exists but no items, something is wrong, proceed with payment deletion but log
        console.warn(`Payment ${id} found but no associated items.`);
      }

      // 2. Delete the payment record (this will CASCADE delete payment_items)
      const { error: deletePaymentError, count } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (deletePaymentError) {
        console.error("Error deleting payment record:", deletePaymentError.message);
        return res.status(400).json({ error: deletePaymentError.message });
      }
      
      if (count === 0) {
          return res.status(404).json({ error: 'Payment not found.' });
      }


      // 3. Restock products (only if items were found)
      if (paymentItems && paymentItems.length > 0) {
        for (const item of paymentItems) {
          await updateProductStock(item.product_id, item.quantity); // Positive quantity_change for increment
        }
      }

      res.status(200).json({ message: 'Payment cancelled and products restocked successfully.' });

    } catch (err) {
      console.error("Unexpected error in DELETE /payments/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });


  return router;
};

export default paymentRoutes;
