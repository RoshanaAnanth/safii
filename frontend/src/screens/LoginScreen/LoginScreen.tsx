import React, { useState } from "react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

import supabase from "../../lib/supabase";

import boltBadge from "../../../assets/BoltBadge.png";
import loginScreenBackground from "../../../assets/LoginScreenBackground.mp4";

import styles from "./LoginScreen.module.scss";

interface LoginScreenProps {}

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useToast();

  const characters =
    "✦  B U I L T  W  I T H  B O L T  ✦  B U I L T  W  I T H  B O L T ".split(
      ""
    );
  const radius = 58;
  const inner_angle = 360 / characters.length;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        showError(error.message, "Login Failed");
        return;
      }

      // Check if login was successful but no user data returned
      if (!data.user) {
        showError("Invalid email or password", "Login Failed");
        return;
      }

      // Check if user exists in users table and is admin
      const { data: adminUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", data.user.email)
        .eq("is_admin", true)
        .single();

      if (fetchError || !adminUser) {
        showError("You are not authorized to login as admin.", "Access Denied");
        await supabase.auth.signOut();
        return;
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Login error:", error);
      showError("An unexpected error occurred during login", "Login Error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        showError(error.message, "Google Login Failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      showError("An unexpected error occurred during Google login", "Login Error");
    }
  };

  return (
    <div className={styles.container}>
      <video autoPlay muted loop playsInline className={styles.video}>
        <source src={loginScreenBackground} type="video/mp4" />
      </video>
      <div className={styles.card}>
        <div className={styles.badgeContainer}>
          <img src={boltBadge} alt="Badge" className={styles.boltBadge} />
          <span className={styles.textRing}>
            {characters.map((char, i) => {
              const angle = i * inner_angle;
              return (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    transform: `
                      rotate(${angle}deg)
                      translate(${radius}px)
                      rotate(${90}deg)
                    `,
                    transformOrigin: "0 0",
                    display: "inline-block",
                    marginRight: "1.5px",
                  }}
                  className={styles.orbitCharacter}
                >
                  {char}
                </span>
              );
            })}
          </span>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.contentWrapper}>
            <h1 className={styles.title}>Safii</h1>
            <p className={styles.subtitle}>WELCOME BACK</p>

            <form onSubmit={handleLogin}>
              <div className={styles.inputWrapper}>
                <label htmlFor="email" className={styles.label}>
                  EMAIL ADDRESS
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isLoading}
                />
              </div>

              <div
                className={`${styles.inputWrapper} ${styles.passwordWrapper}`}
              >
                <label htmlFor="password" className={styles.label}>
                  PASSWORD
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className={styles.loginButtonContainer}>
                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className={styles.buttonContent}>
                      <LoadingSpinner size="small" color="white" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>

            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className={styles.googleButton}
              disabled={isLoading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;