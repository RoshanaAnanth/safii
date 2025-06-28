import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ResolveIssueModal from "../../components/ResolveIssueModal/ResolveIssueModal";
import supabase from "../../lib/supabase";
import { formatLocationForDisplay } from "../../lib/utils";
import styles from "./AdminIssueDetailsScreen.module.scss";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

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
  location: any;
  imageUrl?: string;
  resolvedImageUrl?: string;
  reporter_id: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  reporter_email?: string;
}

const AdminIssueDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const fetchIssue = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: issueData, error: fetchError } = await supabase
        .from("issues")
        .select(
          `
          id,
          title,
          description,
          category,
          status,
          priority,
          location,
          imageUrl,
          resolvedImageUrl,
          reporter_id,
          admin_notes,
          resolved_at,
          created_at,
          updated_at,
          users!reporter_id (
            name,
            email
          )
        `
        )
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error("Error fetching issue:", fetchError);
        setError("Failed to load issue details");
        return;
      }

      const formattedIssue: Issue = {
        id: issueData.id,
        title: issueData.title,
        description: issueData.description,
        category: issueData.category,
        status: issueData.status,
        priority: issueData.priority,
        location: issueData.location,
        imageUrl: issueData.imageUrl,
        resolvedImageUrl: issueData.resolvedImageUrl,
        reporter_id: issueData.reporter_id,
        admin_notes: issueData.admin_notes,
        resolved_at: issueData.resolved_at,
        created_at: issueData.created_at,
        updated_at: issueData.updated_at,
        reporter_name: issueData.users?.name || "Anonymous User",
        reporter_email: issueData.users?.email || "unknown@example.com",
      };

      setIssue(formattedIssue);
      setSelectedStatus(formattedIssue.status);
    } catch (error) {
      console.error("Error fetching issue:", error);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);
  };

  const handleUpdateStatus = async () => {
    if (!issue || selectedStatus === issue.status) return;

    // If changing to resolved, show the resolve modal
    if (selectedStatus === "resolved" && issue.status !== "resolved") {
      setShowResolveModal(true);
      return;
    }

    // For other status changes, update directly
    await updateIssueStatus(selectedStatus, null);
  };

  const updateIssueStatus = async (newStatus: string, resolvedImageUrl: string | null) => {
    if (!issue) return;

    setUpdating(true);
    try {
      const updateData: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      // If resolving, add resolved timestamp and image
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        if (resolvedImageUrl) {
          updateData.resolvedImageUrl = resolvedImageUrl;
        }
      }

      const { error: updateError } = await supabase
        .from("issues")
        .update(updateData)
        .eq("id", issue.id);

      if (updateError) {
        console.error("Error updating issue:", updateError);
        alert("Failed to update issue status");
        return;
      }

      // Refresh the issue data
      await fetchIssue();
      alert("Issue status updated successfully!");
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("An unexpected error occurred");
    } finally {
      setUpdating(false);
      setShowResolveModal(false);
    }
  };

  const handleResolveIssue = async (resolvedImageUrl: string | null) => {
    await updateIssueStatus("resolved", resolvedImageUrl);
  };

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

  const getReporterInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading issue details...</div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className={styles.container}>
        <IconButton
          onClick={() => navigate("/admin")}
          className={styles.backButton}
        >
          <ArrowBackIcon className={styles.backIcon} />
        </IconButton>
        <div className={styles.error}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Issue Not Found</h2>
          <p className={styles.errorMessage}>
            {error || "The requested issue could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <IconButton
        onClick={() => navigate("/admin")}
        className={styles.backButton}
      >
        <ArrowBackIcon className={styles.backIcon} />
      </IconButton>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Issue Details</h1>
          <p className={styles.subtitle}>Administrative View</p>
        </div>

        <div className={styles.detailsCard}>
          <div className={styles.issueHeader}>
            <h2 className={styles.issueTitle}>{issue.title}</h2>
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

            <div className={styles.statusControls}>
              <span className={styles.statusLabel}>Update Status:</span>
              <FormControl size="small">
                <Select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className={styles.statusSelect}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <Button
                onClick={handleUpdateStatus}
                disabled={updating || selectedStatus === issue.status}
                className={styles.updateButton}
              >
                {updating ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>

          <div className={styles.sectionsGrid}>
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
                  <span className={styles.detailLabel}>Priority</span>
                  <span className={styles.detailValue}>{issue.priority}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Location</span>
                  <span
                    className={`${styles.detailValue} ${styles.locationValue}`}
                  >
                    {formatLocationForDisplay(issue.location)}
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
              </div>
            </div>

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

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                {issue.resolvedImageUrl ? "Before & After Images" : "Images"}
              </h3>
              <div className={styles.imagesSection}>
                <div className={styles.imagesGrid}>
                  <div className={styles.imageContainer}>
                    <div className={styles.imageLabel}>
                      {issue.resolvedImageUrl ? "Before (Reported)" : "Issue Image"}
                    </div>
                    {issue.imageUrl ? (
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
                    ) : (
                      <div className={styles.noImage}>
                        <span className={styles.noImageIcon}>📷</span>
                        <span>No image provided</span>
                      </div>
                    )}
                  </div>

                  {issue.resolvedImageUrl && (
                    <div className={styles.imageContainer}>
                      <div className={styles.imageLabel}>After (Resolved)</div>
                      <img
                        src={issue.resolvedImageUrl}
                        alt="Resolved Issue"
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ResolveIssueModal
        isOpen={showResolveModal}
        onClose={() => {
          setShowResolveModal(false);
          setSelectedStatus(issue.status); // Reset status selection
        }}
        onResolve={handleResolveIssue}
        loading={updating}
      />
    </div>
  );
};

export default AdminIssueDetailsScreen;