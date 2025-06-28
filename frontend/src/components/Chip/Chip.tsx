import brokenSign from "../../../assets/BrokenSign.png";
import drainage from "../../../assets/Drainage.png";
import garbage from "../../../assets/Garbage.png";
import landslide from "../../../assets/Landslide.png";
import other from "../../../assets/Other.png";
import pothole from "../../../assets/Pothole.png";
import streetLight from "../../../assets/Streetlight.png";

import styles from "./Chip.module.scss";

interface ChipProps {
  type: "category" | "status" | "priority";
  label: string;
  category?: string;
  // icon?: string;
  status?: "pending" | "resolved";
  priority?: "low" | "medium" | "high" | "critical";
}

export default function Chip({
  type,
  label,
  category,
  status,
  priority,
}: ChipProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "pothole":
        return pothole;
      case "drainage":
        return drainage;
      case "garbage":
        return garbage;
      case "landslide":
        return landslide;
      case "street_light":
        return streetLight;
      case "broken_sign":
        return brokenSign;
      default:
        return other;
    }
  };

  return type === "priority" ? (
    <div className={`${styles.chipContainer} ${styles[priority!]}`}>
      <span className={styles.priorityLabel}>{label}</span>
    </div>
  ) : (
    <div
      className={`${styles.chipContainer} ${
        type === "category"
          ? styles.category
          : status === "pending"
          ? styles.pending
          : styles.resolved
      }`}
    >
      {category ? (
        <img src={getCategoryIcon(category)} className={styles.icon} />
      ) : (
        <div
          className={`${styles.round} ${
            status === "pending" ? styles.pendingRound : styles.resolvedRound
          }`}
        ></div>
      )}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
