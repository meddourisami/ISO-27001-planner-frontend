export interface AuditLog {
  id: string;
  actorEmail: string;
  actionType: string;
  description: string;
  entityType: string;
  timestamp: string; // ISO string
}