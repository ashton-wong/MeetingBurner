import { apiRequest } from "./queryClient";
import type { Meeting, InsertMeeting } from "@shared/schema";

export async function createMeeting(data: InsertMeeting): Promise<Meeting> {
  const res = await apiRequest("POST", "/api/meetings", data);
  return res.json();
}

export async function getMeetings(): Promise<Meeting[]> {
  const response = await fetch("/api/meetings");
  if (!response.ok) throw new Error("Failed to fetch meetings");
  return response.json();
}

export async function getMeeting(id: string): Promise<Meeting> {
  const response = await fetch(`/api/meetings/${id}`);
  if (!response.ok) throw new Error("Failed to fetch meeting");
  return response.json();
}

export async function updateMeeting(id: string, updates: Partial<InsertMeeting>): Promise<Meeting> {
  const res = await apiRequest("PATCH", `/api/meetings/${id}`, updates);
  return res.json();
}
