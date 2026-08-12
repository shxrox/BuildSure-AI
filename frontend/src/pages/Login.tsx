import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn, useUser } from "@clerk/clerk-react";

function Login() {
  const { isSignedIn, user } = useUser();
  const navigate = useNavigate();

  // Automatically route user based on role once they sign in
  useEffect(() => {
    if (isSignedIn && user) {
      const role = (user.publicMetadata as { role?: string })?.role;

      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/homeowner", { replace: true });
      }
    }
  }, [isSignedIn, user, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <SignIn
        signUpUrl="/register"
      />
    </div>
  );
}

export default Login;