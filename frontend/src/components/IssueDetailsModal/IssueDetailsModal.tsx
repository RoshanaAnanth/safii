import React from "react";
import UpvoteButton from "../UpvoteButton/UpvoteButton";
import styles from "./IssueDetailsModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Chip from "../Chip/Chip";

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
  status: "pending" | "resolved";
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
  currentUserId: string;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  issue,
  onClose,
  currentUserId,
}) => {
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
    // The location should already be in the correct format from formatLocationForDisplay
    return location;
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
            <UpvoteButton
              issueId={issue.id}
              userId={currentUserId}
              size="large"
            />
          </div>
          <IconButton onClick={onClose} className={styles.closeButton}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>

        <div className={styles.content}>
          <div className={styles.detailsSection}>
            <div className={styles.reporterDetails}>
              <span className={styles.sectionText}>Reported by: </span>
              <div className={styles.reportedInfo}>
                <h4 className={styles.reporterName}>
                  {issue.reporter_name || "Anonymous User"}
                </h4>
                <p className={styles.reporterEmail}>
                  ({issue.reporter_email || "No email provided"})
                </p>
              </div>
            </div>
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Category:</span>
              <Chip
                type="category"
                label={issue.category}
                category={issue.category.replace("_", " ")}
              />
            </div>
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Status:</span>
              <Chip
                type="status"
                label={issue.status}
                status={issue.status.replace("_", " ")}
              />
            </div>
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Priority:</span>
              <Chip
                type="priority"
                label={issue.priority}
                priority={issue.priority}
              />
            </div>
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Location:</span>
              <span className={styles.locationValue}>
                {formatLocation(issue.location)}
              </span>
            </div>
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Date reported:</span>
              <span className={styles.detailValue}>
                {formatDate(issue.created_at)}
              </span>
            </div>
            {issue.resolved_at && (
              <div className={styles.tagSection}>
                <span className={styles.sectionText}>Date resolved:</span>
                <span className={styles.detailValue}>
                  {formatDate(issue.resolved_at)}
                </span>
              </div>
            )}
            <div className={styles.tagSection}>
              <span className={styles.sectionText}>Description:</span>
              <span className={styles.detailValue}>{issue.description}</span>
            </div>
          </div>

          <hr className={styles.horizontalLine} />

          {issue.imageUrl && (
            <div className={styles.section}>
              {/* <h3 className={styles.sectionTitle}>Image</h3> */}
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
              {/* <h3 className={styles.sectionTitle}>Image</h3> */}
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
