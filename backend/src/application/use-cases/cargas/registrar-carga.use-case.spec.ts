import { describe, expect, it } from 'vitest';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { InMemoryResponsavelTecnicoRepository } from '../../../infrastructure/database/repositories/responsavel-tecnico.repository.js';
import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import {
  CodigoIdentificacaoInvalidoError,
  QuantidadeInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { ResponsavelTecnicoNaoEncontradoError } from '../../../domain/errors/responsavel-tecnico.errors.js';
import { getOrThrow } from '../../../shared/either.js';
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

const criarResponsavelExistente = async () => {
  const responsaveis = new InMemoryResponsavelTecnicoRepository();
  await responsaveis.salvar(
    getOrThrow(
      ResponsavelTecnico.create({
        id: input.responsavelTecnicoId,
        nome: 'Maria Silva',
        cpf: getOrThrow(Cpf.create('529.982.247-25')),
        registroProfissional: getOrThrow(
          RegistroProfissional.create('CRQ 12345', 'SP'),
        ),
      }),
    ),
  );
  return responsaveis;
};

describe('RegistrarCargaUseCase', () => {
  it('não registra carga quando o responsável técnico não existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = new InMemoryResponsavelTecnicoRepository();
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    const resultado = await useCase.execute(input);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(
        ResponsavelTecnicoNaoEncontradoError,
      );
      expect(resultado.error.message).toBe(
        'Responsável técnico não encontrado.',
      );
    }
    expect(await cargas.listar()).toEqual([]);
  });

  it('registra carga quando o responsável técnico existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    const output = getOrThrow(await useCase.execute(input));

    expect(output.codigoIdentificacao).toBe(input.codigoIdentificacao);
    expect(output.responsavelTecnicoId).toBe(input.responsavelTecnicoId);
    expect(await cargas.listar()).toHaveLength(1);
  });

  it('não registra carga quando o código de identificação é inválido', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    const resultado = await useCase.execute({
      ...input,
      codigoIdentificacao: 'abc 123',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CodigoIdentificacaoInvalidoError);
    }
    expect(await cargas.listar()).toEqual([]);
  });

  it('não registra carga com quantidade menor ou igual a zero', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const useCase = new RegistrarCargaUseCase(cargas, responsaveis);

    const resultado = await useCase.execute({ ...input, quantidadeValor: 0 });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(QuantidadeInvalidaError);
    }
    expect(await cargas.listar()).toEqual([]);
  });
});
