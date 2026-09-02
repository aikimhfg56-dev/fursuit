import type { StructureResolver } from "sanity/structure";

/** Pulls commissionPage out as a singleton edit screen instead of a list. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Commission page")
        .child(S.document().schemaType("commissionPage").documentId("commissionPage")),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== "commissionPage"),
    ]);
