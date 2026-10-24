import { FolderKanban, FolderOpen, LayoutGrid } from 'lucide-react'

const ProjectList = () => {
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="ProjectFlow home">
          <span className="brand-mark" aria-hidden="true">
            <FolderKanban size={19} strokeWidth={2.2} />
          </span>
          <span>ProjectFlow</span>
        </a>
        <div className="workspace-label">
          <span className="workspace-dot" aria-hidden="true" />
          Workspace
        </div>
      </header>

      <main className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Workspace</p>
            <h1>Projects</h1>
            <p className="page-description">
              Keep your work organized in one place.
            </p>
          </div>
          <div className="project-count">0 projects</div>
        </div>

        <div className="project-layout">
          <aside className="filter-panel" aria-label="Project filters">
            <div className="panel-heading">
              <h2>Filters</h2>
              <LayoutGrid size={17} aria-hidden="true" />
            </div>
            <div className="filter-group">
              <h3>Category</h3>
              <div className="filter-option is-selected">
                <span className="filter-indicator" aria-hidden="true" />
                All projects
              </div>
            </div>
          </aside>

          <section className="project-results" aria-label="Projects">
            <div className="results-heading">
              <h2>All projects</h2>
              <span>0 results</span>
            </div>
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">
                <FolderOpen size={25} strokeWidth={1.7} />
              </div>
              <h3>No projects yet</h3>
              <p>Your projects will appear here when they’re ready.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ProjectList
