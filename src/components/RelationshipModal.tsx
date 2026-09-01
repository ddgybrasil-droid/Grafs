import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { ArrowRight, Link2, X } from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import type { EntityNode } from '../types/graph';

export interface RelationshipDraft {
  source: string;
  target: string;
  label: string;
}

interface RelationshipModalProps {
  nodes: EntityNode[];
  initialSourceId?: string;
  onClose: () => void;
  onSave: (draft: RelationshipDraft) => void;
}

const relationshipSuggestions = [
  'owns',
  'uses',
  'works at',
  'studied at',
  'operates',
  'located at',
  'related to',
];

export const RelationshipModal = ({
  nodes,
  initialSourceId,
  onClose,
  onSave,
}: RelationshipModalProps) => {
  const [source, setSource] = useState(initialSourceId || nodes[0]?.id || '');
  const [target, setTarget] = useState(
    nodes.find((node) => node.id !== (initialSourceId || nodes[0]?.id))?.id || '',
  );
  const [label, setLabel] = useState('related to');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (source && target && source !== target && label.trim()) {
      onSave({ source, target, label: label.trim() });
    }
  };

  const renderEntitySummary = (nodeId: string) => {
    const node = nodes.find((candidate) => candidate.id === nodeId);
    if (!node) return null;
    const config = ENTITY_CONFIG[node.data.entityType];
    const Icon = config.icon;
    return (
      <div className="relationship-entity">
        <span style={{ color: config.color }}>
          <Icon size={18} />
        </span>
        <div>
          <strong>{node.data.label}</strong>
          <small>{config.label}</small>
        </div>
      </div>
    );
  };

  const stopPropagation = (event: MouseEvent) => event.stopPropagation();

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal relationship-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="relationship-modal-title"
        onMouseDown={stopPropagation}
      >
        <header className="modal__header">
          <div>
            <span className="eyebrow">Create relationship</span>
            <h2 id="relationship-modal-title">Connect two entities</h2>
          </div>
          <button className="icon-button" type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit}>
          <div className="modal__body">
            <div className="relationship-preview">
              {renderEntitySummary(source)}
              <div>
                <ArrowRight size={18} />
                <span>{label || 'relationship'}</span>
              </div>
              {renderEntitySummary(target)}
            </div>

            <div className="form-grid form-grid--two">
              <label className="form-field">
                <span>Source entity</span>
                <select value={source} onChange={(event) => setSource(event.target.value)}>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id}>
                      {node.data.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Target entity</span>
                <select value={target} onChange={(event) => setTarget(event.target.value)}>
                  {nodes.map((node) => (
                    <option key={node.id} value={node.id} disabled={node.id === source}>
                      {node.data.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field form-field--full">
                <span>Relationship label</span>
                <div className="input-with-icon">
                  <Link2 size={15} />
                  <input
                    autoFocus
                    required
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    placeholder="e.g. works at"
                  />
                </div>
              </label>
            </div>

            <div className="suggestion-list">
              {relationshipSuggestions.map((suggestion) => (
                <button
                  className={label === suggestion ? 'is-selected' : ''}
                  type="button"
                  key={suggestion}
                  onClick={() => setLabel(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {source === target && (
              <p className="form-error">Choose two different entities to create a relationship.</p>
            )}
          </div>

          <footer className="modal__footer">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button
              className="primary-button"
              type="submit"
              disabled={!source || !target || source === target || !label.trim()}
            >
              Create relationship
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
