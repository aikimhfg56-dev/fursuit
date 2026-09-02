import { defineField, defineType } from "sanity";

/** Kig, Kemono, Toony, Realistic, Cosplay — dokidoki-style style facet. */
export default defineType({
  name: "styleTag",
  title: "Style tag",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "localeString", validation: (rule) => rule.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title.en" },
  },
});
