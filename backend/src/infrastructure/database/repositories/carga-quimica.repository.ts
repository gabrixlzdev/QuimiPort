import { Injectable } from '@nestjs/common';
import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';

@Injectable()
export class InMemoryCargaQuimicaRepository implements CargaQuimicaRepository {
  private readonly cargas = new Map<string, CargaQuimicaAggregate>();

  async salvar(carga: CargaQuimicaAggregate): Promise<CargaQuimicaAggregate> {
    this.cargas.set(carga.id, carga);
    return carga;
  }

  async buscarPorId(id: string): Promise<CargaQuimicaAggregate | null> {
    return this.cargas.get(id) ?? null;
  }

  async listar(): Promise<CargaQuimicaAggregate[]> {
    return [...this.cargas.values()];
  }
}
