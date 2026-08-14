import { Router } from "express";
import {
  getRealStripeTransactions
} from "../controllers/stripe.controller";

const router = Router();

router.get(
  "/stripe-transactions",
  getRealStripeTransactions
);

export default router;