## Todos os casos de uso planejados (objetivo, ator, entrada, saída, regras, exceções)

Gerenciar Produto Químico (Cadastrar e Inativar)
1. Objetivo: Manter um catálogo atualizado e seguro dos produtos químicos que circulam no porto, permitindo o registro de novos itens e a desativação daqueles que não devem mais ser associados a novas cargas

2. Ator envolvido: Administrador do Sistema ou Gestor Operacional

3. Entrada esperada:
Para Cadastro: Nome do produto, Classe de Risco e descrição técnica
Para Inativação: Identificador (ID) do produto e motivo da inativação.

5. Saída esperada:
No Cadastro: Mensagem de sucesso e o produto disponível no sistema para novas cargas.
Na Inativação: Status do produto alterado para "Inativo" no banco de dados.

6. Principais Regras de Negócio:
Um produto químico não pode ser cadastrado sem nome
Um produto químico não pode ser cadastrado sem classe de risco
Um produto químico inativo não pode ser usado para o registro de novas cargas
Não deve ser permitido o cadastro de produtos duplicados (mesmo nome e classe).

7. Possíveis erros ou exceções:
Tentativa de cadastrar produto com campos obrigatórios em branco (o sistema deve bloquear e emitir alerta)
Tentativa de associar um produto que acabou de ser inativado a uma nova carga (o sistema deve impedir a operação)
