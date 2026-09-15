import type { AccountAddress } from "@/lib/account/profile";
import { capturePaypalOrder } from "@/lib/payments/paypal";
import { createOrder } from "@/lib/orders/createOrder";
import { createThread } from "@/lib/messages/store";
import { sendNotificationEmail } from "@/lib/email/resend";

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
  const capture = (await capturePaypalOrder(orderId)) as PaypalCaptureResponse;
  const captureDetails = capture.purchase_units?.[0]?.payments?.captures?.[0];
  const finalReference = referenceCode ?? orderId;
  const customerEmail = shopper?.customerEmail ?? capture.payer?.email_address;

  await createOrder({
    paymentMethod: "paypal",
    paymentStatus: capture.status === "COMPLETED" ? "paid" : "failed",
    referenceCode: finalReference,
    providerReference: orderId,
    amountTotal: Number(captureDetails?.amount?.value ?? 0),
    currency: captureDetails?.amount?.currency_code ?? "USD",
    customerEmail,
    customerName: shopper?.customerName,
    shippingAddress: shopper?.shippingAddress,
  });

  // Only preorder (semi-order) purchases get a post-purchase chat thread —
  // finished Shop goods have no color/size left to discuss.
  if (capture.status === "COMPLETED" && shopper?.buyerUserId && shopper.productKind === "preorder") {
    await createThread({
      kind: "preorder",
      buyerUserId: shopper.buyerUserId,
      buyerName: shopper.customerName,
      buyerEmail: customerEmail,
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
