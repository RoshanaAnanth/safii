import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import styles from "./AdminHomeScreen.module.scss";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import MapIcon from "@mui/icons-material/Map";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import ReportIcon from "@mui/icons-material/Report";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface AdminHomeScreenProps {
  user: User;
}

interface DashboardStats {
  totalIssues: number;
  pendingIssues: number;
  resolvedIssues: number;
  todayIssues: number;
}

interface Issue {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "resolved" | "rejected";
  location: string;
  created_at: string;
}

const AdminHomeScreen: React.FC<AdminHomeScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    todayIssues: 0,
  });
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats
      const { data: issues, error: issuesError } = await supabase
        .from("issues")
        .select("id, status, created_at");

      if (issuesError) {
        console.error("Error fetching issues:", issuesError);
        return;
      }

      // Calculate stats
      const today = new Date().toDateString();
      const totalIssues = issues?.length || 0;
      const pendingIssues =
        issues?.filter((issue) => issue.status === "pending").length || 0;
      const resolvedIssues =
        issues?.filter((issue) => issue.status === "resolved").length || 0;
      const todayIssues =
        issues?.filter(
          (issue) => new Date(issue.created_at).toDateString() === today
        ).length || 0;

      setStats({
        totalIssues,
        pendingIssues,
        resolvedIssues,
        todayIssues,
      });

      // Fetch recent issues
      const { data: recentIssuesData, error: recentError } = await supabase
        .from("issues")
        .select(
          `
          id,
          title,
          category,
          status,
          location,
          created_at
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (recentError) {
        console.error("Error fetching recent issues:", recentError);
        return;
      }

      setRecentIssues(recentIssuesData || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        alert("Error signing out. Please try again.");
      } else {
        // Close menu first
        handleMenuClose();
        // Navigation will be handled automatically by the auth state change in App.tsx
        console.log("Successfully signed out");
      }
    } catch (error) {
      console.error("Unexpected error during sign out:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleIssueClick = (issueId: string) => {
    navigate(`/admin/issue/${issueId}`);
  };

  const getUserName = () => {
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(" ")[0];
    }
    if (user.user_metadata?.name) {
      return user.user_metadata.name.split(" ")[0];
    }
    if (user.email) {
      return user.email.split("@")[0];
    }
    return "Admin";
  };

  const getUserAvatar = () => {
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    return null;
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      pothole: "🕳️",
      drainage: "🌊",
      garbage: "🗑️",
      landslide: "⛰️",
      street_light: "💡",
      broken_sign: "🚧",
      other: "❓",
    };
    return iconMap[category] || "❓";
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return styles.statusPending;
      case "in_progress":
        return styles.statusInProgress;
      case "resolved":
        return styles.statusResolved;
      case "rejected":
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const formatLocation = (location: string) => {
    if (typeof location === "string") {
      if (location.includes(",")) {
        const [lat, lng] = location.split(",");
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
      }
      return location.length > 30 ? `${location.substring(0, 30)}...` : location;
    }
    
    // Handle location object
    if (location && typeof location === "object") {
      const locationObj = location as any;
      if (locationObj.address) {
        return locationObj.address.length > 30 
          ? `${locationObj.address.substring(0, 30)}...` 
          : locationObj.address;
      }
      if (locationObj.lat && locationObj.lng) {
        return `${locationObj.lat.toFixed(4)}, ${locationObj.lng.toFixed(4)}`;
      }
    }
    
    return "Unknown location";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Safii Admin</h1>
        <div className={styles.profileSection}>
          <span className={styles.welcomeText}>Welcome, {getUserName()}!</span>
          <IconButton className={styles.profileButton} onClick={handleMenuOpen}>
            <AccountCircleIcon className={styles.profileIcon} />
          </IconButton>
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Total Issues</h3>
            <ReportIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.totalIssues}</p>
          <p className={styles.statLabel}>All time</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pending</h3>
            <PendingActionsIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.pendingIssues}</p>
          <p className={styles.statLabel}>Awaiting action</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resolved</h3>
            <TrendingUpIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.resolvedIssues}</p>
          <p className={styles.statLabel}>Completed</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Today</h3>
            <DashboardIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.todayIssues}</p>
          <p className={styles.statLabel}>New reports</p>
        </div>
      </div>

      <div className={styles.recentIssues}>
        <h2 className={styles.sectionTitle}>
          <AssignmentIcon className={styles.sectionIcon} />
          Recent Issues
        </h2>

        {loading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyTitle}>Loading...</div>
          </div>
        ) : recentIssues.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3 className={styles.emptyTitle}>No Recent Issues</h3>
            <p className={styles.emptyDescription}>
              No issues have been reported recently.
            </p>
          </div>
        ) : (
          <div className={styles.issuesList}>
            {recentIssues.map((issue) => (
              <div 
                key={issue.id} 
                className={styles.issueItem}
                onClick={() => handleIssueClick(issue.id)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.issueIcon}>
                  {getCategoryIcon(issue.category)}
                </div>
                <div className={styles.issueDetails}>
                  <h4 className={styles.issueTitle}>{issue.title}</h4>
                  <p className={styles.issueLocation}>
                    {formatLocation(issue.location)}
                  </p>
                </div>
                <span
                  className={`${styles.issueStatus} ${getStatusClass(
                    issue.status
                  )}`}
                >
                  {issue.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>
          <DashboardIcon className={styles.sectionIcon} />
          Quick Actions
        </h2>
        <div className={styles.actionsGrid}>
          <Button
            className={styles.actionButton}
            onClick={() => navigate("/view-reports")}
          >
            <ListAltIcon className={styles.actionIcon} />
            View All Issues
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() => navigate("/view-reports")}
          >
            <MapIcon className={styles.actionIcon} />
            Map View
          </Button>
          <Button
            className={styles.actionButton}
            onClick={() => navigate("/submit-report")}
          >
            <ReportIcon className={styles.actionIcon} />
            Report Issue
          </Button>
        </div>
      </div>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        className={styles.profileMenu}
        slotProps={{
          paper: {
            className: styles.menuPaper,
          },
        }}
      >
        <MenuItem className={styles.userProfile}>
          {getUserAvatar() ? (
            <img
              src={getUserAvatar()}
              alt="Avatar"
              className={styles.userAvatar}
            />
          ) : (
            <AccountCircleIcon className={styles.userAvatar} />
          )}
          <div className={styles.userDetails}>
            <span>Admin: {getUserName()}</span>
            <span className={styles.email}>{user.email}</span>
          </div>
        </MenuItem>
        <Divider />
        <MenuItem className={styles.signOutOption} onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
};

export default AdminHomeScreen;