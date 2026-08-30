import { MarkerType } from '@xyflow/react';
import { ENTITY_TYPES, type EntityType, type Project } from '../types/graph';

export const PROJECT_STORAGE_KEY = 'relation-canvas-project-v1';
export const SETTINGS_STORAGE_KEY = 'relation-canvas-settings-v1';

const isEntityType = (value: unknown): value is EntityType =>
  typeof value === 'string' && ENTITY_TYPES.includes(value as EntityType);

const asStringRecord = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => typeof entry === 'string')
      .map(([key, entry]) => [key, entry as string]),
  );
};

export const parseProject = (raw: string): Project => {
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('The selected file does not contain a project object.');
  }

  const candidate = parsed as Partial<Project>;
  if (!Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) {
    throw new Error('A valid project JSON must contain nodes and edges arrays.');
  }

  const nodes = candidate.nodes.map((node, index) => {
    if (!node || typeof node !== 'object') {
      throw new Error(`Node ${index + 1} is invalid.`);
    }

    const source = node as Project['nodes'][number];
    if (!source.id || typeof source.id !== 'string' || !source.data) {
      throw new Error(`Node ${index + 1} requires an id and data.`);
    }

    const entityType = isEntityType(source.data.entityType) ? source.data.entityType : 'custom';
    const position =
      source.position &&
      Number.isFinite(source.position.x) &&
      Number.isFinite(source.position.y)
        ? source.position
        : { x: index * 260, y: 0 };

    return {
      ...source,
      type: 'entity' as const,
      selected: false,
      position,
      data: {
        label:
          typeof source.data.label === 'string' && source.data.label.trim()
            ? source.data.label
            : `Untitled ${index + 1}`,
        entityType,
        description:
          typeof source.data.description === 'string' ? source.data.description : '',
        attributes: asStringRecord(source.data.attributes),
        history: Array.isArray(source.data.history)
          ? source.data.history.filter(
              (record) =>
                record &&
                typeof record.id === 'string' &&
                typeof record.action === 'string' &&
                typeof record.timestamp === 'string',
            )
          : [],
      },
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = candidate.edges
    .filter(
      (edge) =>
        edge &&
        typeof edge.id === 'string' &&
        typeof edge.source === 'string' &&
        typeof edge.target === 'string' &&
        nodeIds.has(edge.source) &&
        nodeIds.has(edge.target),
    )
    .map((edge) => {
      const label =
        typeof edge.data?.label === 'string'
          ? edge.data.label
          : typeof edge.label === 'string'
            ? edge.label
            : 'related to';

      return {
        ...edge,
        type: 'smoothstep',
        selected: false,
        label,
        data: {
          label,
          createdAt:
            typeof edge.data?.createdAt === 'string'
              ? edge.data.createdAt
              : new Date().toISOString(),
        },
        markerEnd: { type: MarkerType.ArrowClosed },
      };
    });

  return {
    version: 1,
    name:
      typeof candidate.name === 'string' && candidate.name.trim()
        ? candidate.name
        : 'Imported project',
    updatedAt: new Date().toISOString(),
    nodes,
    edges,
  };
};

export const loadStoredProject = (): Project | null => {
  try {
    const raw = localStorage.getItem(PROJECT_STORAGE_KEY);
    return raw ? parseProject(raw) : null;
  } catch {
    localStorage.removeItem(PROJECT_STORAGE_KEY);
    return null;
  }
};

export const saveProject = (project: Project) => {
  localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(project));
};

export const downloadProject = (project: Project) => {
  const blob = new Blob([JSON.stringify(project, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  anchor.href = url;
  anchor.download = `${safeName || 'relation-project'}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};
