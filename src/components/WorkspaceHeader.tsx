import { Check, ChevronDown, Database, LockKeyhole } from 'lucide-react';

interface WorkspaceHeaderProps {
  projectName: string;
  updatedAt: string;
}

const timeFormatter = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
});

export const WorkspaceHeader = ({ projectName, updatedAt }: WorkspaceHeaderProps) => (
  <header className="workspace-header">
    <div className="workspace-header__title">
      <span>Projects</span>
      <i>/</i>
      <strong>{projectName}</strong>
      <ChevronDown size={14} />
    </div>

    <div className="view-tabs" role="tablist" aria-label="Project views">
      <button className="is-active" type="button" role="tab" aria-selected="true">
        Graph
      </button>
      <button type="button" role="tab" aria-selected="false" disabled>
        Table
      </button>
    </div>

    <div className="workspace-header__status">
      <span title="This project only uses data saved in your browser">
        <LockKeyhole size={13} />
        Browser local
      </span>
      <span>
        <Database size={13} />
        Synthetic demo
      </span>
      <span className="save-status">
        <Check size={13} />
        Saved {timeFormatter.format(new Date(updatedAt))}
      </span>
    </div>
  </header>
);
