# Todos os casos de uso planejados (objetivo, ator, entrada, saída, regras, exceções)

## Gerenciar Produto Químico (Cadastrar e Inativar)

1. Objetivo: manter um catálogo atualizado e seguro dos produtos químicos que circulam no porto, permitindo o registro de novos itens e a desativação daqueles que não devem mais ser associados a novas cargas.

2. Ator envolvido: Administrador do Sistema ou Gestor Operacional.

3. Entrada esperada:
* Para Cadastro: Nome do produto, Classe de Risco e Descrição Técnica
* Para Inativação: Identificador (ID) do produto e Motivo da Inativação

5. Saída esperada:
* No Cadastro: mensagem de sucesso e o produto disponível no sistema para ser associado a novas cargas.
* Na Inativação: mensagem de sucesso e o status do produto alterado para "Inativo" no banco de dados.

7. Principais Regras de Negócio:
* Um produto químico não pode ser cadastrado sem nome.
* Um produto químico não pode ser cadastrado sem classe de risco.
* Um produto químico inativo não pode ser usado para o registro de novas cargas.
* Um produto químico deve ser único, não deve ser permitido o cadastro de produtos duplicados (mesmo nome e classe de risco).

9. Possíveis erros ou exceções:
* Tentativa de cadastrar produto com campos obrigatórios em branco (o sistema deve bloquear e emitir alerta).
* Tentativa de associar um produto que acabou de ser inativado a uma nova carga (o sistema deve impedir a operação).

## Registrar Carga Química

1. Objetivo: manter um catálogo atualizado e seguro das cargas químicas que circulam no porto, permitindo o registro de novos itens.

2. Ator envolvido: Administrador do Sistema ou Gestor Operacional.

3. Entrada esperada:
* Para Registro: Nome do produto, Produto(s) Químico(s) associado(s), Classificação de Risco

5. Saída esperada:
* No Cadastro: mensagem de sucesso e a carga no sistema para o status ser alterado.

7. Principais Regras de Negócio:
* Um produto químico não pode ser cadastrado sem nome.
* Um produto químico não pode ser cadastrado sem classe de risco.
* Um produto químico inativo não pode ser usado para o registro de novas cargas.
* Um produto químico deve ser único, não deve ser permitido o cadastro de produtos duplicados (mesmo nome e classe de risco).

9. Possíveis erros ou exceções:
* Uma carga química não pode ser registrada sem produto químico associado;
• Uma carga química não pode ser registrada com produto químico inativo;
• Uma carga química não pode ser registrada sem classificação de risco;
