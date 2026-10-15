import { describe, expect, it } from 'vitest';
import { InMemoryProdutoQuimicoRepository } from '../../../infrastructure/database/repositories/produto-quimico.repository.js';
import {
  ProdutoQuimicoDuplicadoError,
  ProdutoQuimicoInvalidoError,
  ProdutoQuimicoNaoEncontradoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { CadastrarProdutoUseCase } from './cadastrar-produto.use-case.js';
import { AtualizarProdutoUseCase } from './atualizar-produto.use-case.js';

describe('AtualizarProdutoUseCase', () => {
  const acidoSulfurico = {
    nome: 'Ácido Sulfúrico',
    descricao: 'Ácido forte para uso industrial.',
    grupoCompatibilidade: 'ACIDOS',
    classeRisco: '8',
    subclasse: '8.1',
    numeroONU: '1830',
    grupoEmbalagem: 'II',
  };
  const hidroxidoDeSodio = {
    nome: 'Hidróxido de Sódio',
    descricao: 'Base forte.',
    grupoCompatibilidade: 'BASES',
    classeRisco: '8',
    subclasse: '',
    numeroONU: '1823',
    grupoEmbalagem: 'II',
  };

  const prepararCenario = async () => {
    const repository = new InMemoryProdutoQuimicoRepository();
    const cadastrar = new CadastrarProdutoUseCase(repository);
    const acido = getOrThrow(await cadastrar.execute(acidoSulfurico));
    const base = getOrThrow(await cadastrar.execute(hidroxidoDeSodio));
    return {
      repository,
      acido,
      base,
      useCase: new AtualizarProdutoUseCase(repository),
    };
  };

  it('atualiza os dados cadastrais e a data de atualização', async () => {
    const { useCase, base } = await prepararCenario();

    const output = getOrThrow(
      await useCase.execute(base.id, {
        ...hidroxidoDeSodio,
        descricao: 'Soda cáustica em escamas.',
        numeroONU: '1824',
      }),
    );

    expect(output.descricao).toBe('Soda cáustica em escamas.');
    expect(output.numeroONU).toBe('1824');
    expect(output.dataCadastro).toEqual(base.dataCadastro);
    expect(output.dataAtualizacao.getTime()).toBeGreaterThanOrEqual(
      base.dataAtualizacao.getTime(),
    );
  });

  it('permite manter o próprio nome e classe de risco', async () => {
    const { useCase, base } = await prepararCenario();

    const resultado = await useCase.execute(base.id, {
      ...hidroxidoDeSodio,
      grupoEmbalagem: 'III',
    });

    expect(resultado.kind).toBe('right');
  });

  it('retorna ProdutoQuimicoNaoEncontradoError para id inexistente', async () => {
    const { useCase } = await prepararCenario();

    const resultado = await useCase.execute(
      'PRQ-inexistente',
      hidroxidoDeSodio,
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoNaoEncontradoError);
    }
  });

  it('não altera o produto quando o novo nome e classe já pertencem a outro', async () => {
    const { useCase, repository, base } = await prepararCenario();

    const resultado = await useCase.execute(base.id, {
      ...hidroxidoDeSodio,
      nome: acidoSulfurico.nome,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoDuplicadoError);
    }
    expect((await repository.buscarPorId(base.id))?.nome).toBe(
      hidroxidoDeSodio.nome,
    );
  });

  it('não altera o produto quando os dados são inválidos', async () => {
    const { useCase, repository, base } = await prepararCenario();

    const resultado = await useCase.execute(base.id, {
      ...hidroxidoDeSodio,
      nome: '',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoInvalidoError);
    }
    expect((await repository.buscarPorId(base.id))?.nome).toBe(
      hidroxidoDeSodio.nome,
    );
  });
});
