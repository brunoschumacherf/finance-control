import { Pencil, Trash2, X, Check } from 'lucide-react';

type ItemActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editing?: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  saving?: boolean;
};

export const ItemActions = ({ onEdit, onDelete, editing, onCancel, onSave, saving }: ItemActionsProps): JSX.Element => {
  if (editing) {
    return (
      <div className="item-actions">
        <button type="button" onClick={onCancel} className="item-action-btn" aria-label="Cancelar">
          <X size={16} />
        </button>
        <button type="button" onClick={onSave} disabled={saving} className="item-action-btn text-emerald-400" aria-label="Salvar">
          <Check size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="item-actions">
      <button type="button" onClick={onEdit} className="item-action-btn" aria-label="Editar">
        <Pencil size={16} />
      </button>
      <button type="button" onClick={onDelete} className="item-action-btn item-action-btn-danger" aria-label="Excluir">
        <Trash2 size={16} />
      </button>
    </div>
  );
};
