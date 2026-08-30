import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock3,
  Edit3,
  Link2,
  MousePointer2,
  Network,
  Trash2,
  X,
} from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import type { EntityNode, RelationshipEdge } from '../types/graph';

interface DetailsPanelProps {
  node: EntityNode | null;
  nodes: EntityNode[];
  edges: RelationshipEdge[];
  onEdit: (node: EntityNode) => void;
  onDelete: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onClose: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('en', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const DetailsPanel = ({
  node,
  nodes,
  edges,
  onEdit,
  onDelete,
  onSelectNode,
  onClose,
}: DetailsPanelProps) => {
  if (!node) {
    return (
      <aside className="details-panel details-panel--empty">
        <div className="details-empty__visual">
          <Network size={38} strokeWidth={1.25} />
          <span />
          <span />
          <span />
        </div>
        <span className="eyebrow">Inspector</span>
        <h2>No entity selected</h2>
        <p>Select a node to inspect its profile, attributes, relationships, and local history.</p>
        <div className="details-empty__tips">
          <span>
            <MousePointer2 size={14} /> Click a node to select
          </span>
          <span>
            <Link2 size={14} /> Drag handles to connect
          </span>
        </div>
      </aside>
    );
  }

  const config = ENTITY_CONFIG[node.data.entityType];
  const Icon = config.icon;
  const related = edges
    .filter((edge) => edge.source === node.id || edge.target === node.id)
    .map((edge) => {
      const outgoing = edge.source === node.id;
      return {
        edge,
        outgoing,
        entity: nodes.find((candidate) => candidate.id === (outgoing ? edge.target : edge.source)),
      };
    })
    .filter((item): item is typeof item & { entity: EntityNode } => Boolean(item.entity));

  const relatedByType = (types: EntityNode['data']['entityType'][]) =>
    related.filter(({ entity }) => types.includes(entity.data.entityType));

  const renderLinkedValue = (types: EntityNode['data']['entityType'][]) => {
    const matches = relatedByType(types);
    if (!matches.length) return <span className="attribute-value is-muted">Not added</span>;
    return (
      <div className="inline-links">
        {matches.map(({ entity }) => (
          <button type="button" key={entity.id} onClick={() => onSelectNode(entity.id)}>
            {entity.data.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <aside className="details-panel">
      <div className="details-panel__topbar">
        <span>Entity inspector</span>
        <button className="icon-button" type="button" aria-label="Close inspector" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <header className="entity-profile">
        <div
          className="entity-profile__icon"
          style={{ '--entity-color': config.color } as React.CSSProperties}
        >
          <Icon size={24} />
        </div>
        <span className="entity-type-pill" style={{ color: config.color }}>
          {config.label}
        </span>
        <h2>{node.data.label}</h2>
        <p>{node.data.description || 'No description added yet.'}</p>
      </header>

      <div className="details-panel__actions">
        <button type="button" onClick={() => onEdit(node)}>
          <Edit3 size={15} /> Edit
        </button>
        <button className="is-danger" type="button" onClick={() => onDelete(node.id)}>
          <Trash2 size={15} /> Delete
        </button>
      </div>

      <div className="details-scroll">
        {node.data.entityType === 'person' && (
          <>
            <section className="detail-section">
              <h3>Profile</h3>
              <dl className="attribute-list">
                <div>
                  <dt>Name</dt>
                  <dd>{node.data.label}</dd>
                </div>
                <div>
                  <dt>Aliases</dt>
                  <dd>{node.data.attributes.Aliases || <span className="is-muted">Not added</span>}</dd>
                </div>
                <div>
                  <dt>Date of birth</dt>
                  <dd>
                    {node.data.attributes['Date of birth'] || (
                      <span className="is-muted">Not added</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Description</dt>
                  <dd>{node.data.description}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-section">
              <h3>Contacts</h3>
              <dl className="attribute-list">
                <div>
                  <dt>Phone</dt>
                  <dd>{renderLinkedValue(['phone'])}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{renderLinkedValue(['email'])}</dd>
                </div>
                <div>
                  <dt>Username</dt>
                  <dd>{renderLinkedValue(['username', 'social'])}</dd>
                </div>
              </dl>
            </section>

            <section className="detail-section">
              <h3>Education / Work</h3>
              <dl className="attribute-list">
                <div>
                  <dt>Education</dt>
                  <dd>{renderLinkedValue(['education'])}</dd>
                </div>
                <div>
                  <dt>Workplace</dt>
                  <dd>{renderLinkedValue(['workplace', 'company'])}</dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>
                    {node.data.attributes.Position || <span className="is-muted">Not added</span>}
                  </dd>
                </div>
              </dl>
            </section>
          </>
        )}

        {node.data.entityType !== 'person' && (
          <section className="detail-section">
            <h3>Attributes</h3>
            <dl className="attribute-list">
              {Object.entries(node.data.attributes).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              {!Object.keys(node.data.attributes).length && (
                <p className="empty-message">No custom attributes yet.</p>
              )}
            </dl>
          </section>
        )}

        <section className="detail-section">
          <div className="detail-section__title">
            <h3>Related entities</h3>
            <span>{related.length}</span>
          </div>
          <div className="related-list">
            {related.map(({ edge, entity, outgoing }) => {
              const relatedConfig = ENTITY_CONFIG[entity.data.entityType];
              const RelatedIcon = relatedConfig.icon;
              return (
                <button type="button" key={edge.id} onClick={() => onSelectNode(entity.id)}>
                  <span className="related-list__icon" style={{ color: relatedConfig.color }}>
                    <RelatedIcon size={15} />
                  </span>
                  <span>
                    <strong>{entity.data.label}</strong>
                    <small>
                      {outgoing ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
                      {edge.data?.label || String(edge.label || 'related to')}
                    </small>
                  </span>
                </button>
              );
            })}
            {!related.length && <p className="empty-message">No relationships created.</p>}
          </div>
        </section>

        <section className="detail-section">
          <div className="detail-section__title">
            <h3>Project history</h3>
            <span>{node.data.history.length}</span>
          </div>
          <div className="history-list">
            {node.data.history.map((record) => (
              <div key={record.id}>
                <span className="history-list__dot" />
                <div>
                  <strong>{record.action}</strong>
                  <small>
                    <Clock3 size={11} />
                    {dateFormatter.format(new Date(record.timestamp))}
                  </small>
                </div>
              </div>
            ))}
            {!node.data.history.length && <p className="empty-message">No changes recorded.</p>}
          </div>
        </section>
      </div>
    </aside>
  );
};
