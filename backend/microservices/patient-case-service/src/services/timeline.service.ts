import { db } from '../db/database';
import { CaseTimelineEvent, TimelineEventType } from '../types';

export class TimelineService {
  async recordEvent(data: {
    caseId: string;
    eventType: TimelineEventType;
    actorId: string;
    actorRole: string;
    facilityId?: string;
    eventData?: Record<string, unknown>;
  }): Promise<CaseTimelineEvent> {
    return db.addTimelineEvent(data);
  }

  async getCaseTimeline(caseId: string): Promise<CaseTimelineEvent[]> {
    return db.getTimelineForCase(caseId);
  }
}

export const timelineService = new TimelineService();
