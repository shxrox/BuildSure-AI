import {
  SignUp,
} from "@clerk/clerk-react";


function Register() {


  return (

    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

      <SignUp
        signInUrl="/login"
        fallbackRedirectUrl="/homeowner"
      />

    </div>

  );

}


export default Register;