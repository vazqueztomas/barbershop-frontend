interface PriceEditorProps {
  currentPrice: number;
  newPrice: string;
  onNewPriceChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function PriceEditor({
  currentPrice,
  newPrice,
  onNewPriceChange,
  onSave,
  onCancel,
}: PriceEditorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="price-editor" onClick={onCancel}>
      <div className="price-editor-content" onClick={(e) => e.stopPropagation()}>
        <h3>Cambiar Precio</h3>
        <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
          Actual: <strong>{formatCurrency(currentPrice)}</strong>
        </p>
        <div className="price-input-group">
          <label htmlFor="newPrice">Nuevo precio (ARS)</label>
          <input
            type="number"
            id="newPrice"
            value={newPrice}
            onChange={(e) => onNewPriceChange(e.target.value)}
            placeholder="0"
            step="1"
            min="0"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
          />
        </div>
        <div className="price-editor-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button onClick={onSave} className="submit-btn">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
