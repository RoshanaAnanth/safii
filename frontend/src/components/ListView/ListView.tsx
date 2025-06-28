import React, { useState } from "react";
import IssueDetailsModal from "../IssueDetailsModal/IssueDetailsModal";
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
  status: "pending" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  imageUrl: string;
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
}

const ListView: React.FC<ListViewProps> = ({ issues }) => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pothole":
        return "🕳️";
      case "drainage":
        return "🌊";
      case "garbage":
        return "🗑️";
      case "landslide":
        return "⛰️";
      case "street_light":
        return "💡";
      case "broken_sign":
        return "🚧";
      default:
        return "❓";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleRowClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedIssue(null);
    setIsModalOpen(false);
  };

  if (issues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📋</div>
        <h3 className={styles.emptyTitle}>No Reports Found</h3>
        <p className={styles.emptyDescription}>
          There are no reports matching your current filters. Try adjusting your filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            <th className={styles.headerCell}>Issue</th>
            <th className={styles.headerCell}>Category</th>
            <th className={styles.headerCell}>Status</th>
            <th className={styles.headerCell}>Priority</th>
            <th className={styles.headerCell}>Date</th>
          </tr>
        </thead>
        <tbody className={styles.tableBody}>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className={styles.tableRow}
              onClick={() => handleRowClick(issue)}
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
                <div className={styles.category}>
                  <span className={styles.categoryIcon}>
                    {getCategoryIcon(issue.category)}
                  </span>
                  <span className={styles.categoryText}>
                    {issue.category.replace("_", " ")}
                  </span>
                </div>
              </td>
              <td className={styles.cell}>
                <span
                  className={styles.status}
                  style={{ backgroundColor: getStatusColor(issue.status) }}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </td>
              <td className={styles.cell}>
                <span
                  className={styles.priority}
                  style={{ color: getPriorityColor(issue.priority) }}
                >
                  {issue.priority}
                </span>
              </td>
              <td className={styles.cell}>
                <span className={styles.date}>
                  {formatDate(issue.created_at)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedIssue && (
        <IssueDetailsModal issue={selectedIssue} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default ListView;