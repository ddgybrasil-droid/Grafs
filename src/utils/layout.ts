import dagre from '@dagrejs/dagre';
import { Position } from '@xyflow/react';
import type { EntityNode, RelationshipEdge } from '../types/graph';

const NODE_WIDTH = 244;
const NODE_HEIGHT = 94;

export type LayoutDirection = 'LR' | 'TB';

export const layoutGraph = (
  nodes: EntityNode[],
  edges: RelationshipEdge[],
  direction: LayoutDirection = 'LR',
): EntityNode[] => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    ranksep: 115,
    nodesep: 54,
    edgesep: 28,
    marginx: 36,
    marginy: 36,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const position = graph.node(node.id);
    const horizontal = direction === 'LR';

    return {
      ...node,
      sourcePosition: horizontal ? Position.Right : Position.Bottom,
      targetPosition: horizontal ? Position.Left : Position.Top,
      position: {
        x: position.x - NODE_WIDTH / 2,
        y: position.y - NODE_HEIGHT / 2,
      },
    };
  });
};
