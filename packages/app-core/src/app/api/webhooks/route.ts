import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true }) : undefined;

const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  //No need for await validateUser() or roleHasPermissionServerSide() becuase users do not post to here
  //TODO add validateUser for unauthenticated users, log events to this
  try {
    if (!stripe) {
      return NextResponse.json({ message: "Error creating stripe instance" }, { status: 500 });
    }
    const buf = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      // On error, log and return the error message.
      if (err! instanceof Error) console.log(err);
      console.log(`❌ Error message: ${errorMessage}`);

      return NextResponse.json(
        {
          error: {
            message: `Webhook Error: ${errorMessage}`,
          },
        },
        { status: 400 }
      );
    }

    //cons

    // Successfully constructed event.
    console.log("✅ Success:", event.id);

    // getting to the data we want from the event
    const subscription = event.data.object as Stripe.Subscription;

    console.log("webhook event", event);

    const eventData = event.data.object as Stripe.Subscription;
    const stripeCustomerId = eventData.customer;

    switch (event.type) {
      case "customer.subscription.created":
        // Find the customer in our database with the Stripe customer ID linked to this purchase
        // Update that customer so their status is now active
        break;
      case "customer.subscription.updated":
        if (typeof stripeCustomerId !== "string") {
          console.error("Unknown customer for this event", event);
          return NextResponse.json({ received: true });
        }

        if (eventData.status === "active") {
          //a user has likely just subscribed. Update their account with the number of subscriptions they have purchased
          const subId = eventData.id;

          if (eventData.items.object !== "list") console.error("unknown event data items object type", eventData);
          let numSeats = 0;
          eventData.items.data.forEach((item: Stripe.SubscriptionItem) => {
            //counting the seats in this subscription
            const seatsInItem = item.price.id === "xxx" ? 2 : 1;
            numSeats += item.quantity ? seatsInItem * item.quantity : 0;
          });
        } else {
          //non active
        }

        break;
      case "customer.subscription.deleted":
        // Find the customer in our database with the Stripe customer ID linked to this purchase

        // Update that customer so their status is now in-active
        break;
      default:
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
        // Return a response to acknowledge receipt of the event.
        return NextResponse.json({ received: true });
    }

    // Return a response to acknowledge receipt of the event.
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      {
        error: {
          message: `Method Not Allowed`,
        },
      },
      { status: 405 }
    ).headers.set("Allow", "POST");
  }
}
