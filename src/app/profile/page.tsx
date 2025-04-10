// src/app/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  sendEmailVerification,
  deleteUser,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ProfilePage() {
  const { currentUser, loading, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/auth/login");
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        setName(currentUser.name || "");
        setNewEmail(currentUser.email || "");

        try {
          const userRef = doc(db, "users", currentUser.id);
          const userDoc = await getDoc(userRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setBio(userData.bio || "");
          }
        } catch (err) {
          console.error("Error loading user profile:", err);
          setError("Failed to load profile data");
        }
      }
    };

    loadUserProfile();
  }, [currentUser]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const userRef = doc(db, "users", currentUser.id);
      const updateData: any = {
        name,
        bio,
        updatedAt: new Date().toISOString(),
      };

      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${currentUser.id}`);
        await uploadBytes(storageRef, profileImage);
        const photoURL = await getDownloadURL(storageRef);
        updateData.photoURL = photoURL;
      }

      await updateDoc(userRef, updateData);

      const updatedUser = {
        ...currentUser,
        name,
        photoURL: profileImage
          ? await getDownloadURL(
              ref(storage, `profileImages/${currentUser.id}`)
            )
          : currentUser.photoURL,
      };
      localStorage.setItem("coursegpt_user", JSON.stringify(updatedUser));

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");

      setProfileImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !auth.currentUser) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match");
      setIsSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsSaving(false);
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setSuccessMessage("Password updated successfully");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      console.error("Error changing password:", err);
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect");
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !auth.currentUser) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        emailPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      await updateEmail(auth.currentUser, newEmail);

      const userRef = doc(db, "users", currentUser.id);
      await updateDoc(userRef, {
        email: newEmail,
        updatedAt: new Date().toISOString(),
      });

      const updatedUser = {
        ...currentUser,
        email: newEmail,
      };
      localStorage.setItem("coursegpt_user", JSON.stringify(updatedUser));

      setSuccessMessage(
        "Email updated successfully. Please verify your new email address."
      );

      await sendEmailVerification(auth.currentUser);

      setEmailPassword("");
    } catch (err: any) {
      console.error("Error changing email:", err);
      if (err.code === "auth/wrong-password") {
        setError("Password is incorrect");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use by another account");
      } else {
        setError("Failed to update email. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!auth.currentUser) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await sendEmailVerification(auth.currentUser);
      setSuccessMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      console.error("Error sending verification email:", err);
      setError("Failed to send verification email. Please try again later.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !auth.currentUser) return;

    if (deleteConfirmation !== currentUser.email) {
      setError("Please enter your email correctly to confirm account deletion");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email || "",
        deletePassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      const userRef = doc(db, "users", currentUser.id);
      await deleteDoc(userRef);

      await deleteUser(auth.currentUser);

      localStorage.removeItem("coursegpt_user");

      await signOut();
      router.push("/");
    } catch (err: any) {
      console.error("Error deleting account:", err);
      if (err.code === "auth/wrong-password") {
        setError("Password is incorrect");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {imagePreview ? (
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : currentUser?.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {currentUser?.name?.charAt(0) ||
                    currentUser?.email?.charAt(0) ||
                    "?"}
                </div>
              )}
            </div>
            <div className="ml-6 text-white">
              <h1 className="text-3xl font-bold">
                {currentUser?.name || "User Profile"}
              </h1>
              <p className="text-blue-100">{currentUser?.email}</p>
              {auth.currentUser?.emailVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                  <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                  <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 8 8"
                  >
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Unverified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab("profile");
                setError("");
                setSuccessMessage("");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => {
                setActiveTab("security");
                setError("");
                setSuccessMessage("");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "security"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => {
                setActiveTab("deleteAccount");
                setError("");
                setSuccessMessage("");
              }}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === "deleteAccount"
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Delete Account
            </button>
          </nav>
        </div>

        <div className="px-6 py-8">
          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          {/* Profile Information Tab */}
          {activeTab === "profile" && (
            <>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <div className="mt-1">
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="bio"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Bio
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Profile Picture
                    </label>
                    <div className="mt-2 flex items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-medium
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setImagePreview(null);
                        setProfileImage(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Profile Information
                    </h3>
                    <div className="mt-5 border-t border-gray-200 pt-5">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">
                            Full name
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {name || "Not set"}
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">
                            Email address
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            <div className="flex items-center">
                              <span>{currentUser?.email}</span>
                              {!auth.currentUser?.emailVerified && (
                                <button
                                  onClick={handleSendVerificationEmail}
                                  disabled={isSaving}
                                  className="ml-3 px-3 py-1 text-xs rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                  {isSaving ? "Sending..." : "Verify Email"}
                                </button>
                              )}
                            </div>
                          </dd>
                        </div>
                        <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className="text-sm font-medium text-gray-500">
                            Bio
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                            {bio || "No bio provided yet"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Password Change Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Password
                </h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmNewPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Confirm New Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Change Email
                </h3>
                <form onSubmit={handleChangeEmail} className="space-y-4">
                  <div>
                    <label
                      htmlFor="newEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      New Email Address
                    </label>
                    <div className="mt-1">
                      <input
                        id="newEmail"
                        name="newEmail"
                        type="email"
                        required
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="emailPassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Current Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="emailPassword"
                        name="emailPassword"
                        type="password"
                        required
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {isSaving ? "Updating..." : "Update Email"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Account Tab */}
          {activeTab === "deleteAccount" && (
            <div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: This action cannot be undone
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        Deleting your account will permanently remove all of
                        your data, including your profile, courses, and
                        preferences. You will not be able to recover this
                        information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div>
                  <label
                    htmlFor="deleteConfirmation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    To confirm, please type your email address:{" "}
                    {currentUser?.email}
                  </label>
                  <div className="mt-1">
                    <input
                      id="deleteConfirmation"
                      name="deleteConfirmation"
                      type="text"
                      required
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="deletePassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Enter your password
                  </label>
                  <div className="mt-1">
                    <input
                      id="deletePassword"
                      name="deletePassword"
                      type="password"
                      required
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {isSaving ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
