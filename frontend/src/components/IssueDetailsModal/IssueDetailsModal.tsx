import React from "react";
import styles from "./IssueDetailsModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

interface Issue {
  id: string;
  title: string;
  description: string;
  category:
    | "pothole"
    | "drainage"
    | "garbage"
    | "landslide"
    | "street_light"
    | "broken_sign"
    | "other";
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  imageUrl?: string;
  reporter_id: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  reporter_email?: string;
}

interface IssueDetailsModalProps {
  issue: Issue;
  onClose: () => void;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  issue,
  onClose,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "in_progress":
        return "#2196F3";
      case "resolved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#4CAF50";
      case "medium":
        return "#FFA500";
      case "high":
        return "#FF5722";
      case "critical":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLocation = (location: string) => {
    if (location.includes(",")) {
      const [lat, lng] = location.split(",");
      return `${parseFloat(lat).toFixed(6)}, ${parseFloat(lng).toFixed(6)}`;
    }
    return location;
  };

  const getReporterInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{issue.title}</h2>
            <div className={styles.metaTags}>
              <span className={styles.categoryTag}>
                {issue.category.replace("_", " ")}
              </span>
              <span
                className={styles.statusTag}
                style={{ backgroundColor: getStatusColor(issue.status) }}
              >
                {issue.status.replace("_", " ")}
              </span>
              <span
                className={styles.priorityTag}
                style={{ color: getPriorityColor(issue.priority) }}
              >
                {issue.priority}
              </span>
            </div>
          </div>
          <IconButton onClick={onClose} className={styles.closeButton}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{issue.description}</p>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>ID</span>
                <span className={styles.detailValue}>{issue.id}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Category</span>
                <span className={styles.detailValue}>
                  {issue.category.replace("_", " ")}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status</span>
                <span className={styles.detailValue}>
                  {issue.status.replace("_", " ")}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Priority</span>
                <span className={styles.detailValue}>{issue.priority}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Location</span>
                <span
                  className={`${styles.detailValue} ${styles.locationValue}`}
                >
                  {formatLocation(issue.location)}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reported</span>
                <span className={styles.detailValue}>
                  {formatDate(issue.created_at)}
                </span>
              </div>
              {issue.resolved_at && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Resolved</span>
                  <span className={styles.detailValue}>
                    {formatDate(issue.resolved_at)}
                  </span>
                </div>
              )}
              {issue.updated_at !== issue.created_at && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Last Updated</span>
                  <span className={styles.detailValue}>
                    {formatDate(issue.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {issue.admin_notes && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Admin Notes</h3>
              <p className={styles.description}>{issue.admin_notes}</p>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Reporter Information</h3>
            <div className={styles.reporterSection}>
              <div className={styles.reporterInfo}>
                <div className={styles.reporterAvatar}>
                  {getReporterInitials(issue.reporter_name)}
                </div>
                <div className={styles.reporterDetails}>
                  <h4 className={styles.reporterName}>
                    {issue.reporter_name || "Anonymous User"}
                  </h4>
                  <p className={styles.reporterEmail}>
                    {issue.reporter_email || "No email provided"}
                  </p>
                </div>
                <div className={styles.reportedDate}>
                  {new Date(issue.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {issue.imageUrl && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Image</h3>
              <div className={styles.imageSection}>
                <div className={styles.imageContainer}>
                  <img
                    src={issue.imageUrl}
                    alt="Issue"
                    className={styles.issueImage}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const container = target.parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="${styles.noImage}">
                            <span class="${styles.noImageIcon}">🖼️</span>
                            <span>Image could not be loaded</span>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {!issue.imageUrl && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Image</h3>
              <div className={styles.imageSection}>
                <div className={styles.imageContainer}>
                  <div className={styles.noImage}>
                    <span className={styles.noImageIcon}>📷</span>
                    <span>No image provided</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;