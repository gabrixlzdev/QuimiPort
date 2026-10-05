import { describe, expect, it } from 'vitest';
import { generateEntityId, type EntityIdPrefix } from './id-generator.js';

describe('generateEntityId', () => {
  it.each<EntityIdPrefix>(['PRQ', 'CRQ', 'RTC', 'DOC', 'INS', 'ARM'])(
    'gera UUIDv4 com prefixo %s',
    (prefix) => {
      expect(generateEntityId(prefix)).toMatch(
        new RegExp(
          `^${prefix}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`,
          'i',
        ),
      );
    },
  );
});
