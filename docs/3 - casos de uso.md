# Todos os casos de uso planejados (objetivo, ator, entrada, saída, regras, exceções)

## Gerenciar Produto Químico (Cadastrar e Inativar)

1. Objetivo: manter um catálogo atualizado e seguro dos produtos químicos que circulam no porto, permitindo o registro de novos itens e a desativação daqueles que não devem mais ser associados a novas cargas.

2. Ator envolvido: Gestor Operacional

3. Entrada esperada
* Para Cadastro: Nome do produto, Classe de Risco e Descrição Técnica
* Para Inativação: Identificador (ID) do produto e Motivo da Inativação

4. Saída esperada
* No Cadastro: mensagem de sucesso e o produto disponível no sistema para ser associado a novas cargas.
* Na Inativação: mensagem de sucesso e o status do produto alterado para "Inativo" no banco de dados.

5. Principais Regras de Negócio relacionadas a Produtos Químicos
- RN-PRQ-01: Todo produto químico recebe um ID definido automaticamente
- RN-PRQ-02: Todo produto químico deve ser cadastrado com nome
- RN-PRQ-03: Todo produto químico deve ser cadastrado com classificação de risco
- RN-PRQ-04: Todo produto químico é criado com o status automaticamente definido como 'Ativo'
- RN-PRQ-05: Todo produto químico inativo deve ficar indisponível para ser associado a novas cargas químicas
- RN-PRQ-06: Todo produto químico deve ser único, não deve ser permitido o cadastro de produtos duplicados (mesmo nome e classe de risco)
- RN-PRQ-07: Um produto químico só pode ser inativado com a aprovação de um cargo superior

6. Possíveis erros ou exceções:
* Tentativa de cadastrar produto com campos obrigatórios em branco (o sistema deve bloquear e emitir alerta).
* Tentativa de associar um produto que acabou de ser inativado a uma nova carga (o sistema deve impedir a operação).

## Registrar Carga Química

1. Objetivo: manter um catálogo atualizado e seguro das cargas químicas que circulam no porto, permitindo o registro de novos itens.

2. Ator envolvido: Operador portuário, Gestor Operacional

3. Entrada esperada
* No Registro: produtoQuimico (referência), quantidade, responsavelTecnico (referência), documentos (lista), dataRegistro.
* Dados de Registro gerados automaticamente pelo sistema: id, status (inicia com "Aguardando Documentação")

4. Saída esperada
* No Registro: mensagem de sucesso e a carga no sistema para o status ser alterado.

5. Principais Regras de Negócio relacionadas as Cargas Químicas
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

6. Possíveis erros ou exceções
* Uma carga química não pode ser registrada sem produto químico associado.
* Uma carga química não pode ser registrada com produto químico inativo.
* Uma carga química não pode ser registrada sem classificação de risco.

## Validar documentação da carga química

1. Objetivo: manter um catálogo atualizado e seguro dos documentos a respeito das cargas químicas que circulam no porto, permitindo o registro e validação de itens.

2.Ator envolvido: Analista de documentação

3. Entrada esperada

4. Saída esperada

5. Principais Regras de Negócio relacionadas a Documentação da carga química
- RN-DOC-01: Todo documento de carga recebe um ID definido automaticamente
- RN-DOC-02: Todo documento de carga é criado com o status automaticamente definido como 'Pendente'
- RN-DOC-03: Todo documento de carga deve ser cadastrado com um tipo de documento associado
- RN-DOC-04: Todo documento de carga deve ser cadastrado com uma data de validade

6. Possíveis erros ou exceções
