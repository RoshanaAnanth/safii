import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import supabase from "../config/supabaseClient.js";

const router = express.Router();

// Rate limiting for issue submission
const issueSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 issue submissions per windowMs
  message: "Too many issue submissions, please try again later.",
});

// Validation middleware for issue submission
const issueValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),
  body("category")
    .isIn([
      "pothole",
      "drainage",
      "garbage",
      "landslide",
      "street_light",
      "broken_sign",
      "other",
    ])
    .withMessage("Invalid category"),
  body("priority")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid priority"),
  body("location")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Location is required"),
];

// Submit new issue endpoint
router.post(
  "/submit",
  issueSubmissionLimiter,
  issueValidation,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const {
        title,
        description,
        category,
        priority,
        location,
        imageUrl,
        userDetails,
      } = req.body;

      // Parse location - handle both coordinate strings and address strings
      let locationData;
      if (
        location.includes(",") &&
        !isNaN(parseFloat(location.split(",")[0]))
      ) {
        // It's coordinates (lat, lng)
        const [lat, lng] = location
          .split(",")
          .map((coord) => parseFloat(coord.trim()));
        locationData = {
          type: "coordinates",
          lat: lat,
          lng: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        };
      } else {
        // It's an address string
        locationData = {
          type: "address",
          address: location,
        };
      }

      // Insert issue into Supabase
      const { data: newIssue, error: insertError } = await supabase
        .from("issues")
        .insert({
          title,
          description,
          category,
          priority,
          location: locationData,
          imageUrl: imageUrl || null,
          reporter_id: userDetails?.id || null,
          status: "pending",
        })
        .select(
          `
          id,
          title,
          description,
          category,
          status,
          priority,
          location,
          imageUrl,
          reporter_id,
          admin_notes,
          resolved_at,
          created_at,
          updated_at,
          users!reporter_id (
            name,
            email
          )
        `
        )
        .single();

      if (insertError) {
        console.error("Error inserting issue:", insertError);
        return res.status(500).json({
          error: "Database error",
          message: "Failed to save issue to database",
        });
      }

      // Format response
      const formattedIssue = {
        id: newIssue.id,
        title: newIssue.title,
        category: newIssue.category,
        status: newIssue.status,
        priority: newIssue.priority,
        imageUrl: newIssue.imageUrl,
        created_at: newIssue.created_at,
        reporter_name:
          newIssue.users?.name || userDetails?.name || "Anonymous User",
        reporter_email:
          newIssue.users?.email || userDetails?.email || "unknown@example.com",
      };

      // Return success response
      res.status(201).json({
        message: "Issue submitted successfully",
        issue: formattedIssue,
      });
    } catch (error) {
      console.error("Issue submission error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Something went wrong while submitting the issue",
      });
    }
  }
);

// Get all issues endpoint (for viewing reports)
router.get("/", async (req, res) => {
  try {
    // Get query parameters for filtering
    const { status, category, priority } = req.query;

    // Build query
    let query = supabase
      .from("issues")
      .select(
        `
        id,
        title,
        description,
        category,
        status,
        priority,
        location,
        imageUrl,
        resolvedImageUrl,
        reporter_id,
        admin_notes,
        resolved_at,
        created_at,
        updated_at,
        users!reporter_id (
          name,
          email
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error("Error fetching issues:", error);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to fetch issues from database",
      });
    }

    // Format issues for frontend
    const formattedIssues = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      location:
        issue.location?.address ||
        (issue.location?.lat && issue.location?.lng
          ? `${issue.location.lat}, ${issue.location.lng}`
          : "Unknown location"),
      imageUrl: issue.imageUrl,
      resolvedImageUrl: issue.resolvedImageUrl,
      reporter_id: issue.reporter_id,
      admin_notes: issue.admin_notes,
      resolved_at: issue.resolved_at,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      reporter_name: issue.users?.name || "Anonymous User",
      reporter_email: issue.users?.email || "unknown@example.com",
    }));

    res.status(200).json({
      message: "Issues retrieved successfully",
      issues: formattedIssues,
      total: formattedIssues.length,
    });
  } catch (error) {
    console.error("Get issues error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong while retrieving issues",
    });
  }
});

// Get single issue by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: issue, error } = await supabase
      .from("issues")
      .select(
        `
        id,
        title,
        description,
        category,
        status,
        priority,
        location,
        imageUrl,
        resolvedImageUrl,
        reporter_id,
        admin_notes,
        resolved_at,
        created_at,
        updated_at,
        users!reporter_id (
          name,
          email
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          error: "Issue not found",
          message: "The requested issue does not exist",
        });
      }

      console.error("Error fetching issue:", error);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to fetch issue from database",
      });
    }

    // Format issue for frontend
    const formattedIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status,
      priority: issue.priority,
      location:
        issue.location?.address ||
        (issue.location?.lat && issue.location?.lng
          ? `${issue.location.lat}, ${issue.location.lng}`
          : "Unknown location"),
      imageUrl: issue.imageUrl,
      resolvedImageUrl: issue.resolvedImageUrl,
      reporter_id: issue.reporter_id,
      admin_notes: issue.admin_notes,
      resolved_at: issue.resolved_at,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      reporter_name: issue.users?.name || "Anonymous User",
      reporter_email: issue.users?.email || "unknown@example.com",
    };

    res.status(200).json({
      message: "Issue retrieved successfully",
      issue: formattedIssue,
    });
  } catch (error) {
    console.error("Get issue error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong while retrieving the issue",
    });
  }
});

// Update issue endpoint (for admin status updates)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolvedImageUrl, admin_notes } = req.body;

    // Validate status
    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        message: "Status must be one of: " + validStatuses.join(", "),
      });
    }

    // Build update object
    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      
      // If resolving, add resolved timestamp
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }
    }

    if (resolvedImageUrl) {
      updateData.resolvedImageUrl = resolvedImageUrl;
    }

    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }

    // Update issue in Supabase
    const { data: updatedIssue, error: updateError } = await supabase
      .from("issues")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        title,
        description,
        category,
        status,
        priority,
        location,
        imageUrl,
        resolvedImageUrl,
        reporter_id,
        admin_notes,
        resolved_at,
        created_at,
        updated_at,
        users!reporter_id (
          name,
          email
        )
      `
      )
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return res.status(404).json({
          error: "Issue not found",
          message: "The requested issue does not exist",
        });
      }

      console.error("Error updating issue:", updateError);
      return res.status(500).json({
        error: "Database error",
        message: "Failed to update issue in database",
      });
    }

    // Format updated issue for frontend
    const formattedIssue = {
      id: updatedIssue.id,
      title: updatedIssue.title,
      description: updatedIssue.description,
      category: updatedIssue.category,
      status: updatedIssue.status,
      priority: updatedIssue.priority,
      location:
        updatedIssue.location?.address ||
        (updatedIssue.location?.lat && updatedIssue.location?.lng
          ? `${updatedIssue.location.lat}, ${updatedIssue.location.lng}`
          : "Unknown location"),
      imageUrl: updatedIssue.imageUrl,
      resolvedImageUrl: updatedIssue.resolvedImageUrl,
      reporter_id: updatedIssue.reporter_id,
      admin_notes: updatedIssue.admin_notes,
      resolved_at: updatedIssue.resolved_at,
      created_at: updatedIssue.created_at,
      updated_at: updatedIssue.updated_at,
      reporter_name: updatedIssue.users?.name || "Anonymous User",
      reporter_email: updatedIssue.users?.email || "unknown@example.com",
    };

    res.status(200).json({
      message: "Issue updated successfully",
      issue: formattedIssue,
    });
  } catch (error) {
    console.error("Update issue error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong while updating the issue",
    });
  }
});

export default router;