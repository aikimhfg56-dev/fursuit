import type { AccountAddress } from "@/lib/account/profile";
import { capturePaypalOrder } from "@/lib/payments/paypal";
import { createOrder } from "@/lib/orders/createOrder";
import { createThread } from "@/lib/messages/store";
import { sendNotificationEmail } from "@/lib/email/resend";
import { decrementStock } from "@/lib/seller/store";

type PaypalCaptureResponse = {
  status: string;
  payer?: { email_address?: string };
  purchase_units?: { payments?: { captures?: { amount?: { value?: string; currency_code?: string } }[] } }[];
};

export type PaypalCaptureResult = {
  status: string;
  amount?: string;
  currency?: string;
};

/**
 * Captures a PayPal order, records it in Sanity, and emails a notification.
 * Shared by /api/checkout/paypal/capture-order (a client-driven capture, e.g.
 * from PayPal's JS SDK buttons) and the checkout success page (capture on
 * redirect back from PayPal's hosted approval flow).
 */
export async function processPaypalCapture(
  orderId: string,
  referenceCode?: string,
  shopper?: {
    customerEmail?: string;
    customerName?: string;
    shippingAddress?: AccountAddress;
    buyerUserId?: string;
    productKind?: "shop" | "preorder";
    productSlug?: string;
    productName?: string;
  },
): Promise<PaypalCaptureResult> {
  const finalReference = referenceCode ?? orderId;

  let capture: PaypalCaptureResponse;
  try {
    capture = (await capturePaypalOrder(orderId)) as PaypalCaptureResponse;
  } catch (error) {
    // PayPal rejects the capture call outright for a declined card, an
    // already-captured order, etc. — without this, that attempt would never
    // reach createOrder() below and the seller would have zero record of it.
    console.error("PayPal capture request failed", error);
    await createOrder({
      buyerUserId: shopper?.buyerUserId,
      paymentMethod: "paypal",
      paymentStatus: "failed",
      referenceCode: finalReference,
      providerReference: orderId,
      amountTotal: 0,
      currency: "USD",
      customerEmail: shopper?.customerEmail,
      customerName: shopper?.customerName,
      productName: shopper?.productName,
      shippingAddress: shopper?.shippingAddress,
    });
    await sendNotificationEmail({
      subject: `PayPal payment failed — ${finalReference}`,
      text: `PayPal order capture failed outright (declined, expired, or already captured). Order: ${orderId}.`,
    });
    return { status: "FAILED" };
  }

  const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];
  const customerEmail = shopper?.customerEmail ?? capture.payer?.email_address;

  // Only a successful capture should consume a customer number — a failed
  // attempt is still recorded (paymentStatus: "failed") but must not burn one.
  const order = await createOrder({
    buyerUserId: shopper?.buyerUserId,
    productKind: capture.status === "COMPLETED" ? shopper?.productKind : undefined,
    paymentMethod: "paypal",
    paymentStatus: capture.status === "COMPLETED" ? "paid" : "failed",
    referenceCode: finalReference,
    providerReference: orderId,
    amountTotal: Number(captureDetails?.amount?.value ?? 0),
    currency: captureDetails?.amount?.currency_code ?? "USD",
    customerEmail,
    customerName: shopper?.customerName,
    productName: shopper?.productName,
    shippingAddress: shopper?.shippingAddress,
  });

  if (capture.status === "COMPLETED" && shopper?.productSlug) {
    await decrementStock(shopper.productKind === "preorder" ? "preorder" : "shop", shopper.productSlug);
  }

  // Every completed purchase gets a post-purchase chat thread with the seller.
  if (capture.status === "COMPLETED" && shopper?.buyerUserId) {
    await createThread({
      kind: shopper.productKind ?? "shop",
      buyerUserId: shopper.buyerUserId,
      buyerName: shopper.customerName,
      buyerEmail: customerEmail,
      customerNumber: order.customerNumber,
      productName: shopper.productName ?? "",
      productSlug: shopper.productSlug,
      referenceCode: finalReference,
    });
  }

  await sendNotificationEmail({
    subject: `New order — ${finalReference}`,
    text: `PayPal order captured. Order: ${orderId}, status: ${capture.status}.`,
  });

  return {
    status: capture.status,
    amount: captureDetails?.amount?.value,
    currency: captureDetails?.amount?.currency_code,
  };
}
