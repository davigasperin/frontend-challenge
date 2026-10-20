# Arquitetura — Kurio NFT Marketplace

Documento técnico com contratos, padrões arquiteturais, sincronização em tempo real e decisões de design do marketplace Kurio NFT.

---

## 1. Visão Geral da Arquitetura

O projeto é um Single Page Application (SPA) moderno em **React 19** e **TypeScript**, construído com **Vite 6** e arquitetura desacoplada em camadas:

```
┌────────────────────────────────────────────────────────┐
│                   Camada de Apresentação               │
│       React 19 + Tailwind CSS v4 + Radix UI Primitives │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                    Roteamento Declarativo              │
│       TanStack Router (Search Params type-safe)        │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│               Estado Remoto & Sincronização            │
│       TanStack Query v5 + Cliente Socket.IO Realtime   │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
┌─────────────▼──────────────┐ ┌──────────▼──────────────┐
│       Cliente REST         │ │     Eventos Realtime    │
│  Axios + Idempotency-Key   │ │ Socket.IO Client Mock   │
└─────────────┬──────────────┘ └──────────┬──────────────┘
              │                           │
┌─────────────▼───────────────────────────▼──────────────┐
│            Camada Mock (Service Worker / MSW)          │
│       Mock Service Worker v2 + In-Memory MockDB        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Contratos das APIs REST

Todos os endpoints operam sob o prefixo `/api` com payload e respostas em `application/json`.

| Método | Endpoint | Descrição | Headers Relevantes | Status Codes |
| --- | --- | --- | --- | --- |
| `GET` | `/api/nfts` | Lista paginada com busca, filtro e ordenação | — | `200` |
| `GET` | `/api/nfts/:id` | Detalhes do NFT, atributos, estoque e histórico | — | `200`, `404` |
| `GET` | `/api/favorites` | Lista de IDs de NFTs favoritados pelo usuário | `Authorization: Bearer <token>` | `200`, `401` |
| `POST` | `/api/favorites/:id` | Alterna favorito (toggle) | `Authorization: Bearer <token>` | `200`, `401` |
| `GET` | `/api/cart` | Obtém itens do carrinho e cotação consolidada | — | `200` |
| `POST` | `/api/cart` | Adiciona item/edição ao carrinho | — | `200`, `400`, `409` |
| `PATCH` | `/api/cart` | Atualiza quantidade de uma edição | — | `200`, `400` |
| `DELETE` | `/api/cart/:nftId/:editionNumber` | Remove edição do carrinho | — | `200` |
| `POST` | `/api/cart/coupon` | Aplica cupom de desconto (`KURIO10`, `VIP20`) | — | `200`, `400` |
| `DELETE` | `/api/cart/coupon` | Remove cupom aplicado | — | `200` |
| `POST` | `/api/orders` | Cria pedido de compra com checkout | `Idempotency-Key`, `Authorization` | `201`, `400`, `401`, `409`, `504` |
| `GET` | `/api/orders/:id` | Consulta status e detalhes do pedido | — | `200`, `404` |
| `GET` | `/api/wallets` | Lista carteiras vinculadas ao usuário | `Authorization: Bearer <token>` | `200`, `401` |
| `POST` | `/api/wallets` | Cadastra nova carteira (`0x...`) | `Authorization: Bearer <token>` | `201`, `400`, `401` |
| `GET` | `/api/auth/me` | Retorna o usuário autenticado na sessão | `Authorization: Bearer <token>` | `200`, `401` |
| `POST` | `/api/auth/login` | Autentica usuário por e-mail e senha | — | `200`, `401` |
| `POST` | `/api/auth/register` | Cadastra novo colecionador | — | `201`, `400`, `409` |
| `POST` | `/api/auth/logout` | Encerra sessão do usuário | — | `200` |
| `PATCH` | `/api/profile` | Atualiza dados cadastrais do perfil | `Authorization: Bearer <token>` | `200`, `401` |
| `POST` | `/api/profile/change-password` | Altera senha do usuário | `Authorization: Bearer <token>` | `200`, `400`, `401` |
| `GET` | `/api/scenarios` | Consulta flags ativas de cenários de teste | — | `200` |
| `POST` | `/api/scenarios` | Altera latência, falhas e flags de teste | — | `200` |
| `POST` | `/api/scenarios/reset` | Restaura base mock ao estado canônico | — | `200` |

### Parâmetros de Consulta em `/api/nfts`

| Parâmetro | Tipo | Padrão | Descrição |
| --- | --- | --- | --- |
| `search` | `string` | `""` | Busca textual por nome, coleção ou descrição |
| `category` | `string` | `"all"` | Filtro por categoria (`art`, `gaming`, `photography`, `collectibles`) |
| `sort` | `string` | `"recent"` | Ordenação (`recent`, `price-asc`, `price-desc`) |
| `page` | `number` | `1` | Página atual da paginação |
| `limit` | `number` | `6` | Quantidade de itens por página |

---

## 3. Eventos em Tempo Real (Socket.IO)

A aplicação utiliza cliente `socket.io-client` com transporte WebSocket e fallback de polling interceptado pelo Mock Service Worker via `@mswjs/socket.io-binding`.

### `nft.updated`

Disparado sempre que o preço de mercado ou o estoque disponível de uma edição for alterado.

```json
{
  "nftId": "nft-1",
  "priceEth": "2.85",
  "stockAvailable": 3,
  "version": 4
}
```

### `order.updated`

Disparado durante a transição de estado da liquidação do pedido após checkout.

```json
{
  "orderId": "order-1740000000000",
  "status": "confirmed",
  "transactionHash": "0x7f9a1...c4b2",
  "version": 2
}
```

---

## 4. Estratégia de Conciliação: REST ↔ Tempo Real

Para evitar condições de corrida (race conditions), leituras inconsistentes e duplicações de eventos, adota-se a seguinte estratégia:

1. **Versionamento Sequencial Monotônico (`version`)**:
   - Cada payload em tempo real contém uma propriedade `version` inteira auto-incremental.
   - O cliente mantém um mapa local `eventVersions: Map<string, number>`. Eventos recebidos com `version <= lastSeenVersion` são descartados imediatamente.

2. **TanStack Query como Fonte Única da Verdade**:
   - Ao receber `nft.updated`, o listener do Socket.IO atualiza o cache otimista do TanStack Query (`queryClient.setQueryData`) para resposta instantânea na UI.
   - Imediatamente após, marca a query como stale e agenda refetch em segundo plano para garantir integridade referencial com o backend.

3. **Validação Concorrente no Carrinho**:
   - Quando `nft.updated` reduz o estoque abaixo da quantidade no carrinho do usuário, o carrinho exibe aviso não intrusivo com badge de ajuste e impede o checkout até o usuário confirmar a nova quantidade.

4. **Tratamento de Desconexão**:
   - O cliente expõe o indicador de conectividade em tempo real.
   - Ao reconectar (`reconnect`), o cliente invalida todas as queries ativas para puxar o estado consolidado via REST.

---

## 5. Política de Cache e Gerenciamento de Estado

| Recurso | `staleTime` | `gcTime` | Política de Invalidação |
| --- | --- | --- | --- |
| Catálogo (`/api/nfts`) | 30 segundos | 5 minutos | Invalidado por filtros e evento `nft.updated` |
| Detalhe de NFT (`/api/nfts/:id`) | 15 segundos | 10 minutos | Atualizado otimisticamente por `nft.updated` |
| Carrinho (`/api/cart`) | 0 segundos | 5 minutos | Invalidado após qualquer mutação (`add`, `patch`, `delete`, `coupon`) |
| Sessão (`/api/auth/me`) | 5 minutos | 15 minutos | Invalidado em `login`, `logout` e evento `kurio:unauthorized` (401) |
| Carteiras (`/api/wallets`) | 1 minuto | 10 minutos | Invalidado em novo cadastro de carteira |

---

## 6. Sessão, Autenticação e Armazenamento

- **Tokens JWT Simulados**: Armazenados sob a chave `kurio_auth_token` no `localStorage`.
- **Interceptors Axios**: Injetam automaticamente `Authorization: Bearer <token>` em requisições protegidas.
- **Tratamento Global de 401**: Interceptor de resposta dispara evento de janela `kurio:unauthorized`, limpando o token e redirecionando o usuário para login com aviso contextual.
- **Persistência de Dados**: O banco mock (`mockDb`) sincroniza todas as alterações no `localStorage` sob a chave `kurio_mock_db_v1`, persistindo favoritos, carrinho, pedidos e carteiras entre recarregamentos da página.

---

## 7. Decisões de Design & UX

1. **URL como Estado (Deep Linking)**:
   - Todos os filtros de catálogo (`search`, `category`, `sort`, `page`) e abas ativas são serializados nos search params via TanStack Router.
   - Compartilhamento e recarregamento preservam exatamente a mesma visualização.

2. **Idempotência no Checkout**:
   - Todo checkout gera um `Idempotency-Key` único (UUID v4) via header HTTP.
   - Retentativas em caso de instabilidade de rede não criam pedidos duplicados.

3. **Painel de Cenários de Teste**:
   - Componente flutuante colapsável no canto inferior da aplicação (`ScenarioPanel`), permitindo alternar instantaneamente:
     - Latência de rede configurável (0ms a 2000ms).
     - Taxa de falhas transitórias HTTP 500.
     - Simulação de sessão expirada (401).
     - Simulação de esgotamento de estoque no checkout (409).
     - Simulação de timeout de gateway (504).
     - Botão de restauração rápida para o estado canônico inicial.

4. **Acessibilidade WCAG 2.1 AA**:
   - Skip link ("Pular para o conteúdo principal") no topo do layout.
   - `:focus-visible` customizado com anel contrastante (`#D28A4C`).
   - Labels e atributos ARIA em botões iconográficos, inputs e diálogos modais (Radix UI).
   - Suporte a `prefers-reduced-motion` com desativação de animações de shimmer.

5. **Performance & Core Web Vitals**:
   - Code-splitting manual no Vite separando vendors de terceiros (`vendor-react`, `vendor-tanstack`, `vendor-msw`, `vendor-icons`, `vendor-zod`).
   - Imagens com dimensões explícitas, `loading="lazy"` para itens abaixo da dobra e `fetchPriority="high"` para o elemento LCP do Hero.
   - Auditoria Lighthouse com scores: Performance 99, Acessibilidade 100, Melhores Práticas 96, SEO 92.

---

## 8. Desvios e Adaptações do Figma

| Elemento Figma | Implementação | Justificativa |
| --- | --- | --- |
| Estados de Loading | Skeleton screens com shimmer animado | Figma continha apenas estados finais; adicionado feedback visual assíncrono |
| Toast de Feedback | Toasts contextuais no canto inferior direito | Confirmação explícita de ações como adição ao carrinho, cópia de endereço e erros |
| Abas de Mobile | Barra de navegação inferior flutuante (`MobileTabBar`) | Melhora a ergonomia em telas sensíveis ao toque (polegar) |
| Feedback de Estoque | Badge dinâmico de "Restam apenas X edições" | Mitiga frustração do usuário antes de iniciar o fluxo de checkout |

---

## 9. Limitações Conhecidas

- Transações blockchain, extensões Web3 (ex: MetaMask) e gateways de pagamento reais estão fora do escopo, sendo emuladas pelo MSW.
- Imagens remotas utilizam o serviço Unsplash como provedor de mock; conexões offline dependem do cache prévio do navegador.
