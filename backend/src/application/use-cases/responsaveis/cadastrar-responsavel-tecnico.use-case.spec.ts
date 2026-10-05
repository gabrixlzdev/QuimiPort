import { describe, expect, it } from 'vitest';
import { CadastrarResponsavelTecnicoUseCase } from './cadastrar-responsavel-tecnico.use-case.js';
import { InMemoryResponsavelTecnicoRepository } from '../../../infrastructure/database/repositories/responsavel-tecnico.repository.js';

describe('CadastrarResponsavelTecnicoUseCase', () => {
  it('gera ID RTC e persiste o responsável sem expor dados pessoais na saída', async () => {
    const repository = new InMemoryResponsavelTecnicoRepository();
    const useCase = new CadastrarResponsavelTecnicoUseCase(repository);

    const output = await useCase.execute({
      nome: 'Maria Silva',
      cpf: '529.982.247-25',
      registroProfissional: 'CRQ 12345',
      ufConselho: 'SP',
      emailContato: 'maria@example.com',
    });

    expect(output.id).toMatch(
      /^RTC-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(output).toEqual({ id: output.id });
    expect(await repository.buscarPorId(output.id)).not.toBeNull();
  });
});
