import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const photosTable = pgTable("photos", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 49 }).notNull(),
  description: varchar({ length: 254 }).notNull(),
  url: varchar().notNull(),
  author: varchar({ length: 49 }).notNull(),
});
