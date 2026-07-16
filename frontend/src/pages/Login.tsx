import {
  SignIn,
} from "@clerk/clerk-react";


function Login() {


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
        fallbackRedirectUrl="/homeowner"
      />

    </div>

  );

}


export default Login;