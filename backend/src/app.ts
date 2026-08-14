import express from "express";
import cors from "cors";
import morgan from "morgan";
import Stripe from "stripe";

import {
  clerkMiddleware,
} from "@clerk/express";

import projectRoutes from "./routes/project.routes";
import userRoutes from "./routes/user.routes";
import User from "./models/user.model";
import adminRoutes from "./routes/admin.routes";
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ==========================================
// STRIPE WEBHOOK ENDPOINT
// ==========================================
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req: express.Request, res: express.Response): Promise<any> => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        event = req.body;
      } else {
        event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);
      }
    } catch (err: any) {
      console.error(`❌ Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      console.log("🔔 Webhook event received type:", event.type);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email || session.customer_email;

        console.log("📧 Extracted Customer Email:", customerEmail);

        if (customerEmail) {
          let expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Fallback default

          // If it's a subscription, pull the exact correct period end date from Stripe safely using 'any'
          if (session.subscription) {
            try {
              const subscription: any = await stripe.subscriptions.retrieve(
                session.subscription as string
              );

              // Check top-level or item-level period end safely
              const periodEnd = subscription.current_period_end || subscription.items?.data?.[0]?.current_period_end;

              if (periodEnd) {
                expiresAt = new Date(periodEnd * 1000);
              }
            } catch (stripeErr) {
              console.error("Failed to fetch subscription details from Stripe:", stripeErr);
            }
          }

          const updatedUser = await User.findOneAndUpdate(
            { email: customerEmail.toLowerCase().trim() },
            {
              subscription: "PRO",
              subscriptionExpiresAt: expiresAt,
              stripeCustomerId: session.customer as string,
            },
            { new: true }
          );

          if (updatedUser) {
            console.log(`✅ Successfully upgraded user ${customerEmail} to PRO until ${expiresAt.toISOString()}.`);
          } else {
            console.log(`⚠️ User with email ${customerEmail} not found in MongoDB!`);
          }
        }
      }

      return res.json({ received: true });
    } catch (handlerError: any) {
      console.error("🔥 CRITICAL WEBHOOK HANDLER ERROR:", handlerError);
      return res.status(500).json({ error: handlerError.message });
    }
  }
);

app.use(express.json());
app.use(morgan("dev"));

// Clerk MUST come before routes
app.use(clerkMiddleware());

// ==========================================
// STRIPE CHECKOUT SESSION ENDPOINT
// ==========================================
app.post(
  "/api/create-checkout-session",
  async (req: express.Request, res: express.Response): Promise<any> => {
    try {
      const { priceId, customerEmail } = req.body;

      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        customer_email: customerEmail || undefined,
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
app.use("/api/v1/admin", adminRoutes);
app.use(
  "/api/v1/users",
  userRoutes
);

app.use(
  "/api/v1/projects",
  projectRoutes
);

export default app;