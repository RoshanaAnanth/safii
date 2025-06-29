import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";
import { formatLocationForDisplay } from "../../lib/utils";
import styles from "./AdminHomeScreen.module.scss";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";

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
  status: "pending" | "resolved";
  location: any;
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

  const handleViewAllIssues = () => {
    navigate("/view-reports");
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

  const formatLocation = (location: any) => {
    // Use the utility function to format location consistently
    const formattedLocation = formatLocationForDisplay(location);

    // Truncate if too long for display
    if (formattedLocation.length > 30) {
      return `${formattedLocation.substring(0, 30)}...`;
    }

    return formattedLocation;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.logo}>Safii</h1>
          <p className={styles.adminSubtitle}>— ADMIN —</p>
        </div>
        <div className={styles.profileSection}>
          <IconButton className={styles.profileButton} onClick={handleMenuOpen}>
            <AccountCircleIcon className={styles.profileIcon} />
          </IconButton>
        </div>
      </div>

      <div className={styles.welcomeSection}>
        <div className={styles.welcomeContent}>
          <h2 className={styles.welcomeText}>Welcome back!</h2>
        </div>
        <div className={styles.welcomeIllustrationPlaceholder}>
          Illustration
        </div>
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Total Issues</h3>
            <SearchIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.totalIssues}</p>
          <p className={styles.statLabel}>All time</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Pending</h3>
            <HourglassEmptyIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.pendingIssues}</p>
          <p className={styles.statLabel}>Awaiting action</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Resolved</h3>
            <SettingsIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.resolvedIssues}</p>
          <p className={styles.statLabel}>Completed</p>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Today</h3>
            <CalendarTodayIcon className={styles.cardIcon} />
          </div>
          <p className={styles.statNumber}>{stats.todayIssues}</p>
          <p className={styles.statLabel}>New reports</p>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.recentIssuesSection}>
          <div className={styles.recentIssuesHeader}>
            <h2 className={styles.sectionTitle}>
              <AssignmentIcon className={styles.sectionIcon} />
              Recent Issues
            </h2>
            <Button
              className={styles.viewAllIssuesButton}
              onClick={handleViewAllIssues}
            >
              View All Issues
            </Button>
          </div>

          <div className={styles.recentIssuesContent}>
            <div className={styles.issuesList}>
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
                recentIssues.map((issue) => (
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
                ))
              )}
            </div>
            <div className={styles.recentIssuesIllustrationPlaceholder}>
              Illustration
            </div>
          </div>
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
