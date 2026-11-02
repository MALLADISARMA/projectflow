import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  MessageCircle,
  Pencil,
  Plus,
  Send,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.js'
import { apiRequest } from '../lib/api.js'

const STATUSES = ['To Do', 'In Progress', 'Done']
const emptyIssue = { title: '', description: '', status: 'To Do', priority: 'MEDIUM', dueDate: '' }

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, user } = useAuth()
  const [project, setProject] = useState(null)
  const [issues, setIssues] = useState([])
  const [messages, setMessages] = useState([])
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [issueFormOpen, setIssueFormOpen] = useState(false)
  const [issueForm, setIssueForm] = useState(emptyIssue)
  const [issueSubmitting, setIssueSubmitting] = useState(false)
  const [expandedIssue, setExpandedIssue] = useState(null)
  const [comments, setComments] = useState({})
  const [commentDraft, setCommentDraft] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [chatDraft, setChatDraft] = useState('')
  const [chatError, setChatError] = useState('')
  const [projectForm, setProjectForm] = useState(null)

  const isOwner = String(project?.owner?.id) === String(user?.id)
  const tasksByStatus = useMemo(
    () => STATUSES.map((status) => ({ status, tasks: issues.filter((issue) => issue.status === status) })),
    [issues],
  )

  const loadProjectData = useCallback(async () => {
    try {
      const [projectResult, issueResult] = await Promise.all([
        apiRequest(`/api/projects/${projectId}`, { token }),
        apiRequest(`/api/issues/project/${projectId}`, { token }),
      ])
      setProject(projectResult)
      setProjectForm({
        name: projectResult.name || '',
        description: projectResult.description || '',
        category: projectResult.category || '',
        tags: (projectResult.tags || []).join(', '),
      })
      setIssues(Array.isArray(issueResult) ? issueResult : [])
      setPageError('')
    } catch (requestError) {
      setPageError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [projectId, token])

  useEffect(() => {
    // This effect synchronizes the route with project and task data from the API.
    // eslint-disable-next-line react/set-state-in-effect
    loadProjectData()
  }, [loadProjectData])

  const requestedTab = searchParams.get('tab')
  const activeTab = ['overview', 'tasks', 'chat'].includes(requestedTab) ? requestedTab : 'overview'
  const lastSeenStorageKey = `projectflow-chat-last-seen:${user?.id}:${projectId}`

  const loadMessages = useCallback(async () => {
    try {
      const result = await apiRequest(`/api/messages/chat/${projectId}`, { token })
      const loadedMessages = Array.isArray(result) ? result : []
      setMessages(loadedMessages)
      setChatError('')

      const latestMessage = loadedMessages.at(-1)
      const latestMessageId = latestMessage?.id
      const lastSeenMessageId = localStorage.getItem(lastSeenStorageKey)

      if (activeTab === 'chat') {
        if (latestMessageId != null) {
          localStorage.setItem(lastSeenStorageKey, String(latestMessageId))
        }
        setUnreadMessages(0)
      } else if (lastSeenMessageId == null) {
        if (latestMessageId != null) {
          localStorage.setItem(lastSeenStorageKey, String(latestMessageId))
        }
        setUnreadMessages(0)
      } else {
        const lastSeenIndex = loadedMessages.findIndex(
          (message) => String(message.id) === lastSeenMessageId,
        )
        if (lastSeenIndex < 0) {
          if (latestMessageId != null) {
            localStorage.setItem(lastSeenStorageKey, String(latestMessageId))
          }
          setUnreadMessages(0)
        } else {
          const incomingMessages = loadedMessages
            .slice(lastSeenIndex + 1)
            .filter((message) => String(message.sender?.id) !== String(user?.id))
          setUnreadMessages(incomingMessages.length)
        }
      }
    } catch (requestError) {
      setChatError(requestError.message)
    }
  }, [activeTab, lastSeenStorageKey, projectId, token, user?.id])

  useEffect(() => {
    // Poll while the project is open so messages can mark the chat tab unread.
    // eslint-disable-next-line react/set-state-in-effect
    loadMessages()
    const timer = window.setInterval(loadMessages, 5000)
    return () => window.clearInterval(timer)
  }, [loadMessages])

  const changeTab = (tab) => {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  const createIssue = async (event) => {
    event.preventDefault()
    setIssueSubmitting(true)
    setPageError('')
    try {
      const created = await apiRequest('/api/issues', {
        method: 'POST',
        token,
        body: {
          ...issueForm,
          projectId: Number(projectId),
          dueDate: issueForm.dueDate || null,
        },
      })
      setIssues((current) => [...current, created])
      setIssueForm(emptyIssue)
      setIssueFormOpen(false)
    } catch (requestError) {
      setPageError(requestError.message)
    } finally {
      setIssueSubmitting(false)
    }
  }

  const updateIssueStatus = async (issueId, status) => {
    setPageError('')
    try {
      const updated = await apiRequest(
        `/api/issues/${issueId}/status/${encodeURIComponent(status)}`,
        { method: 'PUT', token },
      )
      setIssues((current) => current.map((issue) => issue.id === updated.id ? updated : issue))
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const assignIssue = async (issueId, userId) => {
    setPageError('')
    try {
      const updated = await apiRequest(`/api/issues/${issueId}/assignee/${userId}`, {
        method: 'PUT',
        token,
      })
      setIssues((current) => current.map((issue) => issue.id === updated.id ? updated : issue))
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const deleteIssue = async (issue) => {
    if (!window.confirm(`Delete task "${issue.title}" and its comments?`)) return
    try {
      await apiRequest(`/api/issues/${issue.id}`, { method: 'DELETE', token })
      setIssues((current) => current.filter((item) => item.id !== issue.id))
      setExpandedIssue(null)
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const toggleComments = async (issueId) => {
    if (expandedIssue === issueId) {
      setExpandedIssue(null)
      return
    }
    setExpandedIssue(issueId)
    if (comments[issueId]) return
    try {
      const result = await apiRequest(`/api/comments/${issueId}`, { token })
      setComments((current) => ({ ...current, [issueId]: Array.isArray(result) ? result : [] }))
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const addComment = async (event, issueId) => {
    event.preventDefault()
    const content = commentDraft.trim()
    if (!content) return
    try {
      const created = await apiRequest('/api/comments', {
        method: 'POST',
        token,
        body: { issueId, content },
      })
      setComments((current) => ({ ...current, [issueId]: [...(current[issueId] || []), created] }))
      setCommentDraft('')
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const deleteComment = async (issueId, commentId) => {
    try {
      await apiRequest(`/api/comments/${commentId}`, { method: 'DELETE', token })
      setComments((current) => ({
        ...current,
        [issueId]: (current[issueId] || []).filter((comment) => comment.id !== commentId),
      }))
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const inviteMember = async (event) => {
    event.preventDefault()
    setInviteMessage('')
    setInviteError('')
    setInviting(true)
    const recipient = inviteEmail.trim()
    try {
      const result = await apiRequest('/api/projects/invite', {
        method: 'POST',
        token,
        body: { projectId: Number(projectId), email: recipient },
      })
      setInviteMessage(`${result?.message || 'Invitation email sent'} to ${recipient}. Ask them to check their inbox and spam folder.`)
      setInviteEmail('')
    } catch (requestError) {
      setInviteError(requestError.message)
    } finally {
      setInviting(false)
    }
  }

  const saveProject = async (event) => {
    event.preventDefault()
    if (!projectForm) return
    setPageError('')
    try {
      const updated = await apiRequest(`/api/projects/${projectId}`, {
        method: 'PATCH',
        token,
        body: {
          ...projectForm,
          name: projectForm.name.trim(),
          category: projectForm.category.trim(),
          tags: projectForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        },
      })
      setProject(updated)
      setProjectForm({
        name: updated.name || '',
        description: updated.description || '',
        category: updated.category || '',
        tags: (updated.tags || []).join(', '),
      })
      setInviteMessage('Project details saved.')
    } catch (requestError) {
      setPageError(requestError.message)
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const content = chatDraft.trim()
    if (!content) return
    setChatError('')
    try {
      await apiRequest('/api/messages/send', {
        method: 'POST',
        token,
        body: { projectId: Number(projectId), content },
      })
      setChatDraft('')
      await loadMessages()
    } catch (requestError) {
      setChatError(requestError.message)
    }
  }

  if (loading) {
    return <main className="page-content"><div className="state-message"><LoaderCircle className="spin" size={22} /><p>Loading project…</p></div></main>
  }

  if (!project) {
    return (
      <main className="page-content">
        <Link className="back-link" to="/projects"><ArrowLeft size={16} /> Back to projects</Link>
        <div className="inline-error" role="alert"><p>{pageError || 'Project could not be found.'}</p><button className="text-button" onClick={() => { setLoading(true); setPageError(''); loadProjectData() }} type="button">Try again</button></div>
      </main>
    )
  }

  return (
    <main className="page-content">
      <Link className="back-link" to="/projects"><ArrowLeft size={16} /> All projects</Link>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">{project.category || 'Project'}</p>
          <h1>{project.name}</h1>
          <p className="page-description">{project.description || 'No project description yet.'}</p>
        </div>
        <div className="detail-heading-meta">
          <span className="project-count">{issues.length} {issues.length === 1 ? 'task' : 'tasks'}</span>
          <span className="project-count">{project.team?.length || 1} {project.team?.length === 1 ? 'member' : 'members'}</span>
        </div>
      </div>

      <nav className="detail-tabs" aria-label="Project sections">
        {['overview', 'tasks', 'chat'].map((tab) => (
          <button className={`detail-tab ${activeTab === tab ? 'active' : ''}`} key={tab} onClick={() => changeTab(tab)} type="button">
            {tab === 'chat' ? (
              <>
                Team chat
                {unreadMessages > 0 && (
                  <span aria-label={`${unreadMessages} unread messages`} className="unread-badge">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </>
            ) : tab === 'tasks' ? 'Tasks' : 'Overview'}
          </button>
        ))}
      </nav>

      {pageError && <div className="inline-error" role="alert"><p>{pageError}</p><button className="text-button" onClick={() => setPageError('')} type="button">Dismiss</button></div>}

      {activeTab === 'overview' && (
        <div className="detail-columns">
          <section className="content-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Project overview</p><h2>About this project</h2></div>{isOwner && <Pencil size={16} className="muted-icon" />}</div>
            {isOwner && projectForm ? (
              <form className="project-form-grid detail-project-form" onSubmit={saveProject}>
                <label>Name<input onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} required value={projectForm.name} /></label>
                <label>Category<input onChange={(event) => setProjectForm((current) => ({ ...current, category: event.target.value }))} value={projectForm.category} /></label>
                <label className="form-full-row">Description<textarea onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} rows="3" value={projectForm.description} /></label>
                <label className="form-full-row">Tags <span className="field-hint">(comma separated)</span><input onChange={(event) => setProjectForm((current) => ({ ...current, tags: event.target.value }))} value={projectForm.tags} /></label>
                <div className="form-full-row form-actions"><button className="primary-button" type="submit">Save project</button></div>
              </form>
            ) : <p className="body-copy">{project.description || 'No description provided.'}</p>}
            {inviteMessage && <p className="invite-feedback invite-feedback-success" role="status">{inviteMessage}</p>}
            {inviteError && <p className="invite-feedback invite-feedback-error" role="alert">{inviteError}</p>}
            {project.tags?.length > 0 && <div className="project-tags">{project.tags.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div>}
          </section>

          <section className="content-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Collaborators</p><h2>Project team</h2></div><span className="project-count">{project.team?.length || 1}</span></div>
            <div className="member-list">
              {(project.team?.length ? project.team : project.owner ? [project.owner] : []).map((member) => (
                <div className="member-row" key={member.id}>
                  <span className="avatar">{(member.fullName || member.email || 'U').slice(0, 1).toUpperCase()}</span>
                  <span><strong>{member.fullName || 'Team member'}</strong><small>{member.email}</small></span>
                  {String(member.id) === String(project.owner?.id) && <span className="role-badge">Owner</span>}
                </div>
              ))}
            </div>
            {isOwner && (
              <form className="invite-form" onSubmit={inviteMember}>
                <label htmlFor="invite-email">Invite a teammate</label>
                <div className="inline-form">
                  <input id="invite-email" onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@example.com" required type="email" value={inviteEmail} />
                  <button className="primary-button" disabled={inviting || !inviteEmail.trim()} type="submit">
                    {inviting ? <LoaderCircle className="spin" size={15} /> : <UserPlus size={15} />}
                    {inviting ? 'Sending…' : 'Send invitation'}
                  </button>
                </div>
                <p className="field-hint">We’ll email them an invitation link. They can sign in or create an account using this email address.</p>
              </form>
            )}
          </section>

          <section className="content-panel full-panel">
            <div className="panel-title-row"><div><p className="eyebrow">Progress</p><h2>Task status</h2></div><button className="secondary-button" onClick={() => changeTab('tasks')} type="button">View tasks</button></div>
            <div className="progress-stats">{tasksByStatus.map(({ status, tasks }) => <div className="progress-stat" key={status}><span className="status-dot" data-status={status} /><span>{status}</span><strong>{tasks.length}</strong></div>)}</div>
          </section>
        </div>
      )}

      {activeTab === 'tasks' && (
        <section className="content-panel task-panel">
          <div className="panel-title-row">
            <div><p className="eyebrow">Project work</p><h2>Tasks <span className="subtle-count">{issues.length}</span></h2></div>
            <button className="primary-button" onClick={() => setIssueFormOpen((open) => !open)} type="button"><Plus size={16} /> New task</button>
          </div>
          {issueFormOpen && (
            <form className="create-task-form" onSubmit={createIssue}>
              <label>Task title<input autoFocus onChange={(event) => setIssueForm((current) => ({ ...current, title: event.target.value }))} required value={issueForm.title} /></label>
              <label>Description<textarea onChange={(event) => setIssueForm((current) => ({ ...current, description: event.target.value }))} rows="2" value={issueForm.description} /></label>
              <div className="task-form-row">
                <label>Status<select onChange={(event) => setIssueForm((current) => ({ ...current, status: event.target.value }))} value={issueForm.status}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label>Priority<select onChange={(event) => setIssueForm((current) => ({ ...current, priority: event.target.value }))} value={issueForm.priority}><option>LOW</option><option>MEDIUM</option><option>HIGH</option></select></label>
                <label>Due date<input onChange={(event) => setIssueForm((current) => ({ ...current, dueDate: event.target.value }))} type="date" value={issueForm.dueDate} /></label>
              </div>
              <div className="form-actions"><button className="secondary-button" onClick={() => setIssueFormOpen(false)} type="button">Cancel</button><button className="primary-button" disabled={issueSubmitting} type="submit">{issueSubmitting ? 'Creating…' : 'Create task'}</button></div>
            </form>
          )}
          {issues.length === 0 ? (
            <div className="compact-empty"><Check size={20} /><h3>No tasks yet</h3><p>Create the first task to get work moving.</p></div>
          ) : (
            <div className="task-list">
              {issues.map((issue) => (
                <article className="task-item" key={issue.id}>
                  <div className="task-main">
                    <span className="status-dot" data-status={issue.status} />
                    <div className="task-title-area"><strong>{issue.title}</strong>{issue.description && <p>{issue.description}</p>}</div>
                    <span className={`priority-badge priority-${(issue.priority || 'medium').toLowerCase()}`}>{issue.priority || 'No priority'}</span>
                    {issue.dueDate && <span className="due-date">{formatDate(issue.dueDate)}</span>}
                    <select aria-label={`Change status for ${issue.title}`} className="status-select" onChange={(event) => updateIssueStatus(issue.id, event.target.value)} value={issue.status || 'To Do'}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
                    <select aria-label={`Assign ${issue.title}`} className="assignee-select" onChange={(event) => event.target.value && assignIssue(issue.id, event.target.value)} value={issue.assignee?.id || ''}>
                      <option value="">Unassigned</option>
                      {(project.team || []).map((member) => <option key={member.id} value={member.id}>{member.fullName || member.email}</option>)}
                    </select>
                    <button aria-label={`Show comments for ${issue.title}`} className="icon-button" onClick={() => toggleComments(issue.id)} type="button"><MessageCircle size={16} /></button>
                    <button aria-label={`Delete ${issue.title}`} className="icon-button danger-icon" onClick={() => deleteIssue(issue)} type="button"><Trash2 size={15} /></button>
                  </div>
                  {expandedIssue === issue.id && (
                    <div className="comment-thread">
                      {(comments[issue.id] || []).map((comment) => (
                        <div className="comment-row" key={comment.id}>
                          <span className="avatar small-avatar">{(comment.user?.fullName || comment.user?.email || 'U').slice(0, 1).toUpperCase()}</span>
                          <div><strong>{comment.user?.fullName || 'Team member'}</strong><p>{comment.content}</p><small>{formatDate(comment.createdDateTime)}</small></div>
                          {String(comment.user?.id) === String(user?.id) && <button aria-label="Delete comment" className="icon-button danger-icon" onClick={() => deleteComment(issue.id, comment.id)} type="button"><Trash2 size={14} /></button>}
                        </div>
                      ))}
                      {comments[issue.id]?.length === 0 && <p className="field-hint">No comments yet.</p>}
                      <form className="comment-form" onSubmit={(event) => addComment(event, issue.id)}>
                        <input aria-label="Write a comment" onChange={(event) => setCommentDraft(event.target.value)} placeholder="Write a comment…" value={expandedIssue === issue.id ? commentDraft : ''} />
                        <button aria-label="Post comment" className="icon-button accent-icon" type="submit"><Send size={15} /></button>
                      </form>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'chat' && (
        <section className="content-panel chat-panel">
          <div className="panel-title-row"><div><p className="eyebrow">Collaborate</p><h2>Team chat</h2></div><button className="secondary-button" onClick={loadMessages} type="button">Refresh</button></div>
          {chatError && <div className="inline-error" role="alert"><p>{chatError}</p><button className="text-button" onClick={loadMessages} type="button">Try again</button></div>}
          <div className="message-list" aria-live="polite">
            {messages.length === 0 ? <div className="compact-empty"><MessageCircle size={20} /><h3>No messages yet</h3><p>Start a conversation with your project team.</p></div> : messages.map((message) => (
              <article className={`message-row ${String(message.sender?.id) === String(user?.id) ? 'own-message' : ''}`} key={message.id}>
                <span className="avatar small-avatar">{(message.sender?.fullName || message.sender?.email || 'U').slice(0, 1).toUpperCase()}</span>
                <div className="message-bubble"><div className="message-meta"><strong>{message.sender?.fullName || 'Team member'}</strong><time>{formatDate(message.createdAt)}</time></div><p>{message.content}</p></div>
              </article>
            ))}
          </div>
          <form className="chat-compose" onSubmit={sendMessage}>
            <input aria-label="Message to project team" onChange={(event) => setChatDraft(event.target.value)} placeholder="Message your team…" value={chatDraft} />
            <button className="primary-button" disabled={!chatDraft.trim()} type="submit"><Send size={15} /> Send</button>
          </form>
          <p className="field-hint chat-note">Messages refresh automatically every 10 seconds.</p>
        </section>
      )}
    </main>
  )
}
