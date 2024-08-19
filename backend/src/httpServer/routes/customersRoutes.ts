import { Router } from "express";
import express from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { setCustomerId, updateUserIsPaid } from "../../db/usersModel";
import { logger } from "../../utils/logger";
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const router = Router();

router.post("/create-checkout-session", requireAuth, async (req, res) => {
	const userId = req.user!._id;
	const customerId = req.user!.customerId;

	let sessionObj: any = {
		client_reference_id: userId,
		mode: "subscription",
		line_items: [
			{
				price: process.env.PRICE_ID,
				quantity: 1
			}
		],
		tax_id_collection: {
			enabled: true
		},
		automatic_tax: {
			enabled: true
		},
		success_url: `${process.env.WEBAPP_URL}/plans?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${process.env.WEBAPP_URL}/plans`
	};

	if (customerId) {
		sessionObj["customer"] = customerId;
		sessionObj["customer_update"] = { name: "auto" };
	}

	const session = await stripe.checkout.sessions.create(sessionObj);

	res.json({ url: session.url });
});

// Handle Stripe webhook events
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
	const sig = req.headers["stripe-signature"];
	const webhookSecret = process.env.STRIPE_SECRET;

	let event;

	try {
		event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

		if (event.type === "checkout.session.completed") {
			const session = event.data.object;
			const clientReferenceId = session.client_reference_id;
			const customerId = session.customer;

			// Update subscription status
			await setCustomerId(clientReferenceId, customerId);
		} else if (event.type === "customer.subscription.deleted") {
			const subscription = event.data.object;

			const customerId = subscription.customer;

			await updateUserIsPaid(customerId, false);
		}

		res.json({ received: true });
	} catch (error) {
		logger.error(error, "Error in /webhook");
		res.status(400).send(`Webhook error`);
	}
});

router.post("/customer-portal", requireAuth, async (req, res) => {
	const returnUrl = `${process.env.WEBAPP_URL}/plans`;
	const customerId = req.user!.customerId;

	if (customerId) {
		const portalSession = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: returnUrl
		});

		// Redirect to the URL for the session
		res.json({ url: portalSession.url });
	} else {
		res.status(404);
	}
});

export default router;
