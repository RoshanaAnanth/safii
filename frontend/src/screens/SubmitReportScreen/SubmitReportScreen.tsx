import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import SuccessModal from "../../components/SuccessModal/SuccessModal";
import supabase from "../../lib/supabase";
import { reverseGeocode, uploadImage } from "../../lib/utils";
import { useToast } from "../../context/ToastContext";
import styles from "./SubmitReportScreen.module.scss";

import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import CloseIcon from "@mui/icons-material/Close";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "../../components/Chip/Chip";

import background from "../../../assets/HomeScreenBackground.png";
import submitReportIllustration1 from "../../../assets/SubmitReportIllustration1.png";
import submitReportIllustration2 from "../../../assets/SubmitReportIllustration2.png";
import submitReportIllustration3 from "../../../assets/SubmitReportIllustration3.png";
import submitReportIllustration4 from "../../../assets/SubmitReportIllustration4.png";
import submitReportIllustration5 from "../../../assets/SubmitReportIllustration5.png";

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
  const { showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    category: "pothole",
    priority: "medium",
    location: "",
    imageUrl: "",
  });
  const [activeIndex, setActiveIndex] = useState(-1);

  // Get user profile and current location
  useEffect(() => {
    getCurrentLocation();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeIndex < 3) {
      const timeout = setTimeout(() => {
        setActiveIndex((prev) => prev + 1);
      }, 800); // Adjust timing as needed
      return () => clearTimeout(timeout);
    }
  }, [activeIndex]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Get area name using reverse geocoding
          const areaName = await reverseGeocode(latitude, longitude);

          let locationString;
          if (areaName) {
            // If we got a meaningful area name, format as "Area (lat, lng)"
            locationString = `${areaName} (${latitude.toFixed(
              4
            )}, ${longitude.toFixed(4)})`;
          } else {
            // If no area name found, just use coordinates
            locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          }

          setFormData((prev) => ({
            ...prev,
            location: locationString,
          }));
        } catch (error) {
          console.error("Error getting area name:", error);
          // Fallback to just coordinates
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        }

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
    setIsImageUploading(true);
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
      showError("Failed to upload image. Please try again.", "Upload Failed");
    } finally {
      setIsImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(undefined);
    setFormData((prev) => ({
      ...prev,
      imageUrl: "",
    }));
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.title.trim() || !formData.description.trim()) {
      showError("Please fill in all required fields", "Validation Error");
      return;
    }

    if (!formData.location) {
      showError("Please allow location access or enter an address manually", "Location Required");
      return;
    }

    setLoading(true);
    try {
      // Parse location data - handle both formats
      let locationData;

      if (formData.location.includes("(") && formData.location.includes(")")) {
        // Format: "Area Name (lat, lng)"
        const parts = formData.location.split("(");
        const areaName = parts[0].trim();
        const coordsPart = parts[1].replace(")", "").trim();
        const [lat, lng] = coordsPart
          .split(",")
          .map((coord) => parseFloat(coord.trim()));

        locationData = {
          type: "coordinates",
          lat: lat,
          lng: lng,
          address: areaName,
        };
      } else if (
        formData.location.includes(",") &&
        !isNaN(parseFloat(formData.location.split(",")[0]))
      ) {
        // It's just coordinates (lat, lng) - no area name found
        const [lat, lng] = formData.location
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        locationData = {
          type: "coordinates",
          lat: lat,
          lng: lng,
          address: null, // Set to null when no area name is available
        };
      } else {
        // It's an address string
        locationData = {
          type: "address",
          address: formData.location,
        };
      }

      // Submit directly to Supabase
      const { data: newIssue, error } = await supabase
        .from("issues")
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          location: locationData,
          imageUrl: formData.imageUrl || null,
          reporter_id: user.id,
          status: "pending",
        })
        .select()
        .single();

      if (error) {
        console.error("Error submitting issue:", error);
        showError("Failed to submit report. Please try again.", "Submission Failed");
        return;
      }

      console.log("Issue submitted successfully:", newIssue);

      // Show success modal instead of alert
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error submitting report:", error);
      showError("Failed to submit report. Please try again.", "Submission Error");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back to home after modal closes
    navigate("/home");
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
      <img src={background} alt="Background" className={styles.background} />
      <IconButton
        onClick={() => navigate("/home")}
        className={styles.backButton}
      >
        <ArrowBackIosRoundedIcon className={styles.backIcon} />
      </IconButton>
      <div className={styles.imageContainer}>
        <div className={styles.illustrationGrid}>
          <img
            src={submitReportIllustration1}
            alt="Illustration 1"
            className={`${styles.illustration} ${
              activeIndex >= 0 ? styles.visible : styles.hidden
            }`}
            loading="lazy"
          />
          <div />
          <div />
          <img
            src={submitReportIllustration2}
            alt="Illustration 2"
            className={`${styles.illustration} ${
              activeIndex >= 1 ? styles.visible : styles.hidden
            }`}
            loading="lazy"
          />
          <img
            src={submitReportIllustration3}
            alt="Illustration 3"
            className={`${styles.illustration} ${
              activeIndex >= 2 ? styles.visible : styles.hidden
            }`}
            loading="lazy"
          />
          <div />
          <div />
          <img
            src={submitReportIllustration4}
            alt="Illustration 4"
            className={`${styles.illustration} ${
              activeIndex >= 3 ? styles.visible : styles.hidden
            }`}
            loading="lazy"
          />
        </div>
      </div>
      <div className={styles.formContainer}>
        <h1 className={styles.headerText}>Safii</h1>
        <form className={styles.form}>
          <img
            src={submitReportIllustration5}
            alt="Illustration 5"
            className={styles.formIllustration}
            loading="lazy"
          />
          <h3 className={styles.formTitle}>REPORT AN ISSUE</h3>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              TITLE <span className={styles.asterisk}>*</span>
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
                CATEGORY <span className={styles.asterisk}>*</span>
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
                  slotProps: {
                    paper: {
                      sx: {
                        backgroundColor: "#f1f8e8", // Your desired color
                      },
                    },
                  },
                }}
              >
                <MenuItem value="pothole" className={styles.menuItem}>
                  <Chip type="category" label="Pothole" category="pothole" />
                </MenuItem>
                <MenuItem value="drainage" className={styles.menuItem}>
                  <Chip type="category" label="Drainage" category="drainage" />
                </MenuItem>
                <MenuItem value="garbage" className={styles.menuItem}>
                  <Chip type="category" label="Garbage" category="garbage" />
                </MenuItem>
                <MenuItem value="landslide" className={styles.menuItem}>
                  <Chip
                    type="category"
                    label="Landslide"
                    category="landslide"
                  />
                </MenuItem>
                <MenuItem value="street_light" className={styles.menuItem}>
                  <Chip
                    type="category"
                    label="Street Light"
                    category="street_light"
                  />
                </MenuItem>
                <MenuItem value="broken_sign" className={styles.menuItem}>
                  <Chip
                    type="category"
                    label="Broken Sign"
                    category="broken_sign"
                  />
                </MenuItem>
                <MenuItem value="other" className={styles.menuItem}>
                  <Chip type="category" label="Other" category="other" />
                </MenuItem>
              </Select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="priority" className={styles.label}>
                PRIORITY <span className={styles.asterisk}>*</span>
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
                  slotProps: {
                    paper: {
                      sx: {
                        backgroundColor: "#f1f8e8", // Your desired color
                      },
                    },
                  },
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
              LOCATION <span className={styles.asterisk}>*</span>
            </label>
            <Input
              id="location"
              name="location"
              type="text"
              value={formData.location || ""}
              onChange={handleInputChange}
              required
              className={styles.input}
              placeholder={
                locationLoading
                  ? "Getting location..."
                  : "Enter address or use GPS"
              }
              disabled={locationLoading}
              startAdornment={
                <InputAdornment
                  position="start"
                  className={styles.inputAdornment}
                >
                  <IconButton
                    aria-label="Fetch location"
                    onClick={getCurrentLocation}
                    className={styles.locationButton}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <LoadingSpinner size="small" />
                    ) : (
                      <LocationPinIcon className={styles.locationIcon} />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              DESCRIPTION
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
            {isImageUploading ? (
              <div className={styles.uploadingContainer}>
                <LoadingSpinner size="large" />
                <p className={styles.uploadingText}>Uploading image...</p>
              </div>
            ) : uploadedImage ? (
              <div className={styles.imagePreviewContainer}>
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="Preview"
                  className={styles.imagePreview}
                />
                <IconButton
                  onClick={handleRemoveImage}
                  className={styles.removeImageIcon}
                  aria-label="Remove image"
                >
                  <CloseIcon />
                </IconButton>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => inputRef.current?.click()}
                  disabled={isImageUploading}
                >
                  UPLOAD AN IMAGE
                </button>
                <input
                  type="file"
                  name="image"
                  ref={inputRef}
                  className={styles.fileInput}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      handleImageUpload(file);
                    }
                  }}
                  accept="image/*"
                />
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || locationLoading || isImageUploading}
            className={styles.submitButton}
            onClick={handleSubmit}
          >
            {loading ? (
              <div className={styles.buttonContent}>
                <LoadingSpinner size="small" color="white" />
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Success!"
        message="Your report has been submitted."
        // autoCloseDelay={3000}
      />
    </div>
  );
};

export default SubmitReportScreen;