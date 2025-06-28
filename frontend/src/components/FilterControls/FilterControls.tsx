import React from "react";
import styles from "./FilterControls.module.scss";

import FilterListIcon from "@mui/icons-material/FilterList";
import Button from "@mui/material/Button";
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

  const hasActiveFilters = 
    filters.status !== "all" || 
    filters.category !== "all" || 
    filters.priority !== "all";

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <h3 className={styles.filterTitle}>
          <FilterListIcon className={styles.filterIcon} />
          Filter Reports
        </h3>
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            className={styles.clearButton}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className={styles.filterGrid}>
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
                  marginTop: "8px",
                },
              },
            }}
          >
            <MenuItem value="all" className={styles.menuItem}>
              All Status
            </MenuItem>
            <MenuItem value="pending" className={styles.menuItem}>
              Pending
            </MenuItem>
            <MenuItem value="in_progress" className={styles.menuItem}>
              In Progress
            </MenuItem>
            <MenuItem value="resolved" className={styles.menuItem}>
              Resolved
            </MenuItem>
            <MenuItem value="rejected" className={styles.menuItem}>
              Rejected
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
                  marginTop: "8px",
                },
              },
            }}
          >
            <MenuItem value="all" className={styles.menuItem}>
              All Categories
            </MenuItem>
            <MenuItem value="pothole" className={styles.menuItem}>
              🕳️ Pothole
            </MenuItem>
            <MenuItem value="drainage" className={styles.menuItem}>
              🌊 Drainage
            </MenuItem>
            <MenuItem value="garbage" className={styles.menuItem}>
              🗑️ Garbage
            </MenuItem>
            <MenuItem value="landslide" className={styles.menuItem}>
              ⛰️ Landslide
            </MenuItem>
            <MenuItem value="street_light" className={styles.menuItem}>
              💡 Street Light
            </MenuItem>
            <MenuItem value="broken_sign" className={styles.menuItem}>
              🚧 Broken Sign
            </MenuItem>
            <MenuItem value="other" className={styles.menuItem}>
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
                  marginTop: "8px",
                },
              },
            }}
          >
            <MenuItem value="all" className={styles.menuItem}>
              All Priorities
            </MenuItem>
            <MenuItem value="critical" className={styles.menuItem}>
              🔴 Critical
            </MenuItem>
            <MenuItem value="high" className={styles.menuItem}>
              🟠 High
            </MenuItem>
            <MenuItem value="medium" className={styles.menuItem}>
              🟡 Medium
            </MenuItem>
            <MenuItem value="low" className={styles.menuItem}>
              🟢 Low
            </MenuItem>
          </Select>
        </div>
      </div>

      <div className={styles.resultsCount}>
        <p className={styles.resultsText}>
          Showing <span className={styles.resultsNumber}>{resultsCount}</span> result{resultsCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default FilterControls;