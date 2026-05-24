export type Expense = {
  id?: string;
  keyword: string;
  valor: number;
  descricao: string;
  mes?: string;
  createdAt: Date;
};

export type Income = {
  id?: string;
  valor: number;
  descricao: string;
  mes?: string;
  createdAt: Date;
};

export type Limit = {
  id?: string;
  keyword: string;
  limite: number;
  restante: number;
  mes?: string;
};

export type Config = {
  saldo: number;
  rendaMensal: number;
};
