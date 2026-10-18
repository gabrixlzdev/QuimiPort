import { describe, it, expect } from 'vitest';
import { ClassificacaoRisco } from './classificacao-risco.vo.js';
import { CodigoIdentificacao } from './codigo-identificacao.vo.js';
import { RegistroProfissional } from './registro-profissional.vo.js';
import { QuantidadeCarga } from './quantidade-carga.vo.js';
import { Cpf } from './cpf.vo.js';
import { UnidadeMedida } from '../enums.js';
import { ClassificacaoRiscoInvalidaError } from '../errors/produto-quimico.errors.js';
import {
  CodigoIdentificacaoInvalidoError,
  QuantidadeInvalidaError,
  UnidadeMedidaInvalidaError,
} from '../errors/carga-quimica.errors.js';
import {
  CPFInvalidoError,
  RegistroProfissionalInvalidoError,
} from '../errors/responsavel-tecnico.errors.js';
import { getOrThrow } from '../../shared/either.js';

describe('Value Objects', () => {
  it('deve aceitar codigo identificacao valido', () => {
    expect(CodigoIdentificacao.create('ABC12345').kind).toBe('right');
  });

  it('deve rejeitar codigo identificacao invalido', () => {
    const resultado = CodigoIdentificacao.create('abc');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CodigoIdentificacaoInvalidoError);
    }
  });

  it('deve aceitar registro profissional valido', () => {
    expect(RegistroProfissional.create('CREA 12345', 'SP').kind).toBe('right');
  });

  it('deve rejeitar uf invalida do registro profissional', () => {
    const resultado = RegistroProfissional.create('CRQ 12345', 'XX');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(RegistroProfissionalInvalidoError);
    }
  });

  it('deve aceitar numero ONU com 4 digitos', () => {
    expect(ClassificacaoRisco.create('8', '8.1', '1830', 'II').kind).toBe('right');
  });

  it('deve rejeitar numero ONU invalido', () => {
    const resultado = ClassificacaoRisco.create('8', '8.1', 'abc', 'II');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ClassificacaoRiscoInvalidaError);
    }
  });

  it('deve rejeitar classificacao sem classe de risco', () => {
    const resultado = ClassificacaoRisco.create('', '8.1', '1830', 'II');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(ClassificacaoRiscoInvalidaError);
      expect(resultado.error.message).toBe('Classe de risco é obrigatória.');
    }
  });

  it('deve rejeitar quantidade de carga menor ou igual a zero', () => {
    const resultado = QuantidadeCarga.create(0, UnidadeMedida.QUILOGRAMAS);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(QuantidadeInvalidaError);
    }
  });

  it('deve rejeitar unidade de medida invalida', () => {
    const resultado = QuantidadeCarga.create(10, 'GALOES' as UnidadeMedida);

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(UnidadeMedidaInvalidaError);
    }
  });

  it('deve aceitar cpf valido', () => {
    expect(Cpf.create('529.982.247-25').kind).toBe('right');
  });

  it('deve rejeitar cpf com digitos verificadores invalidos', () => {
    const resultado = Cpf.create('123.456.789-00');

    expect(resultado.kind).toBe('left');
    if (resultado.kind === 'left') {
      expect(resultado.error).toBeInstanceOf(CPFInvalidoError);
    }
  });

  it('deve rejeitar cpf com todos os digitos iguais', () => {
    expect(Cpf.create('111.111.111-11').kind).toBe('left');
  });

  it('deve mascarar o cpf ao converter para string ou json', () => {
    const cpf = getOrThrow(Cpf.create('529.982.247-25'));
    expect(cpf.mascarado()).toBe('***.***.247-25');
    expect(`${cpf}`).toBe('***.***.247-25');
    expect(JSON.stringify({ cpf })).toBe('{"cpf":"***.***.247-25"}');
  });
});
