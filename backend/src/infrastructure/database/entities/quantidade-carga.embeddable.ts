import { Column } from 'typeorm';
import { UnidadeMedida } from '../../../domain/enums.js';

export class QuantidadeCargaEmbeddable {
  @Column({ name: 'quantidade_valor', type: 'numeric' })
  valor: number;

  @Column({ name: 'quantidade_unidade', type: 'enum', enum: UnidadeMedida })
  unidade: UnidadeMedida;
}
