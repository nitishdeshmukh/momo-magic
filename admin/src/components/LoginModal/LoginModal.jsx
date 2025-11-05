import React, { useEffect, useRef, useState } from "react";
import "./LoginModal.css";
import { loginWithCredentials } from "../../auth/auth";
import { useAuth } from "../../auth/AuthContext";
import axios from "axios";
import { url } from "../../assets/assets";
import { toast } from "react-toastify";
import { getPhoneNumberByID } from "../../utils/adminUtils";

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("login"); // "login" | "forgot" | "otp" | "reset"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const idRef = useRef(null);

  useEffect(() => {
    if (open) {
      setErr("");
      setId("");
      setPw("");
      setShowPw(false);
      setLoading(false);
      setStep("login");
      setPhone("");
      setOtp("");
      setCooldown(0);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => idRef.current?.focus(), 50);
    }
  }, [open]);

  const doLogin = async () => {
    if (!id.trim() || !pw) {
      setErr("Please enter both ID and password");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const result = await loginWithCredentials(id.trim(), pw);
      login({ ...result.user, token: result.token });
      onClose?.();
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  const startCooldown = (seconds = 60) => {
    const s = Number(seconds) || 60;
    setCooldown(s);
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!id.trim()) {
      setErr("Please enter your User ID");
      return;
    }
    const phoneNumber = getPhoneNumberByID(id.trim());
    if (!phoneNumber) {
      setErr("Invalid User ID");
      return;
    }
    setPhone(phoneNumber);
    if (cooldown > 0 || loading) return;

    setLoading(true);
    setErr("");
    try {
      const res = await axios.post(
        `${url}/api/sms/request`,
        { phoneNumber },
        { validateStatus: () => true }
      );
      if (res.data?.success) {
        setStep("otp");
        startCooldown(Number(res.data.cooldownSeconds || 60));
        toast.success("OTP sent via SMS");
      } else {
        if (typeof res.data?.remaining === "number") {
          startCooldown(res.data.remaining);
        }
        toast.error(res.data?.message || "Could not send OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!otp.trim()) return;

    setLoading(true);
    setErr("");
    try {
      const res = await axios.post(
        `${url}/api/sms/verify`,
        { phoneNumber: phone, otp: otp.trim() },
        { validateStatus: () => true }
      );
      if (res.data?.success && res.data?.token) {
        setStep("reset");
        toast.success("OTP verified. Please set your new password.");
      } else {
        toast.error(res.data?.message || "Invalid OTP");
      }
    } catch (err) {
      console.error(err);
      toast.error("Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!newPassword.trim()) {
      setErr("Please enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }

    setLoading(true);
    setErr("");
    try {
      const res = await axios.post(
        `${url}/api/user/admin/reset-password`,
        { phoneNumber: phone, newPassword: newPassword.trim() },
        { validateStatus: () => true }
      );
      if (res.data?.success) {
        toast.success(
          "Password reset successfully. Please login with your new password."
        );
        setStep("login");
      } else {
        toast.error(res.data?.message || "Password reset failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (step === "login") {
      if (e.key === "Enter") doLogin();
      if (e.key === "Escape") onClose?.();
    } else if (step === "forgot") {
      if (e.key === "Enter") sendOtp(e);
      if (e.key === "Escape") setStep("login");
    }
  };

  if (!open) return null;

  return (
    <div className="login-overlay" onClick={onClose}>
      <div
        className="login-card"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="login-head">
          <div className="login-title">
            {step === "login"
              ? "Sign in"
              : step === "forgot"
              ? "Forgot Password"
              : step === "otp"
              ? "Enter OTP"
              : "Reset Password"}
          </div>
          <button className="login-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="login-body">
          {step === "login" ? (
            <>
              <label className="login-label" htmlFor="login_user">
                User ID
              </label>
              <input
                id="login_user"
                ref={idRef}
                className="login-input"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin or developer"
                autoComplete="username"
              />

              <label className="login-label" htmlFor="login_pw">
                Password
              </label>

              <div className="pw-wrap">
                <input
                  id="login_pw"
                  className="login-input pw-input"
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                {/* Show/Hide button — click toggles, press-and-hold peeks */}
                <button
                  type="button"
                  className="pw-toggle"
                  aria-label={showPw ? "Hide password" : "Show password"}
                  aria-pressed={showPw}
                  onMouseDown={() => setShowPw(true)}
                  onMouseUp={() => setShowPw(false)}
                  onMouseLeave={() => setShowPw(false)}
                  onTouchStart={() => setShowPw(true)}
                  onTouchEnd={() => setShowPw(false)}
                  onClick={() => setShowPw((v) => !v)}
                  title="Show password (hold to peek)"
                >
                  {/* eye icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    {showPw ? (
                      <>
                        <path d="M3 3l18 18" stroke="#6b7280" strokeWidth="2" />
                        <path
                          d="M10.585 7.414A5 5 0 0117 12c0 .87-.22 1.69-.606 2.405M7.5 9.5C6.57 10.37 5.77 11.39 5 12c2.5 2 4.5 3 7 3 .79 0 1.55-.1 2.28-.29"
                          stroke="#6b7280"
                          strokeWidth="2"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                          stroke="#6b7280"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#6b7280"
                          strokeWidth="2"
                        />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              {err ? <div className="login-error">{err}</div> : null}

              <button className="login-btn" onClick={doLogin}>
                Login
              </button>

              <button className="login-btn" onClick={() => setStep("forgot")}>
                Forgot Password?
              </button>
            </>
          ) : step === "forgot" ? (
            <>
              <label className="login-label" htmlFor="forgotId">
                User ID
              </label>
              <input
                id="forgotId"
                className="login-input"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin or developer"
                autoComplete="username"
              />

              {err ? <div className="login-error">{err}</div> : null}

              <button
                className="login-btn"
                onClick={sendOtp}
                disabled={cooldown > 0 || loading}
              >
                {cooldown > 0 ? `Send OTP (${cooldown}s)` : "Send OTP to phone"}
              </button>

              <button className="login-btn" onClick={() => setStep("login")}>
                Back to Login
              </button>
            </>
          ) : step === "otp" ? (
            <>
              <label className="login-label" htmlFor="otp">
                Enter OTP
              </label>
              <input
                id="otp"
                className="login-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="OTP"
                autoComplete="one-time-code"
              />

              {err ? <div className="login-error">{err}</div> : null}

              <button
                className="login-btn"
                onClick={verifyOtp}
                disabled={loading}
              >
                Verify OTP
              </button>

              <p style={{ marginTop: 8 }}>
                Didn’t get it?{" "}
                <span
                  style={{
                    color: cooldown > 0 ? "#888" : "#007bff",
                    cursor: cooldown > 0 ? "not-allowed" : "pointer",
                  }}
                  onClick={cooldown > 0 ? undefined : sendOtp}
                  aria-disabled={cooldown > 0}
                >
                  Resend OTP {cooldown > 0 ? `in ${cooldown}s` : ""}
                </span>
              </p>

              <button className="login-btn" onClick={() => setStep("forgot")}>
                Back
              </button>
            </>
          ) : step === "reset" ? (
            <>
              <label className="login-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                className="login-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <label className="login-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                className="login-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              {err ? <div className="login-error">{err}</div> : null}

              <button
                className="login-btn"
                onClick={resetPassword}
                disabled={loading}
              >
                Confirm Change
              </button>

              <button className="login-btn" onClick={() => setStep("otp")}>
                Back
              </button>
            </>
          ) : null}
        </div>

        <div className="login-foot">
          <div className="hint">Roles allowed: Admin, Developer</div>
        </div>
      </div>
    </div>
  );
}
