import { describe, expect, it } from 'vitest';
import { getOrThrow, left, right } from './either.js';

describe('Either', () => {
  it('representa falha esperada como left', () => {
    const erro = { message: 'Falha de negócio.' };

    expect(left(erro)).toEqual({ kind: 'left', error: erro });
  });

  it('representa sucesso como right', () => {
    expect(right(42)).toEqual({ kind: 'right', value: 42 });
  });

  it('getOrThrow retorna o valor de um right', () => {
    expect(getOrThrow(right('ok'))).toBe('ok');
  });

  it('getOrThrow lança erro técnico a partir de um left', () => {
    expect(() => getOrThrow(left({ message: 'Dado corrompido.' }))).toThrow(
      'Dado corrompido.',
    );
  });
});
