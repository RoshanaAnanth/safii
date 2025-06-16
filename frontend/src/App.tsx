import { User } from "@supabase/supabase-js";
import React, { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";

import HomeScreen from "./screens/HomeScreen/HomeScreen";
import LoginScreen from "./screens/LoginScreen/LoginScreen";
import SubmitReportScreen from "./screens/SubmitReportScreen/SubmitReportScreen";

import supabase from "./lib/supabase";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        console.log("Logged in user:", data.user);
      } else {
        console.log("No user found");
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
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
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/home" replace /> : <LoginScreen />}
          />

          {/* Protected routes */}
          <Route
            path="/home"
            element={
              user ? (
                <HomeScreen user={user} />
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

          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={user ? "/home" : "/login"} replace />}
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={<Navigate to={user ? "/home" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
