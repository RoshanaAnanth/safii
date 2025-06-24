import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Rate limiting for issue submission
const issueSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 issue submissions per windowMs
  message: "Too many issue submissions, please try again later.",
});

// Mock database for issues (replace with real database)
let issues = [];
let issueIdCounter = 1;

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
    .isLength({ min: 19, max: 50 })
    .withMessage("Invalid location"),
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

      const { title, description, category, priority, location, imageUrl } =
        req.body;

      // Create new issue
      const newIssue = {
        id: issueIdCounter++,
        title,
        description,
        category,
        status: "pending",
        priority,
        location,
        imageUrl,
        reporter_id: 1, // Mock user ID - replace with actual user from JWT token
        admin_notes: null,
        resolved_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reporter_name: "Test User", // Mock reporter name
        reporter_email: "test@example.com", // Mock reporter email
      };

      // Store in mock database
      issues.push(newIssue);

      // Return success response
      res.status(201).json({
        message: "Issue submitted successfully",
        issue: {
          id: newIssue.id,
          title: newIssue.title,
          category: newIssue.category,
          status: newIssue.status,
          priority: newIssue.priority,
          imageUrl: newIssue.imageUrl,
          created_at: newIssue.created_at,
        },
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
    // Return all issues with basic filtering options
    const { status, category, priority } = req.query;

    let filteredIssues = [...issues];

    if (status) {
      filteredIssues = filteredIssues.filter(
        (issue) => issue.status === status
      );
    }

    if (category) {
      filteredIssues = filteredIssues.filter(
        (issue) => issue.category === category
      );
    }

    if (priority) {
      filteredIssues = filteredIssues.filter(
        (issue) => issue.priority === priority
      );
    }

    // Sort by creation date (newest first)
    filteredIssues.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );

    res.status(200).json({
      message: "Issues retrieved successfully",
      issues: filteredIssues,
      total: filteredIssues.length,
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
    const issue = issues.find((issue) => issue.id === parseInt(id));

    if (!issue) {
      return res.status(404).json({
        error: "Issue not found",
        message: "The requested issue does not exist",
      });
    }

    res.status(200).json({
      message: "Issue retrieved successfully",
      issue,
    });
  } catch (error) {
    console.error("Get issue error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong while retrieving the issue",
    });
  }
});

export default router;
