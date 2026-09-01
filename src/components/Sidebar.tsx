import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';
import {
  ArrowLeftRight,
  Boxes,
  Download,
  Filter,
  GitBranch,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Upload,
  X,
} from 'lucide-react';
import { ENTITY_CONFIG } from '../config/entities';
import { ENTITY_TYPES, type EntityNode, type EntityType, type WorkspaceSettings } from '../types/graph';
import type { LayoutDirection } from '../utils/layout';

type UtilityPanel = 'search' | 'filters' | 'layout' | 'settings' | null;

interface SidebarProps {
  projectName: string;
  nodes: EntityNode[];
  edgeCount: number;
  hiddenTypes: Set<EntityType>;
  settings: WorkspaceSettings;
  onNewEntity: () => void;
  onNewRelationship: () => void;
  onImport: () => void;
  onExport: () => void;
  onSelectNode: (nodeId: string) => void;
  onToggleType: (type: EntityType) => void;
  onLayout: (direction: LayoutDirection) => void;
  onSettingsChange: (settings: WorkspaceSettings) => void;
  onRestoreDemo: () => void;
}

interface ToolButtonProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick: () => void;
}

const ToolButton = ({ icon, label, active, badge, onClick }: ToolButtonProps) => (
  <button
    className={`tool-button ${active ? 'is-active' : ''}`}
    type="button"
    onClick={onClick}
  >
    <span className="tool-button__icon">{icon}</span>
    <span>{label}</span>
    {badge && <span className="tool-button__badge">{badge}</span>}
  </button>
);

export const Sidebar = ({
  projectName,
  nodes,
  edgeCount,
  hiddenTypes,
  settings,
  onNewEntity,
  onNewRelationship,
  onImport,
  onExport,
  onSelectNode,
  onToggleType,
  onLayout,
  onSettingsChange,
  onRestoreDemo,
}: SidebarProps) => {
  const [activePanel, setActivePanel] = useState<UtilityPanel>(null);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return nodes.slice(0, 5);

    return nodes
      .filter((node) => {
        const values = [
          node.data.label,
          node.data.description,
          ENTITY_CONFIG[node.data.entityType].label,
          ...Object.values(node.data.attributes),
        ];
        return values.some((value) => value.toLowerCase().includes(normalized));
      })
      .slice(0, 8);
  }, [nodes, query]);

  const togglePanel = (panel: Exclude<UtilityPanel, null>) => {
    setActivePanel((current) => (current === panel ? null : panel));
  };

  const updateSetting =
    (key: keyof WorkspaceSettings) => (event: ChangeEvent<HTMLInputElement>) => {
      onSettingsChange({ ...settings, [key]: event.target.checked });
    };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">
          <GitBranch size={18} />
        </div>
        <div>
          <strong>Relation Canvas</strong>
          <span>Local analysis workspace</span>
        </div>
      </div>

      <div className="project-card">
        <div className="project-card__eyebrow">
          <span className="status-dot" />
          Active project
        </div>
        <strong>{projectName}</strong>
        <div className="project-card__meta">
          <span>{nodes.length} entities</span>
          <span>{edgeCount} links</span>
        </div>
      </div>

      <nav className="tool-list" aria-label="Workspace tools">
        <p className="sidebar-label">Create</p>
        <ToolButton
          icon={<Plus size={17} />}
          label="New entity"
          onClick={onNewEntity}
        />
        <ToolButton
          icon={<ArrowLeftRight size={17} />}
          label="New relationship"
          onClick={onNewRelationship}
        />

        <p className="sidebar-label sidebar-label--spaced">Project</p>
        <ToolButton icon={<Upload size={17} />} label="Import JSON" onClick={onImport} />
        <ToolButton icon={<Download size={17} />} label="Export JSON" onClick={onExport} />
        <ToolButton
          icon={<Search size={17} />}
          label="Search"
          active={activePanel === 'search'}
          onClick={() => togglePanel('search')}
        />
        <ToolButton
          icon={<Filter size={17} />}
          label="Filters"
          badge={hiddenTypes.size ? String(hiddenTypes.size) : undefined}
          active={activePanel === 'filters'}
          onClick={() => togglePanel('filters')}
        />
        <ToolButton
          icon={<LayoutDashboard size={17} />}
          label="Layout"
          active={activePanel === 'layout'}
          onClick={() => togglePanel('layout')}
        />
        <ToolButton
          icon={<Settings size={17} />}
          label="Settings"
          active={activePanel === 'settings'}
          onClick={() => togglePanel('settings')}
        />
      </nav>

      {activePanel && (
        <section className="utility-panel">
          <div className="utility-panel__header">
            <div>
              <span className="eyebrow">Workspace</span>
              <strong>
                {activePanel === 'search' && 'Search nodes'}
                {activePanel === 'filters' && 'Entity filters'}
                {activePanel === 'layout' && 'Auto layout'}
                {activePanel === 'settings' && 'View settings'}
              </strong>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Close panel"
              onClick={() => setActivePanel(null)}
            >
              <X size={15} />
            </button>
          </div>

          {activePanel === 'search' && (
            <>
              <label className="search-input search-input--sidebar">
                <Search size={15} />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, type, attribute…"
                />
              </label>
              <div className="search-results">
                {results.map((node) => {
                  const config = ENTITY_CONFIG[node.data.entityType];
                  const Icon = config.icon;
                  return (
                    <button
                      type="button"
                      key={node.id}
                      onClick={() => onSelectNode(node.id)}
                    >
                      <span style={{ color: config.color }}>
                        <Icon size={15} />
                      </span>
                      <span>
                        <strong>{node.data.label}</strong>
                        <small>{config.label}</small>
                      </span>
                    </button>
                  );
                })}
                {!results.length && <p className="empty-message">No matching nodes</p>}
              </div>
            </>
          )}

          {activePanel === 'filters' && (
            <div className="filter-list">
              {ENTITY_TYPES.map((type) => {
                const config = ENTITY_CONFIG[type];
                const Icon = config.icon;
                const count = nodes.filter((node) => node.data.entityType === type).length;
                return (
                  <label key={type}>
                    <input
                      type="checkbox"
                      checked={!hiddenTypes.has(type)}
                      onChange={() => onToggleType(type)}
                    />
                    <span className="filter-list__icon" style={{ color: config.color }}>
                      <Icon size={14} />
                    </span>
                    <span>{config.label}</span>
                    <small>{count}</small>
                  </label>
                );
              })}
            </div>
          )}

          {activePanel === 'layout' && (
            <div className="layout-options">
              <button type="button" onClick={() => onLayout('LR')}>
                <GitBranch size={18} />
                <span>
                  <strong>Horizontal</strong>
                  <small>Best for relationship paths</small>
                </span>
              </button>
              <button type="button" onClick={() => onLayout('TB')}>
                <Boxes size={18} />
                <span>
                  <strong>Vertical</strong>
                  <small>Best for hierarchies</small>
                </span>
              </button>
            </div>
          )}

          {activePanel === 'settings' && (
            <div className="settings-list">
              <label>
                <span>
                  <strong>Show minimap</strong>
                  <small>Overview in the lower-right corner</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.showMinimap}
                  onChange={updateSetting('showMinimap')}
                />
              </label>
              <label>
                <span>
                  <strong>Snap to grid</strong>
                  <small>Align nodes while dragging</small>
                </span>
                <input
                  type="checkbox"
                  checked={settings.snapToGrid}
                  onChange={updateSetting('snapToGrid')}
                />
              </label>
              <button className="secondary-button" type="button" onClick={onRestoreDemo}>
                <SlidersHorizontal size={15} />
                Restore demo project
              </button>
            </div>
          )}
        </section>
      )}

      <div className="sidebar__privacy">
        <span className="sidebar__privacy-icon">
          <Boxes size={14} />
        </span>
        <div>
          <strong>Local data only</strong>
          <p>No lookup or enrichment. Data stays in this browser.</p>
        </div>
      </div>
    </aside>
  );
};
