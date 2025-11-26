// middleware/checkAdmin.js
const checkAdmin = (supabase) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (roleError || !roleData) {
      return res.status(403).json({ error: "Role not found" });
    }

    if (roleData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    req.user = user;
    next();
    
  } catch (err) {
    // It's still good practice to log unexpected errors, but we avoid logging sensitive data.
    console.error("Unexpected error in checkAdmin middleware:", err.message);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default checkAdmin;