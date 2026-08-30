import { MarkerType } from '@xyflow/react';
import type { EntityNode, Project, RelationshipEdge } from '../types/graph';

const history = (id: string, action: string, timestamp: string) => ({
  id,
  action,
  timestamp,
});

const nodes: EntityNode[] = [
  {
    id: 'person-mira',
    type: 'entity',
    position: { x: 40, y: 160 },
    data: {
      label: 'Mira Veylan',
      entityType: 'person',
      description:
        'Fictional systems designer used to demonstrate a manually assembled research graph.',
      attributes: {
        Aliases: 'M. Veylan, Mira V.',
        'Date of birth': '12 Sep 1993 (synthetic)',
        Position: 'Lead Systems Designer',
        'Profile status': 'Demonstration record',
      },
      history: [
        history('h-mira-3', 'Position updated', '2026-08-29T16:12:00.000Z'),
        history('h-mira-2', 'Email relationship added', '2026-08-28T11:40:00.000Z'),
        history('h-mira-1', 'Entity created', '2026-08-27T09:18:00.000Z'),
      ],
    },
  },
  {
    id: 'company-lattice',
    type: 'entity',
    position: { x: 480, y: 60 },
    data: {
      label: 'Lattice Harbor Labs',
      entityType: 'company',
      description: 'Fictional applied-systems studio in the Aurora sandbox project.',
      attributes: {
        Industry: 'Research software',
        Founded: '2019 (synthetic)',
        Status: 'Active demo entity',
      },
      history: [history('h-company-1', 'Entity created', '2026-08-27T09:21:00.000Z')],
    },
  },
  {
    id: 'phone-mira',
    type: 'entity',
    position: { x: -390, y: 40 },
    data: {
      label: '+1 202 555 0146',
      entityType: 'phone',
      description: 'Reserved fictional 555 number for demonstration only.',
      attributes: { Category: 'Work', Verified: 'Not applicable — synthetic' },
      history: [history('h-phone-1', 'Entity created', '2026-08-27T09:24:00.000Z')],
    },
  },
  {
    id: 'email-mira',
    type: 'entity',
    position: { x: -410, y: 190 },
    data: {
      label: 'mira@lattice.example',
      entityType: 'email',
      description: 'Fictional address using the reserved .example domain.',
      attributes: { Category: 'Work', Domain: 'lattice.example' },
      history: [history('h-email-1', 'Entity created', '2026-08-27T09:25:00.000Z')],
    },
  },
  {
    id: 'username-mira',
    type: 'entity',
    position: { x: -390, y: 340 },
    data: {
      label: 'mira_vector',
      entityType: 'username',
      description: 'Synthetic username entered for this demo project.',
      attributes: { Context: 'Design community', Status: 'Demo only' },
      history: [history('h-user-1', 'Entity created', '2026-08-27T09:27:00.000Z')],
    },
  },
  {
    id: 'education-meridian',
    type: 'entity',
    position: { x: 30, y: 500 },
    data: {
      label: 'Meridian Institute',
      entityType: 'education',
      description: 'Fictional institute for computational design.',
      attributes: { Program: 'Systems Design', Period: '2012–2016 (synthetic)' },
      history: [history('h-education-1', 'Entity created', '2026-08-27T09:31:00.000Z')],
    },
  },
  {
    id: 'social-mira',
    type: 'entity',
    position: { x: 490, y: 265 },
    data: {
      label: '@mira_vector / Orbit',
      entityType: 'social',
      description: 'Fictional social profile on an imaginary platform.',
      attributes: { Platform: 'Orbit (fictional)', Handle: '@mira_vector' },
      history: [history('h-social-1', 'Entity created', '2026-08-27T09:33:00.000Z')],
    },
  },
  {
    id: 'website-lattice',
    type: 'entity',
    position: { x: 860, y: 20 },
    data: {
      label: 'lattice-harbor.example',
      entityType: 'website',
      description: 'Reserved demonstration domain for Lattice Harbor Labs.',
      attributes: { Protocol: 'HTTPS', Category: 'Company site' },
      history: [history('h-site-1', 'Entity created', '2026-08-27T09:35:00.000Z')],
    },
  },
  {
    id: 'document-brief',
    type: 'entity',
    position: { x: 850, y: 210 },
    data: {
      label: 'Project Aurora Brief',
      entityType: 'document',
      description: 'Synthetic project brief imported into the local workspace.',
      attributes: { Format: 'PDF', Classification: 'Internal demo', Pages: '14' },
      history: [history('h-document-1', 'Entity created', '2026-08-27T09:37:00.000Z')],
    },
  },
  {
    id: 'address-studio',
    type: 'entity',
    position: { x: 500, y: 480 },
    data: {
      label: '42 Aurora Quay, Northport',
      entityType: 'address',
      description: 'Entirely fictional studio address.',
      attributes: { Category: 'Studio', Country: 'Fictional jurisdiction' },
      history: [history('h-address-1', 'Entity created', '2026-08-27T09:39:00.000Z')],
    },
  },
];

const edge = (
  id: string,
  source: string,
  target: string,
  label: string,
  createdAt: string,
): RelationshipEdge => ({
  id,
  source,
  target,
  type: 'smoothstep',
  label,
  data: { label, createdAt },
  markerEnd: { type: MarkerType.ArrowClosed },
});

const edges: RelationshipEdge[] = [
  edge('e-mira-phone', 'person-mira', 'phone-mira', 'owns', '2026-08-27T09:42:00.000Z'),
  edge('e-mira-email', 'person-mira', 'email-mira', 'uses', '2026-08-27T09:43:00.000Z'),
  edge('e-mira-user', 'person-mira', 'username-mira', 'uses', '2026-08-27T09:44:00.000Z'),
  edge(
    'e-mira-company',
    'person-mira',
    'company-lattice',
    'works at',
    '2026-08-27T09:45:00.000Z',
  ),
  edge(
    'e-mira-education',
    'person-mira',
    'education-meridian',
    'studied at',
    '2026-08-27T09:46:00.000Z',
  ),
  edge(
    'e-mira-social',
    'person-mira',
    'social-mira',
    'owns',
    '2026-08-27T09:47:00.000Z',
  ),
  edge(
    'e-company-site',
    'company-lattice',
    'website-lattice',
    'operates',
    '2026-08-27T09:48:00.000Z',
  ),
  edge(
    'e-company-document',
    'company-lattice',
    'document-brief',
    'referenced in',
    '2026-08-27T09:49:00.000Z',
  ),
  edge(
    'e-company-address',
    'company-lattice',
    'address-studio',
    'located at',
    '2026-08-27T09:50:00.000Z',
  ),
];

export const demoProject: Project = {
  version: 1,
  name: 'Project Aurora / Sandbox',
  updatedAt: '2026-08-30T20:45:00.000Z',
  nodes,
  edges,
};

export const createDemoProject = (): Project => structuredClone(demoProject);
