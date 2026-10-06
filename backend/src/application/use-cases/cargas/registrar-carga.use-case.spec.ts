import { describe, expect, it } from 'vitest';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { InMemoryResponsavelTecnicoRepository } from '../../../infrastructure/database/repositories/responsavel-tecnico.repository.js';
import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import { RegistrarCargaUseCase } from './registrar-carga.use-case.js';

const input = {
  codigoIdentificacao: 'ABC12345',
  produtoQuimicoId: 'produto-1',
  quantidadeValor: 100,
  quantidadeUnidade: UnidadeMedida.QUILOGRAMAS,
  responsavelTecnicoId: 'RTC-1',
  origem: 'Santos',
  destino: 'Rio',
  dataEntrada: new Date('2026-01-01T00:00:00Z'),
  grupoCompatibilidade: 'CLASSE_8',
};

describe('RegistrarCargaUseCase', () => {
  it('não registra carga quando o responsável técnico não existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = new InMemoryResponsavelTecnicoRepository();
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    await expect(useCase.execute(input)).rejects.toThrow(
      'Responsável técnico não encontrado.',
    );
    expect(await cargas.listar()).toEqual([]);
  });

  it('registra carga quando o responsável técnico existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = new InMemoryResponsavelTecnicoRepository();
    await responsaveis.salvar(
      new ResponsavelTecnico({
        id: input.responsavelTecnicoId,
        nome: 'Maria Silva',
        cpf: new Cpf('529.982.247-25'),
        registroProfissional: new RegistroProfissional('CRQ 12345', 'SP'),
      }),
    );
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    const output = await useCase.execute(input);

    expect(output.responsavelTecnicoId).toBe(input.responsavelTecnicoId);
    expect(await cargas.listar()).toHaveLength(1);
  });
});
