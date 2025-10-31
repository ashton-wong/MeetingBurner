import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attendees = pgTable("attendees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
});

export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  scheduledDurationMinutes: integer("scheduled_duration_minutes").notNull(),
  actualDurationMinutes: integer("actual_duration_minutes"),
  totalCost: integer("total_cost").notNull(),
  hasAgenda: boolean("has_agenda").notNull().default(false),
  attendeeCount: integer("attendee_count").notNull(),
  efficiencyScore: integer("efficiency_score"),
  efficiencyGrade: text("efficiency_grade"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
});

export const insertAttendeeSchema = createInsertSchema(attendees).omit({ id: true });
export const insertMeetingSchema = createInsertSchema(meetings).omit({ id: true });

export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type Attendee = typeof attendees.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

export const SALARY_BANDS = {
  Junior: 45,
  Mid: 65,
  Senior: 85,
  Manager: 110,
} as const;

export type Role = keyof typeof SALARY_BANDS;
