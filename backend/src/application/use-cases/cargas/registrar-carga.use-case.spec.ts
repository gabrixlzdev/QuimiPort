import { describe, expect, it } from 'vitest';
import { InMemoryCargaQuimicaRepository } from '../../../infrastructure/database/repositories/carga-quimica.repository.js';
import { InMemoryResponsavelTecnicoRepository } from '../../../infrastructure/database/repositories/responsavel-tecnico.repository.js';
import { Cpf } from '../../../domain/value-objects/cpf.vo.js';
import { RegistroProfissional } from '../../../domain/value-objects/registro-profissional.vo.js';
import { ResponsavelTecnico } from '../../../domain/entities/responsavel-tecnico.entity.js';
import { UnidadeMedida } from '../../../domain/enums.js';
import {
  AprovacaoSuperiorObrigatoriaError,
  CodigoIdentificacaoInvalidoError,
  GrupoCompatibilidadeIncompativelError,
  QuantidadeInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import {
  ProdutoQuimicoInativoError,
  ProdutoQuimicoNaoEncontradoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { ProdutoQuimico } from '../../../domain/entities/produto-quimico.entity.js';
import { ClassificacaoRisco } from '../../../domain/value-objects/classificacao-risco.vo.js';
import { InMemoryProdutoQuimicoRepository } from '../../../infrastructure/database/repositories/produto-quimico.repository.js';
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

const agora = () => new Date('2025-12-31T12:00:00Z');

const criarProduto = (ativo = true, grupoCompatibilidade = 'CLASSE_8') =>
  getOrThrow(
    ProdutoQuimico.create({
      id: input.produtoQuimicoId,
      nome: 'Produto de teste',
      descricao: 'Produto químico de teste',
      grupoCompatibilidade,
      classificacaoRisco: getOrThrow(
        ClassificacaoRisco.create('8', '', '1234', 'II'),
      ),
      ativo,
    }),
  );

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

const criarProdutoExistente = async () => {
  const produtos = new InMemoryProdutoQuimicoRepository();
  await produtos.salvar(criarProduto());
  return produtos;
};

describe('RegistrarCargaUseCase', () => {
  it('não registra carga quando o responsável técnico não existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = new InMemoryResponsavelTecnicoRepository();
    const produtos = await criarProdutoExistente();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

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
    const produtos = await criarProdutoExistente();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const output = getOrThrow(await useCase.execute(input));

    expect(output.codigoIdentificacao).toBe(input.codigoIdentificacao);
    expect(output.responsavelTecnicoId).toBe(input.responsavelTecnicoId);
    expect(output.autorizacaoSuperiorId).toBeUndefined();
    expect(await cargas.listar()).toHaveLength(1);
  });

  it('não registra carga quando o produto não existe', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const produtos = new InMemoryProdutoQuimicoRepository();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const resultado = await useCase.execute(input);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoNaoEncontradoError);
    }
    expect(await cargas.listar()).toEqual([]);
  });

  it('não registra carga quando o produto está inativo', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const produtos = new InMemoryProdutoQuimicoRepository();
    await produtos.salvar(criarProduto(false));
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const resultado = await useCase.execute(input);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoInativoError);
    }
    expect(await cargas.listar()).toEqual([]);
  });

  it('não registra carga quando o grupo de compatibilidade diverge', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const produtos = new InMemoryProdutoQuimicoRepository();
    await produtos.salvar(criarProduto(true, 'CLASSE_3'));
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const resultado = await useCase.execute(input);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(
        GrupoCompatibilidadeIncompativelError,
      );
    }
    expect(await cargas.listar()).toEqual([]);
  });

  it('exige aprovação superior no registro retroativo e persiste seu identificador', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const produtos = await criarProdutoExistente();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const semAprovacao = await useCase.execute({
      ...input,
      dataEntrada: new Date('2025-12-30T23:00:00Z'),
    });

    expect(semAprovacao.kind).toBe('left');
    if (semAprovacao.kind === 'left') {
      expect(semAprovacao.error).toBeInstanceOf(
        AprovacaoSuperiorObrigatoriaError,
      );
    }
    expect(await cargas.listar()).toEqual([]);

    const autorizado = getOrThrow(
      await useCase.execute({
        ...input,
        dataEntrada: new Date('2025-12-30T23:00:00Z'),
        autorizacaoSuperiorId: 'gestor-superior-1',
      }),
    );

    expect(autorizado.autorizacaoSuperiorId).toBe('gestor-superior-1');
    expect((await cargas.listar())[0].autorizacaoSuperiorId).toBe(
      'gestor-superior-1',
    );
  });

  it('não registra carga quando o código de identificação é inválido', async () => {
    const cargas = new InMemoryCargaQuimicaRepository();
    const responsaveis = await criarResponsavelExistente();
    const produtos = await criarProdutoExistente();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

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
    const produtos = await criarProdutoExistente();
    const useCase = new RegistrarCargaUseCase(
      cargas,
      responsaveis,
      produtos,
      agora,
    );

    const resultado = await useCase.execute({ ...input, quantidadeValor: 0 });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(QuantidadeInvalidaError);
    }
    expect(await cargas.listar()).toEqual([]);
  });
});
