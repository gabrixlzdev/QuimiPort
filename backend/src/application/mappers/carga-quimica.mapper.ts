import { CargaQuimicaAggregate } from '../../domain/aggregate/carga-quimica/carga-quimica.aggregate.js';
import { CargaQuimicaOutputDto } from '../dtos/carga-quimica.dto.js';

// Conversão única agregado -> DTO de saída, reutilizada por todos os casos de uso
// de carga (registrar, listar, buscar), para não duplicar o mapeamento.
export class CargaQuimicaMapper {
  static toOutput(carga: CargaQuimicaAggregate): CargaQuimicaOutputDto {
    return {
      id: carga.id,
      codigoIdentificacao: carga.codigoIdentificacao.codigo,
      produtoQuimicoId: carga.produtoQuimicoId,
      quantidadeValor: carga.quantidade.valor,
      quantidadeUnidade: carga.quantidade.unidade,
      responsavelTecnicoId: carga.responsavelTecnicoId,
      origem: carga.origem,
      destino: carga.destino,
      dataEntrada: carga.dataEntrada,
      grupoCompatibilidade: carga.grupoCompatibilidade,
      status: carga.status,
      autorizacaoSuperiorId: carga.autorizacaoSuperiorId,
    };
  }
}
