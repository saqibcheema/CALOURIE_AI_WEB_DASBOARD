"use client";

import { useState } from "react";
import {
  getAuth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import {
  IconX,
  IconLock,
  IconMail,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconShield,
} from "@tabler/icons-react";

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const auth = getAuth();
  const user = auth.currentUser;
  const email = user?.email ?? "";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initials = email ? email[0].toUpperCase() : "A";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Current password is incorrect.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else if (code === "auth/weak-password") {
        setError("New password is too weak. Use at least 6 characters.");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <IconShield size={18} className="text-arctic-500" />
            <h2 className="text-base font-semibold text-slate-800">My Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Avatar + Email */}
          <div className="flex items-center gap-4 p-4 bg-arctic-50 rounded-xl border border-arctic-100">
            <div className="w-14 h-14 rounded-full bg-arctic-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 shadow-md">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 mb-0.5 font-medium uppercase tracking-wide">
                Signed in as
              </p>
              <div className="flex items-center gap-1.5 min-w-0">
                <IconMail size={13} className="text-arctic-500 flex-shrink-0" />
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {email}
                </span>
              </div>
              <span className="text-xs text-arctic-500 font-medium mt-0.5 inline-block">
                Admin Account
              </span>
            </div>
          </div>

          {/* Change Password Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <IconLock size={15} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-700">Change Password</h3>
            </div>

            {success ? (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <IconCheck size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Password updated!
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Your new password is active.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-3 py-2 pr-9 text-sm border border-arctic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors placeholder:text-slate-300"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showCurrent ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError(null);
                      }}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full px-3 py-2 pr-9 text-sm border border-arctic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors placeholder:text-slate-300"
                      placeholder="Min. 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showNew ? <IconEyeOff size={15} /> : <IconEye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full px-3 py-2 text-sm border border-arctic-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:border-arctic-400 transition-colors placeholder:text-slate-300"
                    placeholder="Repeat new password"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-arctic-500 rounded-lg hover:bg-arctic-600 focus:outline-none focus:ring-2 focus:ring-arctic-400 focus:ring-offset-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating…" : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
