"use client";

import { useState } from "react";
import { FlexibleWizard } from "../../profile/ui/FlexibleWizard";
import { Profile } from "@/models/types";
import { SuccessToast } from "./SuccessToast";
import { calculateAge } from "@/lib/dateUtils";
import "./ProfileSettings.css";

interface ProfileSettingsProps {
  initialProfile?: Profile;
  onProfileUpdate?: (profile: Profile) => void;
}

export function ProfileSettings({ 
  initialProfile,
  onProfileUpdate 
}: ProfileSettingsProps) {
  const [currentProfile, setCurrentProfile] = useState<Profile>(
    initialProfile || {
      id: "",
      username: "",
      name: "",
      interests: [],
      similarInterests: "",
      announcement: "",
      profile: "",
      placesToVisit: "",
      instagram: "",
      photo: "",
      country: "",
      region: "",
      dateOfBirth: "",
    }
  );

  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEditStep = (stepNumber: number) => {
    setEditingStep(stepNumber);
  };

  const handleStepComplete = (step: number, data: Partial<Profile>) => {
    const updatedProfile = { ...currentProfile, ...data };
    setCurrentProfile(updatedProfile);
    setEditingStep(null);
    onProfileUpdate?.(updatedProfile);
    
    // Show success toast
    const stepName = getStepName(step);
    setToastMessage(`${stepName} updated successfully!`);
    setShowSuccessToast(true);
  };

  const handleEditCancel = () => {
    setEditingStep(null);
  };

  const handleHideToast = () => {
    setShowSuccessToast(false);
  };

  const getStepName = (step: number): string => {
    const stepNames: { [key: number]: string } = {
      1: "Name",
      2: "Date of Birth", 
      3: "Occupation",
      4: "Personality",
      5: "Interests",
      6: "Hobbies",
      7: "Travel Plans",
      8: "About Me",
      9: "Instagram",
      10: "Location",
      11: "Looking For",
      12: "Photo"
    };
    return stepNames[step] || "Profile";
  };

  const isFieldComplete = (field: string | string[] | undefined): boolean => {
    if (Array.isArray(field)) return field.length > 0;
    return Boolean(field && field.trim().length > 0);
  };

  // If editing a step, show the wizard
  if (editingStep) {
    return (
      <div className="edit-overlay">
        <div className="edit-modal">
          <div className="edit-header">
            <h3>Edit {getStepName(editingStep)}</h3>
            <button 
              className="close-button"
              onClick={handleEditCancel}
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="edit-content">
            <FlexibleWizard
              mode="edit"
              initialStep={editingStep}
              initialData={currentProfile}
              onStepComplete={handleStepComplete}
              onCancel={handleEditCancel}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-settings">
        <div className="settings-header">
          <h1>Profile Settings</h1>
          <p>Manage your profile information and preferences</p>
        </div>
        
        <div className="settings-sections">
          {/* Basic Information */}
          <div className="settings-section">
            <div className="section-header">
              <h2>👤 Basic Information</h2>
            </div>
            <div className="setting-items">
              <div className={`setting-item ${isFieldComplete(currentProfile.name) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Full Name</label>
                  <span className="setting-value">
                    {currentProfile.name || "Add your name"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(1)}
                >
                  {currentProfile.name ? "Edit" : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Interests & Personality */}
          <div className="settings-section">
            <div className="section-header">
              <h2>❤️ Interests & Personality</h2>
            </div>
            <div className="setting-items">
              <div className={`setting-item ${isFieldComplete(currentProfile.interests) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Interests</label>
                  <span className="setting-value">
                    {currentProfile.interests.length > 0 
                      ? currentProfile.interests.join(", ") 
                      : "Add your interests"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(5)}
                >
                  {currentProfile.interests.length > 0 ? "Edit" : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Travel Information */}
          <div className="settings-section">
            <div className="section-header">
              <h2>✈️ Travel Information</h2>
            </div>
            <div className="setting-items">
              <div className={`setting-item ${isFieldComplete(currentProfile.placesToVisit) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Places to Visit</label>
                  <span className="setting-value">
                    {currentProfile.placesToVisit || "Where do you want to go?"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(7)}
                >
                  {currentProfile.placesToVisit ? "Edit" : "Add"}
                </button>
              </div>
              
              <div className={`setting-item ${isFieldComplete(currentProfile.country) && isFieldComplete(currentProfile.region) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Current Location</label>
                  <span className="setting-value">
                    {currentProfile.country && currentProfile.region
                      ? `${currentProfile.country}, ${currentProfile.region}`
                      : "Add your location"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(10)}
                >
                  {currentProfile.country && currentProfile.region ? "Edit" : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Social & Contact */}
          <div className="settings-section">
            <div className="section-header">
              <h2>📱 Social & Contact</h2>
            </div>
            <div className="setting-items">
              <div className={`setting-item ${isFieldComplete(currentProfile.instagram) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Instagram</label>
                  <span className="setting-value">
                    {currentProfile.instagram || "Add your Instagram"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(9)}
                >
                  {currentProfile.instagram ? "Edit" : "Add"}
                </button>
              </div>
              
              <div className={`setting-item ${isFieldComplete(currentProfile.announcement) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>What are you looking for?</label>
                  <span className="setting-value">
                    {currentProfile.announcement || "Describe what you're looking for"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(11)}
                >
                  {currentProfile.announcement ? "Edit" : "Add"}
                </button>
              </div>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="settings-section">
            <div className="section-header">
              <h2>📸 Profile Photo</h2>
            </div>
            <div className="setting-items">
              <div className={`setting-item ${isFieldComplete(currentProfile.photo) ? 'completed' : 'incomplete'}`}>
                <div className="setting-info">
                  <label>Profile Picture</label>
                  <span className="setting-value">
                    {currentProfile.photo ? "Photo uploaded" : "Add a profile photo"}
                  </span>
                </div>
                <button 
                  className="edit-button"
                  onClick={() => handleEditStep(12)}
                >
                  {currentProfile.photo ? "Change" : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Information */}
          <div className="settings-section optional">
            <div className="section-header">
              <h2>➕ Additional Information</h2>
              <p>Optional fields to enhance your profile</p>
            </div>
            <div className="optional-grid">
              <button 
                className="optional-card"
                onClick={() => handleEditStep(2)}
              >
                <div className="card-icon">🎂</div>
                <div className="card-title">Date of Birth</div>
                <div className="card-subtitle">
                  {currentProfile.dateOfBirth 
                    ? `Age: ${calculateAge(currentProfile.dateOfBirth)}` 
                    : "Add your date of birth"
                  }
                </div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep(3)}
              >
                <div className="card-icon">💼</div>
                <div className="card-title">Occupation</div>
                <div className="card-subtitle">What do you do?</div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep(4)}
              >
                <div className="card-icon">✨</div>
                <div className="card-title">Personality</div>
                <div className="card-subtitle">Describe yourself</div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep(6)}
              >
                <div className="card-icon">🎯</div>
                <div className="card-title">Hobbies</div>
                <div className="card-subtitle">What you enjoy</div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep(8)}
              >
                <div className="card-icon">📝</div>
                <div className="card-title">About Me</div>
                <div className="card-subtitle">Tell your story</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <SuccessToast 
        message={toastMessage}
        isVisible={showSuccessToast}
        onHide={handleHideToast}
      />
    </>
  );
} 