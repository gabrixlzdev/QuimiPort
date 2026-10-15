import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { ProdutoQuimicoOrmEntity } from '../entities/produto-quimico.orm-entity.js';
import { TypeOrmProdutoQuimicoRepository } from './typeorm-produto-quimico.repository.js';
import { getOrThrow } from '../../../shared/either.js';

describe('TypeOrmProdutoQuimicoRepository', () => {
  const dataCadastro = new Date('2026-01-01T12:00:00Z');

  const criarOrmEntity = () =>
    Object.assign(new ProdutoQuimicoOrmEntity(), {
      id: 'PRQ-1',
      nome: 'Ácido Sulfúrico',
      descricao: 'Ácido forte.',
      grupoCompatibilidade: 'ACIDOS',
      classificacaoRisco: {
        classe: '8',
        subclasse: '8.1',
        numeroONU: '1830',
        grupoEmbalagem: 'II',
      },
      ativo: false,
      dataCadastro,
      dataAtualizacao: dataCadastro,
    });

  it('persiste o produto com a classificação de risco embutida', async () => {
    const entity = criarOrmEntity();
    const repository = {
      save: vi.fn(async () => entity),
    } as unknown as Repository<ProdutoQuimicoOrmEntity>;
    const produtoRepository = new TypeOrmProdutoQuimicoRepository(repository);
    const produto = getOrThrow(
      ProdutoQuimico.create({
        id: 'PRQ-1',
        nome: 'Ácido Sulfúrico',
        descricao: 'Ácido forte.',
        grupoCompatibilidade: 'ACIDOS',
        classificacaoRisco: getOrThrow(
          ClassificacaoRisco.create('8', '8.1', '1830', 'II'),
        ),
        ativo: false,
        dataCadastro,
      }),
    );

    const salvo = await produtoRepository.salvar(produto);

    expect(repository.save).toHaveBeenCalledWith({
      id: 'PRQ-1',
      nome: 'Ácido Sulfúrico',
      descricao: 'Ácido forte.',
      grupoCompatibilidade: 'ACIDOS',
      classificacaoRisco: {
        classe: '8',
        subclasse: '8.1',
        numeroONU: '1830',
        grupoEmbalagem: 'II',
      },
      ativo: false,
      dataCadastro,
      dataAtualizacao: dataCadastro,
    });
    expect(salvo).toMatchObject({ id: 'PRQ-1', ativo: false });
  });

  it('busca por nome e classe de risco usando a coluna embutida', async () => {
    const entity = criarOrmEntity();
    const repository = {
      findOneBy: vi.fn(async () => entity),
    } as unknown as Repository<ProdutoQuimicoOrmEntity>;
    const produtoRepository = new TypeOrmProdutoQuimicoRepository(repository);

    const produto = await produtoRepository.buscarPorNomeEClasseRisco(
      'Ácido Sulfúrico',
      '8',
    );

    expect(repository.findOneBy).toHaveBeenCalledWith({
      nome: 'Ácido Sulfúrico',
      classificacaoRisco: { classe: '8' },
    });
    expect(produto?.classificacaoRisco.numeroONU).toBe('1830');
  });

  it('lista produtos em ordem de cadastro e retorna null para id inexistente', async () => {
    const entity = criarOrmEntity();
    const repository = {
      find: vi.fn(async () => [entity]),
      findOneBy: vi.fn(async () => null),
    } as unknown as Repository<ProdutoQuimicoOrmEntity>;
    const produtoRepository = new TypeOrmProdutoQuimicoRepository(repository);

    const produtos = await produtoRepository.listar();
    const inexistente = await produtoRepository.buscarPorId('PRQ-x');

    expect(repository.find).toHaveBeenCalledWith({
      order: { dataCadastro: 'ASC' },
    });
    expect(produtos.map(({ id }) => id)).toEqual(['PRQ-1']);
    expect(inexistente).toBeNull();
  });
});
