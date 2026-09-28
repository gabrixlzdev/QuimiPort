import { Injectable } from '@nestjs/common';
import { AreaArmazenamento } from '../../../domain/entities/area-armazenamento.entity.js';
import { AreaArmazenamentoRepository } from '../../../domain/repositories/area-armazenamento.repository.interface.js';

@Injectable()
export class InMemoryAreaArmazenamentoRepository implements AreaArmazenamentoRepository {
  private readonly areas = new Map<string, AreaArmazenamento>();

  async salvar(area: AreaArmazenamento): Promise<AreaArmazenamento> {
    this.areas.set(area.id, area);
    return area;
  }

  async buscarPorId(id: string): Promise<AreaArmazenamento | null> {
    return this.areas.get(id) ?? null;
  }

  async listar(): Promise<AreaArmazenamento[]> {
    return [...this.areas.values()];
  }
}
