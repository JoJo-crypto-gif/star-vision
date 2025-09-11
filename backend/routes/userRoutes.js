//routes/userRoutes.js
import express from "express";
import checkAdmin from '../middleware/checkAdmin.js';

const userRoutes = (supabase, supabaseAdmin) => {
  const router = express.Router();

  // POST /users/login
  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Use supabase auth to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Handle authentication errors
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Check if a user and session were returned
    if (!data.user || !data.session) {
      return res.status(401).json({ error: "Invalid login credentials." });
    }

    // Get the user's role from the 'users' table using the user's ID
    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (roleError) {
      return res.status(400).json({ error: roleError.message });
    }
    
    // Check if a role was returned
    if (!roleData || !roleData.role) {
      return res.status(400).json({ error: "User role not found." });
    }

    // Return the user, their role, and the session token
    res.json({
      user: data.user,
      role: roleData.role,
      token: data.session.access_token,
    });
  });

  // POST /users/add-staff (admin only)
  router.post("/add-staff", checkAdmin(supabase), async (req, res) => {
    const { email, password, name, phone } = req.body;

    try {
      // 1. Create staff in Supabase Auth with service role
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        return res.status(400).json({ error: createError.message });
      }

      // 2. Insert into users table
      const { error: insertError } = await supabase
        .from("users")
        .insert([{
          id: userData.user.id,
          role: "staff",
          name,
          phone,
        }]);

      if (insertError) {
        return res.status(400).json({ error: insertError.message });
      }

      res.json({ message: "Staff added successfully", user: userData.user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET all staff - Enhanced with emails from auth.users
  router.get("/staff", checkAdmin(supabase), async (req, res) => {
    console.log("=== GET /staff route hit ===");
    console.log("User from middleware:", req.user?.id);
    
    try {
      console.log("Attempting to fetch staff from Supabase...");
      
      // First, get staff data from users table
      const { data: staffData, error } = await supabase
        .from("users")
        .select("id, role, name, phone")
        .eq("role", "staff");

      console.log("Supabase query result:", { 
        dataCount: staffData?.length || 0, 
        error: error?.message || "no error",
      });

      if (error) {
        console.log("Supabase error details:", error);
        return res.status(400).json({ error: error.message });
      }

      // If no staff found, return empty array
      if (!staffData || staffData.length === 0) {
        console.log("No staff found, returning empty array");
        return res.json({ staff: [] });
      }

      // Now fetch emails from auth.users using supabaseAdmin
      console.log("Fetching emails from auth.users...");
      const staffWithEmails = await Promise.all(
        staffData.map(async (staff) => {
          try {
            const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(staff.id);
            
            if (authError) {
              console.log(`Failed to get email for user ${staff.id}:`, authError.message);
              return {
                ...staff,
                email: 'N/A' // Fallback if we can't get the email
              };
            }

            return {
              ...staff,
              email: authUser.user?.email || 'N/A'
            };
          } catch (err) {
            console.log(`Error fetching auth data for user ${staff.id}:`, err);
            return {
              ...staff,
              email: 'N/A'
            };
          }
        })
      );

      console.log("Successfully fetched staff with emails");
      res.json({ staff: staffWithEmails });
      
    } catch (err) {
      console.error("Unexpected error in /staff route:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // PUT Edit staff details
  router.put("/staff/:id", checkAdmin(supabase), async (req, res) => {
    const { id } = req.params;
    const { name, phone } = req.body;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name, phone })
        .eq("id", id)
        .select()
        .single();

      if (error) return res.status(400).json({ error: error.message });

      res.json({ message: "Staff updated successfully", staff: data });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET Count staff
  router.get("/staff-count", checkAdmin(supabase), async (req, res) => {
    try {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("role", "staff");

      if (error) return res.status(400).json({ error: error.message });

      res.json({ staffCount: count });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // DELETE staff - Enhanced with debugging
  router.delete("/staff/:id", checkAdmin(supabase), async (req, res) => {
    const { id } = req.params;
    console.log("=== DELETE /staff/:id route hit ===");
    console.log("Staff ID to delete:", id);
    console.log("User from middleware:", req.user?.id);

    try {
      // 1. Remove from Supabase Auth (must use supabaseAdmin)
      console.log("Attempting to delete user from Supabase Auth...");
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
      
      if (authError) {
        console.log("Auth deletion error:", authError);
        return res.status(400).json({ error: authError.message });
      }

      // 2. Remove from users table
      console.log("Attempting to delete user from database...");
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", id);

      if (dbError) {
        console.log("Database deletion error:", dbError);
        return res.status(400).json({ error: dbError.message });
      }

      console.log("Staff deletion successful");
      res.json({ message: "Staff deleted successfully" });
      
    } catch (err) {
      console.error("Unexpected error in DELETE /staff/:id:", err);
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};

export default userRoutes;