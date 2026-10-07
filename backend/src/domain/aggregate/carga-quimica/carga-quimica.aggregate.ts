import {
  StatusCarga,
  StatusValidacao,
  ResultadoInspecao,
} from '../../enums.js';
import { Inspecao } from '../../entities/inspecao.entity.js';
import { QuantidadeCarga } from '../../value-objects/quantidade-carga.vo.js';
import { DocumentoCarga } from './documento-carga.entity.js';

export type CargaQuimicaAggregateProps = {
  id: string;
  codigoIdentificacao: string;
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

export class CargaQuimicaAggregate {
  public readonly id: string;
  public readonly codigoIdentificacao: string;
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

  constructor(props: CargaQuimicaAggregateProps) {
    if (
      !props.id ||
      !props.codigoIdentificacao ||
      !props.produtoQuimicoId ||
      !props.responsavelTecnicoId
    ) {
      throw new Error('Carga química inválida: dados obrigatórios faltando.');
    }

    this.id = props.id;
    this.codigoIdentificacao = props.codigoIdentificacao;
    this.produtoQuimicoId = props.produtoQuimicoId;
    this.quantidade = props.quantidade;
    this.responsavelTecnicoId = props.responsavelTecnicoId;
    this.origem = props.origem;
    this.destino = props.destino;
    this.dataEntrada = props.dataEntrada;
    this.dataCriacao = props.dataCriacao ?? new Date();
    if (Number.isNaN(this.dataCriacao.getTime())) {
      throw new Error('Data de criação da carga inválida.');
    }
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.statusAtual = props.status ?? StatusCarga.AGUARDANDO_DOCUMENTACAO;
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
    [StatusCarga.AGUARDANDO_DOCUMENTACAO]: [
      StatusCarga.DOCUMENTACAO_VALIDADA,
      StatusCarga.EM_INSPECAO,
      StatusCarga.CANCELADA,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.DOCUMENTACAO_VALIDADA]: [
      StatusCarga.EM_INSPECAO,
      StatusCarga.CANCELADA,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.EM_INSPECAO]: [
      StatusCarga.LIBERADA,
      StatusCarga.CANCELADA,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.LIBERADA]: [
      StatusCarga.EM_MOVIMENTACAO,
      StatusCarga.CANCELADA,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.EM_MOVIMENTACAO]: [
      StatusCarga.FINALIZADA,
      StatusCarga.CANCELADA,
      StatusCarga.BLOQUEADA,
    ],
    [StatusCarga.FINALIZADA]: [],
    [StatusCarga.BLOQUEADA]: [StatusCarga.CANCELADA],
    [StatusCarga.CANCELADA]: [],
  };

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

    const carga = new CargaQuimicaAggregate({
      ...props,
      status: eventoInicial.statusNovo,
    });

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
  ): void {
    if (!responsavelId?.trim() || !motivo?.trim()) {
      throw new Error(
        'Responsável e motivo são obrigatórios para alterar o status.',
      );
    }
    if (!(data instanceof Date) || Number.isNaN(data.getTime())) {
      throw new Error('Data da transição de status inválida.');
    }

    if (
      this.status === StatusCarga.FINALIZADA ||
      this.status === StatusCarga.CANCELADA
    ) {
      throw new Error(
        'Carga finalizada ou cancelada não pode sofrer novas transições.',
      );
    }

    const transicoes =
      CargaQuimicaAggregate.transicoesPermitidas[this.status] ?? [];
    if (!transicoes.includes(novoStatus)) {
      throw new Error(
        `Transição de status inválida: ${this.status} -> ${novoStatus}.`,
      );
    }

    this.eventosStatus.push({
      statusAnterior: this.statusAtual,
      statusNovo: novoStatus,
      data: new Date(data),
      responsavelId: responsavelId.trim(),
      motivo: motivo.trim(),
    });
    this.statusAtual = novoStatus;
  }

  anexarDocumento(documento: DocumentoCarga): void {
    if (
      this.status === StatusCarga.CANCELADA ||
      this.status === StatusCarga.FINALIZADA
    ) {
      throw new Error('Carga imutável em estado CANCELADA ou FINALIZADA.');
    }

    this.documentos.push(documento);
  }

  registrarInspecao(inspecao: Inspecao): void {
    if (
      this.status === StatusCarga.CANCELADA ||
      this.status === StatusCarga.FINALIZADA
    ) {
      throw new Error(
        'Não é possível registrar inspeções em carga cancelada ou finalizada.',
      );
    }

    if (inspecao.resultado === ResultadoInspecao.REPROVADO) {
      this.changeStatus(
        StatusCarga.BLOQUEADA,
        inspecao.inspetorId,
        inspecao.observacoes || 'Inspeção reprovada.',
        inspecao.dataRealizacao,
      );
    } else if (
      this.status === StatusCarga.AGUARDANDO_DOCUMENTACAO ||
      this.status === StatusCarga.DOCUMENTACAO_VALIDADA
    ) {
      this.changeStatus(
        StatusCarga.EM_INSPECAO,
        inspecao.inspetorId,
        inspecao.observacoes || 'Inspeção realizada.',
        inspecao.dataRealizacao,
      );
    }

    this.inspecoes.push(inspecao);
  }

  podeLiberar(): { ok: boolean; motivos: string[] } {
    const motivos: string[] = [];

    if (this.documentos.length === 0) {
      motivos.push('Documentação incompleta ou vencida.');
    } else {
      const documentosInvalidos = this.documentos.filter((documento) => {
        const vencido = documento.estaVencido();
        const valido =
          documento.statusValidacao === StatusValidacao.VALIDADO && !vencido;
        return !valido;
      });

      if (documentosInvalidos.length > 0) {
        motivos.push('Documentação incompleta ou vencida.');
      }
    }

    const temInspecaoAprovada = this.inspecoes.some(
      (inspecao) => inspecao.resultado === ResultadoInspecao.APROVADO,
    );
    if (!temInspecaoAprovada) {
      motivos.push('Nenhuma inspeção aprovada.');
    }

    return { ok: motivos.length === 0, motivos };
  }

  liberarCarga(justificativa: string, responsavelId: string): void {
    if (!justificativa || justificativa.trim().length === 0) {
      throw new Error('Justificativa de liberação é obrigatória.');
    }

    const resultado = this.podeLiberar();
    if (!resultado.ok) {
      throw new Error(`Impossível liberar: ${resultado.motivos.join('; ')}`);
    }

    this.changeStatus(StatusCarga.LIBERADA, responsavelId, justificativa);
  }

  bloquearCarga(motivo: string, responsavelId: string): void {
    if (!motivo || motivo.trim().length === 0) {
      throw new Error('Motivo do bloqueio é obrigatório.');
    }

    this.changeStatus(StatusCarga.BLOQUEADA, responsavelId, motivo);
  }
}
