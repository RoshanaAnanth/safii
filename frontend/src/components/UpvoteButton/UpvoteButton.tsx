import React, { useEffect, useState } from "react";
import { getUpvoteStatus, toggleUpvote } from "../../lib/utils";
import { useToast } from "../../context/ToastContext";
import styles from "./UpvoteButton.module.scss";

import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleUpTwoToneIcon from "@mui/icons-material/ArrowCircleUpTwoTone";

interface UpvoteButtonProps {
  issueId: string;
  userId: string;
  size?: "compact" | "normal" | "large";
  onUpvoteChange?: (upvoteCount: number, isUpvoted: boolean) => void;
}

const UpvoteButton: React.FC<UpvoteButtonProps> = ({
  issueId,
  userId,
  size = "normal",
  onUpvoteChange,
}) => {
  const { showError } = useToast();
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUpvoteStatus();
  }, [issueId, userId]);

  const loadUpvoteStatus = async () => {
    try {
      const status = await getUpvoteStatus(issueId, userId);
      setIsUpvoted(status.isUpvoted);
      setUpvoteCount(status.upvoteCount);
    } catch (error) {
      console.error("Error loading upvote status:", error);
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent click events

    if (loading) return;

    setLoading(true);
    try {
      const result = await toggleUpvote(issueId, userId);
      setIsUpvoted(result.isUpvoted);
      setUpvoteCount(result.upvoteCount);

      // Notify parent component of the change
      if (onUpvoteChange) {
        onUpvoteChange(result.upvoteCount, result.isUpvoted);
      }
    } catch (error) {
      console.error("Error toggling upvote:", error);
      showError("Failed to update upvote. Please try again.", "Upvote Error");
    } finally {
      setLoading(false);
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case "compact":
        return styles.compact;
      case "large":
        return styles.large;
      default:
        return "";
    }
  };

  return (
    <button
      className={`${styles.upvoteButton} ${getSizeClass()} ${
        isUpvoted ? styles.upvoted : ""
      }`}
      onClick={handleUpvote}
      disabled={loading}
      title={isUpvoted ? "Remove upvote" : "Upvote this issue"}
    >
      {isUpvoted ? (
        <ArrowCircleUpTwoToneIcon className={styles.upvoteIcon} />
      ) : (
        <ArrowCircleUpIcon className={styles.upvoteIcon} />
      )}
      <span className={styles.upvoteCount}>{upvoteCount}</span>
    </button>
  );
};

export default UpvoteButton;