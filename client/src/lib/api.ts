import { apiRequest } from "./queryClient";
import type { Meeting, InsertMeeting } from "@shared/schema";

// Helper: local fallback storage key for minimal server-less meetings
const LOCAL_MEETINGS_KEY = "localMeetings";

function makeLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readLocalMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(LOCAL_MEETINGS_KEY);
    if (!raw) return [];
  const parsed = JSON.parse(raw) as Meeting[];
  return parsed.map((m) => ({ ...m, startedAt: m.startedAt ? new Date(m.startedAt) : new Date() }));
  } catch (e) {
    return [];
  }
}

function writeLocalMeetings(list: Meeting[]) {
  try {
    localStorage.setItem(LOCAL_MEETINGS_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export async function createMeeting(data: InsertMeeting): Promise<Meeting> {
  try {
    const res = await apiRequest("POST", "/api/meetings", data);
    return res.json();
  } catch (err) {
    // fallback for static deployments: persist a minimal meeting object locally
    const id = makeLocalId();
    const meeting: Meeting = {
      id,
      title: data.title,
      scheduledDurationMinutes: data.scheduledDurationMinutes,
      totalCost: data.totalCost,
      hasAgenda: data.hasAgenda ?? false,
      attendeeCount: data.attendeeCount,
      actualDurationMinutes: null as any,
      efficiencyScore: null as any,
      efficiencyGrade: "",
  startedAt: new Date() as any,
      endedAt: null as any,
    };
    const list = readLocalMeetings();
    list.unshift(meeting);
    writeLocalMeetings(list);
    return meeting;
  }
}

export async function getMeetings(): Promise<Meeting[]> {
  try {
    const response = await fetch("/api/meetings");
    if (!response.ok) throw new Error("Failed to fetch meetings");
    return response.json();
  } catch (err) {
    return readLocalMeetings();
  }
}

export async function getMeeting(id: string): Promise<Meeting> {
  try {
    const response = await fetch(`/api/meetings/${id}`);
    if (!response.ok) throw new Error("Failed to fetch meeting");
    return response.json();
  } catch (err) {
    const list = readLocalMeetings();
    const found = list.find((m) => m.id === id);
    if (found) return found;
    // as a last resort, attempt to use meetingReport:<id>
    const raw = localStorage.getItem(`meetingReport:${id}`);
    if (raw) return JSON.parse(raw) as any;
    throw err;
  }
}

export async function updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting> {
  try {
    const res = await apiRequest("PATCH", `/api/meetings/${id}`, updates);
    return res.json();
  } catch (err) {
    // apply updates to local fallback store if present
    const list = readLocalMeetings();
    const idx = list.findIndex((m) => m.id === id);
    if (idx >= 0) {
      const updated = { ...list[idx], ...updates } as Meeting;
      list[idx] = updated;
      writeLocalMeetings(list);
      return updated;
    }
    // if no local meeting present, but a meetingReport exists, merge updates into that
    const raw = localStorage.getItem(`meetingReport:${id}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = { ...parsed, ...updates };
      localStorage.setItem(`meetingReport:${id}`, JSON.stringify(merged));
      return merged as any;
    }
    throw err;
  }
}
