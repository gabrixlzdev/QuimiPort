import { describe, expect, it } from 'vitest';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import {
  CargaNaoEncontradaError,
  DocumentoCargaInvalidoError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { getOrThrow } from '../../../shared/either.js';
import { AnexarDocumentoUseCase } from './anexar-documento.use-case.js';

describe('AnexarDocumentoUseCase', () => {
  const documentoInput = {
    tipoDocumento: 'FDS',
    numeroReferencia: 'REF-001',
    urlArquivo: 'https://example.com/fds.pdf',
    dataEmissao: '2026-01-01T00:00:00Z',
    dataValidade: '2030-01-01T00:00:00Z',
  };

  const criarRepositorioComCarga = async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const carga = getOrThrow(
      CargaQuimicaAggregate.create({
        id: 'carga-1',
        codigoIdentificacao: getOrThrow(CodigoIdentificacao.create('ABC12345')),
        produtoQuimicoId: 'produto-1',
        quantidade: getOrThrow(
          QuantidadeCarga.create(100, UnidadeMedida.QUILOGRAMAS),
        ),
        responsavelTecnicoId: 'responsavel-1',
        origem: 'Santos',
        destino: 'Rio',
        dataEntrada: new Date('2026-01-01T00:00:00Z'),
        grupoCompatibilidade: 'CLASSE_8',
      }),
    );
    await repository.salvar(carga);
    return { repository, carga };
  };

  it('gera ID DOC e anexa o documento à carga existente', async () => {
    const { repository, carga } = await criarRepositorioComCarga();
    const useCase = new AnexarDocumentoUseCase(repository);

    const output = getOrThrow(
      await useCase.execute({ ...documentoInput, cargaQuimicaId: carga.id }),
    );

    expect(output.id).toMatch(
      /^DOC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect((await repository.buscarPorId(carga.id))?.documentos[0].id).toBe(
      output.id,
    );
  });

  it('retorna CargaNaoEncontradaError quando a carga não existe', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const useCase = new AnexarDocumentoUseCase(repository);

    const resultado = await useCase.execute({
      ...documentoInput,
      cargaQuimicaId: 'carga-inexistente',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaNaoEncontradaError);
    }
  });

  it('não anexa documento com data de validade inválida', async () => {
    const { repository, carga } = await criarRepositorioComCarga();
    const useCase = new AnexarDocumentoUseCase(repository);

    const resultado = await useCase.execute({
      ...documentoInput,
      cargaQuimicaId: carga.id,
      dataValidade: 'data-invalida',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoCargaInvalidoError);
    }
    expect((await repository.buscarPorId(carga.id))?.documentos).toEqual([]);
  });
});
