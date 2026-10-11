import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_URL = "https://adminportfolio-6swc.onrender.com/api/project";
const MAX_IMAGE_MB = 5;

const EMPTY_FORM = {
  title: "",
  description: "",
  github: "",
  live: "",
  category: "",
  techStack: "",
  features: "",
  problem: "",
  contribution: "",
  architecture: "",
  challenges: "",
};

// Optional fields: only sent when filled in
const OPTIONAL_FIELDS = [
  "category",
  "techStack",
  "features",
  "problem",
  "contribution",
  "architecture",
  "challenges",
];

function Home() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [fileKey, setFileKey] = useState(0); // remounts the file input to clear it
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  // Image preview (and cleanup of the temporary URL)
  useEffect(() => {
    if (!image) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    setStatus({ type: "", text: "" });

    if (!file) {
      setImage(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", text: "Please choose an image file (JPG, PNG or WebP)." });
      setImage(null);
      setFileKey((k) => k + 1);
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setStatus({ type: "error", text: `Image must be smaller than ${MAX_IMAGE_MB} MB.` });
      setImage(null);
      setFileKey((k) => k + 1);
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      setStatus({ type: "error", text: "Please choose a project image." });
      return;
    }

    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("image", image);
    formData.append("description", form.description.trim());
    formData.append("github", form.github.trim());
    formData.append("live", form.live.trim());

    OPTIONAL_FIELDS.forEach((key) => {
      if (form[key].trim()) formData.append(key, form[key].trim());
    });

    setSubmitting(true);
    setStatus({ type: "", text: "" });

    try {
      await axios.post(API_URL, formData);

      setStatus({ type: "success", text: "Project added successfully." });
      setForm(EMPTY_FORM);
      setImage(null);
      setFileKey((k) => k + 1);
    } catch (error) {
      console.log(error.response?.data || error.message);
      setStatus({
        type: "error",
        text:
          error.response?.data?.message ||
          "Could not save the project. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="form-card">
        <header className="form-header">
          <div>
            <h1>Add Project</h1>
            <p>New projects appear on your portfolio automatically.</p>
          </div>
          <button type="button" className="view-btn" onClick={() => navigate("/view")}>
            View Projects
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="title">Project title</label>
            <input
              id="title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Resume Analyzer"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="image">Project image</label>
            <input
              key={fileKey}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImage}
              required
            />
            <small>JPG, PNG or WebP, up to {MAX_IMAGE_MB} MB.</small>
            {preview && (
              <img className="image-preview" src={preview} alt="Selected project preview" />
            )}
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What the project does and the problem it solves"
              rows="5"
              required
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="github">GitHub URL</label>
              <input
                id="github"
                type="url"
                name="github"
                value={form.github}
                onChange={handleChange}
                placeholder="https://github.com/..."
                required
              />
            </div>

            <div className="field">
              <label htmlFor="live">Live demo URL</label>
              <input
                id="live"
                type="url"
                name="live"
                value={form.live}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
            </div>
          </div>

          <details className="optional">
            <summary>Case study details (optional)</summary>
            <p className="optional-note">
              Shown in the portfolio's case-study view. Leave blank to skip.
            </p>

            <div className="field">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Full Stack, Frontend or Android"
              />
            </div>

            <div className="field">
              <label htmlFor="techStack">Tech stack</label>
              <input
                id="techStack"
                type="text"
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                placeholder="React, Node.js, Express, MongoDB"
              />
              <small>Separate with commas.</small>
            </div>

            <div className="field">
              <label htmlFor="features">Key features</label>
              <input
                id="features"
                type="text"
                name="features"
                value={form.features}
                onChange={handleChange}
                placeholder="Feature one, feature two, feature three"
              />
              <small>Separate with commas.</small>
            </div>

            <div className="field">
              <label htmlFor="problem">Problem it addresses</label>
              <textarea id="problem" name="problem" value={form.problem} onChange={handleChange} rows="3" />
            </div>

            <div className="field">
              <label htmlFor="contribution">My contribution</label>
              <textarea id="contribution" name="contribution" value={form.contribution} onChange={handleChange} rows="3" />
            </div>

            <div className="field">
              <label htmlFor="architecture">Architecture</label>
              <textarea id="architecture" name="architecture" value={form.architecture} onChange={handleChange} rows="3" />
            </div>

            <div className="field">
              <label htmlFor="challenges">Challenges and solutions</label>
              <textarea id="challenges" name="challenges" value={form.challenges} onChange={handleChange} rows="3" />
            </div>
          </details>

          <button type="submit" className="save-btn" disabled={submitting}>
            {submitting ? "Saving…" : "Save Project"}
          </button>

          <p className={`form-status ${status.type}`} role="status" aria-live="polite">
            {status.text}
          </p>
        </form>
      </div>
    </div>
  );
}

export default Home;