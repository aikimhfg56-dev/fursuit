import { defineField, defineType } from "sanity";

/** Singleton: hero image for the homepage, added once real photography is available. */
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
  ],
  preview: {
    prepare: () => ({ title: "Home page" }),
  },
});
