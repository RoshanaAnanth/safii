import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ViewReportsScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import IconButton from "@mui/material/IconButton";

import Button from "@mui/material/Button";
import FilterControls, {
  FilterState,
} from "../../components/FilterControls/FilterControls";
import ListView from "../../components/ListView/ListView";
import MapView from "../../components/MapView/MapView";
import supabase from "../../lib/supabase";
import { formatLocationForDisplay } from "../../lib/utils";

interface ViewReportsScreenProps {
  user: User;
}

export interface Issue {
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
  reporter_id: string;
  admin_notes?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  reporter_email?: string;
}

const ViewReportsScreen: React.FC<ViewReportsScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    category: [],
    priority: [],
  });

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);

      // Fetch issues directly from Supabase
      const { data: issues, error } = await supabase
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
        .order("created_at", { ascending: false });

      console.log("After Supabase fetch");
      if (error) {
        console.error("Error fetching issues:", error);
        return;
      }

      // Format issues for frontend
      const formattedIssues: Issue[] = issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priority: issue.priority,
        location: formatLocationForDisplay(issue.location),
        imageUrl: issue.imageUrl || "",
        reporter_id: issue.reporter_id,
        admin_notes: issue.admin_notes,
        resolved_at: issue.resolved_at,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        reporter_name: issue.users?.name || "Anonymous User",
        reporter_email: issue.users?.email || "unknown@example.com",
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on current filter state
  const filteredIssues = issues.filter((issue) => {
    // If no filters are selected for a category, show all items for that category
    if (filters.status.length > 0 && !filters.status.includes(issue.status))
      return false;
    if (
      filters.category.length > 0 &&
      !filters.category.includes(issue.category)
    )
      return false;
    if (
      filters.priority.length > 0 &&
      !filters.priority.includes(issue.priority)
    )
      return false;
    return true;
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className={styles.container}>
      <IconButton
        onClick={() => navigate("/home")}
        className={styles.backButton}
      >
        <ArrowBackIosRoundedIcon className={styles.backIcon} />
      </IconButton>
      <div className={styles.header}>
        <h1 className={styles.headerText}>Safii</h1>
        <hr className={styles.horizontalLine} />
      </div>

      <div className={styles.content}>
        <div className={styles.controlsRow}>
          <div className={styles.toggleButtonGroup}>
            <Button
              variant="contained"
              className={`${styles.toggleListViewButton} ${
                currentView === "list" ? styles.selected : ""
              }`}
              onClick={() => setCurrentView("list")}
            >
              LIST VIEW
            </Button>
            <Button
              variant="contained"
              className={`${styles.toggleMapViewButton} ${
                currentView === "map" ? styles.selected : ""
              }`}
              onClick={() => setCurrentView("map")}
            >
              MAP VIEW
            </Button>
          </div>

          <FilterControls
            filters={filters}
            onFilterChange={handleFilterChange}
            resultsCount={filteredIssues.length}
          />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading reports...</div>
        ) : currentView === "list" ? (
          <ListView issues={filteredIssues} currentUserId={user.id} />
        ) : (
          <MapView issues={filteredIssues} currentUserId={user.id} />
        )}
      </div>
    </div>
  );
};

export default ViewReportsScreen;
