// src/app/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/lib/types";

interface UserSettings {
  emailNotifications: boolean;
  lessonReminders: boolean;
  moduleUpdates: boolean;
  weeklyDigest: boolean;
  darkMode: boolean;
  fontSize: string;
  highContrastMode: boolean;
  shareProgress: boolean;
  publicProfile: boolean;
  autoSaveDrafts: boolean;
  showTips: boolean;
  defaultLessonView: string;
}

export default function Settings() {
  const { currentUser, signOut } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    lessonReminders: true,
    moduleUpdates: true,
    weeklyDigest: false,
    
    darkMode: false,
    fontSize: "medium",
    highContrastMode: false,
    
    shareProgress: true,
    publicProfile: false,
    
    autoSaveDrafts: true,
    showTips: true,
    defaultLessonView: "cards",
  });

  const handleToggleChange = (setting: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSelectChange = (setting: keyof UserSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = async () => {
    if (!currentUser || !currentUser.id) {
      setErrorMessage("You need to be logged in to save settings");
      return;
    }

    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const userRef = doc(db, "users", currentUser.id);
      
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          settings: settings,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, {
          settings: settings,
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name || null,
          photoURL: currentUser.photoURL || null,
          updatedAt: new Date().toISOString()
        });
      }
      
      setSuccessMessage("Settings saved successfully!");
      
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      emailNotifications: true,
      lessonReminders: true,
      moduleUpdates: true,
      weeklyDigest: false,
      darkMode: false,
      fontSize: "medium",
      highContrastMode: false,
      shareProgress: true,
      publicProfile: false,
      autoSaveDrafts: true,
      showTips: true,
      defaultLessonView: "cards",
    });
  };

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setErrorMessage("Please type DELETE to confirm account deletion");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {

      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("Failed to delete account. Please try again.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      if (!currentUser || !currentUser.id) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.id));
        if (userDoc.exists() && userDoc.data().settings) {
          setSettings(userDoc.data().settings as UserSettings);
        }
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    };
    
    loadUserSettings();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-700">
            Please log in to view your settings
          </h2>
          <div className="mt-4">
            <Button onClick={() => router.push("/auth/login")}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
        <p className="text-gray-600">
          Manage your account preferences and settings
        </p>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Account Settings */}
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900">{currentUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <p className="text-gray-900">Free Plan</p>
              </div>

              {/* Removed createdAt field since it doesn't exist in your User type */}

              <div className="pt-4 border-t border-gray-200">
                <Button onClick={() => router.push("/profile")} className="w-full">
                  Edit Profile
                </Button>
              </div>
            </div>
          </Card>

          {/* Subscription Settings */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Subscription</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Current Plan</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Free
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Basic access to lesson creation and modules
              </p>
            </div>
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Upgrade to Pro
            </Button>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h2>
            
            {!showDeleteConfirmation ? (
              <Button 
                className="w-full bg-white text-red-600 border border-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete Account
              </Button>
            ) : (
              <div>
                <p className="text-sm text-gray-700 mb-3">
                  This action cannot be undone. All your data, including lessons and modules, will be permanently deleted.
                </p>
                <p className="text-sm font-medium text-gray-800 mb-2">
                  Please type "DELETE" to confirm:
                </p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 mb-3"
                  placeholder="Type DELETE"
                />
                <div className="flex space-x-3">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Permanently Delete"}
                  </Button>
                  <Button
                    className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => {
                      setShowDeleteConfirmation(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Preferences */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive email updates about your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.emailNotifications}
                    onChange={() => handleToggleChange("emailNotifications")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.emailNotifications ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Lesson Reminders</h3>
                  <p className="text-sm text-gray-500">Get reminded about scheduled lessons</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.lessonReminders}
                    onChange={() => handleToggleChange("lessonReminders")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.lessonReminders ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Module Updates</h3>
                  <p className="text-sm text-gray-500">Notifications about changes to your modules</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.moduleUpdates}
                    onChange={() => handleToggleChange("moduleUpdates")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.moduleUpdates ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Weekly Digest</h3>
                  <p className="text-sm text-gray-500">Receive a weekly summary of your progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.weeklyDigest}
                    onChange={() => handleToggleChange("weeklyDigest")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.weeklyDigest ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Display Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Dark Mode</h3>
                  <p className="text-sm text-gray-500">Use dark theme across the application</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.darkMode}
                    onChange={() => handleToggleChange("darkMode")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.darkMode ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Font Size</h3>
                <p className="text-sm text-gray-500 mb-2">Select your preferred text size</p>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={settings.fontSize}
                  onChange={(e) => handleSelectChange("fontSize", e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">High Contrast Mode</h3>
                  <p className="text-sm text-gray-500">Increase color contrast for better readability</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.highContrastMode}
                    onChange={() => handleToggleChange("highContrastMode")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.highContrastMode ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Privacy Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Share Progress</h3>
                  <p className="text-sm text-gray-500">Allow sharing of your progress with course creators</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.shareProgress}
                    onChange={() => handleToggleChange("shareProgress")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.shareProgress ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Public Profile</h3>
                  <p className="text-sm text-gray-500">Make your profile and achievements visible to others</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.publicProfile}
                    onChange={() => handleToggleChange("publicProfile")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.publicProfile ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>
            </div>
          </Card>

          <Card className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Application Preferences</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Auto-save Drafts</h3>
                  <p className="text-sm text-gray-500">Automatically save your lesson drafts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.autoSaveDrafts}
                    onChange={() => handleToggleChange("autoSaveDrafts")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.autoSaveDrafts ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Show Tips</h3>
                  <p className="text-sm text-gray-500">Display helpful tips while using the app</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={settings.showTips}
                    onChange={() => handleToggleChange("showTips")}
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full peer ${settings.showTips ? 'bg-blue-600' : ''} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
                </label>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Default Lesson View</h3>
                <p className="text-sm text-gray-500 mb-2">Choose how lessons appear in your dashboard</p>
                <select 
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={settings.defaultLessonView}
                  onChange={(e) => handleSelectChange("defaultLessonView", e.target.value)}
                >
                  <option value="cards">Card View</option>
                  <option value="list">List View</option>
                  <option value="compact">Compact View</option>
                </select>
              </div>
            </div>
          </Card>

          <div className="flex justify-between mt-6">
            <Button 
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveSettings}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}