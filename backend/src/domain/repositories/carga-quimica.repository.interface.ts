import { CargaQuimicaAggregate } from '../aggregate/carga-quimica/carga-quimica.aggregate.js';

export interface CargaQuimicaRepository {
  salvar(carga: CargaQuimicaAggregate): Promise<CargaQuimicaAggregate>;
  buscarPorId(id: string): Promise<CargaQuimicaAggregate | null>;
  listar(): Promise<CargaQuimicaAggregate[]>;
}
