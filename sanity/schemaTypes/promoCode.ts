import { defineField, defineType } from "sanity";

/**
 * Provider-agnostic promo codes. Validated server-side in
 * /api/promo/validate and applied to the order total before it's handed to
 * whichever of Stripe/PayPal/Wise the shopper picks, so the discount is
 * consistent no matter the payment method.
 */
export default defineType({
  name: "promoCode",
  title: "Promo code",
  type: "document",
  fields: [
    defineField({
      name: "code",
      title: "Code",
      type: "string",
      description: "Entered by the shopper, case-insensitive (e.g. WELCOME10).",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "discountType",
      title: "Discount type",
      type: "string",
      options: {
        list: [
          { title: "Percentage off", value: "percentage" },
          { title: "Fixed amount off (USD)", value: "fixed" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "discountValue",
      title: "Discount value",
      description: "Percentage (1-100) or fixed USD amount, depending on discount type.",
      type: "number",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
    defineField({ name: "expiresAt", title: "Expires at", type: "datetime" }),
    defineField({
      name: "minOrderAmount",
      title: "Minimum order amount (USD)",
      type: "number",
    }),
  ],
  preview: {
    select: { title: "code", subtitle: "discountType" },
  },
});
