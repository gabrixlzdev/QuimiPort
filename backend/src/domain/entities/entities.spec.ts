import { describe, it, expect } from 'vitest';
import { ResponsavelTecnico } from './responsavel-tecnico.entity.js';
import { AreaArmazenamento } from './area-armazenamento.entity.js';
import { ProdutoQuimico } from './produto-quimico.entity.js';
import { RegistroProfissional } from '../value-objects/registro-profissional.vo.js';
import { ClassificacaoRisco } from '../value-objects/classificacao-risco.vo.js';
import { Cpf } from '../value-objects/cpf.vo.js';
import { StatusAreaArmazenamento } from '../enums.js';
import {
  AreaArmazenamentoInvalidaError,
  CapacidadeExcedidaError,
} from '../errors/area-armazenamento.errors.js';
import { ProdutoQuimicoInvalidoError } from '../errors/produto-quimico.errors.js';
import { ResponsavelTecnicoInvalidoError } from '../errors/responsavel-tecnico.errors.js';
import { getOrThrow } from '../../shared/either.js';

describe('ProdutoQuimico', () => {
  const props = () => ({
    id: 'prq-1',
    nome: 'Ácido Sulfúrico',
    descricao: 'Produto de limpeza industrial.',
    grupoCompatibilidade: 'Ácido forte',
    classificacaoRisco: getOrThrow(
      ClassificacaoRisco.create('8', '8.1', '1830', 'II'),
    ),
  });

  it('deve criar produto químico ativo por padrão', () => {
    const produto = getOrThrow(ProdutoQuimico.create(props()));
    expect(produto.ativo).toBe(true);
  });

  it('deve rejeitar produto químico sem nome', () => {
    const resultado = ProdutoQuimico.create({ ...props(), nome: '' });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoInvalidoError);
    }
  });

  it('deve rejeitar produto químico sem classificação de risco', () => {
    const resultado = ProdutoQuimico.create({
      ...props(),
      classificacaoRisco: undefined as unknown as ClassificacaoRisco,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ProdutoQuimicoInvalidoError);
    }
  });
});

describe('ResponsavelTecnico', () => {
  const props = {
    id: 'rt-1',
    nome: 'Maria Silva',
    cpf: getOrThrow(Cpf.create('529.982.247-25')),
    registroProfissional: getOrThrow(
      RegistroProfissional.create('CRQ 12345', 'SP'),
    ),
  };

  it('deve criar responsável técnico com cpf e registro profissional válidos', () => {
    expect(ResponsavelTecnico.create(props).kind).toBe('right');
  });

  it('deve rejeitar responsável técnico sem cpf', () => {
    const resultado = ResponsavelTecnico.create({
      ...props,
      cpf: undefined as unknown as Cpf,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ResponsavelTecnicoInvalidoError);
    }
  });
});

describe('AreaArmazenamento', () => {
  const props = {
    id: 'area-1',
    nome: 'Pátio A',
    codigo: 'PA-01',
    tipo: 'PATIO' as const,
    cargaQuimicaId: 'carga-1',
    capacidadeMaxima: 1000,
    quantidadeOcupada: 500,
  };

  it('deve criar área com status COM_ESPACO quando ainda há capacidade', () => {
    const area = getOrThrow(AreaArmazenamento.create(props));
    expect(area.status).toBe(StatusAreaArmazenamento.COM_ESPACO);
  });

  it('deve marcar área como LOTADA quando ocupação alcançar a capacidade', () => {
    const area = getOrThrow(
      AreaArmazenamento.create({
        ...props,
        quantidadeOcupada: props.capacidadeMaxima,
      }),
    );
    expect(area.status).toBe(StatusAreaArmazenamento.LOTADA);
  });

  it('deve rejeitar área sem carga química associada', () => {
    const resultado = AreaArmazenamento.create({
      ...props,
      cargaQuimicaId: '',
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(AreaArmazenamentoInvalidaError);
    }
  });

  it('deve rejeitar quantidade ocupada menor ou igual a zero', () => {
    const resultado = AreaArmazenamento.create({
      ...props,
      quantidadeOcupada: 0,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(AreaArmazenamentoInvalidaError);
    }
  });

  it('deve rejeitar quantidade ocupada maior que a capacidade máxima', () => {
    const resultado = AreaArmazenamento.create({
      ...props,
      quantidadeOcupada: 1500,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CapacidadeExcedidaError);
    }
  });

  it('deve rejeitar capacidade máxima não finita', () => {
    const resultado = AreaArmazenamento.create({
      ...props,
      capacidadeMaxima: Number.POSITIVE_INFINITY,
    });

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(AreaArmazenamentoInvalidaError);
    }
  });
});
