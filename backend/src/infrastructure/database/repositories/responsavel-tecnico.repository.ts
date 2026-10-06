import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { ResponsavelTecnicoRepository } from '../../../domain/repositories/responsavel-tecnico.repository.interface.js';
import { ResponsavelTecnicoOrmEntity } from '../entities/responsavel-tecnico.orm-entity.js';

@Injectable()
export class TypeOrmResponsavelTecnicoRepository implements ResponsavelTecnicoRepository {
  constructor(
    @InjectRepository(ResponsavelTecnicoOrmEntity)
    private readonly repository: Repository<ResponsavelTecnicoOrmEntity>,
  ) {}

  async salvar(responsavel: ResponsavelTecnico): Promise<ResponsavelTecnico> {
    const entity = await this.repository.save({
      id: responsavel.id,
      nome: responsavel.nome,
      cpf: responsavel.cpf.valor,
      registroProfissional: responsavel.registroProfissional.valor,
      ufConselho: responsavel.registroProfissional.ufConselho,
      emailContato: responsavel.emailContato ?? null,
    });

    return this.toDomain(entity);
  }

  async buscarPorId(id: string): Promise<ResponsavelTecnico | null> {
    const entity = await this.repository.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  private toDomain(entity: ResponsavelTecnicoOrmEntity): ResponsavelTecnico {
    return new ResponsavelTecnico({
      id: entity.id,
      nome: entity.nome,
      cpf: new Cpf(entity.cpf),
      registroProfissional: new RegistroProfissional(
        entity.registroProfissional,
        entity.ufConselho,
      ),
      emailContato: entity.emailContato ?? undefined,
    });
  }
}

@Injectable()
export class InMemoryResponsavelTecnicoRepository implements ResponsavelTecnicoRepository {
  private readonly responsaveis = new Map<string, ResponsavelTecnico>();

  async salvar(responsavel: ResponsavelTecnico): Promise<ResponsavelTecnico> {
    this.responsaveis.set(responsavel.id, responsavel);
    return responsavel;
  }

  async buscarPorId(id: string): Promise<ResponsavelTecnico | null> {
    return this.responsaveis.get(id) ?? null;
  }
}
