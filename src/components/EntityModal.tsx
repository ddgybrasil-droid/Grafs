import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import { ENTITY_TYPES, type EntityNode, type EntityType } from '../types/graph';

export interface EntityDraft {
  label: string;
  entityType: EntityType;
  description: string;
  attributes: Record<string, string>;
}

interface AttributeRow {
  id: string;
  key: string;
  value: string;
}

interface EntityModalProps {
  node?: EntityNode | null;
  onClose: () => void;
  onSave: (draft: EntityDraft) => void;
}

const defaultRows = (type: EntityType): AttributeRow[] =>
  type === 'person'
    ? [
        { id: crypto.randomUUID(), key: 'Aliases', value: '' },
        { id: crypto.randomUUID(), key: 'Date of birth', value: '' },
        { id: crypto.randomUUID(), key: 'Position', value: '' },
      ]
    : [{ id: crypto.randomUUID(), key: '', value: '' }];

export const EntityModal = ({ node, onClose, onSave }: EntityModalProps) => {
  const [label, setLabel] = useState(node?.data.label || '');
  const [entityType, setEntityType] = useState<EntityType>(node?.data.entityType || 'person');
  const [description, setDescription] = useState(node?.data.description || '');
  const [attributes, setAttributes] = useState<AttributeRow[]>(
    node
      ? Object.entries(node.data.attributes).map(([key, value]) => ({
          id: crypto.randomUUID(),
          key,
          value,
        }))
      : defaultRows('person'),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleTypeChange = (type: EntityType) => {
    setEntityType(type);
    if (!node && type === 'person' && attributes.every((row) => !row.key && !row.value)) {
      setAttributes(defaultRows(type));
    }
  };

  const updateRow = (id: string, field: 'key' | 'value', value: string) => {
    setAttributes((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const attributeRecord = Object.fromEntries(
      attributes
        .map((row) => [row.key.trim(), row.value.trim()])
        .filter(([key]) => Boolean(key)),
    );
    onSave({
      label: label.trim(),
      entityType,
      description: description.trim(),
      attributes: attributeRecord,
    });
  };

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal entity-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entity-modal-title"
        onMouseDown={stopPropagation}
      >
        <header className="modal__header">
          <div>
            <span className="eyebrow">{node ? 'Edit entity' : 'Create entity'}</span>
            <h2 id="entity-modal-title">{node ? node.data.label : 'Add to canvas'}</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="modal__body">
            <fieldset className="type-picker">
              <legend>Entity type</legend>
              <div>
                {ENTITY_TYPES.map((type) => {
                  const config = ENTITY_CONFIG[type];
                  const Icon = config.icon;
                  return (
                    <button
                      className={entityType === type ? 'is-selected' : ''}
                      type="button"
                      key={type}
                      onClick={() => handleTypeChange(type)}
                    >
                      <span style={{ color: config.color }}>
                        <Icon size={16} />
                      </span>
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="form-grid">
              <label className="form-field form-field--full">
                <span>Name</span>
                <input
                  autoFocus
                  required
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  placeholder="Enter an entity name"
                />
              </label>
              <label className="form-field form-field--full">
                <span>Description</span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Add concise context for this entity"
                />
              </label>
            </div>

            <section className="attribute-editor">
              <div className="attribute-editor__header">
                <div>
                  <strong>Attributes</strong>
                  <span>Project-specific structured fields</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAttributes((rows) => [
                      ...rows,
                      { id: crypto.randomUUID(), key: '', value: '' },
                    ])
                  }
                >
                  <Plus size={14} /> Add field
                </button>
              </div>
              <div className="attribute-editor__rows">
                {attributes.map((row) => (
                  <div key={row.id}>
                    <input
                      aria-label="Attribute name"
                      value={row.key}
                      onChange={(event) => updateRow(row.id, 'key', event.target.value)}
                      placeholder="Field name"
                    />
                    <input
                      aria-label="Attribute value"
                      value={row.value}
                      onChange={(event) => updateRow(row.id, 'value', event.target.value)}
                      placeholder="Value"
                    />
                    <button
                      type="button"
                      aria-label="Remove attribute"
                      onClick={() =>
                        setAttributes((rows) => rows.filter((item) => item.id !== row.id))
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {!attributes.length && (
                  <p className="empty-message">No attributes. Add one when useful.</p>
                )}
              </div>
            </section>
          </div>

          <footer className="modal__footer">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" type="submit">
              {node ? 'Save changes' : 'Create entity'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
