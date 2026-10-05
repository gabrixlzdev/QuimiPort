import { StatusAreaArmazenamento } from '../enums.js';

export type AreaArmazenamentoProps = {
  id: string;
  nome: string;
  codigo: string;
  tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
  cargaQuimicaId: string;
  capacidadeMaxima: number;
  quantidadeOcupada: number;
};

export class AreaArmazenamento {
  public readonly id: string;
  public readonly nome: string;
  public readonly codigo: string;
  public readonly tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
  public readonly cargaQuimicaId: string;
  public readonly capacidadeMaxima: number;
  public readonly quantidadeOcupada: number;
  public readonly status: StatusAreaArmazenamento;

  constructor(props: AreaArmazenamentoProps) {
    if (!props.id || !props.nome || !props.codigo) {
      throw new Error('Área de armazenamento inválida.');
    }

    if (!props.cargaQuimicaId) {
      throw new Error('Área de armazenamento deve estar associada a uma carga química.');
    }

    if (!props.capacidadeMaxima || props.capacidadeMaxima <= 0) {
      throw new Error('Capacidade máxima deve ser maior que zero.');
    }

    if (!props.quantidadeOcupada || props.quantidadeOcupada <= 0) {
      throw new Error('Quantidade ocupada deve ser maior que zero.');
    }

    if (props.quantidadeOcupada > props.capacidadeMaxima) {
      throw new Error('Quantidade ocupada não pode exceder a capacidade máxima da área.');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.codigo = props.codigo.trim();
    this.tipo = props.tipo;
    this.cargaQuimicaId = props.cargaQuimicaId;
    this.capacidadeMaxima = props.capacidadeMaxima;
    this.quantidadeOcupada = props.quantidadeOcupada;
    this.status = StatusAreaArmazenamento.COM_ESPACO;
  }
}
