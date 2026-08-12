import Stripe from "stripe";
import Order from "../models/Order.js";

export const stripeWebhook = async (req, res) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;
    await Order.findByIdAndUpdate(orderId, {
      status: "paid",
      "paymentInfo.paymentStatus": "paid",
    });
    console.log(`Order ${orderId} marked as paid`);
  }

  res.json({ received: true });
};