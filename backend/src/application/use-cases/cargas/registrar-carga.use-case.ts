import { CargaQuimicaAggregate } from '../../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaQuimicaRepository } from '../../../domain/repositories/carga-quimica.repository.interface.js';
import { QuantidadeCarga } from '../../../domain/value-objects/quantidade-carga.vo.js';
import {
  RegistrarCargaInputDto,
  CargaQuimicaOutputDto,
} from '../../dtos/carga-quimica.dto.js';

export class RegistrarCargaUseCase {
  constructor(private readonly cargaRepository: CargaQuimicaRepository) {}

  async execute(input: RegistrarCargaInputDto): Promise<CargaQuimicaOutputDto> {
    const carga = new CargaQuimicaAggregate({
      id: `CRQ-${crypto.randomUUID()}`,
      codigoIdentificacao: input.codigoIdentificacao,
      produtoQuimicoId: input.produtoQuimicoId,
      quantidade: new QuantidadeCarga(
        input.quantidadeValor,
        input.quantidadeUnidade,
      ),
      responsavelTecnicoId: input.responsavelTecnicoId,
      origem: input.origem,
      destino: input.destino,
      dataEntrada: input.dataEntrada,
      grupoCompatibilidade: input.grupoCompatibilidade,
    });

    const salva = await this.cargaRepository.salvar(carga);

    return {
      id: salva.id,
      codigoIdentificacao: salva.codigoIdentificacao,
      produtoQuimicoId: salva.produtoQuimicoId,
      quantidadeValor: salva.quantidade.valor,
      quantidadeUnidade: salva.quantidade.unidade,
      responsavelTecnicoId: salva.responsavelTecnicoId,
      origem: salva.origem,
      destino: salva.destino,
      dataEntrada: salva.dataEntrada,
      grupoCompatibilidade: salva.grupoCompatibilidade,
      status: salva.status,
    };
  }
}
