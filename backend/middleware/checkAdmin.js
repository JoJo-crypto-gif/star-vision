// middleware/checkAdmin.js
const checkAdmin = (supabase) => async (req, res, next) => {
  console.log("=== checkAdmin middleware triggered ===");
  console.log("Request method:", req.method);
  console.log("Request path:", req.path);
  console.log("Authorization header present:", !!req.headers.authorization);
  
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("❌ No authorization header found");
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  console.log("✅ Token extracted, length:", token?.length);
  console.log("Token preview:", token?.substring(0, 30) + "...");

  try {
    console.log("🔍 Validating token with Supabase...");
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log("Supabase auth response:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: error?.message || "no error"
    });

    if (error || !user) {
      console.log("❌ Token validation failed:", error?.message);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("🔍 Checking user role in database...");
    const { data: roleData, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("Role query result:", {
      roleData,
      roleError: roleError?.message || "no error"
    });

    if (roleError || !roleData) {
      console.log("❌ Role not found in database");
      console.log("Role error details:", roleError);
      return res.status(403).json({ error: "Role not found" });
    }

    if (roleData.role !== "admin") {
      console.log("❌ User is not admin, role:", roleData.role);
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }

    console.log("✅ User is admin, proceeding to route handler");
    req.user = user;
    next();
    
  } catch (err) {
    console.log("❌ Unexpected error in middleware:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export default checkAdmin;