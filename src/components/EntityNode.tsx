import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { MoreHorizontal } from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import type { EntityNode as EntityNodeType } from '../types/graph';

const EntityNodeComponent = ({ data, selected }: NodeProps<EntityNodeType>) => {
  const config = ENTITY_CONFIG[data.entityType];
  const Icon = config.icon;

  return (
    <article
      className={`entity-node ${selected ? 'is-selected' : ''}`}
      style={{ '--entity-color': config.color } as React.CSSProperties}
      aria-label={`${config.label}: ${data.label}`}
    >
      <Handle id="target-left" type="target" position={Position.Left} />
      <Handle id="target-top" type="target" position={Position.Top} />

      <div className="entity-node__accent" />
      <div className="entity-node__icon">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="entity-node__content">
        <span className="entity-node__type">{config.label}</span>
        <strong title={data.label}>{data.label}</strong>
        <p>{data.description || config.description}</p>
      </div>
      <MoreHorizontal className="entity-node__more" size={16} aria-hidden="true" />

      <Handle id="source-right" type="source" position={Position.Right} />
      <Handle id="source-bottom" type="source" position={Position.Bottom} />
    </article>
  );
};

export const EntityNode = memo(EntityNodeComponent);
