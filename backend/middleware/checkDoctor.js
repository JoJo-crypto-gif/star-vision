// middleware/checkDoctor.js

const checkDoctor = (supabase) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 1. Validate the JWT token and get the user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // 2. Get the user's role from the database
    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !roleData) {
      return res.status(403).json({ error: "Role not found" });
    }

    // 3. Check for required roles: 'doctor' or 'admin'
    if (!["doctor", "admin"].includes(roleData.role)) {
      return res.status(403).json({ error: "Forbidden: Doctor or Admin only" });
    }

    // 4. Attach user info and proceed
    req.user = user;
    req.role = roleData.role; // Attach role for potential future use
    next();
  } catch (err) {
    console.error("Error in checkDoctor middleware:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default checkDoctor;