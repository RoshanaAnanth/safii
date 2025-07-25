import React, { useState } from "react";
import Chip from "../Chip/Chip";
import IssueDetailsModal from "../IssueDetailsModal/IssueDetailsModal";
import UpvoteButton from "../UpvoteButton/UpvoteButton";
import styles from "./ListView.module.scss";

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
  imageUrl: string;
  resolvedImageUrl?: string;
  reporter_id: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  reporter_email?: string;
}

interface ListViewProps {
  issues: Issue[];
  currentUserId: string;
  isAdmin?: boolean;
  onIssueUpdate?: () => void;
}

const ListView: React.FC<ListViewProps> = ({
  issues,
  currentUserId,
  isAdmin = false,
  onIssueUpdate,
}) => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatLocationForTable = (location: string) => {
    // If location already contains parentheses, it's likely in the correct format
    if (location.includes("(") && location.includes(")")) {
      return location;
    }

    // If it's just coordinates, return as is
    if (location.includes(",")) {
      const parts = location.split(",");
      if (
        parts.length === 2 &&
        !isNaN(parseFloat(parts[0])) &&
        !isNaN(parseFloat(parts[1]))
      ) {
        return location;
      }
    }

    // For other cases, return as is
    return location;
  };

  const handleRowClick = (issue: Issue, e: React.MouseEvent) => {
    // Don't open modal if clicking on upvote button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedIssue(null);
    setIsModalOpen(false);
    // Refresh issues if there was an update and callback is provided
    if (onIssueUpdate) {
      onIssueUpdate();
    }
  };

  if (issues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No Reports Found</h3>
        <p className={styles.emptyDescription}>
          There are no reports matching your current filters. Try adjusting your
          filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* <img
        src={listViewIllustration}
        alt="Illustration"
        className={styles.illustration}
        loading="lazy"
      /> */}
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.headerCell}>Issue</th>
            <th className={styles.headerCell}>Category</th>
            <th className={styles.headerCell}>Status</th>
            <th className={styles.headerCell}>Priority</th>
            <th className={styles.headerCell}>Location</th>
            <th className={styles.headerCell}>Date</th>
            <th className={`${styles.headerCell} ${styles.upvoteHeader}`}></th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className={styles.tableRow}
              onClick={(e) => handleRowClick(issue, e)}
              style={{ cursor: "pointer" }}
            >
              <td className={styles.cell}>
                <div className={styles.issueInfo}>
                  <h4 className={styles.issueTitle}>{issue.title}</h4>
                  {issue.reporter_name && (
                    <span className={styles.reporter}>
                      By {issue.reporter_name}
                    </span>
                  )}
                </div>
              </td>
              <td className={styles.cell}>
                <Chip
                  type="category"
                  label={issue.category.replace("_", " ")}
                  category={issue.category}
                />
              </td>
              <td className={styles.cell}>
                <Chip
                  type="status"
                  label={issue.status.replace("_", " ")}
                  status={issue.status}
                />
              </td>
              <td className={styles.cell}>
                <Chip
                  type="priority"
                  priority={issue.priority}
                  label={issue.priority}
                />
              </td>
              <td className={styles.cell}>
                <span className={styles.location}>
                  {formatLocationForTable(issue.location)}
                </span>
              </td>
              <td className={styles.cell}>
                <span className={styles.date}>
                  {formatDate(issue.created_at)}
                </span>
              </td>
              <td className={styles.upvoteCell}>
                <UpvoteButton
                  issueId={issue.id}
                  userId={currentUserId}
                  size="compact"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedIssue && (
        <IssueDetailsModal
          issue={selectedIssue}
          onClose={handleCloseModal}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default ListView;
