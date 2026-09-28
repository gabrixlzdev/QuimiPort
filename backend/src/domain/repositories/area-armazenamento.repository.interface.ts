import { AreaArmazenamento } from '../entities/area-armazenamento.entity.js';

export interface AreaArmazenamentoRepository {
  salvar(area: AreaArmazenamento): Promise<AreaArmazenamento>;
  buscarPorId(id: string): Promise<AreaArmazenamento | null>;
  listar(): Promise<AreaArmazenamento[]>;
}
