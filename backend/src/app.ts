

// import express from "express";
// import cors from "cors";
// import morgan from "morgan";

// import {
//   clerkMiddleware,
// } from "@clerk/express";

// import projectRoutes from "./routes/project.routes";
// import userRoutes from "./routes/user.routes";


// const app = express();


// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );


// app.use(express.json());
// app.use(morgan("dev"));


// // Clerk MUST come before routes
// app.use(clerkMiddleware());


// app.use(
//   "/api/v1/users",
//   userRoutes
// );


// app.use(
//   "/api/v1/projects",
//   projectRoutes
// );


// export default app;

import express from "express";
import cors from "cors";
import morgan from "morgan";
import Stripe from "stripe";

import {
  clerkMiddleware,
} from "@clerk/express";

import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));

// Clerk MUST come before routes
app.use(clerkMiddleware());

// ==========================================
// STRIPE CHECKOUT SESSION ENDPOINT
// ==========================================
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

app.post(
  "/api/create-checkout-session",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { priceId } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/homeowner?success=true`,
        cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/pricing?canceled=true`,
      });

      return res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      return res.status(500).json({ error: error.message });
    }
  }
);

app.use(
  "/api/v1/users",
  userRoutes
);

app.use(
  "/api/v1/projects",
  projectRoutes
);

export default app;