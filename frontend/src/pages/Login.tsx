import { SignIn } from "@clerk/clerk-react";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn />
    </div>
  );
}

export default Login;