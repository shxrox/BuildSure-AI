import React from "react";
import ReactDOM from "react-dom/client";

import {
  ClerkProvider,
} from "@clerk/clerk-react";


import AppRoutes from "./routes/AppRoutes";


import {
  AuthProvider,
} from "./context/AuthContext";



const CLERK_KEY =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;



ReactDOM.createRoot(
  document.getElementById("root")!
)
.render(

  <React.StrictMode>

    <ClerkProvider
      publishableKey={CLERK_KEY}
    >

      <AuthProvider>

        <AppRoutes />

      </AuthProvider>

    </ClerkProvider>

  </React.StrictMode>

);