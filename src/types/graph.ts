import type { Edge, Node } from '@xyflow/react';

export const ENTITY_TYPES = [
  'person',
  'company',
  'phone',
  'email',
  'username',
  'website',
  'address',
  'document',
  'education',
  'workplace',
  'social',
  'custom',
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface ChangeRecord {
  id: string;
  action: string;
  timestamp: string;
}

export interface EntityData extends Record<string, unknown> {
  label: string;
  entityType: EntityType;
  description: string;
  attributes: Record<string, string>;
  history: ChangeRecord[];
}

export interface RelationshipData extends Record<string, unknown> {
  label: string;
  createdAt: string;
}

export type EntityNode = Node<EntityData, 'entity'>;
export type RelationshipEdge = Edge<RelationshipData>;

export interface Project {
  version: 1;
  name: string;
  updatedAt: string;
  nodes: EntityNode[];
  edges: RelationshipEdge[];
}

export interface WorkspaceSettings {
  showMinimap: boolean;
  snapToGrid: boolean;
}
