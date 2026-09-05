import { defineField, defineType } from "sanity";

/**
 * Lightweight order record written by the checkout API routes (Stripe
 * webhook, PayPal capture, or a Wise bank-transfer reservation). Not a full
 * fulfillment system — just enough to track payment/shipping status without
 * duplicating each provider's own dashboard.
 */
export default defineType({
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    defineField({
      name: "paymentMethod",
      title: "Payment method",
      type: "string",
      options: {
        list: [
          { title: "Stripe (card)", value: "stripe_card" },
          { title: "Stripe (Alipay)", value: "stripe_alipay" },
          { title: "Stripe (Revolut Pay)", value: "stripe_revolut_pay" },
          { title: "PayPal", value: "paypal" },
          { title: "Wise (bank transfer)", value: "wise" },
          { title: "Coinbase Commerce (crypto)", value: "coinbase" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentStatus",
      title: "Payment status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Awaiting bank transfer", value: "awaiting_bank_transfer" },
          { title: "Paid", value: "paid" },
          { title: "Failed", value: "failed" },
          { title: "Refunded", value: "refunded" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({ name: "referenceCode", title: "Reference code", type: "string" }),
    defineField({ name: "providerReference", title: "Provider reference (Stripe/PayPal ID)", type: "string" }),
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "readyMadeProduct" }, { type: "preorderProduct" }],
    }),
    defineField({ name: "promoCode", title: "Promo code used", type: "reference", to: [{ type: "promoCode" }] }),
    defineField({ name: "amountTotal", title: "Amount total", type: "number" }),
    defineField({ name: "currency", title: "Currency", type: "string" }),
    defineField({ name: "customerEmail", title: "Customer email", type: "string" }),
    defineField({ name: "customerName", title: "Customer full name", type: "string" }),
    defineField({
      name: "shippingAddress",
      title: "Shipping address",
      type: "object",
      fields: [
        defineField({ name: "line1", title: "Address line 1", type: "string" }),
        defineField({ name: "line2", title: "Address line 2", type: "string" }),
        defineField({ name: "city", title: "City", type: "string" }),
        defineField({ name: "postalCode", title: "Postal code", type: "string" }),
        defineField({ name: "country", title: "Country", type: "string" }),
      ],
    }),
    defineField({
      name: "shippingStatus",
      title: "Shipping status",
      type: "string",
      options: {
        list: [
          { title: "Not shipped", value: "not_shipped" },
          { title: "In production", value: "in_production" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
        ],
      },
      initialValue: "not_shipped",
    }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime" }),
  ],
  preview: {
    select: { title: "referenceCode", subtitle: "paymentStatus" },
  },
});
