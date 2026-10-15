import { describe, expect, it } from 'vitest';
import { InMemoryProdutoQuimicoRepository } from '../../../infrastructure/database/repositories/produto-quimico.repository.js';
import { ProdutoQuimicoNaoEncontradoError } from '../../../domain/errors/produto-quimico.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { CadastrarProdutoUseCase } from './cadastrar-produto.use-case.js';
import { ListarProdutosUseCase } from './listar-produtos.use-case.js';
import { BuscarProdutoUseCase } from './buscar-produto.use-case.js';
import { InativarProdutoUseCase } from './inativar-produto.use-case.js';

describe('Consulta e inativação de produtos químicos', () => {
  const input = {
    nome: 'Ácido Sulfúrico',
    descricao: 'Ácido forte para uso industrial.',
    grupoCompatibilidade: 'ACIDOS',
    classeRisco: '8',
    subclasse: '8.1',
    numeroONU: '1830',
    grupoEmbalagem: 'II',
  };

  const prepararCenario = async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const produto = getOrThrow(
      await new CadastrarProdutoUseCase(repository).execute(input),
    );
    return { repository, produto };
  };

  it('lista os produtos cadastrados', async () => {
    const { repository, produto } = await prepararCenario();

    const produtos = getOrThrow(
      await new ListarProdutosUseCase(repository).execute(),
    );

    expect(produtos).toEqual([produto]);
  });

  it('busca produto por identificador', async () => {
    const { repository, produto } = await prepararCenario();

    const encontrado = getOrThrow(
      await new BuscarProdutoUseCase(repository).execute(produto.id),
    );

    expect(encontrado).toEqual(produto);
  });

  it('retorna ProdutoQuimicoNaoEncontradoError ao buscar id inexistente', async () => {
    const { repository } = await prepararCenario();

    const resultado = await new BuscarProdutoUseCase(repository).execute(
      'PRQ-inexistente',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoNaoEncontradoError);
    }
  });

  it('inativa produto e retorna o estado atualizado', async () => {
    const { repository, produto } = await prepararCenario();

    const inativado = getOrThrow(
      await new InativarProdutoUseCase(repository).execute(produto.id),
    );

    expect(inativado.ativo).toBe(false);
    expect((await repository.buscarPorId(produto.id))?.ativo).toBe(false);
  });

  it('retorna ProdutoQuimicoNaoEncontradoError ao inativar id inexistente', async () => {
    const { repository } = await prepararCenario();

    const resultado = await new InativarProdutoUseCase(repository).execute(
      'PRQ-inexistente',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoNaoEncontradoError);
    }
  });
});
