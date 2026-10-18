import { Either, getOrThrow, left, right } from '../../../shared/either.js';
import {
  StatusCarga,
  StatusValidacao,
  ResultadoInspecao,
} from '../../enums.js';
import {
  AuditoriaStatusInvalidaError,
  CargaBloqueadaError,
  CargaCanceladaError,
  CargaFinalizadaError,
  CargaQuimicaInvalidaError,
  DocumentoObrigatorioAusenteError,
  DocumentoPendenteError,
  DocumentoRejeitadoError,
  DocumentoVencidoError,
  InspecaoForaDeEtapaError,
  InspecaoNaoAprovadaError,
  JustificativaLiberacaoObrigatoriaError,
  MotivoBloqueioObrigatorioError,
  TransicaoStatusInvalidaError,
} from '../../errors/carga-quimica.errors.js';
import { Inspecao } from '../../entities/inspecao.entity.js';
import { QuantidadeCarga } from '../../value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../value-objects/codigo-identificacao.vo.js';
import { DocumentoCarga } from './documento-carga.entity.js';

export type CargaQuimicaAggregateProps = {
  id: string;
  codigoIdentificacao: CodigoIdentificacao;
  produtoQuimicoId: string;
  quantidade: QuantidadeCarga;
  responsavelTecnicoId: string;
  origem: string;
  destino: string;
  dataEntrada: Date;
  dataCriacao?: Date;
  grupoCompatibilidade: string;
  status?: StatusCarga;
};

export type HistoricoStatusCarga = {
  statusAnterior: StatusCarga | null;
  statusNovo: StatusCarga;
  data: Date;
  responsavelId: string;
  motivo: string;
};

export type CargaImutavelError = CargaCanceladaError | CargaFinalizadaError;

export type AlteracaoStatusError =
  | AuditoriaStatusInvalidaError
  | CargaImutavelError
  | CargaBloqueadaError
  | TransicaoStatusInvalidaError;

export type DocumentacaoLiberacaoError =
  | DocumentoObrigatorioAusenteError
  | DocumentoPendenteError
  | DocumentoRejeitadoError
  | DocumentoVencidoError;

export type LiberacaoCargaError =
  | JustificativaLiberacaoObrigatoriaError
  | DocumentacaoLiberacaoError
  | InspecaoNaoAprovadaError
  | AlteracaoStatusError;

export type BloqueioCargaError =
  MotivoBloqueioObrigatorioError | AlteracaoStatusError;

export type AnexoDocumentoError = AlteracaoStatusError;

export type RegistroInspecaoError =
  InspecaoForaDeEtapaError | AlteracaoStatusError;

export class CargaQuimicaAggregate {
  public readonly id: string;
  public readonly codigoIdentificacao: CodigoIdentificacao;
  public readonly produtoQuimicoId: string;
  public readonly quantidade: QuantidadeCarga;
  public readonly responsavelTecnicoId: string;
  public readonly origem: string;
  public readonly destino: string;
  public readonly dataEntrada: Date;
  public readonly dataCriacao: Date;
  public readonly grupoCompatibilidade: string;

  public documentos: DocumentoCarga[] = [];
  public inspecoes: Inspecao[] = [];
  private statusAtual: StatusCarga;
  private readonly eventosStatus: HistoricoStatusCarga[] = [];

  get status(): StatusCarga {
    return this.statusAtual;
  }

  get historicoStatus(): readonly HistoricoStatusCarga[] {
    return this.eventosStatus.map((evento) => ({
      ...evento,
      data: new Date(evento.data),
    }));
  }

  private constructor(props: CargaQuimicaAggregateProps) {
    this.id = props.id;
    this.codigoIdentificacao = props.codigoIdentificacao;
    this.produtoQuimicoId = props.produtoQuimicoId;
    this.quantidade = props.quantidade;
    this.responsavelTecnicoId = props.responsavelTecnicoId;
    this.origem = props.origem;
    this.destino = props.destino;
    this.dataEntrada = props.dataEntrada;
    this.dataCriacao = props.dataCriacao ?? new Date();
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.statusAtual = props.status ?? StatusCarga.REGISTRADA;
    this.eventosStatus.push({
      statusAnterior: null,
      statusNovo: this.statusAtual,
      data: new Date(this.dataCriacao),
      responsavelId: this.responsavelTecnicoId,
      motivo: 'Carga criada.',
    });
  }

  private static readonly transicoesPermitidas: Record<
    StatusCarga,
    StatusCarga[]
  > = {
    [StatusCarga.REGISTRADA]: [StatusCarga.EM_ANALISE, StatusCarga.CANCELADA],
    [StatusCarga.EM_ANALISE]: [StatusCarga.EM_INSPECAO, StatusCarga.CANCELADA],
    [StatusCarga.EM_INSPECAO]: [
      StatusCarga.LIBERADA,
      StatusCarga.BLOQUEADA,
      StatusCarga.CANCELADA,
    ],
    [StatusCarga.LIBERADA]: [
      StatusCarga.EM_MOVIMENTACAO,
      StatusCarga.CANCELADA,
    ],
    [StatusCarga.BLOQUEADA]: [StatusCarga.CANCELADA],
    [StatusCarga.EM_MOVIMENTACAO]: [StatusCarga.FINALIZADA],
    [StatusCarga.FINALIZADA]: [],
    [StatusCarga.CANCELADA]: [],
  };

  static create(
    props: CargaQuimicaAggregateProps,
  ): Either<CargaQuimicaInvalidaError, CargaQuimicaAggregate> {
    if (
      !props.id ||
      !props.codigoIdentificacao ||
      !props.produtoQuimicoId ||
      !props.responsavelTecnicoId
    ) {
      return left(
        new CargaQuimicaInvalidaError(
          'Carga química inválida: dados obrigatórios faltando.',
        ),
      );
    }

    if (props.dataCriacao && Number.isNaN(props.dataCriacao.getTime())) {
      return left(
        new CargaQuimicaInvalidaError('Data de criação da carga inválida.'),
      );
    }

    return right(new CargaQuimicaAggregate(props));
  }

  static restaurar(
    props: CargaQuimicaAggregateProps,
    historicoStatus: readonly HistoricoStatusCarga[],
  ): CargaQuimicaAggregate {
    const eventoInicial = historicoStatus[0];
    if (!eventoInicial || eventoInicial.statusAnterior !== null) {
      throw new Error(
        'Histórico de status persistido inválido: evento inicial ausente.',
      );
    }

    const carga = getOrThrow(
      CargaQuimicaAggregate.create({
        ...props,
        status: eventoInicial.statusNovo,
      }),
    );

    for (let indice = 0; indice < historicoStatus.length; indice += 1) {
      const evento = historicoStatus[indice];
      if (
        !(evento.data instanceof Date) ||
        Number.isNaN(evento.data.getTime()) ||
        !evento.responsavelId.trim() ||
        !evento.motivo.trim()
      ) {
        throw new Error(
          'Histórico de status persistido contém um evento inválido.',
        );
      }

      if (indice === 0) {
        if (
          evento.statusNovo !== carga.status ||
          evento.data.getTime() !== carga.dataCriacao.getTime() ||
          evento.responsavelId !== carga.responsavelTecnicoId
        ) {
          throw new Error(
            'Histórico de status persistido não corresponde à criação da carga.',
          );
        }
        continue;
      }

      const eventoAnterior = historicoStatus[indice - 1];
      const transicoes =
        CargaQuimicaAggregate.transicoesPermitidas[eventoAnterior.statusNovo] ??
        [];
      if (
        evento.statusAnterior !== eventoAnterior.statusNovo ||
        !transicoes.includes(evento.statusNovo)
      ) {
        throw new Error(
          'Histórico de status persistido contém uma sequência de transições inválida.',
        );
      }
    }

    const ultimoEvento = historicoStatus.at(-1)!;
    if (props.status !== ultimoEvento.statusNovo) {
      throw new Error('Status atual da carga diverge do histórico persistido.');
    }

    carga.eventosStatus.splice(
      0,
      carga.eventosStatus.length,
      ...historicoStatus.map((evento) => ({
        ...evento,
        data: new Date(evento.data),
      })),
    );
    carga.statusAtual = ultimoEvento.statusNovo;
    return carga;
  }

  changeStatus(
    novoStatus: StatusCarga,
    responsavelId: string,
    motivo: string,
    data: Date = new Date(),
  ): Either<AlteracaoStatusError, void> {
    if (!responsavelId?.trim() || !motivo?.trim()) {
      return left(
        new AuditoriaStatusInvalidaError(
          'Responsável e motivo são obrigatórios para alterar o status.',
        ),
      );
    }
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      return left(
        new AuditoriaStatusInvalidaError(
          'Data da transição de status inválida.',
        ),
      );
    }

    const imutavel = this.verificarImutabilidade();
    if (imutavel.kind === 'left') return imutavel;

    if (
      this.status === StatusCarga.BLOQUEADA &&
      novoStatus !== StatusCarga.CANCELADA
    ) {
      return left(new CargaBloqueadaError());
    }

    const transicoes =
      CargaQuimicaAggregate.transicoesPermitidas[this.status] ?? [];
    if (!transicoes.includes(novoStatus)) {
      return left(new TransicaoStatusInvalidaError(this.status, novoStatus));
    }

    this.eventosStatus.push({
      statusAnterior: this.statusAtual,
      statusNovo: novoStatus,
      data: new Date(data),
      responsavelId: responsavelId.trim(),
      motivo: motivo.trim(),
    });
    this.statusAtual = novoStatus;
    return right(undefined);
  }

  anexarDocumento(
    documento: DocumentoCarga,
  ): Either<AnexoDocumentoError, void> {
    const imutavel = this.verificarImutabilidade();
    if (imutavel.kind === 'left') return imutavel;

    if (this.status === StatusCarga.REGISTRADA) {
      const inicioAnalise = this.changeStatus(
        StatusCarga.EM_ANALISE,
        this.responsavelTecnicoId,
        `Documento ${documento.tipoDocumento} anexado para análise.`,
      );
      if (inicioAnalise.kind === 'left') return inicioAnalise;
    }

    this.documentos.push(documento);
    return right(undefined);
  }

  registrarInspecao(inspecao: Inspecao): Either<RegistroInspecaoError, void> {
    const imutavel = this.verificarImutabilidade();
    if (imutavel.kind === 'left') return imutavel;

    if (this.status === StatusCarga.BLOQUEADA) {
      return left(new CargaBloqueadaError());
    }

    if (
      this.status !== StatusCarga.EM_ANALISE &&
      this.status !== StatusCarga.EM_INSPECAO
    ) {
      return left(new InspecaoForaDeEtapaError(this.status));
    }

    if (this.status === StatusCarga.EM_ANALISE) {
      const inicioInspecao = this.changeStatus(
        StatusCarga.EM_INSPECAO,
        inspecao.inspetorId,
        'Inspeção iniciada.',
        inspecao.dataRealizacao,
      );
      if (inicioInspecao.kind === 'left') return inicioInspecao;
    }

    if (inspecao.resultado === ResultadoInspecao.REPROVADO) {
      const bloqueio = this.changeStatus(
        StatusCarga.BLOQUEADA,
        inspecao.inspetorId,
        inspecao.observacoes || 'Inspeção reprovada.',
        inspecao.dataRealizacao,
      );
      if (bloqueio.kind === 'left') return bloqueio;
    }

    this.inspecoes.push(inspecao);
    return right(undefined);
  }

  liberarCarga(
    justificativa: string,
    responsavelId: string,
    agora: Date = new Date(),
  ): Either<LiberacaoCargaError, void> {
    if (!justificativa || justificativa.trim().length === 0) {
      return left(new JustificativaLiberacaoObrigatoriaError());
    }

    const imutavel = this.verificarImutabilidade();
    if (imutavel.kind === 'left') return imutavel;

    if (this.status === StatusCarga.BLOQUEADA) {
      return left(new CargaBloqueadaError());
    }

    const documentacao = this.verificarDocumentacao(agora);
    if (documentacao.kind === 'left') return documentacao;

    const temInspecaoAprovada = this.inspecoes.some(
      (inspecao) => inspecao.resultado === ResultadoInspecao.APROVADO,
    );
    if (!temInspecaoAprovada) {
      return left(new InspecaoNaoAprovadaError());
    }

    return this.changeStatus(
      StatusCarga.LIBERADA,
      responsavelId,
      justificativa,
      agora,
    );
  }

  bloquearCarga(
    motivo: string,
    responsavelId: string,
  ): Either<BloqueioCargaError, void> {
    if (!motivo || motivo.trim().length === 0) {
      return left(new MotivoBloqueioObrigatorioError());
    }

    return this.changeStatus(StatusCarga.BLOQUEADA, responsavelId, motivo);
  }

  private verificarImutabilidade(): Either<CargaImutavelError, void> {
    if (this.status === StatusCarga.CANCELADA) {
      return left(new CargaCanceladaError());
    }
    if (this.status === StatusCarga.FINALIZADA) {
      return left(new CargaFinalizadaError());
    }

    return right(undefined);
  }

  private verificarDocumentacao(
    agora: Date,
  ): Either<DocumentacaoLiberacaoError, void> {
    if (this.documentos.length === 0) {
      return left(new DocumentoObrigatorioAusenteError());
    }

    for (const documento of this.documentos) {
      if (documento.statusValidacao === StatusValidacao.REJEITADO) {
        return left(new DocumentoRejeitadoError(documento.id));
      }
      if (documento.statusValidacao === StatusValidacao.PENDENTE) {
        return left(new DocumentoPendenteError(documento.id));
      }
      if (documento.estaVencido(agora)) {
        return left(new DocumentoVencidoError(documento.id));
      }
    }

    return right(undefined);
  }
}
