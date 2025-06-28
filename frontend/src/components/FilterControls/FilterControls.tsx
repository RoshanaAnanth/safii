import React, { useState } from "react";
import styles from "./FilterControls.module.scss";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";

export interface FilterState {
  status: string[];
  category: string[];
  priority: string[];
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
  const [expandedSections, setExpandedSections] = useState({
    status: false,
    category: false,
    priority: false,
  });
  const isMenuOpen = Boolean(anchorEl);

  const statusOptions = [
    { value: "pending", label: "🟡 Pending" },
    { value: "in_progress", label: "🔵 In Progress" },
    { value: "resolved", label: "🟢 Resolved" },
    { value: "rejected", label: "🔴 Rejected" },
  ];

  const categoryOptions = [
    { value: "pothole", label: "🕳️ Pothole" },
    { value: "drainage", label: "🌊 Drainage" },
    { value: "garbage", label: "🗑️ Garbage" },
    { value: "landslide", label: "⛰️ Landslide" },
    { value: "street_light", label: "💡 Street Light" },
    { value: "broken_sign", label: "🚧 Broken Sign" },
    { value: "other", label: "❓ Other" },
  ];

  const priorityOptions = [
    { value: "critical", label: "🔴 Critical" },
    { value: "high", label: "🟠 High" },
    { value: "medium", label: "🟡 Medium" },
    { value: "low", label: "🟢 Low" },
  ];

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    checked: boolean
  ) => {
    const currentValues = filters[filterType] as string[];
    let newValues: string[];

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v) => v !== value);
    }

    const newFilters = {
      ...filters,
      [filterType]: newValues,
    };
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onFilterChange({
      status: [],
      category: [],
      priority: [],
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const hasActiveFilters = 
    filters.status.length > 0 || 
    filters.category.length > 0 || 
    filters.priority.length > 0;

  const getActiveCount = (filterType: keyof FilterState) => {
    return filters[filterType].length;
  };

  const renderCollapsibleSection = (
    title: string,
    filterType: keyof FilterState,
    options: { value: string; label: string }[]
  ) => {
    const isExpanded = expandedSections[filterType];
    const activeCount = getActiveCount(filterType);

    return (
      <div className={styles.filterGroup}>
        <div 
          className={styles.sectionHeader}
          onClick={() => toggleSection(filterType)}
        >
          <div className={styles.sectionTitleContainer}>
            <span className={styles.sectionTitle}>{title}</span>
            {activeCount > 0 && (
              <span className={styles.activeCount}>({activeCount})</span>
            )}
          </div>
          <IconButton className={styles.expandButton}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </div>
        
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <div className={styles.checkboxGroup}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={filters[filterType].includes(option.value)}
                    onChange={(e) =>
                      handleFilterChange(filterType, option.value, e.target.checked)
                    }
                    className={styles.checkbox}
                    size="small"
                  />
                }
                label={option.label}
                className={styles.checkboxLabel}
              />
            ))}
          </div>
        </Collapse>
      </div>
    );
  };

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
          {renderCollapsibleSection("Status", "status", statusOptions)}
          {renderCollapsibleSection("Category", "category", categoryOptions)}
          {renderCollapsibleSection("Priority", "priority", priorityOptions)}
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