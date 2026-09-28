import { describe, it, expect } from 'vitest';
import { ClassificacaoRisco } from './classificacao-risco.vo.js';
import { CodigoIdentificacao } from './codigo-identificacao.vo.js';
import { RegistroProfissional } from './registro-profissional.vo.js';
import { QuantidadeCarga } from './quantidade-carga.vo.js';
import { UnidadeMedida } from '../enums.js';

describe('Value Objects', () => {
  it('deve aceitar codigo identificacao valido', () => {
    expect(() => new CodigoIdentificacao('ABC12345')).not.toThrow();
  });

  it('deve rejeitar codigo identificacao invalido', () => {
    expect(() => new CodigoIdentificacao('abc')).toThrow();
  });

  it('deve aceitar registro profissional valido', () => {
    expect(() => new RegistroProfissional('CREA 12345', 'SP')).not.toThrow();
  });

  it('deve rejeitar uf invalida do registro profissional', () => {
    expect(() => new RegistroProfissional('CRQ 12345', 'XX')).toThrow();
  });

  it('deve aceitar numero ONU com 4 digitos', () => {
    expect(() => new ClassificacaoRisco('8', '8.1', '1830', 'II')).not.toThrow();
  });

  it('deve rejeitar numero ONU invalido', () => {
    expect(() => new ClassificacaoRisco('8', '8.1', 'abc', 'II')).toThrow();
  });

  it('deve rejeitar quantidade de carga menor ou igual a zero', () => {
    expect(() => new QuantidadeCarga(0, UnidadeMedida.QUILOGRAMAS)).toThrow();
  });
});
