import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ViewReportsScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import IconButton from "@mui/material/IconButton";

import Button from "@mui/material/Button";
import ListView from "../../components/ListView/ListView";
import MapView from "../../components/MapView/MapView";
import { apiRequest } from "../../lib/utils";

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
  priority: "low" | "medium" | "high" | "urgent";
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
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
  const [filters, setFilters] = useState({
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
      const response = await apiRequest("/api/issues/", {
        method: "GET",
      });
      console.log("Response from API:", response);
      //   const { data, error } = await supabase
      //     .from("issue_summary_view")
      //     .select("*")
      //     .order("created_at", { ascending: false });

      //   if (error) {
      //     console.error("Error fetching issues:", error);
      //     return;
      //   }

      const formattedIssues: Issue[] = response.issues.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        description: issue.description,
        category: issue.category,
        status: issue.status,
        priority: issue.priority,
        location: issue.location,
        images: issue.images || [],
        reporter_id: issue.reporter_id,
        admin_notes: issue.admin_notes,
        resolved_at: issue.resolved_at,
        created_at: issue.created_at,
        updated_at: issue.updated_at,
        reporter_name: issue.reporter_name,
        reporter_email: issue.reporter_email,
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filters.status !== "all" && issue.status !== filters.status)
      return false;
    if (filters.category !== "all" && issue.category !== filters.category)
      return false;
    if (filters.priority !== "all" && issue.priority !== filters.priority)
      return false;
    return true;
  });

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

        {/* <div className={styles.headerActions}> */}
        {/* <IconButton className={styles.filterButton}>
            <FilterListIcon className={styles.filterIcon} />
          </IconButton> */}

        {/* <IconButton onClick={toggleView} className={styles.viewToggle}>
            {currentView === "list" ? (
              <MapIcon className={styles.viewIcon} />
            ) : (
              <ListIcon className={styles.viewIcon} />
            )}
          </IconButton> */}
        {/* </div> */}
      </div>

      <div className={styles.content}>
        <div className={styles.buttonGroup}>
          <Button
            variant="contained"
            className={styles.listViewButton}
            onClick={() => setCurrentView("list")}
          >
            List View
          </Button>
          <Button
            variant="contained"
            className={styles.mapViewButton}
            onClick={() => setCurrentView("map")}
          >
            Map View
          </Button>
        </div>
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
