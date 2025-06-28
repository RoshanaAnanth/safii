import React, { useState } from "react";
import styles from "./FilterControls.module.scss";

import FilterListIcon from "@mui/icons-material/FilterList";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";

export interface FilterState {
  status: string;
  category: string;
  priority: string;
}

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  resultsCount: number;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  onFilterChange,
  resultsCount,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleFilterChange = (filterType: keyof FilterState) => (
    event: SelectChangeEvent<string>
  ) => {
    const newFilters = {
      ...filters,
      [filterType]: event.target.value,
    };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: "all",
      category: "all",
      priority: "all",
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const hasActiveFilters = 
    filters.status !== "all" || 
    filters.category !== "all" || 
    filters.priority !== "all";

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        className={`${styles.filterButton} ${hasActiveFilters ? styles.active : ""}`}
      >
        <FilterListIcon className={styles.filterIcon} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleMenuClose}
        className={styles.filterMenu}
        slotProps={{
          paper: {
            className: styles.menuPaper,
          },
        }}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <div className={styles.menuHeader}>
          <div className={styles.menuTitle}>
            Filter Reports
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                className={styles.clearButton}
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className={styles.menuContent}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <Select
              value={filters.status}
              onChange={handleFilterChange("status")}
              className={styles.filterSelect}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: "12px",
                    marginTop: "4px",
                  },
                },
              }}
            >
              <MenuItem value="all" className={styles.selectMenuItem}>
                All Status
              </MenuItem>
              <MenuItem value="pending" className={styles.selectMenuItem}>
                🟡 Pending
              </MenuItem>
              <MenuItem value="in_progress" className={styles.selectMenuItem}>
                🔵 In Progress
              </MenuItem>
              <MenuItem value="resolved" className={styles.selectMenuItem}>
                🟢 Resolved
              </MenuItem>
              <MenuItem value="rejected" className={styles.selectMenuItem}>
                🔴 Rejected
              </MenuItem>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <Select
              value={filters.category}
              onChange={handleFilterChange("category")}
              className={styles.filterSelect}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: "12px",
                    marginTop: "4px",
                  },
                },
              }}
            >
              <MenuItem value="all" className={styles.selectMenuItem}>
                All Categories
              </MenuItem>
              <MenuItem value="pothole" className={styles.selectMenuItem}>
                🕳️ Pothole
              </MenuItem>
              <MenuItem value="drainage" className={styles.selectMenuItem}>
                🌊 Drainage
              </MenuItem>
              <MenuItem value="garbage" className={styles.selectMenuItem}>
                🗑️ Garbage
              </MenuItem>
              <MenuItem value="landslide" className={styles.selectMenuItem}>
                ⛰️ Landslide
              </MenuItem>
              <MenuItem value="street_light" className={styles.selectMenuItem}>
                💡 Street Light
              </MenuItem>
              <MenuItem value="broken_sign" className={styles.selectMenuItem}>
                🚧 Broken Sign
              </MenuItem>
              <MenuItem value="other" className={styles.selectMenuItem}>
                ❓ Other
              </MenuItem>
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Priority</label>
            <Select
              value={filters.priority}
              onChange={handleFilterChange("priority")}
              className={styles.filterSelect}
              MenuProps={{
                PaperProps: {
                  style: {
                    borderRadius: "12px",
                    marginTop: "4px",
                  },
                },
              }}
            >
              <MenuItem value="all" className={styles.selectMenuItem}>
                All Priorities
              </MenuItem>
              <MenuItem value="critical" className={styles.selectMenuItem}>
                🔴 Critical
              </MenuItem>
              <MenuItem value="high" className={styles.selectMenuItem}>
                🟠 High
              </MenuItem>
              <MenuItem value="medium" className={styles.selectMenuItem}>
                🟡 Medium
              </MenuItem>
              <MenuItem value="low" className={styles.selectMenuItem}>
                🟢 Low
              </MenuItem>
            </Select>
          </div>
        </div>

        <div className={styles.resultsFooter}>
          <p className={styles.resultsText}>
            Showing <span className={styles.resultsNumber}>{resultsCount}</span> result{resultsCount !== 1 ? 's' : ''}
          </p>
        </div>
      </Menu>
    </>
  );
};

export default FilterControls;