import { EUserRole } from "@/types/common/roles";
import { pgTable, varchar, text, timestamp, boolean, primaryKey, index, serial, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  profileUrl: text("profileUrl"),
  coverUrl: text("coverUrl"),
  role: varchar("role", { length: 50 })
    .$type<EUserRole>()
    .default(EUserRole.USER)
    .notNull(),
});

export const photosTable = pgTable("photos", {
  title: varchar("title", { length: 49 }).notNull(),
  description: varchar("description", { length: 254 }).notNull(),
  url: varchar("url").primaryKey(),
  author: varchar("author", { length: 49 }).notNull(),
  createdBy: text("createdBy").notNull().references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const photoLikes = pgTable(
  "photo_likes",
  {
    photoUrl: varchar("photoUrl")
      .notNull()
      .references(() => photosTable.url, { onDelete: "cascade" }),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    likedAt: timestamp("likedAt").defaultNow().notNull(),
  },
  (table) => [
    index("photo_likes_idx").on(table.photoUrl, table.userId),
    primaryKey({ columns: [table.photoUrl, table.userId] }),
  ]
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export const notificationTypeEnum = pgEnum("notification_type", [
  "global",
  "specific",
  "warning",
  "info",
  "alert",
  "like",
]);

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 49 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  readStatus: boolean("readStatus").default(false),
  notificationOf: text("notificationOf").notNull().references(() => users.id, { onDelete: "cascade" }),

  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const schema = {
  users,
  sessions,
  accounts,
  verifications,
  photosTable,
};

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;
export type Likes = typeof photoLikes.$inferInsert;
export type Notification = typeof notifications.$inferInsert;
