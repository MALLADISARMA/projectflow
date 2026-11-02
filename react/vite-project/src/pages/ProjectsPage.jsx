import { useEffect, useMemo, useState } from 'react'
import { FolderOpen, FolderPlus, LoaderCircle, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../lib/api.js'

const emptyForm = { name: '', description: '', category: '', tags: '' }

export default function ProjectsPage() {
  const { token, user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('All projects')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadProjects = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await apiRequest('/api/projects', { token })
      setProjects(Array.isArray(result) ? result : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
    // Load once per authenticated session; refreshes are explicit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const categories = useMemo(
    () => [...new Set(projects.map((project) => project.category).filter(Boolean))].sort(),
    [projects],
  )
  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects.filter((project) => {
      const categoryMatches = category === 'All projects' || project.category === category
      const searchMatches =
        !query ||
        [project.name, project.description, project.category, ...(project.tags || [])]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      return categoryMatches && searchMatches
    })
  }, [category, projects, search])

  const openForm = (project = null) => {
    setEditing(project)
    setForm(project
      ? {
          name: project.name || '',
          description: project.description || '',
          category: project.category || '',
          tags: (project.tags || []).join(', '),
        }
      : emptyForm)
    setShowForm(true)
  }

  const saveProject = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }
    try {
      if (editing) {
        const updated = await apiRequest(`/api/projects/${editing.id}`, {
          method: 'PATCH',
          token,
          body: payload,
        })
        setProjects((current) => current.map((project) => project.id === updated.id ? updated : project))
      } else {
        const created = await apiRequest('/api/projects', {
          method: 'POST',
          token,
          body: payload,
        })
        setProjects((current) => [created, ...current])
      }
      setShowForm(false)
      setForm(emptyForm)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteProject = async (project) => {
    if (!window.confirm(`Delete "${project.name}" and its tasks? This cannot be undone.`)) return
    setError('')
    try {
      await apiRequest(`/api/projects/${project.id}`, { method: 'DELETE', token })
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Projects</h1>
          <p className="page-description">Plan, organize, and keep your team moving.</p>
        </div>
        <div className="heading-actions">
          <span className="project-count">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
          <button className="primary-button" onClick={() => openForm()} type="button">
            <Plus size={16} /> New project
          </button>
        </div>
      </div>

      {error && (
        <div className="inline-error" role="alert">
          <p>{error}</p>
          <button className="text-button" onClick={loadProjects} type="button">Try again</button>
        </div>
      )}

      <div className="project-layout">
        <aside className="filter-panel">
          <div className="panel-heading"><h2>Categories</h2></div>
          <div className="filter-group">
            <button
              className={`filter-option ${category === 'All projects' ? 'is-selected' : ''}`}
              onClick={() => setCategory('All projects')}
              type="button"
            >
              <span className="filter-indicator" /> All projects <span className="filter-total">{projects.length}</span>
            </button>
            {categories.map((item) => (
              <button
                className={`filter-option ${category === item ? 'is-selected' : ''}`}
                key={item}
                onClick={() => setCategory(item)}
                type="button"
              >
                <span className="filter-indicator" /><span className="filter-name">{item}</span>
                <span className="filter-total">{projects.filter((project) => project.category === item).length}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="project-results">
          <div className="results-heading">
            <div><h2>{category}</h2><span>{visibleProjects.length} results</span></div>
            <label className="search-field">
              <Search size={16} aria-hidden="true" />
              <input aria-label="Search projects" onChange={(event) => setSearch(event.target.value)} placeholder="Search projects" value={search} />
            </label>
          </div>
          {loading ? (
            <div className="state-message"><LoaderCircle className="spin" size={22} /><p>Loading projects…</p></div>
          ) : visibleProjects.length ? (
            <div className="project-grid">
              {visibleProjects.map((project) => {
                const isOwner = String(project.owner?.id) === String(user?.id)
                return (
                  <article className="project-card" key={project.id}>
                    <div className="project-card-top">
                      <span className="project-card-icon"><FolderOpen size={19} /></span>
                      {project.category && <span className="category-badge">{project.category}</span>}
                    </div>
                    <Link className="project-title-link" to={`/projects/${project.id}`}><h3>{project.name}</h3></Link>
                    <p className="project-description">{project.description || 'No description provided.'}</p>
                    <div className="project-card-footer">
                      <span>{project.team?.length || 1} {project.team?.length === 1 ? 'member' : 'members'}</span>
                      <span>{project.issues?.length || 0} tasks</span>
                    </div>
                    {project.tags?.length > 0 && (
                      <div className="project-tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>
                    )}
                    <div className="project-card-actions">
                      <Link className="text-button" to={`/projects/${project.id}`}>Open project</Link>
                      {isOwner && (
                        <>
                          <button aria-label={`Edit ${project.name}`} className="icon-button" onClick={() => openForm(project)} type="button"><Pencil size={15} /></button>
                          <button aria-label={`Delete ${project.name}`} className="icon-button danger-icon" onClick={() => deleteProject(project)} type="button"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon"><FolderPlus size={24} /></div>
              <h3>{search || category !== 'All projects' ? 'No matching projects' : 'Start with your first project'}</h3>
              <p>{search || category !== 'All projects' ? 'Change your search or category filter.' : 'Create a project to plan tasks and collaborate with your team.'}</p>
              {!search && category === 'All projects' && <button className="secondary-button empty-action" onClick={() => openForm()} type="button"><Plus size={15} /> Create a project</button>}
            </div>
          )}
        </section>
      </div>

      {showForm && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowForm(false) }}>
          <section aria-labelledby="project-form-title" aria-modal="true" className="modal-card" role="dialog">
            <div className="form-panel-heading">
              <div><p className="eyebrow">Workspace</p><h2 id="project-form-title">{editing ? 'Edit project' : 'Create a project'}</h2></div>
              <button aria-label="Close dialog" className="icon-button" onClick={() => setShowForm(false)} type="button"><X size={18} /></button>
            </div>
            <form onSubmit={saveProject}>
              <div className="project-form-grid">
                <label>Project name<input autoFocus maxLength={120} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required value={form.name} /></label>
                <label>Category<input onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} placeholder="e.g. Product" required value={form.category} /></label>
                <label className="form-full-row">Description<textarea onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows="3" value={form.description} /></label>
                <label className="form-full-row">Tags <span className="field-hint">(comma separated)</span><input onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="planning, launch" value={form.tags} /></label>
              </div>
              {error && <p className="error-message" role="alert">{error}</p>}
              <div className="form-actions">
                <button className="secondary-button" onClick={() => setShowForm(false)} type="button">Cancel</button>
                <button className="primary-button" disabled={submitting} type="submit">{submitting && <LoaderCircle className="spin" size={15} />}{editing ? 'Save changes' : 'Create project'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
