import { SignUp } from "@clerk/clerk-react";

function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUp />
    </div>
  );
}

export default Register;