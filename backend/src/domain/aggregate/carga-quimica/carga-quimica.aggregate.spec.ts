import { describe, it, expect } from 'vitest';
import { CargaQuimicaAggregate } from './carga-quimica.aggregate.js';
import {
  StatusCarga,
  StatusValidacao,
  ResultadoInspecao,
  UnidadeMedida,
} from '../../enums.js';
import {
  AuditoriaStatusInvalidaError,
  CargaBloqueadaError,
  CargaCanceladaError,
  CargaQuimicaInvalidaError,
  DocumentoObrigatorioAusenteError,
  DocumentoPendenteError,
  DocumentoRejeitadoError,
  DocumentoVencidoError,
  InspecaoForaDeEtapaError,
  InspecaoNaoAprovadaError,
  JustificativaLiberacaoObrigatoriaError,
  TransicaoStatusInvalidaError,
} from '../../errors/carga-quimica.errors.js';
import { RegraNegocioError } from '../../errors/domain.error.js';
import {
  DocumentoCarga,
  DocumentoCargaProps,
} from './documento-carga.entity.js';
import { Inspecao, InspecaoProps } from '../../entities/inspecao.entity.js';
import { QuantidadeCarga } from '../../value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../value-objects/codigo-identificacao.vo.js';
import { getOrThrow } from '../../../shared/either.js';

describe('CargaQuimicaAggregate', () => {
  const propsCarga = () => ({
    id: 'carga-1',
    codigoIdentificacao: getOrThrow(CodigoIdentificacao.create('ABC12345')),
    produtoQuimicoId: 'produto-1',
    quantidade: getOrThrow(
      QuantidadeCarga.create(1200, UnidadeMedida.QUILOGRAMAS),
    ),
    responsavelTecnicoId: 'responsavel-1',
    origem: 'Santos',
    destino: 'Rio',
    dataEntrada: new Date('2026-01-01T00:00:00Z'),
    dataCriacao: new Date('2025-12-31T23:00:00Z'),
    grupoCompatibilidade: 'CLASSE_8',
  });

  const criarCarga = () =>
    getOrThrow(CargaQuimicaAggregate.create(propsCarga()));

  const criarDocumento = (props: Partial<DocumentoCargaProps> = {}) =>
    getOrThrow(
      DocumentoCarga.create({
        id: 'doc-1',
        tipoDocumento: 'FDS',
        numeroReferencia: 'REF-001',
        urlArquivo: 'https://example.com/fds.pdf',
        dataEmissao: new Date('2025-01-01'),
        dataValidade: new Date('2030-01-01'),
        statusValidacao: StatusValidacao.VALIDADO,
        ...props,
      }),
    );

  const criarInspecao = (props: Partial<InspecaoProps> = {}) =>
    getOrThrow(
      Inspecao.create({
        id: 'inspecao-1',
        dataSolicitacao: new Date('2026-01-02'),
        dataRealizacao: new Date('2026-01-03'),
        inspetorId: 'inspetor-1',
        resultado: ResultadoInspecao.APROVADO,
        observacoes: 'Tudo conforme',
        ...props,
      }),
    );

  const criarCargaEmInspecaoAprovada = (documento: DocumentoCarga) => {
    const carga = criarCarga();
    getOrThrow(carga.anexarDocumento(documento));
    getOrThrow(carga.registrarInspecao(criarInspecao()));
    return carga;
  };

  const caminhoAte: Record<StatusCarga, StatusCarga[]> = {
    [StatusCarga.REGISTRADA]: [],
    [StatusCarga.EM_ANALISE]: [StatusCarga.EM_ANALISE],
    [StatusCarga.EM_INSPECAO]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
    ],
    [StatusCarga.LIBERADA]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
    ],
    [StatusCarga.BLOQUEADA]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.EM_MOVIMENTACAO]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
      StatusCarga.EM_MOVIMENTACAO,
    ],
    [StatusCarga.FINALIZADA]: [
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
      StatusCarga.EM_MOVIMENTACAO,
      StatusCarga.FINALIZADA,
    ],
    [StatusCarga.CANCELADA]: [StatusCarga.CANCELADA],
  };

  const criarCargaNoStatus = (status: StatusCarga) => {
    const carga = criarCarga();
    for (const proximo of caminhoAte[status]) {
      getOrThrow(carga.changeStatus(proximo, 'operador-1', 'Preparação.'));
    }
    return carga;
  };

  describe('máquina de estados [Fase 2]', () => {
    it.each([
      [StatusCarga.REGISTRADA, StatusCarga.EM_ANALISE],
      [StatusCarga.EM_ANALISE, StatusCarga.EM_INSPECAO],
      [StatusCarga.EM_INSPECAO, StatusCarga.LIBERADA],
      [StatusCarga.LIBERADA, StatusCarga.EM_MOVIMENTACAO],
      [StatusCarga.EM_MOVIMENTACAO, StatusCarga.FINALIZADA],
      [StatusCarga.REGISTRADA, StatusCarga.CANCELADA],
      [StatusCarga.EM_ANALISE, StatusCarga.CANCELADA],
      [StatusCarga.EM_INSPECAO, StatusCarga.BLOQUEADA],
      [StatusCarga.EM_INSPECAO, StatusCarga.CANCELADA],
      [StatusCarga.LIBERADA, StatusCarga.CANCELADA],
      [StatusCarga.BLOQUEADA, StatusCarga.CANCELADA],
    ])('permite a transição %s -> %s', (origem, destino) => {
      const carga = criarCargaNoStatus(origem);

      const resultado = carga.changeStatus(destino, 'operador-1', 'Transição.');

      expect(resultado.kind).toBe('right');
      expect(carga.status).toBe(destino);
      expect(carga.historicoStatus.at(-1)).toMatchObject({
        statusAnterior: origem,
        statusNovo: destino,
      });
    });

    it.each([
      [StatusCarga.CANCELADA, StatusCarga.LIBERADA],
      [StatusCarga.FINALIZADA, StatusCarga.EM_MOVIMENTACAO],
      [StatusCarga.BLOQUEADA, StatusCarga.EM_MOVIMENTACAO],
      [StatusCarga.REGISTRADA, StatusCarga.FINALIZADA],
      [StatusCarga.EM_INSPECAO, StatusCarga.FINALIZADA],
      [StatusCarga.LIBERADA, StatusCarga.REGISTRADA],
      [StatusCarga.REGISTRADA, StatusCarga.EM_INSPECAO],
      [StatusCarga.REGISTRADA, StatusCarga.BLOQUEADA],
      [StatusCarga.EM_ANALISE, StatusCarga.BLOQUEADA],
      [StatusCarga.LIBERADA, StatusCarga.BLOQUEADA],
      [StatusCarga.EM_MOVIMENTACAO, StatusCarga.BLOQUEADA],
      [StatusCarga.EM_MOVIMENTACAO, StatusCarga.CANCELADA],
    ])('impede a transição %s -> %s', (origem, destino) => {
      const carga = criarCargaNoStatus(origem);
      const eventosAntes = carga.historicoStatus.length;

      const resultado = carga.changeStatus(destino, 'operador-1', 'Transição.');

      expect(resultado.kind).toBe('left');
      if (resultado.kind === 'left') {
        expect(resultado.error).toBeInstanceOf(RegraNegocioError);
      }
      expect(carga.status).toBe(origem);
      expect(carga.historicoStatus).toHaveLength(eventosAntes);
    });
  });

  it('deve rejeitar criação sem dados obrigatórios', () => {
    const resultado = CargaQuimicaAggregate.create({
      ...propsCarga(),
      responsavelTecnicoId: '',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaQuimicaInvalidaError);
    }
  });

  it('deve iniciar a análise ao anexar o primeiro documento', () => {
    const carga = criarCarga();

    getOrThrow(carga.anexarDocumento(criarDocumento()));
    getOrThrow(carga.anexarDocumento(criarDocumento({ id: 'doc-2' })));

    expect(carga.status).toBe(StatusCarga.EM_ANALISE);
    expect(carga.documentos).toHaveLength(2);
    expect(carga.historicoStatus.map((evento) => evento.statusNovo)).toEqual([
      StatusCarga.REGISTRADA,
      StatusCarga.EM_ANALISE,
    ]);
    expect(carga.historicoStatus[1]).toMatchObject({
      responsavelId: 'responsavel-1',
      motivo: 'Documento FDS anexado para análise.',
    });
  });

  it('deve liberar carga com documentação válida e inspeção aprovada', () => {
    const carga = criarCargaEmInspecaoAprovada(criarDocumento());

    const resultado = carga.liberarCarga(
      'Liberado após validação',
      'operador-1',
    );

    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.LIBERADA);
    expect(carga.historicoStatus.map((evento) => evento.statusNovo)).toEqual([
      StatusCarga.REGISTRADA,
      StatusCarga.EM_ANALISE,
      StatusCarga.EM_INSPECAO,
      StatusCarga.LIBERADA,
    ]);
    expect(carga.historicoStatus[2]).toMatchObject({
      responsavelId: 'inspetor-1',
      motivo: 'Inspeção iniciada.',
    });
    expect(carga.historicoStatus[3]).toMatchObject({
      responsavelId: 'operador-1',
      motivo: 'Liberado após validação',
    });
  });

  it('deve bloquear carga quando a inspeção é reprovada', () => {
    const carga = criarCarga();
    getOrThrow(carga.anexarDocumento(criarDocumento()));

    const resultado = carga.registrarInspecao(
      criarInspecao({
        id: 'inspecao-2',
        resultado: ResultadoInspecao.REPROVADO,
        observacoes: 'Embalagem danificada',
      }),
    );

    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.BLOQUEADA);
    expect(carga.historicoStatus.at(-1)).toMatchObject({
      statusAnterior: StatusCarga.EM_INSPECAO,
      statusNovo: StatusCarga.BLOQUEADA,
      responsavelId: 'inspetor-1',
      motivo: 'Embalagem danificada',
    });
  });

  it('deve impedir inspeção de carga ainda sem documentação', () => {
    const carga = criarCarga();

    const resultado = carga.registrarInspecao(criarInspecao());

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(InspecaoForaDeEtapaError);
    }
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
    expect(carga.inspecoes).toHaveLength(0);
  });

  it('deve rejeitar tentativa de liberar sem documentação anexada', () => {
    const carga = criarCarga();

    const resultado = carga.liberarCarga('Sem documentação', 'operador-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoObrigatorioAusenteError);
    }
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });

  it('deve rejeitar tentativa de liberar com documento pendente de validação', () => {
    const carga = criarCargaEmInspecaoAprovada(
      criarDocumento({ statusValidacao: StatusValidacao.PENDENTE }),
    );

    const resultado = carga.liberarCarga('Documento pendente', 'operador-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoPendenteError);
    }
    expect(carga.status).toBe(StatusCarga.EM_INSPECAO);
  });

  it('deve rejeitar tentativa de liberar com documento rejeitado', () => {
    const carga = criarCargaEmInspecaoAprovada(
      criarDocumento({ statusValidacao: StatusValidacao.REJEITADO }),
    );

    const resultado = carga.liberarCarga('Documento rejeitado', 'operador-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoRejeitadoError);
    }
    expect(carga.status).toBe(StatusCarga.EM_INSPECAO);
  });

  it('impede liberação quando um documento validado venceu [RN-CRQ-09, RN-DOC-05]', () => {
    const agora = new Date('2026-08-16T12:00:00Z');
    const carga = criarCargaEmInspecaoAprovada(
      criarDocumento({ dataValidade: new Date('2026-08-15T23:59:59Z') }),
    );

    const resultado = carga.liberarCarga(
      'Documento vencido',
      'operador-1',
      agora,
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(DocumentoVencidoError);
    }
    expect(carga.status).toBe(StatusCarga.EM_INSPECAO);
  });

  it('deve rejeitar tentativa de liberar sem inspeção aprovada', () => {
    const carga = criarCarga();
    getOrThrow(carga.anexarDocumento(criarDocumento({ id: 'doc-2' })));

    const resultado = carga.liberarCarga('Sem inspeção aprovada', 'operador-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(InspecaoNaoAprovadaError);
    }
    expect(carga.status).toBe(StatusCarga.EM_ANALISE);
  });

  it('deve rejeitar liberação sem justificativa', () => {
    const carga = criarCargaEmInspecaoAprovada(criarDocumento());

    const resultado = carga.liberarCarga('  ', 'operador-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(
        JustificativaLiberacaoObrigatoriaError,
      );
    }
  });

  it('deve impedir liberação de carga bloqueada [RN-CRQ-10]', () => {
    const carga = criarCargaEmInspecaoAprovada(criarDocumento());
    getOrThrow(carga.bloquearCarga('Interdição preventiva', 'gestor-1'));

    const resultado = carga.liberarCarga('Tentativa de liberação', 'gestor-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaBloqueadaError);
    }
    expect(carga.status).toBe(StatusCarga.BLOQUEADA);
  });

  it('deve impedir movimentação de carga bloqueada [RN-CRQ-10]', () => {
    const carga = criarCargaEmInspecaoAprovada(criarDocumento());
    getOrThrow(carga.bloquearCarga('Interdição preventiva', 'gestor-1'));

    const resultado = carga.changeStatus(
      StatusCarga.EM_MOVIMENTACAO,
      'operador-1',
      'Início do transporte.',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaBloqueadaError);
    }
    expect(carga.status).toBe(StatusCarga.BLOQUEADA);
  });

  it('deve impedir bloqueio fora da etapa de inspeção', () => {
    const carga = criarCarga();

    const resultado = carga.bloquearCarga('Bloqueio preventivo', 'gestor-1');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(TransicaoStatusInvalidaError);
    }
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });

  it('deve permitir cancelar carga bloqueada', () => {
    const carga = criarCargaEmInspecaoAprovada(criarDocumento());
    getOrThrow(carga.bloquearCarga('Interdição preventiva', 'gestor-1'));

    const resultado = carga.changeStatus(
      StatusCarga.CANCELADA,
      'gestor-1',
      'Cancelamento definitivo.',
    );

    expect(resultado.kind).toBe('right');
    expect(carga.status).toBe(StatusCarga.CANCELADA);
  });

  it('deve impedir anexar documento em carga cancelada [RN-CRQ-11]', () => {
    const carga = criarCarga();
    getOrThrow(
      carga.changeStatus(
        StatusCarga.CANCELADA,
        'operador-1',
        'Cancelamento solicitado.',
      ),
    );

    const resultado = carga.anexarDocumento(criarDocumento({ id: 'doc-3' }));

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaCanceladaError);
    }
    expect(carga.documentos).toHaveLength(0);
  });

  it('deve impedir qualquer transição a partir de carga cancelada [RN-CRQ-11]', () => {
    const carga = criarCarga();
    getOrThrow(
      carga.changeStatus(
        StatusCarga.CANCELADA,
        'operador-1',
        'Cancelamento solicitado.',
      ),
    );

    const resultado = carga.changeStatus(
      StatusCarga.LIBERADA,
      'operador-1',
      'Tentativa de liberação.',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CargaCanceladaError);
    }
    expect(carga.status).toBe(StatusCarga.CANCELADA);
  });

  it('deve rejeitar transição inválida de status', () => {
    const carga = criarCarga();

    const resultado = carga.changeStatus(
      StatusCarga.FINALIZADA,
      'operador-1',
      'Finalização.',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(TransicaoStatusInvalidaError);
      expect(resultado.error.message).toMatch(/transição/i);
    }
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });

  it('deve registrar data de criação e rejeitar transição sem auditoria', () => {
    const carga = criarCarga();

    expect(carga.dataCriacao).toEqual(new Date('2025-12-31T23:00:00Z'));
    expect(carga.historicoStatus[0]).toMatchObject({
      statusAnterior: null,
      statusNovo: StatusCarga.REGISTRADA,
      responsavelId: 'responsavel-1',
      motivo: 'Carga criada.',
    });
    expect(carga.historicoStatus[0].data).toEqual(carga.dataCriacao);

    const resultado = carga.changeStatus(
      StatusCarga.CANCELADA,
      '',
      'Cancelamento.',
    );

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(AuditoriaStatusInvalidaError);
      expect(resultado.error.message).toMatch(/responsável/i);
    }
    expect(carga.historicoStatus).toHaveLength(1);
    expect(carga.status).toBe(StatusCarga.REGISTRADA);
  });

  it('deve restaurar o histórico sem duplicar o evento inicial', () => {
    const original = criarCarga();
    getOrThrow(
      original.changeStatus(
        StatusCarga.CANCELADA,
        'operador-1',
        'Cancelamento solicitado.',
        new Date('2026-01-02T00:00:00Z'),
      ),
    );

    const restaurada = CargaQuimicaAggregate.restaurar(
      {
        id: original.id,
        codigoIdentificacao: original.codigoIdentificacao,
        produtoQuimicoId: original.produtoQuimicoId,
        quantidade: original.quantidade,
        responsavelTecnicoId: original.responsavelTecnicoId,
        origem: original.origem,
        destino: original.destino,
        dataEntrada: original.dataEntrada,
        dataCriacao: original.dataCriacao,
        grupoCompatibilidade: original.grupoCompatibilidade,
        status: original.status,
      },
      original.historicoStatus,
    );

    expect(restaurada.status).toBe(StatusCarga.CANCELADA);
    expect(restaurada.historicoStatus).toEqual(original.historicoStatus);
    expect(restaurada.historicoStatus).toHaveLength(2);
  });

  it('deve rejeitar reidratação quando o status diverge do histórico', () => {
    const original = criarCarga();

    expect(() =>
      CargaQuimicaAggregate.restaurar(
        {
          id: original.id,
          codigoIdentificacao: original.codigoIdentificacao,
          produtoQuimicoId: original.produtoQuimicoId,
          quantidade: original.quantidade,
          responsavelTecnicoId: original.responsavelTecnicoId,
          origem: original.origem,
          destino: original.destino,
          dataEntrada: original.dataEntrada,
          dataCriacao: original.dataCriacao,
          grupoCompatibilidade: original.grupoCompatibilidade,
          status: StatusCarga.CANCELADA,
        },
        original.historicoStatus,
      ),
    ).toThrow(/diverge do histórico/i);
  });
});
