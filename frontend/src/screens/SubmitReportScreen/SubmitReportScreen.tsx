import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, uploadImage } from "../../lib/utils";
import styles from "./SubmitReportScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "../../components/Chip/Chip";

interface SubmitReportScreenProps {
  user: User;
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
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  imageUrl: string;
}

const SubmitReportScreen: React.FC<SubmitReportScreenProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "pothole",
    priority: "medium",
    location: "",
    imageUrl: "",
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
          location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
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

  const handleImageUpload = async (uploadedImage: File) => {
    try {
      const imageUrl = await uploadImage(
        uploadedImage,
        user.id,
        formData.title
      );
      console.log("Uploaded image URL:", imageUrl);

      setUploadedImage(uploadedImage);
      setFormData((prev) => ({
        ...prev,
        imageUrl: imageUrl ?? "",
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (!formData.location) {
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
      HTMLInputElement | HTMLTextAreaElement | SelectChangeEvent
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
        <form className={styles.form}>
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
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className={styles.select}
                disabled={loading}
                MenuProps={{
                  className: styles.dropdownMenu,
                }}
              >
                <MenuItem value="pothole" className={styles.menuItem}>
                  <Chip type="category" label="Pothole" icon="🕳️" />
                </MenuItem>
                <MenuItem value="drainage" className={styles.menuItem}>
                  <Chip type="category" label="Drainage" icon="🌊" />
                </MenuItem>
                <MenuItem value="garbage" className={styles.menuItem}>
                  <Chip type="category" label="Garbage" icon="🗑️" />
                </MenuItem>
                <MenuItem value="landslide" className={styles.menuItem}>
                  <Chip type="category" label="Landslide" icon="⛰️" />
                </MenuItem>
                <MenuItem value="street_light" className={styles.menuItem}>
                  <Chip type="category" label="Street Light" icon="💡" />
                </MenuItem>
                <MenuItem value="broken_sign" className={styles.menuItem}>
                  <Chip type="category" label="Broken Sign" icon="🚧" />
                </MenuItem>
                <MenuItem value="other" className={styles.menuItem}>
                  <Chip type="category" label="Other" icon="❓" />
                </MenuItem>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                Priority <span className={styles.asterisk}>*</span>
              </label>
              <Select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                required
                className={styles.select}
                disabled={loading}
                MenuProps={{
                  className: styles.dropdownMenu,
                }}
              >
                <MenuItem value="critical" className={styles.menuItem}>
                  <Chip type="priority" priority="critical" label="Critical" />
                </MenuItem>
                <MenuItem value="high" className={styles.menuItem}>
                  <Chip type="priority" priority="high" label="High" />
                </MenuItem>
                <MenuItem value="medium" className={styles.menuItem}>
                  <Chip type="priority" priority="medium" label="Medium" />
                </MenuItem>
                <MenuItem value="low" className={styles.menuItem}>
                  <Chip type="priority" priority="low" label="Low" />
                </MenuItem>
              </Select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Location <span className={styles.asterisk}>*</span>
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location || ""}
              onChange={handleInputChange}
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
            {uploadedImage ? (
              <img
                src={URL.createObjectURL(uploadedImage)}
                alt="Preview"
                className={styles.imagePreview}
              />
            ) : (
              <>
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => inputRef.current?.click()}
                >
                  Upload Image
                </button>
                <input
                  type="file"
                  name="image"
                  ref={inputRef}
                  className={styles.fileInput}
                  onChange={(event) => {
                    handleImageUpload(event.target.files[0]);
                  }}
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading}
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitReportScreen;
