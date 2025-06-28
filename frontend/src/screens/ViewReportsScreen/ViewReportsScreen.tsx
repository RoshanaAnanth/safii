import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ViewReportsScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import IconButton from "@mui/material/IconButton";

import Button from "@mui/material/Button";
import FilterControls, { FilterState } from "../../components/FilterControls/FilterControls";
import ListView from "../../components/ListView/ListView";
import MapView from "../../components/MapView/MapView";
import supabase from "../../lib/supabase";

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

const ViewReportsScreen: React.FC<ViewReportsScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"list" | "map">("list");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    status: "all",
    category: "all",
    priority: "all",
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
        location:
          issue.location?.address ||
          (issue.location?.lat && issue.location?.lng
            ? `${issue.location.lat}, ${issue.location.lng}`
            : "Unknown location"),
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
    if (filters.status !== "all" && issue.status !== filters.status)
      return false;
    if (filters.category !== "all" && issue.category !== filters.category)
      return false;
    if (filters.priority !== "all" && issue.priority !== filters.priority)
      return false;
    return true;
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleBack = () => {
    navigate("/home");
  };

  const toggleView = () => {
    setCurrentView(currentView === "list" ? "map" : "list");
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

        {loading ? (
          <div className={styles.loading}>Loading reports...</div>
        ) : currentView === "list" ? (
          <ListView issues={filteredIssues} />
        ) : (
          <MapView issues={filteredIssues} />
        )}
      </div>
    </div>
  );
};

export default ViewReportsScreen;