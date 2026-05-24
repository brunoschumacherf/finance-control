import type { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/format';

type ExpenseListProps = { expenses: Expense[] };

export const ExpenseList = ({ expenses }: ExpenseListProps): JSX.Element => {
  if (expenses.length === 0) {
    return <div className="empty-state">Nenhum gasto cadastrado.</div>;
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div key={expense.id} className="list-item">
          <div>
            <p className="list-item-title">{expense.keyword}</p>
            <p className="list-item-meta">
              {expense.descricao || 'Sem descrição'} · {formatDate(expense.createdAt)}
            </p>
          </div>
          <strong className="list-item-value">-{formatCurrency(expense.valor)}</strong>
        </div>
      ))}
    </div>
  );
};
