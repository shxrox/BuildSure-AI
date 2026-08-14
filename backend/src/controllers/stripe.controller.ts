import { Request, Response } from "express";
import Stripe from "stripe";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY as string
);

export const getRealStripeTransactions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("========== STRIPE TRANSACTIONS ==========");

    const key = process.env.STRIPE_SECRET_KEY;

    console.log(
      "Stripe key:",
      key ? `${key.substring(0, 12)}...` : "MISSING"
    );

    console.log(
      "Mode:",
      key?.startsWith("sk_test_")
        ? "TEST"
        : key?.startsWith("sk_live_")
        ? "LIVE"
        : "UNKNOWN"
    );

    const sessions =
      await stripe.checkout.sessions.list({
        limit: 100,
      });

    console.log(
      "Sessions found:",
      sessions.data.length
    );

    const transactions = sessions.data.map(
      (session) => {
        const amount =
          (session.amount_total ?? 0) / 100;

        const currency =
          (session.currency ?? "usd").toUpperCase();

        const email =
          session.customer_details?.email ??
          session.customer_email ??
          "No Email";

        return {
          transactionId: session.id,

          userEmail: email,

          amount: `${currency} ${amount.toFixed(2)}`,

          amountValue: amount,

          currency,

          status:
            session.payment_status === "paid"
              ? "Succeeded"
              : session.payment_status,

          timestamp: new Date(
            session.created * 1000
          ).toISOString(),
        };
      }
    );

    res.status(200).json({
      success: true,
      data: transactions,
    });

  } catch (error: any) {
    console.error(
      "========== STRIPE ERROR =========="
    );

    console.error("Message:", error?.message);
    console.error("Type:", error?.type);
    console.error("Code:", error?.code);
    console.error("Param:", error?.param);
    console.error("Status:", error?.statusCode);

    res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Failed to retrieve Stripe transactions",
    });
  }
};