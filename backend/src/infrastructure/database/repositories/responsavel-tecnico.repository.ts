import { Injectable } from '@nestjs/common';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { ResponsavelTecnicoRepository } from '../../../domain/repositories/responsavel-tecnico.repository.interface.js';

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
