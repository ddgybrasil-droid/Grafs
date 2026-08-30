import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type ReactFlowInstance,
  type XYPosition,
} from '@xyflow/react';
import {
  Copy,
  Edit3,
  Focus,
  GitBranch,
  Link2,
  Maximize2,
  Plus,
  Trash2,
} from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import type {
  EntityNode as EntityNodeType,
  EntityType,
  RelationshipEdge,
  WorkspaceSettings,
} from '../types/graph';
import type { LayoutDirection } from '../utils/layout';
import { EntityNode } from './EntityNode';

const nodeTypes = { entity: EntityNode };

type ContextMenuState =
  | { kind: 'node'; nodeId: string; x: number; y: number }
  | { kind: 'edge'; edgeId: string; x: number; y: number }
  | { kind: 'pane'; position: XYPosition; x: number; y: number };

interface GraphCanvasProps {
  nodes: EntityNodeType[];
  edges: RelationshipEdge[];
  hiddenTypes: Set<EntityType>;
  settings: WorkspaceSettings;
  selectedNodeId: string | null;
  focusRequest: { nodeId: string; nonce: number } | null;
  onNodesChange: (changes: NodeChange<EntityNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange<RelationshipEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  onSelectNode: (nodeId: string | null) => void;
  onEditNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onCreateEntityAt: (position: XYPosition) => void;
  onCreateRelationship: (sourceId?: string) => void;
  onLayout: (direction: LayoutDirection) => void;
}

export const GraphCanvas = ({
  nodes,
  edges,
  hiddenTypes,
  settings,
  selectedNodeId,
  focusRequest,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onDeleteEdge,
  onDuplicateNode,
  onCreateEntityAt,
  onCreateRelationship,
  onLayout,
}: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [instance, setInstance] =
    useState<ReactFlowInstance<EntityNodeType, RelationshipEdge> | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const visibleNodes = useMemo(
    () => nodes.filter((node) => !hiddenTypes.has(node.data.entityType)),
    [hiddenTypes, nodes],
  );
  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes],
  );
  const visibleEdges = useMemo(
    () =>
      edges.filter(
        (edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
      ),
    [edges, visibleNodeIds],
  );

  useEffect(() => {
    if (!instance || !focusRequest) return;
    const node = instance.getNode(focusRequest.nodeId);
    if (node) {
      void instance.fitView({
        nodes: [node],
        duration: 520,
        padding: 1.4,
        minZoom: 0.9,
        maxZoom: 1.15,
      });
    }
  }, [focusRequest, instance]);

  const getMenuPosition = (event: MouseEvent) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    return {
      x: Math.min(event.clientX - (bounds?.left || 0), (bounds?.width || 900) - 190),
      y: Math.min(event.clientY - (bounds?.top || 0), (bounds?.height || 700) - 180),
    };
  };

  const closeContextMenu = () => setContextMenu(null);

  const fitCanvas = () => {
    closeContextMenu();
    void instance?.fitView({ padding: 0.18, duration: 550, maxZoom: 1.05 });
  };

  return (
    <main className="graph-shell" ref={containerRef}>
      <div className="canvas-meta">
        <div>
          <span className="canvas-meta__pulse" />
          <span>
            {visibleNodes.length} of {nodes.length} entities
          </span>
          <i />
          <span>{visibleEdges.length} visible links</span>
        </div>
        <span className="canvas-meta__hint">Right-click for actions</span>
      </div>

      <div className="canvas-toolbar">
        <button type="button" onClick={() => onCreateRelationship(selectedNodeId || undefined)}>
          <Link2 size={15} />
          Connect
        </button>
        <button type="button" onClick={() => onLayout('LR')}>
          <GitBranch size={15} />
          Auto layout
        </button>
        <span />
        <button type="button" onClick={fitCanvas}>
          <Focus size={15} />
          Center / Reset view
        </button>
      </div>

      <ReactFlow<EntityNodeType, RelationshipEdge>
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onInit={setInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          closeContextMenu();
          onSelectNode(node.id);
        }}
        onNodeDoubleClick={(_, node) => onEditNode(node.id)}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          const position = getMenuPosition(event);
          onSelectNode(node.id);
          setContextMenu({ kind: 'node', nodeId: node.id, ...position });
        }}
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault();
          setContextMenu({ kind: 'edge', edgeId: edge.id, ...getMenuPosition(event) });
        }}
        onPaneClick={() => {
          closeContextMenu();
          onSelectNode(null);
        }}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          if (!instance) return;
          const clientPosition = { x: event.clientX, y: event.clientY };
          setContextMenu({
            kind: 'pane',
            position: instance.screenToFlowPosition(clientPosition),
            ...getMenuPosition(event as MouseEvent),
          });
        }}
        onSelectionChange={({ nodes: selectedNodes }) => {
          if (selectedNodes.length) onSelectNode(selectedNodes.at(-1)?.id || null);
        }}
        fitView
        fitViewOptions={{ padding: 0.16, maxZoom: 1 }}
        colorMode="dark"
        minZoom={0.22}
        maxZoom={1.8}
        snapToGrid={settings.snapToGrid}
        snapGrid={[20, 20]}
        deleteKeyCode={['Backspace', 'Delete']}
        selectionOnDrag
        panOnScroll
        zoomOnScroll={false}
        zoomActivationKeyCode={['Meta', 'Control']}
        multiSelectionKeyCode={['Meta', 'Control']}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#5f6879', strokeWidth: 1.35 },
          labelStyle: { fill: '#a9b1c1', fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: '#11151c', fillOpacity: 0.94 },
          labelBgPadding: [7, 4],
          labelBgBorderRadius: 4,
        }}
        connectionLineStyle={{ stroke: '#8b5cf6', strokeWidth: 1.5 }}
        ariaLabelConfig={{
          'node.a11yDescription.default':
            'Press Enter or Space to select a node. Press Delete to remove it.',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={22}
          size={1.2}
          color="#242933"
          bgColor="#080a0e"
        />
        <Controls position="bottom-left" showInteractive={false} />
        {settings.showMinimap && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeStrokeWidth={3}
            nodeColor={(node) =>
              ENTITY_CONFIG[(node as EntityNodeType).data.entityType]?.color || '#64748b'
            }
            maskColor="rgba(4, 6, 9, 0.72)"
          />
        )}
      </ReactFlow>

      {contextMenu?.kind === 'node' && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <span>Entity actions</span>
          <button
            type="button"
            onClick={() => {
              onEditNode(contextMenu.nodeId);
              closeContextMenu();
            }}
          >
            <Edit3 size={14} /> Edit entity
          </button>
          <button
            type="button"
            onClick={() => {
              onCreateRelationship(contextMenu.nodeId);
              closeContextMenu();
            }}
          >
            <Link2 size={14} /> Create relationship
          </button>
          <button
            type="button"
            onClick={() => {
              onDuplicateNode(contextMenu.nodeId);
              closeContextMenu();
            }}
          >
            <Copy size={14} /> Duplicate
          </button>
          <i />
          <button
            className="is-danger"
            type="button"
            onClick={() => {
              onDeleteNode(contextMenu.nodeId);
              closeContextMenu();
            }}
          >
            <Trash2 size={14} /> Delete entity
          </button>
        </div>
      )}

      {contextMenu?.kind === 'edge' && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <span>Relationship actions</span>
          <button
            className="is-danger"
            type="button"
            onClick={() => {
              onDeleteEdge(contextMenu.edgeId);
              closeContextMenu();
            }}
          >
            <Trash2 size={14} /> Delete relationship
          </button>
        </div>
      )}

      {contextMenu?.kind === 'pane' && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <span>Canvas actions</span>
          <button
            type="button"
            onClick={() => {
              onCreateEntityAt(contextMenu.position);
              closeContextMenu();
            }}
          >
            <Plus size={14} /> New entity here
          </button>
          <button type="button" onClick={fitCanvas}>
            <Maximize2 size={14} /> Fit all entities
          </button>
        </div>
      )}
    </main>
  );
};
