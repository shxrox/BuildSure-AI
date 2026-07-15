import React from "react";
import ReactDOM from "react-dom/client";

import {
  ClerkProvider,
} from "@clerk/clerk-react";

import App from "./App";
import "./styles/index.css";

import {
  clerkPublishableKey,
} from "./config/clerk";


if (!clerkPublishableKey) {
  throw new Error(
    "Missing Clerk Publishable Key"
  );
}


ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);