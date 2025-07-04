import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";

import AdminHomeScreen from "./screens/AdminHomeScreen/AdminHomeScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import SubmitReportScreen from "./screens/SubmitReportScreen/SubmitReportScreen";
import ViewReportsScreen from "./screens/ViewReportsScreen/ViewReportsScreen";

import ToastContainer from "./components/ToastContainer/ToastContainer";
import { ToastProvider, useToast } from "./context/ToastContext";
import supabase from "./lib/supabase";

import "./App.scss";

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [minLoadTimeReached, setMinLoadTimeReached] = useState(false);
  const { toasts, removeToast } = useToast();
  const location = useLocation();

  // Ensure minimum loading time of 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeReached(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Initial user fetch on app load
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        console.log("Initial user loaded:", data.user);
        // Don't set loading to false here - wait for profile to load
      } else {
        setUser(null);
        setUserProfile(null);
        console.log("No user found on initial load");
        setLoading(false); // Only set loading to false if no user
      }
    };

    fetchUser();

    // Listen for auth changes (simplified - no database calls here)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);

      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setLoading(true); // Set loading back to true when user signs in
        console.log("User signed in:", session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
        setLoading(false); // Set loading to false when user signs out
        console.log("User signed out");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Separate useEffect to fetch userProfile when user changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        console.log("Fetching user profile for:", user.email);

        // Determine provider
        const provider = user.app_metadata?.provider;
        let profile = null;

        if (provider === "google") {
          // For Google users, check if user exists by email
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .maybeSingle();

          if (fetchError) {
            console.error("Error fetching Google user:", fetchError);
            setLoading(false);
            setProfileLoading(false);
            return;
          }

          if (!existingUser) {
            // Insert Google user if not exists
            const { error: insertError } = await supabase.from("users").insert({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email,
              avatar_url:
                user.user_metadata?.avatar_url || user.user_metadata?.picture,
              is_guest: false,
              is_admin: false,
            });

            if (insertError) {
              console.error("Error inserting Google user:", insertError);
              setLoading(false);
              setProfileLoading(false);
              return;
            }

            // Fetch the newly inserted user
            const { data: newUser, error: newUserError } = await supabase
              .from("users")
              .select("*")
              .eq("email", user.email)
              .maybeSingle();

            if (newUserError) {
              console.error(
                "Error fetching newly inserted user:",
                newUserError
              );
              setLoading(false);
              setProfileLoading(false);
              return;
            }

            profile = newUser;
          } else {
            profile = existingUser;
          }
        } else {
          // For admin (email/password), fetch by email
          const { data: adminProfile, error: adminProfileError } =
            await supabase
              .from("users")
              .select("*")
              .eq("email", user.email)
              .maybeSingle();

          if (adminProfileError) {
            console.error("Error fetching admin profile:", adminProfileError);
            setLoading(false);
            setProfileLoading(false);
            return;
          }

          profile = adminProfile;
        }

        setUserProfile(profile);
        console.log("User profile set:", profile);
      } catch (error) {
        console.error("Error in fetchUserProfile:", error);
      } finally {
        // Always set loading to false after profile fetch completes
        setLoading(false);
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]); // This effect runs whenever the user state changes

  // Show loading screen while either initial loading, profile loading, or minimum time not reached (but skip minimum time for admins)
  if (
    loading ||
    profileLoading ||
    (!minLoadTimeReached && !userProfile?.is_admin)
  ) {
    return (
      <>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="video"
        ></video>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontFamily: "Poppins, sans-serif",
            backgroundColor: "#f1f8e8",
          }}
        >
          <DotLottieReact
            src="https://lottie.host/53d9f123-78b9-47cf-8a65-0ed27fadb9a5/NhPcrLwE7g.lottie"
            loop
            autoplay
          />
        </div>
      </>
    );
  }

  console.log("Current user:", user);
  console.log("Current userProfile:", userProfile);
  const isAdmin = userProfile?.is_admin === true;

  return (
    <div className="app">
      <div className="app-transition-container">
        <TransitionGroup>
          <CSSTransition
            key={location.key}
            classNames="fade"
            timeout={300}
            location={location}
          >
            <Routes location={location}>
              {/* Public routes */}
              <Route
                path="/login"
                element={
                  user ? (
                    <Navigate to={isAdmin ? "/admin" : "/home"} replace />
                  ) : (
                    <LoginScreen />
                  )
                }
              />

              {/* Protected routes */}
              <Route
                path="/home"
                element={
                  user ? (
                    !isAdmin ? (
                      <HomeScreen user={user} />
                    ) : (
                      <Navigate to="/admin" replace />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/admin"
                element={
                  user ? (
                    isAdmin ? (
                      <AdminHomeScreen user={user} />
                    ) : (
                      <Navigate to="/home" replace />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route
                path="/submit-report"
                element={
                  user ? (
                    <SubmitReportScreen user={user} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/view-reports"
                element={
                  user ? (
                    <ViewReportsScreen user={user} userProfile={userProfile} />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              {/* Default redirect */}
              <Route
                path="/"
                element={
                  <Navigate
                    to={user ? (isAdmin ? "/admin" : "/home") : "/login"}
                    replace
                  />
                }
              />

              {/* Catch all route */}
              <Route
                path="*"
                element={
                  <Navigate
                    to={user ? (isAdmin ? "/admin" : "/home") : "/login"}
                    replace
                  />
                }
              />
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
};

export default App;
