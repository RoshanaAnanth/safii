import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../lib/utils";
import styles from "./SubmitReportScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import LocationPinIcon from "@mui/icons-material/LocationPin";

interface SubmitReportScreenProps {
  user: User;
}

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface FormData {
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
  priority: "low" | "medium" | "high" | "urgent";
  location: LocationData;
  images: string[];
}

const SubmitReportScreen: React.FC<SubmitReportScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "pothole",
    priority: "medium",
    location: { lat: 0, lng: 0, address: "" },
    images: [],
  });

  // Get user's current location
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          },
        }));
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.location.address) {
      alert("Please allow location access or enter an address manually");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRequest("/api/issues/submit", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      console.log("Issue submitted successfully:", response);

      // Show success message
      alert(
        "Issue submitted successfully! Thank you for helping make your community better."
      );

      // Navigate back to home
      navigate("/home");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]:
          name === "lat" || name === "lng" ? parseFloat(value) || 0 : value,
      },
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <IconButton
          onClick={() => navigate("/home")}
          className={styles.backButton}
        >
          <ArrowBackIosRoundedIcon className={styles.backIcon} />
        </IconButton>
        <h1 className={styles.headerText}>Safii</h1>
        <hr className={styles.horizontalLine} />
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Title <span className={styles.asterisk}>*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="Enter issue title"
              className={styles.input}
              disabled={loading}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="category" className={styles.label}>
                Category <span className={styles.asterisk}>*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="pothole">Pothole</option>
                <option value="drainage">Drainage</option>
                <option value="garbage">Garbage</option>
                <option value="landslide">Landslide</option>
                <option value="street_light">Street Light</option>
                <option value="broken_sign">Broken Sign</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority <span className={styles.asterisk}>*</span>
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Location <span className={styles.asterisk}>*</span>
            </label>
            <Input
              id="address"
              type="text"
              value={formData.location.address}
              onChange={handleLocationChange}
              required
              className={styles.input}
              startAdornment={
                <InputAdornment
                  position="start"
                  className={styles.inputAdornment}
                >
                  <IconButton
                    aria-label="Fetch location"
                    onClick={getCurrentLocation}
                    className={styles.locationButton}
                  >
                    <LocationPinIcon className={styles.locationIcon} />
                  </IconButton>
                </InputAdornment>
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              placeholder="Describe the issue in detail"
              rows={4}
              className={styles.textarea}
              disabled={loading}
            />
          </div>

          <div className={styles.imageSection}>
            <button className={styles.uploadButton}>Upload Image</button>
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className={styles.submitButton}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitReportScreen;
