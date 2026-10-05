import { describe, expect, it } from 'vitest';
import { InMemoryAreaArmazenamentoRepository } from '../../../infrastructure/database/repositories/area-armazenamento.repository.js';
import { CadastrarAreaArmazenamentoUseCase } from './cadastrar-area-armazenamento.use-case.js';

describe('CadastrarAreaArmazenamentoUseCase', () => {
  it('gera ID ARM e persiste a área criada', async () => {
    const repository = new InMemoryAreaArmazenamentoRepository();
    const useCase = new CadastrarAreaArmazenamentoUseCase(repository);

    const output = await useCase.execute({
      nome: 'Pátio A',
      codigo: 'PA-01',
      tipo: 'PATIO',
      cargaQuimicaId: 'carga-1',
      capacidadeMaxima: 1000,
      quantidadeOcupada: 500,
    });

    expect(output.id).toMatch(
      /^ARM-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(await repository.buscarPorId(output.id)).not.toBeNull();
  });
});
