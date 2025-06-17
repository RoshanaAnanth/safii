import { User } from "@supabase/supabase-js";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../lib/supabase";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

import authority from "../../../assets/Authority.svg";
import background from "../../../assets/Background.jpg";

import Button from "@mui/material/Button";
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleReportIssue = () => {
    navigate("/submit-report");
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
      <Button className={styles.viewReportButton}>VIEW REPORTS</Button>
      <IconButton className={styles.profileIconButton} onClick={handleMenuOpen}>
        <AccountCircleIcon className={styles.profileIcon} />
      </IconButton>
      <div className={styles.headerContainer}>
        <img src={background} alt="Background" className={styles.background} />
        <div className={styles.headerText}>
          <h1 className={styles.header}>Safii</h1>
          <span className={styles.tagline}>
            Let's make our streets cleaner, together.
          </span>
        </div>
      </div>
      <div className={styles.contentContainer}>
        <span className={styles.description}>
          Report garbage dumps, potholes and pollution in your neighbourhood in
          just a few taps.
        </span>
        <span className={styles.contentTagline}>
          Be the change your city needs
        </span>
        <button onClick={handleReportIssue} className={styles.reportButton}>
          Report an issue
        </button>
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
        <MenuItem className={styles.userProfile} onClick={handleMenuClose}>
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
