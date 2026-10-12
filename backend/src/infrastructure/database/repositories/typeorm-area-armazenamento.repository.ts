import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AreaArmazenamento } from '../../../domain/entities/area-armazenamento.entity.js';
import { AreaArmazenamentoRepository } from '../../../domain/repositories/area-armazenamento.repository.interface.js';
import { AreaArmazenamentoOrmEntity } from '../entities/area-armazenamento.orm-entity.js';

@Injectable()
export class TypeOrmAreaArmazenamentoRepository implements AreaArmazenamentoRepository {
  constructor(
    @InjectRepository(AreaArmazenamentoOrmEntity)
    private readonly repository: Repository<AreaArmazenamentoOrmEntity>,
  ) {}

  async salvar(area: AreaArmazenamento): Promise<AreaArmazenamento> {
    const entity = await this.repository.save({
      id: area.id,
      nome: area.nome,
      codigo: area.codigo,
      tipo: area.tipo,
      capacidadeMaxima: area.capacidadeMaxima,
      quantidadeOcupada: area.quantidadeOcupada,
      carga: { id: area.cargaQuimicaId },
    });

    return this.toDomain(entity);
  }

  async buscarPorId(id: string): Promise<AreaArmazenamento | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: { carga: true },
    });

    return entity ? this.toDomain(entity) : null;
  }

  async listar(): Promise<AreaArmazenamento[]> {
    const entities = await this.repository.find({
      relations: { carga: true },
    });

    return entities.map((entity) => this.toDomain(entity));
  }

  private toDomain(entity: AreaArmazenamentoOrmEntity): AreaArmazenamento {
    return new AreaArmazenamento({
      id: entity.id,
      nome: entity.nome,
      codigo: entity.codigo,
      tipo: entity.tipo,
      cargaQuimicaId: entity.carga.id,
      capacidadeMaxima: entity.capacidadeMaxima,
      quantidadeOcupada: entity.quantidadeOcupada,
    });
  }
}
