"use client";

import { useState } from "react";
import { FlexibleWizard } from "../../profile/ui/FlexibleWizard";
import { Profile } from "@/models/types";
import { SuccessToast } from "./SuccessToast";
import { calculateAge } from "@/lib/dateUtils";
import { ONBOARDING_STEPS } from "../../profile/ui/wizardConfig";
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
      hobbies: [],
      personalityTraits: [],
      goal: "",
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

  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleEditStep = (stepId: string) => {
    const index = ONBOARDING_STEPS.findIndex(s => s.id === stepId);
    if (index !== -1) {
        setEditingStepIndex(index);
    }
  };

  const handleStepComplete = (stepId: string, data: Partial<Profile>) => {
    const updatedProfile = { ...currentProfile, ...data };
    setCurrentProfile(updatedProfile);
    setEditingStepIndex(null);
    onProfileUpdate?.(updatedProfile);
    
    // Show success toast
    setToastMessage(`Updated successfully!`);
    setShowSuccessToast(true);
  };

  const handleEditCancel = () => {
    setEditingStepIndex(null);
  };

  const handleHideToast = () => {
    setShowSuccessToast(false);
  };

  const isFieldComplete = (field: string | string[] | undefined): boolean => {
    if (Array.isArray(field)) return field.length > 0;
    return Boolean(field && field.trim().length > 0);
  };

  // If editing a step, show the wizard
  if (editingStepIndex !== null) {
    return (
      <div className="edit-overlay">
        <div className="edit-modal">
          <div className="edit-header">
            <h3>Edit Profile</h3>
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
              steps={ONBOARDING_STEPS}
              initialStepIndex={editingStepIndex}
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
                  onClick={() => handleEditStep('name')}
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
                  onClick={() => handleEditStep('interests')}
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
              {/* Note: placesToVisit (Travel Plans) is not in new wizard steps, so leaving it read-only or removing edit button if there's no step for it. */}
              
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
                  onClick={() => handleEditStep('country')}
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
                  onClick={() => handleEditStep('socials')}
                >
                  {currentProfile.instagram ? "Edit" : "Add"}
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
                  onClick={() => handleEditStep('photo')}
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
                onClick={() => handleEditStep('dateOfBirth')}
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
                onClick={() => handleEditStep('personality')}
              >
                <div className="card-icon">✨</div>
                <div className="card-title">Personality</div>
                <div className="card-subtitle">Describe yourself</div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep('hobbies')}
              >
                <div className="card-icon">🎯</div>
                <div className="card-title">Hobbies</div>
                <div className="card-subtitle">What you enjoy</div>
              </button>
              
              <button 
                className="optional-card"
                onClick={() => handleEditStep('about')}
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
