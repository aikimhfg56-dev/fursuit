import { defineField, defineType } from "sanity";

/** Longer translated text (product descriptions, page copy). See localeString. */
export default defineType({
  name: "localeText",
  title: "Localized text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "text", rows: 4, validation: (rule) => rule.required() }),
    defineField({ name: "de", title: "Deutsch", type: "text", rows: 4 }),
    defineField({ name: "fr", title: "Français", type: "text", rows: 4 }),
    defineField({ name: "es", title: "Español", type: "text", rows: 4 }),
    defineField({ name: "ja", title: "日本語", type: "text", rows: 4 }),
  ],
});
