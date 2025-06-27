import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import AdminHomeScreen from "./screens/AdminHomeScreen/AdminHomeScreen";
import HomeScreen from "./screens/HomeScreen/HomeScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import SubmitReportScreen from "./screens/SubmitReportScreen/SubmitReportScreen";
import ViewReportsScreen from "./screens/ViewReportsScreen/ViewReportsScreen";

import supabase from "./lib/supabase";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);

        // Determine provider
        const provider = data.user.app_metadata?.provider;

        let profile = null;

        if (provider === "google") {
          // For Google users, check if user exists by email
          const { data: existingUser, error: fetchError } = await supabase
            .from("users")
            .select("*")
            .eq("email", data.user.email)
            .maybeSingle();

          if (!existingUser) {
            // Insert Google user if not exists
            const { error: insertError } = await supabase.from("users").insert({
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.full_name || data.user.email,
              avatar_url:
                data.user.user_metadata?.avatar_url ||
                data.user.user_metadata?.picture,
              is_guest: false,
              is_admin: false,
            });
            if (insertError) {
              console.error("Error inserting Google user:", insertError);
            }
            // Fetch the newly inserted user
            const { data: newUser } = await supabase
              .from("users")
              .select("*")
              .eq("email", data.user.email)
              .maybeSingle();
            profile = newUser;
          } else {
            profile = existingUser;
          }
        } else {
          // For admin (email/password), fetch by id
          const { data: adminProfile, error: adminProfileError } =
            await supabase
              .from("users")
              .select("*")
              .eq("email", data.user.email)
              .maybeSingle();
          profile = adminProfile;
        }

        setUserProfile(profile || null);
        console.log("Logged in user:", data.user);
      } else {
        setUser(null);
        setUserProfile(null);
        console.log("No user found");
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session);
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        setLoading(false);

        const provider = session.user.app_metadata?.provider;
        let profile = null;

        if (provider === "google") {
          const { data: existingUser } = supabase
            .from("users")
            .select("*")
            .eq("email", session.user.email)
            .maybeSingle();

          if (!existingUser) {
            supabase.from("users").insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url:
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture,
              is_guest: false,
              is_admin: false,
            });
            const { data: newUser } = supabase
              .from("users")
              .select("*")
              .eq("email", session.user.email)
              .maybeSingle();
            profile = newUser;
          } else {
            profile = existingUser;
          }
        } else {
          const { data: adminProfile } = supabase
            .from("users")
            .select("*")
            .eq("email", session.user.email)
            .maybeSingle();
          profile = adminProfile;
        }

        setUserProfile(profile || null);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    // if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "Geist, sans-serif",
        }}
      >
        Loading...
      </div>
    );
    // }
  }

  console.log("User: ", user);
  const isAdmin = userProfile?.is_admin === true;

  return (
    <Router>
      <div className="app">
        <Routes>
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
                <ViewReportsScreen user={user} />
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
      </div>
    </Router>
  );
};

export default App;
