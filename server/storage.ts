import { type Meeting, type InsertMeeting, type Attendee, type InsertAttendee } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  getAllMeetings(): Promise<Meeting[]>;
  updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  
  createAttendee(attendee: InsertAttendee): Promise<Attendee>;
  getAttendee(id: string): Promise<Attendee | undefined>;
}

export class MemStorage implements IStorage {
  private meetings: Map<string, Meeting>;
  private attendees: Map<string, Attendee>;

  constructor() {
    this.meetings = new Map();
    this.attendees = new Map();
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const id = randomUUID();
    const meeting: Meeting = { 
      id,
      title: insertMeeting.title,
      scheduledDurationMinutes: insertMeeting.scheduledDurationMinutes,
      totalCost: insertMeeting.totalCost,
      hasAgenda: insertMeeting.hasAgenda ?? false,
      attendeeCount: insertMeeting.attendeeCount,
      actualDurationMinutes: null,
      efficiencyScore: null,
      efficiencyGrade: null,
      startedAt: new Date(),
      endedAt: null,
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getAllMeetings(): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).sort((a, b) => {
      const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updated = { ...meeting, ...updates };
    this.meetings.set(id, updated);
    return updated;
  }

  async createAttendee(insertAttendee: InsertAttendee): Promise<Attendee> {
    const id = randomUUID();
    const attendee: Attendee = { ...insertAttendee, id };
    this.attendees.set(id, attendee);
    return attendee;
  }

  async getAttendee(id: string): Promise<Attendee | undefined> {
    return this.attendees.get(id);
  }
}

export const storage = new MemStorage();
