import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import {
  AprovacaoSuperiorObrigatoriaError,
  CargaQuimicaInvalidaError,
  CodigoIdentificacaoInvalidoError,
  DataEntradaInvalidaError,
  GrupoCompatibilidadeIncompativelError,
  QuantidadeInvalidaError,
  UnidadeMedidaInvalidaError,
} from '../../../domain/errors/carga-quimica.errors.js';
import {
  ProdutoQuimicoInativoError,
  ProdutoQuimicoNaoEncontradoError,
} from '../../../domain/errors/produto-quimico.errors.js';
import { ResponsavelTecnicoNaoEncontradoError } from '../../../domain/errors/responsavel-tecnico.errors.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { ProdutoQuimicoRepository } from '../../../domain/repositories/produto-quimico.repository.interface.js';
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
  | ProdutoQuimicoNaoEncontradoError
  | ProdutoQuimicoInativoError
  | GrupoCompatibilidadeIncompativelError
  | AprovacaoSuperiorObrigatoriaError
  | DataEntradaInvalidaError
  | CodigoIdentificacaoInvalidoError
  | QuantidadeInvalidaError
  | UnidadeMedidaInvalidaError
  | CargaQuimicaInvalidaError;

export class RegistrarCargaUseCase {
  constructor(
    private readonly cargaRepository: CargaQuimicaRepository,
    private readonly responsavelRepository: ResponsavelTecnicoRepository,
    private readonly produtoRepository: ProdutoQuimicoRepository,
    private readonly agora: () => Date = () => new Date(),
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

    const produto = await this.produtoRepository.buscarPorId(
      input.produtoQuimicoId,
    );
    if (!produto) {
      return left(new ProdutoQuimicoNaoEncontradoError(input.produtoQuimicoId));
    }
    if (!produto.ativo) {
      return left(new ProdutoQuimicoInativoError(input.produtoQuimicoId));
    }
    if (
      typeof input.grupoCompatibilidade !== 'string' ||
      input.grupoCompatibilidade.trim() !== produto.grupoCompatibilidade
    ) {
      return left(new GrupoCompatibilidadeIncompativelError());
    }

    const dataEntrada =
      input.dataEntrada instanceof Date
        ? new Date(input.dataEntrada)
        : new Date(String(input.dataEntrada));
    if (Number.isNaN(dataEntrada.getTime())) {
      return left(new DataEntradaInvalidaError());
    }

    const hoje = this.agora().toISOString().slice(0, 10);
    const dataEntradaDia = dataEntrada.toISOString().slice(0, 10);
    const registroRetroativo = dataEntradaDia < hoje;
    const autorizacaoSuperiorId = input.autorizacaoSuperiorId?.trim();
    if (registroRetroativo && !autorizacaoSuperiorId) {
      return left(new AprovacaoSuperiorObrigatoriaError());
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
      dataEntrada,
      autorizacaoSuperiorId,
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
      autorizacaoSuperiorId: salva.autorizacaoSuperiorId,
    });
  }
}
