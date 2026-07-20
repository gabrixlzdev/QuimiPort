## Linguagem ubíqua
|
 Termo 
|
 Definição 
|
|
---
|
---
|
|
 Carga Química 
|
 Lote de produto químico registrado para movimentação portuária 
|
|
 Produto Químico 
|
 Item cadastrado no sistema, com nome e classificação de risco 
|
|
 Classificação de Risco 
|
 Categoria de periculosidade do produto (inflamável, corrosivo, tóxico, explosivo) 
|
|
 Responsável Técnico 
|
 Profissional habilitado que valida e assina a carga 
|
|
 Documentação Obrigatória 
|
 Conjunto de documentos exigidos antes da liberação (ex: ficha de segurança, laudo técnico) 
|
|
 Status da Carga 
|
 Situação atual da carga (registrada, em inspeção, liberada, bloqueada, cancelada) 
|
|
 Liberação 
|
 Ato de autorizar a movimentação da carga 
|
|
 Bloqueio 
|
 Impedimento formal de movimentação por não conformidade 
|
|
 Inspeção 
|
 Verificação técnica realizada antes da liberação 
|
## Entidades

### Produto Químico

**Responsabilidade:** Representar um tipo de produto químico que pode ser associado a cargas.

**Atributos principais:**
- id
- nome
- classificacaoRisco
- status (ativo/inativo)

**Regras relacionadas:**
- RN08: Não pode ser cadastrado sem nome
- RN09: Não pode ser cadastrado sem classe de risco
- RN10: Se inativo, não pode ser usado em novas cargas

**Relacionamento:** 1 Produto Químico → N Cargas Químicas

---

### Carga Química

**Responsabilidade:** Representar um lote de produto químico em movimentação, concentrando as regras de liberação, bloqueio e status.

**Atributos principais:**
- id
- produtoQuimico (referência)
- quantidade
- status
- responsavelTecnico (referência)
- documentos (lista)
- dataRegistro

**Regras relacionadas:**
- RN01: Uma carga química não pode ser registrada sem produto químico associado
- RN02: Uma carga química não pode ser registrada com produto químico inativo
- RN03: Uma carga química não pode ser registrada sem classificação de risco
- RN04: Uma carga química não pode ser liberada sem documentação obrigatória
- RN05: Uma carga bloqueada não pode entrar em movimentação
- RN06: Uma carga cancelada não pode ser liberada
- RN07: Uma carga em inspeção não pode ser finalizada sem antes ser liberada
- RN12: Não pode ser registrada sem responsável técnico

**Relacionamento:**
- 1 Carga Química → 1 Produto Químico
- 1 Carga Química → 1 Responsável Técnico
- 1 Carga Química → N Documentos da Carga

---

### Responsável Técnico

**Responsabilidade:** Representar o profissional habilitado a validar cargas químicas.

**Atributos principais:**
- id
- nome
- registroProfissional

**Regras relacionadas:**
- RN12: Toda carga deve ter um responsável técnico informado

**Relacionamento:** 1 Responsável Técnico → N Cargas Químicas

---

### Documento da Carga

**Responsabilidade:** Representar um documento obrigatório vinculado a uma carga.

**Atributos principais:**
- id
- tipoDocumento
- validade
- status (pendente/anexado)

**Regras relacionadas:**
- RN04: Carga não pode ser liberada com documentos pendentes

**Relacionamento:** N Documentos da Carga → 1 Carga Química

---

### Inspeção

**Responsabilidade:** Representar a verificação técnica realizada antes da liberação de uma carga.

**Atributos principais:**
- id
- cargaQuimica (referência)
- resultado
- data
- inspetorResponsavel

**Regras relacionadas:**
- RN07: Carga em inspeção não pode ser finalizada sem antes ser liberada

**Relacionamento:** N Inspeções → 1 Carga Química

---

### Área de armazenamento

**Responsabilidade:** Representar o local destinado a reservar um espaço para o armazenamento das cargas químicas.

**Atributos principais:**
- id
- cargaQuimica (referência)
- quantidade
- capacidadeMaxima
- Status (com/sem espaço)

**Regras relacionadas:**


**Relacionamento:** 1 Área de armazenamento → N Cargas Químicas

## Objetos de valor

### Quantidade
Representa o volume/peso da carga. Não possui identidade própria.
- valor: number
- unidade: "kg" | "l" | "ton"

>RN11: valor deve ser maior que zero.

### Classificação de Risco
Categoria de periculosidade do produto.
- Inflamável | Corrosivo | Tóxico | Explosivo

### Status da Carga
Situação atual da carga química.
- Registrada | Em Inspeção | Liberada | Bloqueada | Cancelada

## Agregados

### Agregado: Carga Química

A Carga Química é a raiz do agregado porque concentra as decisões que precisam de consistência imediata: associação com produto, documentação, responsável técnico e status.

**Por quê:** liberar uma carga exige checar, na mesma operação, se a documentação está completa e se o status permite liberação. Se essas verificações estivessem espalhadas em entidades separadas, seria possível liberar uma carga com documentação incompleta por falta de sincronismo entre partes do sistema.

**O que o agregado protege:**
- Carga não pode ser liberada sem documentos obrigatórios completos
- Carga bloqueada não pode mudar de status sem passar por revisão
- Carga cancelada não pode ser liberada

> Observação: esta é uma primeira versão do agregado.


## Regras de negócio

- RN01: Uma carga química não pode ser registrada sem produto químico associado
- RN02: Uma carga química não pode ser registrada com produto químico inativo
- RN03: Uma carga química não pode ser registrada sem classificação de risco
- RN04: Uma carga química não pode ser liberada sem documentação obrigatória
- RN05: Uma carga bloqueada não pode entrar em movimentação
- RN06: Uma carga cancelada não pode ser liberada
- RN07: Uma carga em inspeção não pode ser finalizada sem antes ser liberada
- RN08: Um produto químico não pode ser cadastrado sem nome
- RN09: Um produto químico não pode ser cadastrado sem classe de risco
- RN10: Um produto químico inativo não pode ser usado em novas cargas
- RN11: A quantidade da carga deve ser maior que zero
- RN12: Toda carga deve possuir um responsável técnico informado
