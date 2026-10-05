import { describe, expect, it } from 'vitest';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import { AnexarDocumentoUseCase } from './anexar-documento.use-case.js';

describe('AnexarDocumentoUseCase', () => {
  it('gera ID DOC e anexa o documento à carga existente', async () => {
    const repository = new InMemoryCargaQuimicaRepository();
    const carga = new CargaQuimicaAggregate({
      id: 'carga-1',
      codigoIdentificacao: 'ABC12345',
      produtoQuimicoId: 'produto-1',
      quantidade: new QuantidadeCarga(100, UnidadeMedida.QUILOGRAMAS),
      responsavelTecnicoId: 'responsavel-1',
      origem: 'Santos',
      destino: 'Rio',
      dataEntrada: new Date('2026-01-01T00:00:00Z'),
      grupoCompatibilidade: 'CLASSE_8',
    });
    await repository.salvar(carga);
    const useCase = new AnexarDocumentoUseCase(repository);

    const output = await useCase.execute({
      cargaQuimicaId: carga.id,
      tipoDocumento: 'FDS',
      numeroReferencia: 'REF-001',
      urlArquivo: 'https://example.com/fds.pdf',
      dataEmissao: '2026-01-01T00:00:00Z',
      dataValidade: '2030-01-01T00:00:00Z',
    });

    expect(output.id).toMatch(
      /^DOC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect((await repository.buscarPorId(carga.id))?.documentos[0].id).toBe(
      output.id,
    );
  });
});
