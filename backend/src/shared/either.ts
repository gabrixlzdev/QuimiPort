export type Left<E> = { readonly kind: 'left'; readonly error: E };
export type Right<A> = { readonly kind: 'right'; readonly value: A };

export type Either<E, A> = Left<E> | Right<A>;

export const left = <E>(error: E): Left<E> => ({ kind: 'left', error });

export const right = <A>(value: A): Right<A> => ({ kind: 'right', value });

export function getOrThrow<E extends { message: string }, A>(
  resultado: Either<E, A>,
): A {
  if (resultado.kind === 'left') {
    throw new Error(resultado.error.message);
  }

  return resultado.value;
}
