import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import authority from "../../../assets/Authority.svg";
import background from "../../../assets/HomeScreenBackground.png";
import grid1 from "../../../assets/HomeScreenGrid1.png";
import grid2 from "../../../assets/HomeScreenGrid2.png";
import grid3 from "../../../assets/HomeScreenGrid3.png";
import grid4 from "../../../assets/HomeScreenGrid4.png";
import reportIssueArt from "../../../assets/ReportIssueArt.png";
import viewReportsArt from "../../../assets/ViewReportsArt.png";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./HomeScreen.module.scss";

interface HomeScreenProps {
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [positions, setPositions] = useState([0, 1, 2, 3]);
  const [shrinking, setShrinking] = useState(false);
  const images = [grid1, grid2, grid4, grid3];

  useEffect(() => {
    const interval = setInterval(() => {
      setShrinking(true); // Start shrinking

      setTimeout(() => {
        setPositions((prev) => {
          const newPos = [...prev];
          newPos.push(newPos.shift()!); // Rotate while shrunk
          return newPos;
        });
        // Wait for the transition to complete before growing back
        setTimeout(() => {
          setShrinking(false); // Grow back after moving
        }, 1000); // This should match your CSS transition duration
      }, 1000); // Shrink duration before moving (optional, can be 0)
    }, 6000);

    return () => clearInterval(interval);
  }, []);

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
      console.log("Signing out");
      const { error } = await supabase.auth.signOut();
      console.log("Sign out response:", error);
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

  const handleReportIssue = () => {
    navigate("/submit-report");
  };

  const handleViewReports = () => {
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
    return "User";
  };

  const getUserAvatar = () => {
    if (user.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    return authority;
  };

  return (
    <div className={styles.container}>
      <img src={background} alt="Background" className={styles.background} />
      <IconButton className={styles.menuIconButton} onClick={handleMenuOpen}>
        <MenuIcon className={styles.menuIcon} />
      </IconButton>
      <div className={styles.actionContainer}>
        <div className={styles.headerSection}>
          <h1 className={styles.header}>Safii</h1>
          <span className={styles.tagline}>
            WHEN CITIZENS CARE, CITIES CHANGE.
          </span>
        </div>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaBubble} onClick={handleReportIssue}>
            <img
              src={reportIssueArt}
              alt="Report an issue"
              className={styles.reportIssueArt}
            />
            <div className={styles.ctaDataSection}>
              <h1 className={styles.ctaTitle}>REPORT AN ISSUE</h1>
              <span className={styles.ctaDescription}>
                Report garbage dumps, potholes and pollution in your
                neighborhood in just a few taps.
              </span>
              <div className={styles.arrow}></div>
            </div>
          </div>
          <div className={styles.ctaBubble} onClick={handleViewReports}>
            <img
              src={viewReportsArt}
              alt="View Reports"
              className={styles.viewReportsArt}
            />
            <div className={styles.ctaDataSection}>
              <h1 className={styles.ctaTitle}>VIEW REPORTS</h1>
              <span className={styles.ctaDescription}>
                View and check the status of the issues reported in your
                neighborhood.
              </span>
              <div className={styles.arrow}></div>
            </div>
          </div>
        </div>
      </div>
      {/* Desktop grid animation (hidden on mobile) */}
      <div className={styles.imageContainerDesktop}>
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            className={`${styles.gridImage} ${styles[`pos${positions[i]}`]} ${
              shrinking ? styles.shrinking : ""
            }`}
            alt={`Grid${i + 1}`}
          />
        ))}
      </div>
      {/* Mobile carousel animation (hidden on desktop) */}
      <div className={styles.imageContainerMobile}>
        <div className={styles.carouselTrack}>
          {[...images, ...images].map((src, i) => (
            <img
              key={i}
              src={src}
              className={styles.carouselImage}
              alt={`Grid${(i % images.length) + 1}`}
            />
          ))}
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
          <img
            src={getUserAvatar()}
            alt="Avatar"
            className={styles.userAvatar}
          />
          <div className={styles.userDetails}>
            <span>Welcome {getUserName()}!</span>
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

export default HomeScreen;
