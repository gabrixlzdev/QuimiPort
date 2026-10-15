import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import {
  CargaQuimicaInvalidaError,
  CodigoIdentificacaoInvalidoError,
  QuantidadeInvalidaError,
  UnidadeMedidaInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import { ResponsavelTecnicoNaoEncontradoError } from '../../../domain/errors/responsavel-tecnico.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { ResponsavelTecnicoRepository } from '../../../domain/repositories/responsavel-tecnico.repository.interface.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import { CodigoIdentificacao } from '../../../domain/value-objects/codigo-identificacao.vo.js';
import { Either, left, right } from '../../../shared/either.js';
import { generateEntityId } from '../../id-generator.js';
import {
  RegistrarCargaInputDto,
  CargaQuimicaOutputDto,
} from '../../dtos/carga-quimica.dto.js';

export type RegistrarCargaError =
  | ResponsavelTecnicoNaoEncontradoError
  | CodigoIdentificacaoInvalidoError
  | QuantidadeInvalidaError
  | UnidadeMedidaInvalidaError
  | CargaQuimicaInvalidaError;

export class RegistrarCargaUseCase {
  constructor(
    private readonly cargaRepository: CargaQuimicaRepository,
    private readonly responsavelRepository: ResponsavelTecnicoRepository,
  ) {}

  async execute(
    input: RegistrarCargaInputDto,
  ): Promise<Either<RegistrarCargaError, CargaQuimicaOutputDto>> {
    const responsavel = await this.responsavelRepository.buscarPorId(
      input.responsavelTecnicoId,
    );
    if (!responsavel) {
      return left(
        new ResponsavelTecnicoNaoEncontradoError(input.responsavelTecnicoId),
      );
    }

    const codigoIdentificacao = CodigoIdentificacao.create(
      input.codigoIdentificacao,
    );
    if (codigoIdentificacao.kind === 'left') return codigoIdentificacao;

    const quantidade = QuantidadeCarga.create(
      input.quantidadeValor,
      input.quantidadeUnidade,
    );
    if (quantidade.kind === 'left') return quantidade;

    const carga = CargaQuimicaAggregate.create({
      id: generateEntityId('CRQ'),
      codigoIdentificacao: codigoIdentificacao.value,
      produtoQuimicoId: input.produtoQuimicoId,
      quantidade: quantidade.value,
      responsavelTecnicoId: input.responsavelTecnicoId,
      origem: input.origem,
      destino: input.destino,
      dataEntrada: input.dataEntrada,
      grupoCompatibilidade: input.grupoCompatibilidade,
    });
    if (carga.kind === 'left') return carga;

    const salva = await this.cargaRepository.salvar(carga.value);

    return right({
      id: salva.id,
      codigoIdentificacao: salva.codigoIdentificacao.codigo,
      produtoQuimicoId: salva.produtoQuimicoId,
      quantidadeValor: salva.quantidade.valor,
      quantidadeUnidade: salva.quantidade.unidade,
      responsavelTecnicoId: salva.responsavelTecnicoId,
      origem: salva.origem,
      destino: salva.destino,
      dataEntrada: salva.dataEntrada,
      grupoCompatibilidade: salva.grupoCompatibilidade,
      status: salva.status,
    });
  }
}
