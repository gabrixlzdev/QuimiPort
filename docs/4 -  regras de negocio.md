# Regras de negócio
## [RN-PRQ] Regras de Produto Químico
- RN-PRQ-01: Todo produto químico deve ser cadastrado com nome
- RN-PRQ-02: Todo produto químico deve ser cadastrado com classificação de risco
- RN-PRQ-03: Todo produto químico é criado com o status automaticamente definido como 'Ativo'
- RN-PRQ-04: Todo produto químico inativo deve ficar indisponível para ser associado a novas cargas químicas
- RN-PRQ-05: Todo produto químico deve ser único, não deve ser permitido o cadastro de produtos duplicados (mesmo nome e classe de risco)
- RN-PRQ-06: Um produto químico só pode ser inativado com a aprovação de um cargo superior

## [RN-CRQ] Regras de Carga Química
- RN-CRQ-01: Toda carga química recebe um ID definido automaticamente
- RN-CRQ-02: Toda carga química deve ser cadastrada com um produto químico ativo associado
- RN-CRQ-03: Toda carga química deve ter quantidade maior que zero
- RN-CRQ-04: Toda carga química é criada com o status automaticamente definido como 'Aguardando Documentação'
- RN-CRQ-05: Toda carga química deve ser cadastrada com um responsável técnico associado
- RN-CRQ-06: Toda carga química pode ser associada a mais de uma documentação
- RN-CRQ-07: Toda carga química em inspeção deve ser finalizada antes ser liberada
- RN-CRQ-08: Toda carga química não pode ser registrada com um produto químico inativo
- RN-CRQ-09: Uma carga química não pode ser liberada sem a documentação obrigatória
- RN-CRQ-10: Uma carga química bloqueada não pode entrar em movimentação
- RN-CRQ-11: Uma carga química cancelada não pode ter seus status alterado
- RN-CRQ-12: Uma carga química só pode ser registrada em data menor que hoje com aprovação de um cargo superior

## [RN-RTC] Regras de Responsável Técnico
- RN-RTC-01: Todo responsável técnico recebe um ID definido automaticamente
- RN-RTC-02: Todo responsável técnico deve ser cadastrado com um CPF
- RN-RTC-03: Todo responsável técnico deve ser cadastrado com um registro profissional

## [RN-DOC] Regras de Documento de Carga
- RN-DOC-01: Todo documento de carga recebe um ID definido automaticamente
- RN-DOC-02: Todo documento de carga é criado com o status automaticamente definido como 'Pendente'
- RN-DOC-03: Todo documento de carga deve ser cadastrado com um tipo de documento associado
- RN-DOC-04: Todo documento de carga deve ser cadastrado com uma data de validade

## [RN-INS] Regras de Inspeção
- RN-INS-01: Toda inspeção recebe um ID definido automaticamente
- RN-INS-02: Toda inspeção deve ser cadastrada com uma carga química associada
- RN-INS-03: Toda inspeção deve ter a data definida automaticamente pelo sistema quando o resultado é inserido
- RN-INS-04: Toda inspeção deve ter o Inspetor Responsável definido quando o resultado é inserido

## [RN-ARM] Regras de Área de Armazenamento
- RN-ARM01: Toda área de armazenamento recebe um ID definido automaticamente
- RN-ARM02: Toda área de armazenamento é criada com o status automaticamente definido como "Com espaço"
- RN-ARM03: Toda área de armazenamento deve ser cadastrada com uma carga química associada
- RN-ARM04: Toda área de armazenamento deve ser cadastrada com uma quantidade maior que zero
- RN-ARM05: Toda área de armazenamento deve ser cadastrada com uma capacidade máxima
