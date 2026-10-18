import { describe, expect, it } from 'vitest';
import { InMemoryProdutoQuimicoRepository } from '../../../infrastructure/database/repositories/produto-quimico.repository.js';
import {
  ClassificacaoRiscoInvalidaError,
  ProdutoQuimicoDuplicadoError,
  ProdutoQuimicoInvalidoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { CadastrarProdutoUseCase } from './cadastrar-produto.use-case.js';

describe('CadastrarProdutoUseCase', () => {
  const baseInput = {
    nome: 'Ácido Sulfúrico',
    descricao: 'Produto de limpeza industrial.',
    grupoCompatibilidade: 'Ácido forte',
    classeRisco: 'Classe 1',
    subclasse: 'A',
    numeroONU: '1234',
    grupoEmbalagem: 'II',
    ativo: true,
  };

  it('cadastra produto químico ativo com ID PRQ', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    const output = getOrThrow(await useCase.execute(baseInput));

    expect(output.id).toMatch(/^PRQ-/);
    expect(output.ativo).toBe(true);
    expect(await repository.listar()).toHaveLength(1);
  });

  it('bloqueia cadastro sem nome', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    const resultado = await useCase.execute({ ...baseInput, nome: '' });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoInvalidoError);
    }
    expect(await repository.listar()).toEqual([]);
  });

  it('bloqueia cadastro sem classe de risco', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    const resultado = await useCase.execute({ ...baseInput, classeRisco: '' });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ClassificacaoRiscoInvalidaError);
    }
    expect(await repository.listar()).toEqual([]);
  });

  it('bloqueia cadastro com mesmo nome e mesma classe de risco', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    await useCase.execute(baseInput);
    const resultado = await useCase.execute(baseInput);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoDuplicadoError);
      expect(resultado.error.message).toBe(
        'Produto químico já cadastrado com esse nome e classe de risco.',
      );
    }
  });

  it('permite cadastro com mesmo nome em classe de risco diferente', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    await useCase.execute(baseInput);

    const output = getOrThrow(
      await useCase.execute({
        ...baseInput,
        classeRisco: 'Classe 2',
        numeroONU: '5678',
        subclasse: 'B',
      }),
    );

    expect(output.id).toMatch(/^PRQ-/);
    expect(output.nome).toBe(baseInput.nome);
    expect(output.classeRisco).toBe('Classe 2');
  });
});
