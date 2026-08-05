# Gerenciamento de Contexto e Memória

Este projeto utiliza múltiplas fontes de conhecimento. Cada uma possui uma responsabilidade específica e deve ser utilizada corretamente para minimizar consumo de contexto, evitar retrabalho e preservar conhecimento entre sessões.

## Hierarquia de fontes

O Claude deve utilizar as fontes na seguinte ordem:

1. Graphify (memória do projeto)
2. CLAUDE.md
3. Documentação em `/docs`
4. Código-fonte
5. Histórico da conversa (último recurso)

O histórico da conversa nunca deve ser considerado a principal fonte de verdade.

Antes de iniciar qualquer implementação:

1. Consultar o Graphify para recuperar o contexto arquitetural.
2. Identificar quais documentos realmente precisam ser lidos.
3. Ler apenas os documentos necessários em `/docs`.
4. Evitar leitura desnecessária de documentação já representada no Graphify.

---

# Regras Gerais

Antes de iniciar qualquer implementação:

1. Consultar o Graphify para recuperar o contexto arquitetural.
2. Identificar quais documentos realmente precisam ser lidos.
3. Ler apenas os documentos necessários em `/docs`.
4. Evitar leitura desnecessária de documentação já representada no Graphify.

---

## Graphify

Neste projeto NÃO utilizar graphify --update.

Motivo:

O modo incremental perde relações (imports_from) em projetos grandes (>300 arquivos).

Sempre utilizar build completo quando houver alterações estruturais.

Para consultas do dia a dia utilizar apenas o grafo existente.

Reconstruir somente quando houver:

- Nova Sprint
- Novas migrations
- ADR
- Mudanças arquiteturais
- Grandes refactors

---

## Quando consultar o Graphify

Antes de iniciar qualquer Sprint, Fase ou tarefa relevante, consultar obrigatoriamente o Graphify para recuperar:

- arquitetura relacionada;
- módulos envolvidos;
- componentes existentes;
- hooks reutilizáveis;
- services existentes;
- repositories existentes;
- entidades;
- relações entre entidades;
- decisões arquiteturais;
- ADRs relacionados;
- dependências;
- backlog relacionado;
- dívidas técnicas;
- funcionalidades já implementadas;
- integrações existentes;
- fluxos de negócio.

Nunca assumir que o contexto atual da conversa representa o estado completo do projeto.

---

## Durante a implementação

Sempre consultar o Graphify antes de criar:

- novo módulo;
- novo componente;
- novo hook;
- novo repository;
- novo service;
- nova entidade;
- nova API;
- novo fluxo.

Primeiro verificar se já existe algo reutilizável.

Evitar duplicação de conhecimento.

---

## Atualização do Graphify

Ao concluir qualquer Sprint ou Fase, atualizar obrigatoriamente o Graphify registrando:

### Arquitetura

- novos módulos;
- novos componentes;
- novas APIs;
- novos hooks;
- novos repositories;
- novos services;
- novas entidades;
- novos relacionamentos.

### Negócio

- novas regras;
- novos fluxos;
- novas validações;
- mudanças de comportamento.

### Engenharia

- decisões arquiteturais;
- novos ADRs;
- trade-offs;
- riscos conhecidos;
- limitações;
- dívida técnica.

### Roadmap

- funcionalidades concluídas;
- pendências;
- backlog;
- próximos passos.

---

## O que deve ir para o Graphify

Registrar conhecimento de alto valor.

Exemplos:

- arquitetura;
- relações entre módulos;
- entidades;
- fluxos;
- eventos;
- integrações;
- APIs;
- permissões;
- multi-tenancy;
- RLS;
- padrões arquiteturais;
- decisões importantes;
- dependências entre módulos;
- backlog;
- dívida técnica.

---

## O que NÃO deve ir para o Graphify

Não utilizar Graphify como armazenamento de código.

Não registrar:

- arquivos completos;
- código-fonte;
- componentes completos;
- CSS;
- JSX;
- HTML;
- commits;
- changelog;
- logs;
- builds;
- documentação duplicada.

Essas informações já pertencem ao Git e à documentação tradicional.

---

## Objetivo principal

O objetivo do Graphify é permitir que futuras tarefas recuperem contexto arquitetural utilizando poucos tokens.

Sempre preferir recuperar conhecimento do Graphify em vez de reconstruí-lo lendo dezenas de arquivos.

---

# Uso obrigatório do Graphify

O Graphify é o segundo cérebro do projeto.

Seu objetivo NÃO é substituir a documentação, mas reduzir consumo de contexto e preservar coerência arquitetural.

## Política de consulta

Antes de ler qualquer documentação do projeto, consulte o Graphify.

Utilize-o como primeira fonte para descobrir:

- arquitetura relacionada
- ADRs
- migrations
- services
- repositories
- entidades
- decisões anteriores
- módulos afetados
- dependências entre arquivos
- histórico de implementação

Se o Graphify fornecer contexto suficiente, NÃO leia a documentação completa.

Leia apenas os arquivos especificamente apontados pelo Graphify quando forem realmente necessários.

O Graphify deve ser utilizado para localizar informação, e não para reconstruir todo o contexto do projeto.

## Política de atualização

Atualize o Graphify somente quando ocorrerem mudanças estruturais.

Exemplos:

- nova sprint
- nova ADR
- nova migration
- novo módulo
- nova entidade
- alteração arquitetural
- mudança significativa de fluxo

Não execute atualização após pequenas alterações locais como:

- ajustes visuais
- correções de lint
- mudanças de texto
- pequenos refactors
- alterações de CSS

## Eficiência

Priorize sempre:

1. Consultar Graphify.
2. Recuperar apenas os nós relevantes.
3. Ler somente os arquivos realmente necessários.
4. Implementar.
5. Atualizar Graphify apenas se houve alteração estrutural.

Evite reconstruir contexto lendo README, BACKLOG, ADRs e documentação completa quando o Graphify já responder à dúvida.

O objetivo é minimizar consumo de tokens, preservar coerência arquitetural e manter continuidade entre as sprints.

---

# Documentação

A documentação em `/docs` continua sendo a referência oficial para explicações detalhadas.

Responsabilidades:

- Architecture
- Database
- Backend
- Frontend
- Security
- Deployment
- Testing
- Roadmap
- ADRs

O Graphify deve conter apenas um resumo estruturado dessas informações e seus relacionamentos.

---

# Definition of Done

Ao concluir qualquer Sprint ou Fase executar obrigatoriamente:

1. Atualizar documentação (`docs/`)
2. Atualizar CHANGELOG.md
3. Atualizar BACKLOG.md
4. Atualizar Graphify
5. Criar/Atualizar ADR quando necessário
6. Executar Build
7. Executar Typecheck
8. Executar Lint
9. Executar Testes
10. Revisão crítica
11. Sprint Report
12. Commit automático seguindo Conventional Commits

Uma Sprint não é considerada concluída enquanto o Graphify não estiver sincronizado.

---

# Fluxo obrigatório de trabalho

Antes de qualquer implementação:

1. Ler o CLAUDE.md
2. Consultar o Graphify
3. Recuperar o contexto relacionado
4. Ler apenas a documentação necessária em `/docs`
5. Analisar o código existente
6. Planejar a solução
7. Implementar

Após concluir:

1. Atualizar código
2. Atualizar documentação
3. Atualizar Graphify
4. Atualizar BACKLOG
5. Atualizar CHANGELOG
6. Criar ADR quando necessário
7. Executar validações
8. Gerar Sprint Report
9. Commit automático