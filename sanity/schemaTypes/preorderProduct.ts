import { defineField, defineType } from "sanity";
import { baseProductFields } from "./productFields";

/** Products already designed but not yet physically made — reserve ahead of production. */
export default defineType({
  name: "preorderProduct",
  title: "Pre-order product",
  type: "document",
  fields: [
    ...baseProductFields,
    defineField({ name: "expectedShipWindowStart", title: "Expected ship window start", type: "date" }),
    defineField({ name: "expectedShipWindowEnd", title: "Expected ship window end", type: "date" }),
    defineField({
      name: "preorderStatus",
      title: "Pre-order status",
      type: "string",
      options: {
        list: [
          { title: "Open", value: "open" },
          { title: "Closing soon", value: "closing_soon" },
          { title: "Closed", value: "closed" },
          { title: "In production", value: "in_production" },
        ],
      },
      initialValue: "open",
    }),
    defineField({
      name: "depositAmount",
      title: "Deposit amount (USD)",
      description: "Reserved for a future deposit-now/balance-later flow. Full payment upfront is used for now — leave blank.",
      type: "number",
    }),
    defineField({ name: "maxUnits", title: "Max units", type: "number" }),
    defineField({ name: "unitsReserved", title: "Units reserved", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "name.en", media: "images.0" },
  },
});
