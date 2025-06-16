import { User } from "@supabase/supabase-js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import styles from "./SubmitReportScreen.module.scss";

interface SubmitReportScreenProps {
  user: User;
}

const SubmitReportScreen: React.FC<SubmitReportScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "pothole" as const,
    priority: "medium" as const,
    location: { lat: 0, lng: 0, address: "" },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("issues").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        location: formData.location,
        reporter_id: user.id,
      });

      if (error) throw error;

      navigate("/home");
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate("/home")} className={styles.backButton}>
          ← Back
        </button>
        <h1>Submit Report</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            placeholder="Brief description of the issue"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder="Detailed description of the issue"
            rows={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
          >
            <option value="pothole">Pothole</option>
            <option value="drainage">Drainage</option>
            <option value="garbage">Garbage</option>
            <option value="landslide">Landslide</option>
            <option value="street_light">Street Light</option>
            <option value="broken_sign">Broken Sign</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            required
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
};

export default SubmitReportScreen;
