import { defineArrayMember, defineField, defineType } from "sanity";

/** Singleton: copy for the custom-commission page (lemonbrat-style process steps). */
export default defineType({
  name: "commissionPage",
  title: "Commission page",
  type: "document",
  fields: [
    defineField({ name: "heroTitle", title: "Hero title", type: "localeString" }),
    defineField({ name: "heroBody", title: "Hero body", type: "localeText" }),
    defineField({
      name: "steps",
      title: "Process steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "step",
          fields: [
            defineField({ name: "stepNumber", title: "Step number", type: "number", validation: (rule) => rule.required() }),
            defineField({ name: "title", title: "Title", type: "localeString" }),
            defineField({ name: "description", title: "Description", type: "localeText" }),
            defineField({ name: "image", title: "Image", type: "image" }),
          ],
          preview: {
            select: { title: "title.en", subtitle: "stepNumber" },
          },
        }),
      ],
    }),
    defineField({
      name: "faq",
      title: "FAQ",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "faqItem",
          fields: [
            defineField({ name: "question", title: "Question", type: "localeString" }),
            defineField({ name: "answer", title: "Answer", type: "localeText" }),
          ],
          preview: {
            select: { title: "question.en" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Commission page" }),
  },
});
