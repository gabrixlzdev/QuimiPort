# 4. MATRIZ DE REGRAS DE NEGÓCIO E ARQUITETURA

---

## 4.1 Mapeamento e Detalhamento das Regras de Negócio

### [RN-PRQ] Regras de Produto Químico
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-PRQ-01** | Todo produto químico recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-PRQ-02** | Todo produto químico deve ser cadastrado com nome. | Domínio / Entidade | Validação de campo não-nulo na Entidade `ProdutoQuimico`. |
| **RN-PRQ-03** | Todo produto químico deve ser cadastrado com classificação de risco. | Domínio / Value Object | Instanciação do VO `ClassificacaoRisco`. |
| **RN-PRQ-04** | Todo produto químico é criado com o status automaticamente definido como 'Ativo'. | Domínio / Entidade | Definido no construtor da Entidade `ProdutoQuimico`. |
| **RN-PRQ-05** | Todo produto químico inativo deve ficar indisponível para ser associado a novas cargas químicas. | Aplicação / Use Case | Filtro/Validação do Use Case no `RegistrarCarga`. |
| **RN-PRQ-06** | Todo produto químico deve ser único (proibido duplicidade de mesmo nome e classe de risco). | Aplicação / Repositório | Checagem de existência prévia antes da persistência. |
| **RN-PRQ-07** | Um produto químico só pode ser inativado com a aprovação de um cargo superior. | Aplicação / Autorização | Validação de perfil/Role e `autorizacaoSuperiorId`. |

---

### [RN-CRQ] Regras de Carga Química
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-CRQ-01** | Toda carga química recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-CRQ-02** | Toda carga química deve ser cadastrada com um produto químico ativo associado. | Domínio / Agregado | Invariante da raiz do agregado `CargaQuimica`. |
| **RN-CRQ-03** | Toda carga química deve ter quantidade maior que zero. | Domínio / Value Object | Validação do VO `QuantidadeCarga`. |
| **RN-CRQ-04** | Toda carga química é criada com status inicial `REGISTRADA` (Aguardando Documentação). | Domínio / Agregado | Definido no construtor do Agregado `CargaQuimica`. |
| **RN-CRQ-05** | Toda carga química deve ser cadastrada com um responsável técnico associado. | Domínio / Agregado | Invariante obrigatória de criação. |
| **RN-CRQ-06** | Toda carga química pode ser associada a mais de uma documentação. | Domínio / Agregado | Coleção `List<DocumentoCarga>` interna do Agregado. |
| **RN-CRQ-07** | Toda carga química em inspeção deve ser finalizada antes de ser liberada. | Domínio / Máquina Estado | Método `liberar()` valida se o status de inspeção é final. |
| **RN-CRQ-08** | Toda carga química não pode ser registrada com um produto químico inativo. | Aplicação / Use Case | Verificação do estado do `ProdutoQuimico` no Use Case. |
| **RN-CRQ-09** | Uma carga química não pode ser liberada sem a documentação obrigatória. | Domínio / Agregado | Validação do checklist de documentos em `liberar()`. |
| **RN-CRQ-10** | Uma carga química bloqueada não pode entrar em movimentação. | Domínio / Máquina Estado | Bloqueio de métodos de transição no status `BLOQUEADA`. |
| **RN-CRQ-11** | Uma carga química cancelada não pode ter seu status alterado. | Domínio / Máquina Estado | Estado Terminal: lança exceção em qualquer transição. |
| **RN-CRQ-12** | Registro de carga com data retroativa exige aprovação de cargo superior. | Aplicação / Policy | Policy de liberação/aprovação de registro retroativo. |

---

### [RN-RTC] Regras de Responsável Técnico
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-RTC-01** | Todo responsável técnico recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-RTC-02** | Todo responsável técnico deve ser cadastrado com um CPF válido. | Domínio / Value Object | Instanciação e validação do algoritmo do VO `CPF`. |
| **RN-RTC-03** | Todo responsável técnico deve ser cadastrado com um registro profissional. | Domínio / Value Object | Instanciação do VO `RegistroProfissional` (CRQ/CREA). |

---

### [RN-DOC] Regras de Documento de Carga
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-DOC-01** | Todo documento de carga recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-DOC-02** | Todo documento de carga é criado com o status automaticamente definido como 'Pendente'. | Domínio / Entidade | Estado inicial no construtor do `DocumentoCarga`. |
| **RN-DOC-03** | Todo documento de carga deve ser cadastrado com um tipo de documento associado. | Domínio / Entidade | Enum de Tipos de Documento (FDS, FISPQ, Laudo). |
| **RN-DOC-04** | Todo documento de carga deve ser cadastrado com uma data de validade. | Domínio / Entidade | Validação da presença e consistência da `dataValidade`. |

---

### [RN-INS] Regras de Inspeção
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-INS-01** | Toda inspeção recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-INS-02** | Toda inspeção deve ser cadastrada com uma carga química associada. | Domínio / Entidade | Chave/Referência obrigatória para `CargaQuimica`. |
| **RN-INS-03** | Toda inspeção deve ter a data definida automaticamente pelo sistema no resultado. | Aplicação / Use Case | `DateTime.UtcNow` gravado no lançamento do parecer. |
| **RN-INS-04** | Toda inspeção deve ter o Inspetor Responsável definido no resultado. | Domínio / Entidade | Atribuição obrigatória do ID/Nome do Inspetor no laudo. |

---

### [RN-ARM] Regras de Área de Armazenamento
| ID | Descrição da Regra | Camada de Proteção | Implementação / Mecanismo |
| :--- | :--- | :--- | :--- |
| **RN-ARM-01** | Toda área de armazenamento recebe um ID definido automaticamente. | Infraestrutura / DB | Gerado via UUIDv4 / Identity DB. |
| **RN-ARM-02** | Toda área é criada com o status automaticamente definido como 'Com espaço'. | Domínio / Entidade | Estado inicial no construtor de `AreaArmazenamento`. |
| **RN-ARM-03** | Toda área de armazenamento deve ser cadastrada com uma carga química associada. | Domínio / Entidade | Mapeamento da carga alocada no setor do pátio. |
| **RN-ARM-04** | Toda área de armazenamento deve ter quantidade ocupada maior que zero. | Domínio / Value Object | Validação de quantidade alocada. |
| **RN-ARM-05** | Toda área de armazenamento deve ser cadastrada com uma capacidade máxima. | Domínio / Agregado | Invariante que impede que a ocupação exceda o limite. |