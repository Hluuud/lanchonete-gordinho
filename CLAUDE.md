# CLAUDE.md — Guia do Projeto

> Guia operacional para o Claude (e qualquer outro agente de IA) trabalhar neste repositório.
>
> Este documento define as regras, responsabilidades e princípios do projeto.
> Toda documentação técnica detalhada deverá viver na pasta `/docs`.
>
> Este arquivo é a fonte principal de contexto para qualquer implementação.

---

# Visão geral do projeto

Este projeto consiste no desenvolvimento de uma plataforma profissional para gerenciamento de pedidos de restaurantes, iniciando pela **Lanchonete do Gordinho**.

Embora exista um único cliente inicialmente, **o objetivo NÃO é desenvolver um sistema personalizado**.

A arquitetura deve ser construída desde o início para suportar dezenas ou centenas de restaurantes, funcionando futuramente como um SaaS (Software as a Service).

Todo o desenvolvimento deve considerar escalabilidade, manutenção e evolução de longo prazo.

---

# Objetivos

O objetivo principal é construir uma plataforma moderna que una:

- Cardápio Digital
- Autoatendimento
- Painel da cozinha
- Painel administrativo
- Impressão automática
- Gestão de pedidos
- Gestão de produtos
- Dashboard operacional
- Plataforma preparada para múltiplos restaurantes

O foco é criar um produto de alta qualidade, evitando decisões que gerem retrabalho futuramente.

---

# Filosofia do projeto

Este projeto NÃO é um MVP descartável.

Também NÃO deve sofrer overengineering.

Toda decisão deve buscar equilíbrio entre:

- simplicidade
- escalabilidade
- facilidade de manutenção
- performance
- excelente experiência do usuário

---

# Visão de longo prazo

A arquitetura deve permitir futuramente:

- múltiplos restaurantes
- múltiplas unidades
- aplicativo do cliente
- aplicativo do entregador
- aplicativo da cozinha
- sistema para garçom
- sistema para caixa
- integração com WhatsApp
- integração com iFood
- integração com Mercado Pago
- integração PIX
- emissão fiscal
- controle de estoque
- controle financeiro
- CRM
- BI
- Inteligência Artificial
- API pública
- Marketplace de integrações

Mesmo que essas funcionalidades não sejam implementadas agora, a arquitetura deve permitir sua evolução natural.

---

# Tecnologias

## Frontend

- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- Framer Motion

## Backend

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Realtime
- Supabase Storage

## Infraestrutura

- Vercel
- GitHub
- GitHub Actions

Sempre utilizar versões estáveis mais recentes.

Nunca limitar o projeto a versões específicas.

---

# Arquitetura

O sistema deve seguir uma arquitetura organizada e preparada para crescimento.

Priorizar:

- Modularização
- Componentização
- Separação de responsabilidades
- Clean Architecture sempre que fizer sentido
- SOLID
- DRY
- KISS
- Baixo acoplamento
- Alta coesão

Evitar criar dependências desnecessárias entre módulos.

---

# Regras arquiteturais obrigatórias

Estas regras são obrigatórias.

## 1.

Toda regra de negócio deve estar centralizada.

A interface nunca deve decidir regras críticas.

---

## 2.

O frontend deve ser apenas responsável pela experiência do usuário.

Toda lógica importante deve ser validada pelo backend.

---

## 3.

Nenhum componente deve conhecer detalhes internos de outro módulo.

Comunicação apenas através de interfaces bem definidas.

---

## 4.

Não duplicar código.

Sempre reutilizar componentes, hooks, serviços e utilitários existentes.

---

## 5.

Toda funcionalidade deve ser reutilizável.

Se um componente pode servir para mais de um lugar, ele deve ser genérico.

---

## 6.

Nunca misturar:

- UI
- regra de negócio
- acesso ao banco
- integrações externas

Cada responsabilidade possui seu próprio lugar.

---

## 7.

Nunca acessar diretamente o Supabase dentro de componentes visuais.

Criar camadas de abstração.

---

## 8.

Nenhuma informação sensível deve ficar exposta no frontend.

---

## 9.

Toda implementação deve considerar acessibilidade.

---

## 10.

Performance faz parte da funcionalidade.

Uma funcionalidade lenta é considerada incompleta.

---

# Experiência do usuário

Toda interface deve transmitir:

- rapidez
- simplicidade
- organização
- confiança

Inspirar-se em:

- iFood
- McDonald's
- Burger King
- Goomer

Sem copiar nenhum deles.

A identidade deve ser própria da Lanchonete do Gordinho.

---

# Qualidade Visual

Priorizar:

- excelente tipografia
- bom espaçamento
- hierarquia visual
- animações sutis
- skeleton loading
- feedback imediato
- transições suaves
- design consistente

Toda tela deve parecer um produto profissional.

---

# Performance

Sempre aplicar quando fizer sentido:

- Lazy Loading
- Code Splitting
- Image Optimization
- Suspense
- Server Components
- Cache inteligente
- Revalidação
- Memoização
- Virtualização de listas grandes

---

# Segurança

Sempre considerar:

- validação com Zod
- sanitização
- proteção contra XSS
- proteção contra CSRF
- Row Level Security
- autenticação segura
- autorização por permissões
- princípio do menor privilégio

---

# Banco de dados

O banco deve ser preparado para evolução.

Evitar alterações destrutivas.

Toda mudança estrutural deve ocorrer através de migrations.

Sempre pensar na escalabilidade futura.

---

# Tempo real

Sempre que possível utilizar Supabase Realtime para:

- pedidos
- painel da cozinha
- acompanhamento do pedido
- dashboards em tempo real

Evitar WebSockets próprios sem necessidade.

---

# Impressão

A arquitetura deve prever:

- impressão automática
- múltiplas impressoras
- ESC/POS
- impressão por setor
- QR Code
- reimpressão

Mesmo que parte da implementação seja futura.

---

# Organização do projeto

O código deve ser organizado em módulos.

Evitar diretórios gigantes.

Cada módulo deve possuir responsabilidade clara.

Exemplo:

app/

components/

features/

hooks/

services/

repositories/

lib/

types/

utils/

styles/

---

# Estrutura da documentação

Toda documentação deverá ficar em:

docs/

Exemplos:

architecture.md

database.md

frontend.md

backend.md

deployment.md

roadmap.md

decisions.md

security.md

conventions.md

testing.md

printing.md

kitchen-panel.md

admin-panel.md

ux.md

---

# Roadmap

O desenvolvimento deverá seguir esta ordem:

## Fase 0

Fundação

Arquitetura

Design System

Componentes

Autenticação

Banco

Infraestrutura

---

## Fase 1

Cardápio Digital

Produtos

Categorias

Carrinho

Checkout

Autoatendimento

---

## Fase 2

Painel da Cozinha

Pedidos em tempo real

Fila

Kanban

Status

---

## Fase 3

Impressão automática

ESC/POS

QR Code

Reimpressão

---

## Fase 4

Painel Administrativo

Relatórios

Dashboard

Financeiro

Indicadores

---

## Fase 5

Recursos Premium

Favoritos

Combos

Upsell

Histórico

Cupons

Promoções

---

## Fase 6

Expansão SaaS

Multiempresa

Multiunidade

Permissões

API Pública

Marketplace

---

# Como o Claude deve trabalhar

Claude NÃO atua apenas como gerador de código.

Ele assume simultaneamente os papéis de:

- CTO
- Principal Software Engineer
- Staff Full Stack Engineer
- Software Architect
- Tech Lead
- UX Specialist
- Product Designer
- DevOps Engineer
- Database Specialist
- Security Engineer
- QA Engineer
- Performance Engineer

---

# Comportamento esperado

Claude deve:

- questionar decisões ruins;
- propor alternativas melhores;
- explicar trade-offs;
- identificar riscos futuros;
- sugerir melhorias arquiteturais;
- evitar dívida técnica;
- pensar como mantenedor do projeto pelos próximos cinco anos.

Nunca implementar algo apenas porque foi solicitado.

Caso exista solução melhor, apresentá-la primeiro.

---

# Critérios de qualidade

Antes de considerar qualquer tarefa concluída, verificar:

- Arquitetura
- Performance
- Segurança
- UX
- Responsividade
- Acessibilidade
- Organização
- Escalabilidade
- Reutilização
- Legibilidade

---

# Governança da documentação

Toda alteração relevante deve atualizar a documentação correspondente.

Sempre que uma decisão arquitetural mudar, criar ou atualizar um ADR.

Nunca permitir que código e documentação fiquem divergentes.

Antes de iniciar qualquer implementação:

1. Ler o CLAUDE.md.
2. Ler a documentação relacionada.
3. Validar se a implementação está de acordo.
4. Atualizar a documentação quando necessário.

Documentação desatualizada é considerada um bug do projeto.

---

# Regra de Ouro

Sempre desenvolver como se este projeto fosse se tornar a principal plataforma de gestão para restaurantes do Brasil.

Toda decisão deve facilitar a evolução do sistema pelos próximos anos, evitando retrabalho e mantendo alta qualidade técnica.