import { describe, expect, it } from 'vitest';
import { InMemoryProdutoQuimicoRepository } from '../../../infrastructure/database/repositories/produto-quimico.repository.js';
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

  it('bloqueia cadastro com mesmo nome e mesma classe de risco', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    await useCase.execute(baseInput);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      'Produto químico já cadastrado com esse nome e classe de risco.',
    );
  });

  it('permite cadastro com mesmo nome em classe de risco diferente', async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const useCase = new CadastrarProdutoUseCase(repository);

    await useCase.execute(baseInput);

    const output = await useCase.execute({
      ...baseInput,
      classeRisco: 'Classe 2',
      numeroONU: '5678',
      subclasse: 'B',
    });

    expect(output.id).toMatch(/^PRQ-/);
    expect(output.nome).toBe(baseInput.nome);
    expect(output.classeRisco).toBe('Classe 2');
  });
});
