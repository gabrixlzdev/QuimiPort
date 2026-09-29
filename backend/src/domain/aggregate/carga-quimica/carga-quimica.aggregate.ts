import { StatusCarga, StatusValidacao, ResultadoInspecao } from '../../enums.js';
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
  grupoCompatibilidade: string;
  status?: StatusCarga;
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
  public readonly grupoCompatibilidade: string;

  public documentos: DocumentoCarga[] = [];
  public inspecoes: Inspecao[] = [];
  public status: StatusCarga;

  constructor(props: CargaQuimicaAggregateProps) {
    if (!props.id || !props.codigoIdentificacao || !props.produtoQuimicoId || !props.responsavelTecnicoId) {
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
    this.grupoCompatibilidade = props.grupoCompatibilidade;
    this.status = props.status ?? StatusCarga.AGUARDANDO_DOCUMENTACAO;
  }

  private static readonly transicoesPermitidas: Record<StatusCarga, StatusCarga[]> = {
    [StatusCarga.AGUARDANDO_DOCUMENTACAO]: [StatusCarga.DOCUMENTACAO_VALIDADA, StatusCarga.CANCELADA, StatusCarga.BLOQUEADA],
    [StatusCarga.DOCUMENTACAO_VALIDADA]: [StatusCarga.EM_INSPECAO, StatusCarga.CANCELADA, StatusCarga.BLOQUEADA],
    [StatusCarga.EM_INSPECAO]: [StatusCarga.LIBERADA, StatusCarga.CANCELADA, StatusCarga.BLOQUEADA],
    [StatusCarga.LIBERADA]: [StatusCarga.EM_MOVIMENTACAO, StatusCarga.CANCELADA, StatusCarga.BLOQUEADA],
    [StatusCarga.EM_MOVIMENTACAO]: [StatusCarga.FINALIZADA, StatusCarga.CANCELADA, StatusCarga.BLOQUEADA],
    [StatusCarga.FINALIZADA]: [],
    [StatusCarga.BLOQUEADA]: [StatusCarga.CANCELADA],
    [StatusCarga.CANCELADA]: [],
  };

  changeStatus(novoStatus: StatusCarga): void {
    if (this.status === StatusCarga.FINALIZADA || this.status === StatusCarga.CANCELADA) {
      throw new Error('Carga finalizada ou cancelada não pode sofrer novas transições.');
    }

    const transicoes = CargaQuimicaAggregate.transicoesPermitidas[this.status] ?? [];
    if (!transicoes.includes(novoStatus)) {
      throw new Error(`Transição de status inválida: ${this.status} -> ${novoStatus}.`);
    }

    this.status = novoStatus;
  }

  anexarDocumento(documento: DocumentoCarga): void {
    if (this.status === StatusCarga.CANCELADA || this.status === StatusCarga.FINALIZADA) {
      throw new Error('Carga imutável em estado CANCELADA ou FINALIZADA.');
    }

    this.documentos.push(documento);
  }

  registrarInspecao(inspecao: Inspecao): void {
    if (this.status === StatusCarga.CANCELADA || this.status === StatusCarga.FINALIZADA) {
      throw new Error('Não é possível registrar inspeções em carga cancelada ou finalizada.');
    }

    this.inspecoes.push(inspecao);

    if (inspecao.resultado === ResultadoInspecao.REPROVADO) {
      this.status = StatusCarga.BLOQUEADA;
      return;
    }

    if (this.status === StatusCarga.AGUARDANDO_DOCUMENTACAO || this.status === StatusCarga.DOCUMENTACAO_VALIDADA) {
      this.status = StatusCarga.EM_INSPECAO;
    }
  }

  podeLiberar(): { ok: boolean; motivos: string[] } {
    const motivos: string[] = [];

    if (this.documentos.length === 0) {
      motivos.push('Documentação incompleta ou vencida.');
    } else {
      const documentosInvalidos = this.documentos.filter((documento) => {
        const vencido = documento.estaVencido();
        const valido = documento.statusValidacao === StatusValidacao.VALIDADO && !vencido;
        return !valido;
      });

      if (documentosInvalidos.length > 0) {
        motivos.push('Documentação incompleta ou vencida.');
      }
    }

    const temInspecaoAprovada = this.inspecoes.some((inspecao) => inspecao.resultado === ResultadoInspecao.APROVADO);
    if (!temInspecaoAprovada) {
      motivos.push('Nenhuma inspeção aprovada.');
    }

    return { ok: motivos.length === 0, motivos };
  }

  liberarCarga(justificativa: string): void {
    if (!justificativa || justificativa.trim().length === 0) {
      throw new Error('Justificativa de liberação é obrigatória.');
    }

    const resultado = this.podeLiberar();
    if (!resultado.ok) {
      throw new Error(`Impossível liberar: ${resultado.motivos.join('; ')}`);
    }

    this.changeStatus(StatusCarga.LIBERADA);
  }

  bloquearCarga(motivo: string): void {
    if (!motivo || motivo.trim().length === 0) {
      throw new Error('Motivo do bloqueio é obrigatório.');
    }

    this.changeStatus(StatusCarga.BLOQUEADA);
  }
}
