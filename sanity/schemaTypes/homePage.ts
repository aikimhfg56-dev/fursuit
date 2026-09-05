import { defineField, defineType } from "sanity";

/** Singleton: homepage hero + the four scroll-reveal feature images, added once real photography is available. */
export default defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "shopImage",
      title: "Ready-made suits section image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "preorderImage",
      title: "Pre-order section image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "commissionImage",
      title: "Custom commission section image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "contactImage",
      title: "Contact section image",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
