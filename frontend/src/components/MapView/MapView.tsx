import L from "leaflet";
import React, { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import UpvoteButton from "../UpvoteButton/UpvoteButton";

import brokenSign from "../../../assets/BrokenSign.png";
import drainage from "../../../assets/Drainage.png";
import garbage from "../../../assets/Garbage.png";
import landslide from "../../../assets/Landslide.png";
import other from "../../../assets/Other.png";
import pothole from "../../../assets/Pothole.png";
import streetLight from "../../../assets/Streetlight.png";

import styles from "./MapView.module.scss";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import Chip from "../Chip/Chip";

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

interface MapViewProps {
  issues: Issue[];
  currentUserId: string;
}

const MapView: React.FC<MapViewProps> = ({ issues, currentUserId }) => {
  useEffect(() => {
    // Fix for default markers in react-leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  const createCustomIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      pothole: pothole,
      drainage: drainage,
      garbage: garbage,
      landslide: landslide,
      street_light: streetLight,
      broken_sign: brokenSign,
      other: other,
    };

    return L.divIcon({
      html: `<div class="${styles.customMarker}">
               <div class="${styles.markerIcon}">
             <img src="${iconMap[category]}" alt="Icon" style="width: 75%; height: 75%; object-fit: scale-down;" />
           </div>
             </div>`,
      className: "custom-div-icon",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "in_progress":
        return "#2196F3";
      case "resolved":
        return "#4CAF50";
      case "rejected":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "#4CAF50";
      case "medium":
        return "#FFA500";
      case "high":
        return "#FF5722";
      case "critical":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Extract coordinates from location string
  const extractCoordinates = (location: string): [number, number] | null => {
    console.log("Location in Map: ", location);
    // Check if location contains coordinates in parentheses (Area (lat, lng) format)
    if (location.includes("(") && location.includes(")")) {
      const coordsPart = location.split("(")[1].split(")")[0];
      const [lat, lng] = coordsPart
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }

    // Check if location is just coordinates
    if (location.includes(",")) {
      const [lat, lng] = location
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return [lat, lng];
      }
    }

    return null;
  };

  // Filter issues that have valid coordinates
  const issuesWithCoordinates = issues.filter(
    (issue) => extractCoordinates(issue.location) !== null
  );

  // Default center (you can adjust this based on your needs)
  const defaultCenter: [number, number] = [40.7128, -74.006]; // New York City

  // Calculate center from issues if available
  const mapCenter: [number, number] =
    issuesWithCoordinates.length > 0
      ? [
          issuesWithCoordinates.reduce((sum, issue) => {
            const coords = extractCoordinates(issue.location);
            return sum + (coords ? coords[0] : 0);
          }, 0) / issuesWithCoordinates.length,
          issuesWithCoordinates.reduce((sum, issue) => {
            const coords = extractCoordinates(issue.location);
            return sum + (coords ? coords[1] : 0);
          }, 0) / issuesWithCoordinates.length,
        ]
      : defaultCenter;

  if (issuesWithCoordinates.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🗺️</div>
        <h3 className={styles.emptyTitle}>No Reports Found</h3>
        <p className={styles.emptyDescription}>
          There are no reports matching your current filters. Try adjusting your
          filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          className={styles.map}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {issuesWithCoordinates.map((issue) => {
            const coords = extractCoordinates(issue.location);
            if (!coords) return null;

            const [lat, lng] = coords;

            return (
              <Marker
                key={issue.id}
                position={[lat, lng]}
                icon={createCustomIcon(issue.category)}
              >
                <Popup className={styles.popup}>
                  <div className={styles.popupContent}>
                    <div className={styles.headerSection}>
                      <h4 className={styles.popupTitle}>{issue.title}</h4>
                      <UpvoteButton
                        issueId={issue.id}
                        userId={currentUserId}
                        size="normal"
                      />
                    </div>

                    <div className={styles.popupMeta}>
                      <Chip
                        type="category"
                        label={issue.category}
                        category={issue.category.replace("_", " ")}
                      />
                      <Chip
                        type="status"
                        label={issue.status}
                        status={issue.status.replace("_", " ")}
                      />
                    </div>

                    <div className={styles.popupDetails}>
                      <div className={styles.popupDetail}>
                        <span className={styles.popupLabel}>Priority:</span>
                        <span
                          className={styles.popupPriority}
                          style={{ color: getPriorityColor(issue.priority) }}
                        >
                          {issue.priority}
                        </span>
                      </div>

                      <div className={styles.popupDetail}>
                        <span className={styles.popupLabel}>Location:</span>
                        <span className={styles.popupAddress}>
                          {issue.location}
                        </span>
                      </div>

                      <div className={styles.popupDetail}>
                        <span className={styles.popupLabel}>
                          Date reported:
                        </span>
                        <span className={styles.popupDate}>
                          {formatDate(issue.created_at)}
                        </span>
                      </div>

                      {issue.reporter_name && (
                        <div className={styles.popupDetail}>
                          <span className={styles.popupLabel}>
                            Reported By:
                          </span>
                          <span className={styles.popupReporter}>
                            {issue.reporter_name}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className={styles.popupDescription}>
                      {issue.description.length > 100
                        ? `${issue.description.substring(0, 100)}...`
                        : issue.description}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;
