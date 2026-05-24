# Finance Control

Aplicação web para controle financeiro pessoal. Registre gastos, adicione saldo, defina limites por categoria e acompanhe tudo em tempo real com gráficos e dashboard.

## Funcionalidades

- **Dashboard** — saldo atual, totais de gastos/recebimentos, gráficos por categoria e uso dos limites
- **Gastos** — cadastro de despesas e entrada de saldo
- **Limites** — criação de limites por categoria com barra de progresso
- **Histórico** — listagem completa de gastos
- **Tempo real** — dados sincronizados via Firestore
- **Validações** — impede gastos acima do limite da categoria ou sem limite cadastrado

## Stack

| Tecnologia | Uso |
|---|---|
| React + TypeScript | Interface |
| Vite | Build e dev server |
| Tailwind CSS v4 | Estilização |
| Firebase Firestore | Banco de dados |
| Recharts | Gráficos |
| React Router | Navegação |
| Lucide React | Ícones |
| React Hot Toast | Notificações |

## Pré-requisitos

- Node.js 20.19+ ou 22.12+
- Conta no [Firebase](https://firebase.google.com/) com Firestore habilitado

## Instalação

```bash
git clone <url-do-repositorio>
cd finance-control
npm install
```

## Configuração

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Firebase:

```bash
cp .env.example .env
```

Variáveis necessárias:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

No Firebase Console, crie um app Web e copie os valores de configuração. Ative o **Cloud Firestore** no modo de produção ou teste.

### Estrutura do Firestore

O app usa as seguintes coleções:

| Coleção | Documento/Campos | Descrição |
|---|---|---|
| `config` | `main` → `saldo`, `rendaMensal` | Saldo e renda mensal |
| `limits` | `keyword`, `limite`, `restante` | Limites por categoria |
| `expenses` | `keyword`, `valor`, `descricao`, `createdAt` | Gastos |
| `incomes` | `valor`, `descricao`, `createdAt` | Entradas de saldo |

## Scripts

```bash
npm run dev      # Servidor de desenvolvimento
npm run build    # Build de produção
npm run preview  # Preview do build
```

## Estrutura do projeto

```
src/
├── components/     # Componentes reutilizáveis (Layout, formulários, listas)
├── hooks/          # useFinance — estado global com Firestore
├── pages/          # Dashboard, Gastos, Limites, Histórico
├── services/       # Operações no Firestore
├── types/          # Tipos TypeScript
├── utils/          # Formatação e helpers
├── firebase.ts     # Inicialização do Firebase
├── index.css       # Design system (Tailwind v4)
└── main.tsx        # Entry point
```

## Fluxo de uso

1. Crie **limites** por categoria (ex.: `alimentacao`, `transporte`)
2. Adicione **saldo** na página de Gastos
3. Registre **gastos** vinculados a uma categoria existente
4. Acompanhe o consumo no **Dashboard** e no **Histórico**

> Gastos só são aceitos se existir um limite para a categoria e o valor não ultrapassar o restante.

## Licença

Projeto pessoal — uso livre.
# finance-control
