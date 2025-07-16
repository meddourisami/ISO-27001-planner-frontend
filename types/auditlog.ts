export interface AuditLog {
  id: string;
  actorEmail: string;
  actionType: string;
  entityType: string;
  timestamp: string; // ISO string
  details?: string;
}