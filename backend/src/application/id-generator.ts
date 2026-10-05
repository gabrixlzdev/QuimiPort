export type EntityIdPrefix = 'PRQ' | 'CRQ' | 'RTC' | 'DOC' | 'INS' | 'ARM';

export function generateEntityId(prefix: EntityIdPrefix): string {
  return `${prefix}-${crypto.randomUUID()}`;
}
