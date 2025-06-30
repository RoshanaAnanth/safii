import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import supabase from "../../lib/supabase";
import { uploadImage } from "../../lib/utils";
import UpvoteButton from "../UpvoteButton/UpvoteButton";
import styles from "./IssueDetailsModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
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
  resolvedImageUrl?: string;
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
  isAdmin?: boolean;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({
  issue,
  onClose,
  currentUserId,
  isAdmin = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>(issue.status);
  const [resolvedImageFile, setResolvedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const imageUploadRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to image upload section when it becomes visible
  useEffect(() => {
    if (selectedStatus === "resolved" && isAdmin && imageUploadRef.current) {
      setTimeout(() => {
        imageUploadRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 100);
    }
  }, [selectedStatus, isAdmin]);

  const handleStatusChange = async (event: SelectChangeEvent) => {
    const newStatus = event.target.value;
    setSelectedStatus(newStatus);

    // If changing to resolved, don't update immediately - wait for image upload
    if (newStatus === "resolved") {
      return;
    }

    // For other status changes, update immediately
    await handleUpdateStatus(newStatus, null);
  };

  const handleUpdateStatus = async (
    newStatus: string,
    resolvedImageUrl: string | null
  ) => {
    setIsUpdatingStatus(true);
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

      alert("Issue status updated successfully!");
      onClose(); // Close modal and trigger refresh in parent
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setResolvedImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setResolvedImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResolveIssue = async () => {
    setIsUploading(true);
    try {
      let resolvedImageUrl: string | null = null;

      if (resolvedImageFile) {
        // Upload the image
        resolvedImageUrl = await uploadImage(
          resolvedImageFile,
          currentUserId,
          `resolved-${issue.id}-${Date.now()}`
        );
      }

      await handleUpdateStatus("resolved", resolvedImageUrl);

      // Reset state
      setResolvedImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading resolved image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
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
    return location;
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageLoad = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
  };

  const handleImageLoadStart = (imageKey: string) => {
    setImageLoading(prev => ({ ...prev, [imageKey]: true }));
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const imageKey = target.getAttribute('data-image-key') || 'unknown';
    setImageLoading(prev => ({ ...prev, [imageKey]: false }));
    
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
  };

  const renderImageSection = () => {
    const isResolved = issue.status === "resolved";
    const hasOriginalImage = issue.imageUrl;
    const hasResolvedImage = issue.resolvedImageUrl;

    if (isResolved && hasOriginalImage && hasResolvedImage) {
      // Show before & after images side by side
      return (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Before & After Images</h3>
          <div className={styles.imageComparisonGrid}>
            <div className={styles.imageContainer}>
              <div className={styles.imageLabel}>Before (Reported)</div>
              <div className={styles.imageWrapper}>
                {imageLoading['original'] && (
                  <div className={styles.imageLoadingOverlay}>
                    <LoadingSpinner size="medium" />
                  </div>
                )}
                <img
                  src={issue.imageUrl}
                  alt="Original Issue"
                  className={styles.issueImage}
                  data-image-key="original"
                  onLoadStart={() => handleImageLoadStart('original')}
                  onLoad={() => handleImageLoad('original')}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
            <div className={styles.imageContainer}>
              <div className={styles.imageLabel}>After (Resolved)</div>
              <div className={styles.imageWrapper}>
                {imageLoading['resolved'] && (
                  <div className={styles.imageLoadingOverlay}>
                    <LoadingSpinner size="medium" />
                  </div>
                )}
                <img
                  src={issue.resolvedImageUrl}
                  alt="Resolved Issue"
                  className={styles.issueImage}
                  data-image-key="resolved"
                  onLoadStart={() => handleImageLoadStart('resolved')}
                  onLoad={() => handleImageLoad('resolved')}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (isResolved && hasResolvedImage && !hasOriginalImage) {
      // Show only resolved image
      return (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Resolved Image</h3>
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                {imageLoading['resolved-only'] && (
                  <div className={styles.imageLoadingOverlay}>
                    <LoadingSpinner size="medium" />
                  </div>
                )}
                <img
                  src={issue.resolvedImageUrl}
                  alt="Resolved Issue"
                  className={styles.issueImage}
                  data-image-key="resolved-only"
                  onLoadStart={() => handleImageLoadStart('resolved-only')}
                  onLoad={() => handleImageLoad('resolved-only')}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (isResolved && hasOriginalImage && !hasResolvedImage) {
      // Show only original image for resolved issue without proof
      return (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Issue Image</h3>
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                {imageLoading['original-only'] && (
                  <div className={styles.imageLoadingOverlay}>
                    <LoadingSpinner size="medium" />
                  </div>
                )}
                <img
                  src={issue.imageUrl}
                  alt="Issue"
                  className={styles.issueImage}
                  data-image-key="original-only"
                  onLoadStart={() => handleImageLoadStart('original-only')}
                  onLoad={() => handleImageLoad('original-only')}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else if (hasOriginalImage) {
      // Show original image for non-resolved issues
      return (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Issue Image</h3>
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                {imageLoading['issue'] && (
                  <div className={styles.imageLoadingOverlay}>
                    <LoadingSpinner size="medium" />
                  </div>
                )}
                <img
                  src={issue.imageUrl}
                  alt="Issue"
                  className={styles.issueImage}
                  data-image-key="issue"
                  onLoadStart={() => handleImageLoadStart('issue')}
                  onLoad={() => handleImageLoad('issue')}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // No image provided
      return (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Issue Image</h3>
          <div className={styles.imageSection}>
            <div className={styles.imageContainer}>
              <div className={styles.noImage}>
                <span className={styles.noImageIcon}>📷</span>
                <span>No image provided</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{issue.title}</h2>
            {!isAdmin && (
              <UpvoteButton
                issueId={issue.id}
                userId={currentUserId}
                size="large"
              />
            )}
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
              {isAdmin && issue.status !== "resolved" ? (
                <FormControl size="small" className={styles.statusSelect}>
                  <Select
                    value={selectedStatus}
                    onChange={handleStatusChange}
                    disabled={isUpdatingStatus}
                    className={styles.statusDropdown}
                    sx={{
                      "& .MuiSelect-select": {
                        paddingLeft: 0,
                      },
                    }}
                  >
                    <MenuItem value="pending">
                      <Chip type="status" label="Pending" status="pending" />
                    </MenuItem>
                    <MenuItem value="resolved">
                      <Chip type="status" label="Resolved" status="resolved" />
                    </MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  type="status"
                  label={issue.status}
                  status={issue.status.replace("_", " ")}
                />
              )}
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

          {/* Render images based on issue status */}
          {renderImageSection()}

          {/* Resolved Image Upload Section - Only visible for admins when changing to "resolved" and issue is not already resolved */}
          {isAdmin &&
            selectedStatus === "resolved" &&
            issue.status !== "resolved" && (
              <div className={styles.section} ref={imageUploadRef}>
                <hr className={styles.horizontalLine} />
                <h3 className={styles.sectionTitle}>Upload Resolved Image</h3>
                <div className={styles.uploadSection}>
                  <div
                    className={`${styles.uploadArea} ${
                      resolvedImageFile ? styles.hasImage : ""
                    }`}
                    onClick={
                      !resolvedImageFile ? handleUploadAreaClick : undefined
                    }
                  >
                    {isUploading ? (
                      <div className={styles.uploadingContainer}>
                        <LoadingSpinner size="large" />
                        <p className={styles.uploadText}>Uploading image...</p>
                      </div>
                    ) : resolvedImageFile ? (
                      <div className={styles.resolvedImagePreviewContainer}>
                        <img
                          src={URL.createObjectURL(resolvedImageFile)}
                          alt="Resolved issue proof"
                          className={styles.imagePreview}
                        />
                        <IconButton
                          onClick={handleRemoveImage}
                          className={styles.removeResolvedImageIcon}
                          aria-label="Remove image"
                        >
                          <CloseIcon />
                        </IconButton>
                      </div>
                    ) : (
                      <>
                        <CloudUploadIcon className={styles.uploadIcon} />
                        <p className={styles.uploadText}>
                          Upload Proof of Resolution
                        </p>
                        <p className={styles.uploadSubtext}>
                          Click to upload an image showing the resolved issue
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className={styles.fileInput}
                  />
                </div>

                <div className={styles.resolveActions}>
                  <Button
                    onClick={() => setSelectedStatus(issue.status)}
                    className={styles.cancelButton}
                    disabled={isUpdatingStatus || isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleResolveIssue}
                    disabled={isUpdatingStatus || isUploading}
                    className={styles.resolveButton}
                  >
                    {isUpdatingStatus || isUploading ? (
                      <div className={styles.buttonContent}>
                        <LoadingSpinner size="small" color="white" />
                        <span>Resolving...</span>
                      </div>
                    ) : (
                      "Resolve Issue"
                    )}
                  </Button>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsModal;