import { defineType } from "sanity";
import { baseProductFields } from "./productFields";

/** Completed fursuits available to buy and ship immediately (dokidoki-style catalog). */
export default defineType({
  name: "readyMadeProduct",
  title: "Ready-made product",
  type: "document",
  fields: baseProductFields,
  preview: {
    select: { title: "name.en", media: "images.0" },
  },
});
