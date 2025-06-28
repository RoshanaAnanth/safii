import React, { useRef, useState } from "react";
import { uploadImage } from "../../lib/utils";
import styles from "./ResolveIssueModal.module.scss";

import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";

interface ResolveIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResolve: (resolvedImageUrl: string | null) => void;
  loading: boolean;
}

const ResolveIssueModal: React.FC<ResolveIssueModalProps> = ({
  isOpen,
  onClose,
  onResolve,
  loading,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResolve = async () => {
    setUploading(true);
    try {
      let resolvedImageUrl: string | null = null;

      if (selectedImage) {
        // Upload the image
        resolvedImageUrl = await uploadImage(
          selectedImage,
          "admin", // Using admin as userId for resolved images
          `resolved-${Date.now()}`
        );
      }

      await onResolve(resolvedImageUrl);
      
      // Reset state
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading resolved image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Are you sure you want to resolve this issue?</h2>
          <IconButton onClick={onClose} className={styles.closeButton}>
            <CloseIcon className={styles.closeIcon} />
          </IconButton>
        </div>

        <div className={styles.content}>
          <div className={styles.statusSection}>
            <p className={styles.statusLabel}>Status</p>
            <span className={styles.statusTag}>Resolved</span>
          </div>

          <div className={styles.uploadSection}>
            <div
              className={`${styles.uploadArea} ${
                selectedImage ? styles.hasImage : ""
              }`}
              onClick={!selectedImage ? handleUploadAreaClick : undefined}
            >
              {selectedImage ? (
                <>
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Resolved issue proof"
                    className={styles.imagePreview}
                  />
                  <Button
                    onClick={handleRemoveImage}
                    className={styles.removeImageButton}
                  >
                    Remove Image
                  </Button>
                </>
              ) : (
                <>
                  <CloudUploadIcon className={styles.uploadIcon} />
                  <p className={styles.uploadText}>Upload</p>
                  <p className={styles.uploadSubtext}>
                    To resolve this issue, please upload an image
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

          <div className={styles.actions}>
            <Button onClick={onClose} className={styles.cancelButton}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={loading || uploading}
              className={styles.resolveButton}
            >
              {loading || uploading ? "Resolving..." : "Resolve"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolveIssueModal;