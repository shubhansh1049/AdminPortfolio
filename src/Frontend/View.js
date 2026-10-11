import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./View.css";

const PROJECTS_URL = "https://adminportfolio-6swc.onrender.com/project";
const PROJECT_API = "https://adminportfolio-6swc.onrender.com/api/project";
const UPLOADS_URL = "https://adminportfolio-6swc.onrender.com/uploads";
const CONTACTS_URL = "https://portfolio-pzgj.onrender.com/mess/getmessage";

function View() {
  const navigate = useNavigate();

  const [project, setProject] = useState([]);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [notice, setNotice] = useState({ type: "", text: "" });

  const [confirmId, setConfirmId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", github: "", live: "" });
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);

  const [contacts, setContacts] = useState([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactsState, setContactsState] = useState("idle"); // idle | loading | ready | error

  // GET PROJECTS
  useEffect(() => {
    axios
      .get(PROJECTS_URL)
      .then((res) => {
        const data =
          res.data.projects ||
          res.data.Projects ||
          res.data.Project ||
          res.data;

        setProject(Array.isArray(data) ? data : []);
        setLoadState("ready");
      })
      .catch((err) => {
        console.log("Fetch Error:", err);
        setLoadState("error");
      });
  }, []);

  // Open the edit dialog once an item is selected
  useEffect(() => {
    const dialog = dialogRef.current;
    if (editing && dialog && !dialog.open) dialog.showModal();
  }, [editing]);

  // DELETE PROJECT
  const handleDelete = async (id) => {
    setDeletingId(id);
    setNotice({ type: "", text: "" });

    try {
      await axios.delete(`${PROJECT_API}/${id}`);
      setProject((prev) => prev.filter((item) => item._id !== id));
      setNotice({ type: "success", text: "Project deleted." });
    } catch (err) {
      console.log(err);
      setNotice({ type: "error", text: "Could not delete the project. Please try again." });
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  // EDIT PROJECT
  const openEdit = (item) => {
    setNotice({ type: "", text: "" });
    setEditForm({
      title: item.title || "",
      description: item.description || "",
      github: item.github || "",
      live: item.live || "",
    });
    setEditing(item);
  };

  const closeEdit = () => {
    if (dialogRef.current) dialogRef.current.close();
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      github: editForm.github.trim(),
      live: editForm.live.trim(),
    };

    setSaving(true);
    try {
      const res = await axios.put(`${PROJECT_API}/${editing._id}`, payload);
      const updated = res.data?.data || { ...editing, ...payload };

      setProject((prev) => prev.map((p) => (p._id === editing._id ? updated : p)));
      setNotice({ type: "success", text: "Project updated successfully." });
      closeEdit();
    } catch (err) {
      console.log("Update Error:", err);
      setNotice({ type: "error", text: "Could not update the project. Please try again." });
      closeEdit();
    } finally {
      setSaving(false);
    }
  };

  // CONTACTS
  const handleViewContact = async () => {
    if (contactsOpen) {
      setContactsOpen(false);
      return;
    }

    setContactsOpen(true);
    setContactsState("loading");

    try {
      const res = await axios.get(CONTACTS_URL);
      const data =
        res.data.contacts ||
        res.data.messages ||
        res.data.data ||
        res.data;

      setContacts(Array.isArray(data) ? data : []);
      setContactsState("ready");
    } catch (err) {
      console.log("Contact Fetch Error:", err);
      setContactsState("error");
    }
  };

  return (
    <div className="container">
      <header className="dash-header">
        <div>
          <h1 className="main-title">Admin Dashboard</h1>
          <p className="dash-sub">
            {loadState === "ready"
              ? `${project.length} ${project.length === 1 ? "project" : "projects"}`
              : "Manage your portfolio projects and messages"}
          </p>
        </div>

        <div className="header-section">
          {/* Change "/" if your Add Project page uses a different route */}
          <button type="button" className="add-btn" onClick={() => navigate("/")}>
            Add Project
          </button>
          <button
            type="button"
            className="contact-btn"
            onClick={handleViewContact}
            aria-expanded={contactsOpen}
            aria-controls="contacts-panel"
          >
            {contactsOpen ? "Hide Contact Messages" : "View Contact Messages"}
          </button>
        </div>
      </header>

      {notice.text && (
        <p className={`notice ${notice.type}`} role="status" aria-live="polite">
          {notice.text}
        </p>
      )}

      {/* ===== Projects ===== */}
      {loadState === "loading" && <p className="state-text">Loading projects…</p>}
      {loadState === "error" && (
        <p className="state-text">Projects could not be loaded. Please refresh and try again.</p>
      )}
      {loadState === "ready" && project.length === 0 && (
        <p className="state-text">No projects found. Add your first project to get started.</p>
      )}

      {project.length > 0 && (
        <div className="projects-grid">
          {project.map((item) => (
            <article key={item._id} className="project-card">
              <img
                src={`${UPLOADS_URL}/${item.image}`}
                alt={item.title}
                className="project-image"
                loading="lazy"
              />

              <div className="project-content">
                <h2>{item.title}</h2>
                <p>{item.description}</p>

                <div className="links">
                  {item.github && (
                    <a href={item.github} target="_blank" rel="noreferrer" className="github-btn">
                      GitHub
                    </a>
                  )}
                  {item.live && (
                    <a href={item.live} target="_blank" rel="noreferrer" className="live-btn">
                      Live Demo
                    </a>
                  )}
                </div>

                <div className="action-buttons">
                  {confirmId === item._id ? (
                    <>
                      <span className="confirm-text">Delete this project?</span>
                      <button
                        type="button"
                        className="delete-btn"
                        onClick={() => handleDelete(item._id)}
                        disabled={deletingId === item._id}
                      >
                        {deletingId === item._id ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setConfirmId(null)}
                        disabled={deletingId === item._id}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="edit-btn" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-btn outline"
                        onClick={() => setConfirmId(item._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ===== Contact messages ===== */}
      {contactsOpen && (
        <section id="contacts-panel" className="contacts-section">
          <h2>Contact Messages</h2>

          {contactsState === "loading" && <p className="state-text">Loading messages…</p>}
          {contactsState === "error" && (
            <p className="state-text">Messages could not be loaded. Please try again.</p>
          )}
          {contactsState === "ready" && contacts.length === 0 && (
            <p className="state-text">No messages yet.</p>
          )}

          {contacts.length > 0 && (
            <div className="contacts-grid">
              {contacts.map((contact) => (
                <article key={contact._id} className="contact-card">
                  <h3>{contact.name}</h3>
                  <a href={`mailto:${contact.email}`} className="contact-email">
                    {contact.email}
                  </a>
                  <p className="message-title">Message</p>
                  <div className="message-box">{contact.message}</div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===== Edit dialog ===== */}
      <dialog
        ref={dialogRef}
        className="edit-dialog"
        aria-labelledby="edit-title"
        onClose={() => setEditing(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) closeEdit();
        }}
      >
        {editing && (
          <form className="dialog-body" onSubmit={handleEditSubmit}>
            <h2 id="edit-title">Edit project</h2>

            <div className="field">
              <label htmlFor="edit-title-input">Title</label>
              <input
                id="edit-title-input"
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="edit-description">Description</label>
              <textarea
                id="edit-description"
                name="description"
                rows="5"
                value={editForm.description}
                onChange={handleEditChange}
              />
            </div>

            <div className="field">
              <label htmlFor="edit-github">GitHub URL</label>
              <input
                id="edit-github"
                type="url"
                name="github"
                value={editForm.github}
                onChange={handleEditChange}
              />
            </div>

            <div className="field">
              <label htmlFor="edit-live">Live demo URL</label>
              <input
                id="edit-live"
                type="url"
                name="live"
                value={editForm.live}
                onChange={handleEditChange}
              />
            </div>

            <div className="dialog-actions">
              <button type="button" className="cancel-btn" onClick={closeEdit} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="dialog-save" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}

export default View;