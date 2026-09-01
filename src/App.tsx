import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  MarkerType,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import { createDemoProject } from './data/demoProject';
import { DetailsPanel } from './components/DetailsPanel';
import { EntityModal, type EntityDraft } from './components/EntityModal';
import { GraphCanvas } from './components/GraphCanvas';
import {
  RelationshipModal,
  type RelationshipDraft,
} from './components/RelationshipModal';
import { Sidebar } from './components/Sidebar';
import { Toast, type ToastMessage } from './components/Toast';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import type {
  EntityNode,
  EntityType,
  Project,
  RelationshipEdge,
  WorkspaceSettings,
} from './types/graph';
import { layoutGraph, type LayoutDirection } from './utils/layout';
import {
  SETTINGS_STORAGE_KEY,
  downloadProject,
  loadStoredProject,
  parseProject,
  saveProject,
} from './utils/projectStorage';

type EntityModalState =
  | { mode: 'create'; position?: XYPosition }
  | { mode: 'edit'; nodeId: string }
  | null;

const defaultSettings: WorkspaceSettings = {
  showMinimap: true,
  snapToGrid: false,
};

const loadSettings = (): WorkspaceSettings => {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const now = () => new Date().toISOString();

const createRelationshipEdge = ({
  source,
  target,
  label,
}: RelationshipDraft): RelationshipEdge => ({
  id: `edge-${crypto.randomUUID()}`,
  source,
  target,
  type: 'smoothstep',
  label,
  data: { label, createdAt: now() },
  markerEnd: { type: MarkerType.ArrowClosed },
});

const App = () => {
  const [project, setProject] = useState<Project>(() => loadStoredProject() || createDemoProject());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set());
  const [settings, setSettings] = useState<WorkspaceSettings>(loadSettings);
  const [entityModal, setEntityModal] = useState<EntityModalState>(null);
  const [relationshipSourceId, setRelationshipSourceId] = useState<string | null>(null);
  const [focusRequest, setFocusRequest] = useState<{
    nodeId: string;
    nonce: number;
  } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const selectedNode = useMemo(
    () => project.nodes.find((node) => node.id === selectedNodeId) || null,
    [project.nodes, selectedNodeId],
  );
  const editedNode =
    entityModal?.mode === 'edit'
      ? project.nodes.find((node) => node.id === entityModal.nodeId) || null
      : null;

  useEffect(() => {
    const timeout = window.setTimeout(() => saveProject(project), 180);
    return () => window.clearTimeout(timeout);
  }, [project]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (selectedNodeId && !project.nodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNodeId(null);
    }
  }, [project.nodes, selectedNodeId]);

  const showToast = (
    tone: ToastMessage['tone'],
    title: string,
    message: string,
  ) => {
    setToast({ id: Date.now(), tone, title, message });
  };

  const handleNodesChange = (changes: NodeChange<EntityNode>[]) => {
    setProject((current) => {
      const removedNodeIds = new Set(
        changes.filter((change) => change.type === 'remove').map((change) => change.id),
      );
      const hasProjectMutation = changes.some(
        (change) => change.type === 'position' || change.type === 'remove',
      );

      return {
        ...current,
        updatedAt: hasProjectMutation ? now() : current.updatedAt,
        nodes: applyNodeChanges(changes, current.nodes),
        edges: removedNodeIds.size
          ? current.edges.filter(
              (edge) =>
                !removedNodeIds.has(edge.source) && !removedNodeIds.has(edge.target),
            )
          : current.edges,
      };
    });
  };

  const handleEdgesChange = (changes: EdgeChange<RelationshipEdge>[]) => {
    setProject((current) => ({
      ...current,
      updatedAt: changes.some((change) => change.type === 'remove') ? now() : current.updatedAt,
      edges: applyEdgeChanges(changes, current.edges),
    }));
  };

  const handleConnect = (connection: Connection) => {
    if (!connection.source || !connection.target || connection.source === connection.target) return;
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      edges: [
        ...current.edges,
        createRelationshipEdge({
          source: connection.source,
          target: connection.target,
          label: 'related to',
        }),
      ],
    }));
  };

  const openEditModal = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setEntityModal({ mode: 'edit', nodeId });
  };

  const saveEntity = (draft: EntityDraft) => {
    if (entityModal?.mode === 'edit') {
      setProject((current) => ({
        ...current,
        updatedAt: now(),
        nodes: current.nodes.map((node) =>
          node.id === entityModal.nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  ...draft,
                  history: [
                    {
                      id: `history-${crypto.randomUUID()}`,
                      action: 'Entity details updated',
                      timestamp: now(),
                    },
                    ...node.data.history,
                  ],
                },
              }
            : node,
        ),
      }));
      showToast('success', 'Entity updated', `${draft.label} was saved locally.`);
    } else {
      const id = `node-${crypto.randomUUID()}`;
      const position = entityModal?.position || {
        x: 120 + (project.nodes.length % 4) * 70,
        y: 100 + (project.nodes.length % 5) * 55,
      };
      const node: EntityNode = {
        id,
        type: 'entity',
        selected: true,
        position,
        data: {
          ...draft,
          history: [
            {
              id: `history-${crypto.randomUUID()}`,
              action: 'Entity created',
              timestamp: now(),
            },
          ],
        },
      };
      setProject((current) => ({
        ...current,
        updatedAt: now(),
        nodes: [
          ...current.nodes.map((candidate) => ({ ...candidate, selected: false })),
          node,
        ],
      }));
      setSelectedNodeId(id);
      setFocusRequest({ nodeId: id, nonce: Date.now() });
      showToast('success', 'Entity created', `${draft.label} is now on the canvas.`);
    }
    setEntityModal(null);
  };

  const deleteNode = (nodeId: string) => {
    const node = project.nodes.find((candidate) => candidate.id === nodeId);
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      nodes: current.nodes.filter((candidate) => candidate.id !== nodeId),
      edges: current.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      ),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (node) showToast('success', 'Entity deleted', `${node.data.label} was removed.`);
  };

  const deleteEdge = (edgeId: string) => {
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      edges: current.edges.filter((edge) => edge.id !== edgeId),
    }));
    showToast('success', 'Relationship deleted', 'The connection was removed from this project.');
  };

  const duplicateNode = (nodeId: string) => {
    const source = project.nodes.find((node) => node.id === nodeId);
    if (!source) return;
    const id = `node-${crypto.randomUUID()}`;
    const duplicated: EntityNode = {
      ...source,
      id,
      selected: true,
      position: { x: source.position.x + 54, y: source.position.y + 54 },
      data: {
        ...structuredClone(source.data),
        label: `${source.data.label} copy`,
        history: [
          {
            id: `history-${crypto.randomUUID()}`,
            action: 'Entity duplicated',
            timestamp: now(),
          },
        ],
      },
    };
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      nodes: [
        ...current.nodes.map((node) => ({ ...node, selected: false })),
        duplicated,
      ],
    }));
    setSelectedNodeId(id);
    setFocusRequest({ nodeId: id, nonce: Date.now() });
  };

  const createRelationship = (draft: RelationshipDraft) => {
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      edges: [...current.edges, createRelationshipEdge(draft)],
    }));
    setRelationshipSourceId(null);
    showToast(
      'success',
      'Relationship created',
      `The “${draft.label}” connection was added.`,
    );
  };

  const applyLayout = (direction: LayoutDirection) => {
    setProject((current) => ({
      ...current,
      updatedAt: now(),
      nodes: layoutGraph(current.nodes, current.edges, direction),
    }));
  };

  const selectAndFocusNode = (nodeId: string) => {
    const node = project.nodes.find((candidate) => candidate.id === nodeId);
    if (node && hiddenTypes.has(node.data.entityType)) {
      setHiddenTypes((current) => {
        const next = new Set(current);
        next.delete(node.data.entityType);
        return next;
      });
    }
    setProject((current) => {
      const selectionChanged = current.nodes.some(
        (candidate) => Boolean(candidate.selected) !== (candidate.id === nodeId),
      );
      if (!selectionChanged) return current;
      return {
        ...current,
        nodes: current.nodes.map((candidate) => ({
          ...candidate,
          selected: candidate.id === nodeId,
        })),
      };
    });
    setSelectedNodeId(nodeId);
    setFocusRequest({ nodeId, nonce: Date.now() });
  };

  const toggleType = (type: EntityType) => {
    setHiddenTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
    if (selectedNode?.data.entityType === type && !hiddenTypes.has(type)) {
      setSelectedNodeId(null);
    }
  };

  const importProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const imported = parseProject(await file.text());
      setProject(imported);
      setSelectedNodeId(null);
      setHiddenTypes(new Set());
      if (imported.nodes[0]) {
        setFocusRequest({ nodeId: imported.nodes[0].id, nonce: Date.now() });
      }
      showToast(
        'success',
        'Project imported',
        `${imported.nodes.length} entities and ${imported.edges.length} links loaded.`,
      );
    } catch (error) {
      showToast(
        'error',
        'Import failed',
        error instanceof Error ? error.message : 'The JSON file could not be read.',
      );
    }
  };

  const restoreDemo = () => {
    if (!window.confirm('Replace the current project with the synthetic demo project?')) return;
    const restored = createDemoProject();
    setProject({ ...restored, updatedAt: now() });
    setSelectedNodeId(null);
    setHiddenTypes(new Set());
    showToast('success', 'Demo restored', 'The synthetic Aurora project is ready.');
  };

  return (
    <div className="app-shell">
      <Sidebar
        projectName={project.name}
        nodes={project.nodes}
        edgeCount={project.edges.length}
        hiddenTypes={hiddenTypes}
        settings={settings}
        onNewEntity={() => setEntityModal({ mode: 'create' })}
        onNewRelationship={() => setRelationshipSourceId(selectedNodeId || '')}
        onImport={() => importInputRef.current?.click()}
        onExport={() => {
          downloadProject(project);
          showToast('success', 'Project exported', 'A portable JSON file was downloaded.');
        }}
        onSelectNode={selectAndFocusNode}
        onToggleType={toggleType}
        onLayout={applyLayout}
        onSettingsChange={setSettings}
        onRestoreDemo={restoreDemo}
      />

      <section className="workspace">
        <WorkspaceHeader projectName={project.name} updatedAt={project.updatedAt} />
        <div className="workspace__body">
          <GraphCanvas
            nodes={project.nodes}
            edges={project.edges}
            hiddenTypes={hiddenTypes}
            settings={settings}
            selectedNodeId={selectedNodeId}
            focusRequest={focusRequest}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={handleConnect}
            onSelectNode={setSelectedNodeId}
            onEditNode={openEditModal}
            onDeleteNode={deleteNode}
            onDeleteEdge={deleteEdge}
            onDuplicateNode={duplicateNode}
            onCreateEntityAt={(position) => setEntityModal({ mode: 'create', position })}
            onCreateRelationship={(sourceId) => setRelationshipSourceId(sourceId || '')}
            onLayout={applyLayout}
          />
          <DetailsPanel
            node={selectedNode}
            nodes={project.nodes}
            edges={project.edges}
            onEdit={(node) => openEditModal(node.id)}
            onDelete={deleteNode}
            onSelectNode={selectAndFocusNode}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      </section>

      <input
        ref={importInputRef}
        className="visually-hidden"
        type="file"
        accept="application/json,.json"
        onChange={importProject}
      />

      {entityModal && (
        <EntityModal node={editedNode} onClose={() => setEntityModal(null)} onSave={saveEntity} />
      )}
      {relationshipSourceId !== null && (
        <RelationshipModal
          nodes={project.nodes}
          initialSourceId={relationshipSourceId || undefined}
          onClose={() => setRelationshipSourceId(null)}
          onSave={createRelationship}
        />
      )}
      {toast && <Toast key={toast.id} toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
