import styles from "./Chip.module.scss";

interface ChipProps {
  type: "category" | "status" | "priority";
  label: string;
  icon?: string;
  status?: "pending" | "resolved";
  priority?: "low" | "medium" | "high" | "critical";
}

export default function Chip({
  type,
  label,
  icon,
  status,
  priority,
}: ChipProps) {
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
      {icon ? (
        <span className={styles.icon}>{icon}</span>
      ) : (
        <span className={styles.round} />
      )}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
