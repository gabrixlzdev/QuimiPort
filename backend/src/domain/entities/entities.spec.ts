import { describe, it, expect } from 'vitest';
import { ResponsavelTecnico } from './responsavel-tecnico.entity.js';
import { AreaArmazenamento } from './area-armazenamento.entity.js';
import { RegistroProfissional } from '../value-objects/registro-profissional.vo.js';
import { Cpf } from '../value-objects/cpf.vo.js';
import { StatusAreaArmazenamento } from '../enums.js';

describe('ResponsavelTecnico', () => {
  const props = {
    id: 'rt-1',
    nome: 'Maria Silva',
    cpf: new Cpf('529.982.247-25'),
    registroProfissional: new RegistroProfissional('CRQ 12345', 'SP'),
  };

  it('deve criar responsável técnico com cpf e registro profissional válidos', () => {
    expect(() => new ResponsavelTecnico(props)).not.toThrow();
  });

  it('deve rejeitar responsável técnico sem cpf', () => {
    expect(() => new ResponsavelTecnico({ ...props, cpf: undefined as unknown as Cpf })).toThrow();
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

  it('deve criar área com status inicial COM_ESPACO', () => {
    const area = new AreaArmazenamento(props);
    expect(area.status).toBe(StatusAreaArmazenamento.COM_ESPACO);
  });

  it('deve rejeitar área sem carga química associada', () => {
    expect(() => new AreaArmazenamento({ ...props, cargaQuimicaId: '' })).toThrow();
  });

  it('deve rejeitar quantidade ocupada menor ou igual a zero', () => {
    expect(() => new AreaArmazenamento({ ...props, quantidadeOcupada: 0 })).toThrow();
  });

  it('deve rejeitar quantidade ocupada maior que a capacidade máxima', () => {
    expect(() => new AreaArmazenamento({ ...props, quantidadeOcupada: 1500 })).toThrow();
  });
});
