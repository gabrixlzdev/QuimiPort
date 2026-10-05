export type AreaArmazenamentoProps = {
  id: string;
  nome: string;
  codigo: string;
  tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';
};

export class AreaArmazenamento {
  public readonly id: string;
  public readonly nome: string;
  public readonly codigo: string;
  public readonly tipo: 'PATIO' | 'ARMAZEM' | 'AREA_SEGURA';

  constructor(props: AreaArmazenamentoProps) {
    if (!props.id || !props.nome || !props.codigo) {
      throw new Error('Área de armazenamento inválida.');
    }

    this.id = props.id;
    this.nome = props.nome.trim();
    this.codigo = props.codigo.trim();
    this.tipo = props.tipo;
  }
}
