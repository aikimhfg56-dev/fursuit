import { defineField, defineType } from "sanity";

/**
 * Short translated text (product names, category titles, etc). English
 * covers en-US/en-GB/en-AU alike — regional spelling differences live in
 * the UI-chrome message files, not in commerce copy. See de/fr/es/ja for
 * the other four site locales.
 */
export default defineType({
  name: "localeString",
  title: "Localized string",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "de", title: "Deutsch", type: "string" }),
    defineField({ name: "fr", title: "Français", type: "string" }),
    defineField({ name: "es", title: "Español", type: "string" }),
    defineField({ name: "ja", title: "日本語", type: "string" }),
  ],
});
