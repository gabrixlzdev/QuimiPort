import { StatusValidacao } from '../../enums.js';

export type DocumentoCargaProps = {
  id: string;
  tipoDocumento: string;
  numeroReferencia: string;
  urlArquivo: string;
  dataEmissao: Date;
  dataValidade: Date;
  statusValidacao?: StatusValidacao;
};

export class DocumentoCarga {
  public readonly id: string;
  public readonly tipoDocumento: string;
  public readonly numeroReferencia: string;
  public readonly urlArquivo: string;
  public readonly dataEmissao: Date;
  public readonly dataValidade: Date;
  public statusValidacao: StatusValidacao;

  constructor(props: DocumentoCargaProps) {
    if (!props.id || !props.tipoDocumento || !props.numeroReferencia || !props.urlArquivo) {
      throw new Error('Documento da carga inválido: dados obrigatórios faltando.');
    }

    if (!(props.dataEmissao instanceof Date) || Number.isNaN(props.dataEmissao.getTime())) {
      throw new Error('Data de emissão do documento inválida.');
    }

    if (!(props.dataValidade instanceof Date) || Number.isNaN(props.dataValidade.getTime())) {
      throw new Error('Data de validade do documento inválida.');
    }

    this.id = props.id;
    this.tipoDocumento = props.tipoDocumento;
    this.numeroReferencia = props.numeroReferencia;
    this.urlArquivo = props.urlArquivo;
    this.dataEmissao = props.dataEmissao;
    this.dataValidade = props.dataValidade;
    this.statusValidacao = props.statusValidacao ?? StatusValidacao.PENDENTE;
  }

  estaVencido(agora: Date = new Date()): boolean {
    return this.dataValidade.getTime() < agora.getTime();
  }

  validar(): void {
    this.statusValidacao = StatusValidacao.VALIDADO;
  }

  rejeitar(): void {
    this.statusValidacao = StatusValidacao.REJEITADO;
  }
}
