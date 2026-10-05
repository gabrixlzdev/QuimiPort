import { ResponsavelTecnico } from '../entities/responsavel-tecnico.entity.js';

export interface ResponsavelTecnicoRepository {
  salvar(responsavel: ResponsavelTecnico): Promise<ResponsavelTecnico>;
  buscarPorId(id: string): Promise<ResponsavelTecnico | null>;
}
