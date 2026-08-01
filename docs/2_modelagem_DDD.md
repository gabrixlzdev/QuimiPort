# 🧩 2. Modelagem com Domain-Driven Design (DDD)

---

## 2.1 Diagrama de Agregados e Entidades

```mermaid
classDiagram
    class CargaQuimicaAggregateRoot {
        -CargaId id
        -CodigoIdentificacao codigoIdentificacao
        -ProdutoQuimicoId produtoQuimicoId
        -QuantidadeCarga quantidade
        -ResponsavelTecnico responsavelTecnico
        -StatusCarga status
        -List~DocumentoCarga~ documentos
        -List~Inspecao~ inspecoes
        +registrarCarga()
        +anexarDocumento(documento)
        +solicitarInspecao()
        +registrarResultadoInspecao(resultado)
        +liberarCarga(justificativa)
        +bloquearCarga(motivo)
    }

    class ProdutoQuimicoEntity {
        -ProdutoQuimicoId id
        -string nomeComercial
        -string nomeTecnico
        -ClassificacaoRisco classificacaoRisco
        -boolean ativo
        +inativar()
    }

    class DocumentoCargaEntity {
        -DocumentoId id
        -string tipo
        -string numeroReferencia
        -Date dataValidade
        -StatusValidacao statusValidacao
        +validar()
        +estaVencido() boolean
    }

    class InspecaoEntity {
        -InspecaoId id
        -Date dataSolicitacao
        -string inspetorId
        -ResultadoInspecao resultado
        +aprovar()
        +reprovar()
    }

    class ClassificacaoRiscoVO {
        -string classe
        -string subclasse
        -string numeroONU
        -string grupoEmbalagem
    }

    class QuantidadeCargaVO {
        -number valor
        -UnidadeMedida unidade
    }

    class ResponsavelTecnicoVO {
        -string nome
        -string registroConselho
        -string ufConselho
    }

    CargaQuimicaAggregateRoot "1" *-- "many" DocumentoCargaEntity : contem
    CargaQuimicaAggregateRoot "1" *-- "many" InspecaoEntity : contem
    CargaQuimicaAggregateRoot "1" *-- "1" QuantidadeCargaVO : possui
    CargaQuimicaAggregateRoot "1" *-- "1" ResponsavelTecnicoVO : possui
    CargaQuimicaAggregateRoot ..> ProdutoQuimicoEntity : referencia por ProdutoQuimicoId
    ProdutoQuimicoEntity "1" *-- "1" ClassificacaoRiscoVO : possui

2.2 Entidades de Domínio
    1. CargaQuimica (Aggregate Root)
        Responsabilidade: Gerenciar o ciclo de vida da carga no terminal portuário, garantir que a movimentação só ocorra se a carga estiver em conformidade e proteger as transições de status.

        Identidade: CargaId (UUID v4 imutável).

        Principais Atributos: id, codigoIdentificacao, produtoQuimicoId, quantidade, responsavelTecnico, documentos (lista), inspecoes (lista),     status, historicoStatus (lista), dataCriacao.

        Regras Principais: Não transita para LIBERADA sem documentação completa e inspeção aprovada; não aceita alterações se estiver nos estados       CANCELADA ou FINALIZADA.

        Relacionamentos: Contém uma lista interna da Entidade DocumentoCarga e da Entidade Inspecao; referencia ProdutoQuimico pelo seu     ProdutoQuimicoId.

    2. ProdutoQuimico
        Responsabilidade: Definir o catálogo de substâncias autorizadas para movimentação no terminal e suas propriedades operacionais de risco.

        Identidade: ProdutoQuimicoId (UUID v4 imutável).

        Principais Atributos: id, nomeComercial, nomeTecnico, classificacaoRisco, ativo, dataCadastro.

        Regras Principais: Não pode ser cadastrado sem nome ou classificação de risco; quando inativado, impede o registro de novas cargas  associadas.

        Relacionamentos: Mantém um identificador consultado pelo agregado CargaQuimica.

    3. DocumentoCarga
        Responsabilidade: Representar um documento legal anexado à carga (ex.: FDS, Declaração IMDG) e rastrear seu status de validação.

        Identidade: DocumentoId (UUID v4 imutável, no escopo da Carga).

        Principais Atributos: id, tipoDocumento, numeroReferencia, urlArquivo, dataEmissao, dataValidade, statusValidacao (PENDENTE, VALIDADO,      REJEITADO).

        Regras Principais: Se a data de validade for anterior à data atual, o documento é marcado como expirado e invalida a liberação da carga.

    4. Inspecao
        Responsabilidade: Armazenar o parecer, a data, o inspetor e o resultado da vistoria física realizada no pátio portuário.

        Identidade: InspecaoId (UUID v4 imutável, no escopo da Carga).

        Principais Atributos: id, dataSolicitacao, dataRealizacao, inspetorId, resultado (PENDENTE, APROVADO, REPROVADO), observacoes.

        Regras Principais: Uma inspeção reprovada exige justificativa e dispara automaticamente o bloqueio da carga.

2.3 Objetos de Valor (Value Objects)
    1. ClassificacaoRisco
        Atributos: classe (ex.: "8 - Corrosivos"), subclasse (ex.: "8.1"), numeroONU (ex.: "1830"), grupoEmbalagem (ex.: "PG II").

        Invariantes: O numeroONU deve conter exatamente 4 dígitos numéricos. A classe deve pertencer às categorias oficiais da ANTT (1 a 9).

    2. QuantidadeCarga
        Atributos: valor (number), unidade (Enum: TONELADAS, QUILOGRAMAS, LITROS, METROS_CUBICOS).

        Invariantes: O valor deve ser estritamente maior que zero (valor > 0).

    3. ResponsavelTecnico
        Atributos: nome, registroConselho (CRQ ou CREA), ufConselho, emailContato.

        Invariantes: registroConselho e ufConselho não podem ser nulos nem vazios.

    4. CodigoIdentificacao
        Atributos: codigo (string).

        Invariantes: Formato alfanumérico com tamanho entre 8 e 20 caracteres sem espaços ou caracteres especiais.

2.4 Agregados e Invariantes
    Agregado Principal: CargaQuimica
    Aggregate Root: CargaQuimica

    Invariantes Protegidas pelo Agregado:

    Consistência Documental para Liberação: A carga jamais transita para LIBERADA se existir qualquer documento obrigatório pendente ou reprovado.

    Exigência de Inspeção Finalizada: A carga não pode ser liberada sem ter ao menos uma inspeção registrada com resultado APROVADO.

    Imutabilidade de Cargas Finalizadas/Canceladas: Cargas que atingem os estados CANCELADA ou FINALIZADA não podem aceitar inclusão de documentos,     alterações de responsáveis ou novas transições de status.

    Coerência de Responsabilidade Técnica: Nenhuma carga é transicionada para REGISTRADA ou etapas subsequentes sem um ResponsavelTecnico associado.

    Limites do Agregado e Decisão Arquitetural:
    A entidade ProdutoQuimico NÃO faz parte do agregado CargaQuimica. O agregado mantém apenas uma referência por identificador (produtoQuimicoId).     Isso evita um agregado gigante e diminui o acoplamento, permitindo que alterações no catálogo global de produtos não bloqueiem  concorrencialmente as transações operacionais das cargas físicas.
```
