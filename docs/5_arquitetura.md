# 5. ARQUITETURA E ESTRUTURA DO PROJETO

---

## 5.1 Divisão de Camadas (Clean Architecture)

A estrutura do projeto adota rigorosamente os princípios da **Clean Architecture**, dividindo as responsabilidades em camadas concêntricas onde as dependências apontam estritamente de fora para dentro:

[ Infraestrutura (DB, HTTP, Frameworks) ]
↓
[ Interface / Adaptadores (Controllers, Presenters) ]
↓
[ Aplicação (Casos de Uso, DTOs) ]
↓
[ Domínio (Entidades, Agregados, Value Objects) ]

1. **Camada de Domínio (`domain`):** Contém as Entidades, Agregados, Value Objects imutáveis, Enums de estado e Interfaces/Contratos de Repositório. Isenta de bibliotecas externas.
2. **Camada de Aplicação (`application`):** Implementa os Casos de Uso (`UC-001` ao `UC-008`), orquestra o fluxo do domínio e define DTOs.
3. **Camada de Adaptadores / Interface (`presentation`):** Controllers REST, Middlewares de validação e DTO Mappers.
4. **Camada de Infraestrutura (`infrastructure`):** Implementação dos Repositórios (ORMs/Database), logs e integrações de rede.

---

## 5.2 Estrutura Oficial de Pastas em TypeScript (`src/`)

```text
src/
├── domain/                               # Camada de Domínio (Core da Aplicação)
│   ├── aggregates/                       # Agregados Principais
│   │   └── carga-quimica/
│   │       ├── carga-quimica.aggregate.ts# Raiz do Agregado (Aggregate Root)
│   │       ├── status-carga.enum.ts      # Enum / State Machine de Status
│   │       └── documento-carga.entity.ts # Entidade do Agregado [RN-DOC]
│   ├── entities/                         # Entidades Independentes
│   │   ├── produto-quimico.entity.ts     # Entidade de Produto [RN-PRQ]
│   │   ├── responsavel-tecnico.entity.ts # Entidade de Responsável [RN-RTC]
│   │   ├── inspecao.entity.ts           # Entidade de Inspeção [RN-INS]
│   │   └── area-armazenamento.entity.ts  # Entidade de Armazenamento [RN-ARM]
│   ├── value-objects/                    # Objetos de Valor Imutáveis
│   │   ├── classificacao-risco.vo.ts     # Classe de risco / ONU [RN-PRQ-03]
│   │   ├── quantidade-carga.vo.ts        # Quantidade e Unidade [RN-CRQ-03]
│   │   ├── cpf.vo.ts                     # Validação de CPF [RN-RTC-02]
│   │   └── registro-profissional.vo.ts   # CRQ/CREA [RN-RTC-03]
│   ├── repositories/                     # Interfaces/Contratos (Sem implementação)
│   │   ├── carga-quimica.repository.interface.ts
│   │   ├── produto-quimico.repository.interface.ts
│   │   └── area-armazenamento.repository.interface.ts
│   └── errors/                           # Erros de Domínio Personalizados
│       └── domain.error.ts
│
├── application/                          # Camada de Aplicação (Casos de Uso)
│   ├── use-cases/                        # Implementação dos Casos de Uso
│   │   ├── produtos/
│   │   │   ├── cadastrar-produto.use-case.ts
│   │   │   └── inativar-produto.use-case.ts
│   │   ├── cargas/
│   │   │   ├── registrar-carga.use-case.ts
│   │   │   ├── validar-documentacao.use-case.ts
│   │   │   ├── liberar-carga.use-case.ts
│   │   │   └── bloquear-carga.use-case.ts
│   │   └── inspecoes/
│   │       └── realizar-inspecao.use-case.ts
│   └── dtos/                             # Data Transfer Objects
│       ├── carga-quimica.dto.ts
│       └── produto-quimico.dto.ts
│
├── infrastructure/                       # Camada de Infraestrutura
│   ├── database/                         # Persistência e Mapeamento
│   │   └── repositories/                 # Implementação Concreta das Interfaces
│   └── shared/                           # Padrão Either e Result Types
│
└── presentation/                         # Camada de Apresentação
    └── controllers/                      # Controllers da API REST


5.3 Recursos Avançados do TypeScript no Projeto
    A aplicação utiliza os recursos do TypeScript para garantir a segurança de tipos e o cumprimento das invariantes de DDD:

    Interfaces Estritas para Contratos: O Domínio define interfaces (ICargaQuimicaRepository) garantindo que a aplicação dependa de abstrações, e   não de implementações de banco de dados.

    Enums Nativos para Estado: A máquina de estados da carga utiliza enum StatusCarga (REGISTRADA, EM_ANALISE, EM_INSPECAO, LIBERADA, BLOQUEADA,    CANCELADA, FINALIZADA), impedindo valores inválidos em tempo de compilação.

    Value Objects Imutáveis com Getters Privados: Os Value Objects (CPF, ClassificacaoRisco) utilizam propriedades readonly e construtores privados     com métodos estáticos de fábrica (CPF.create()) para garantir imutabilidade.

    Tipagem Funcional com Tipo Result / Either: Tratamento de erros de domínio sem disparar exceções pesadas na call-stack, utilizando o tipo   Either<DomainError, SuccessResult>.
```

## 5.4 Padrões de Design e Boas Práticas Aplicadas

| Padrão / Prática | Aplicação no Projeto QuimiPort |
| :--- | :--- |
| **Domain-Driven Design (DDD)** | Modelagem focada na Linguagem Ubíqua, delimitada por Agregados (`CargaQuimica`), Invariantes de Domínio e Value Objects imutáveis. |
| **Rich Domain Model** | As entidades contêm comportamento e regras de transição. Proibição de *Anemic Domain Model* (getters/setters públicos sem validação). |
| **Pattern Either / Result** | Tratamento funcional de erros e falhas de validação de negócio sem o uso ostensivo de exceções para fluxo de controle. |
| **Dependency Inversion (DIP)** | O Domínio define as interfaces dos repositórios; a Infraestrutura as implementa, garantindo desacoplamento do banco de dados. |
| **Repository Pattern** | Abstração do acesso a dados para garantir persistência orientada a agregados. |