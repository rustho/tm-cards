"use client";

import { useState } from "react";
import { FlexibleWizard } from "../ui/FlexibleWizard";
import { Profile } from "@/models/types";
import "./examples.css";

// Example 1: Full Profile Creation Flow
export function FullProfileCreation() {
  const [isComplete, setIsComplete] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);

  const handleComplete = (data: Profile) => {
    setProfileData(data);
    setIsComplete(true);
    console.log("Profile completed:", data);
    // Here you would typically save to database or API
  };

  if (isComplete) {
    return (
      <div className="completion-message">
        <h2>Profile Created Successfully!</h2>
        <p>Welcome, {profileData?.name}!</p>
        <button onClick={() => setIsComplete(false)}>Create Another Profile</button>
      </div>
    );
  }

  return (
    <FlexibleWizard 
      mode="full"
      onComplete={handleComplete}
    />
  );
}

// Example 2: Single Step Editing
export function SingleStepEdit() {
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile>({
    id: "user123",
    username: "johndoe",
    name: "John Doe",
    dateOfBirth: "1990-05-15",
    interests: ["Travel", "Photography"],
    similarInterests: "",
    announcement: "Looking for travel companions!",
    profile: "",
    placesToVisit: "Japan, Iceland, New Zealand",
    instagram: "@johndoe",
    photo: "",
    country: "USA",
    region: "California",
  });

  const handleStepEdit = (stepNumber: number) => {
    setEditingStep(stepNumber);
  };

  const handleEditComplete = (step: number, data: Partial<Profile>) => {
    setCurrentProfile(prev => ({ ...prev, ...data }));
    setEditingStep(null);
    console.log(`Step ${step} updated:`, data);
    // Here you would typically save to database or API
  };

  const handleEditCancel = () => {
    setEditingStep(null);
  };

  if (editingStep) {
    return (
      <FlexibleWizard
        mode="edit"
        initialStep={editingStep}
        initialData={currentProfile}
        onStepComplete={handleEditComplete}
        onCancel={handleEditCancel}
      />
    );
  }

  return (
    <div className="profile-editor">
      <h2>Edit Your Profile</h2>
      <div className="profile-summary">
        <div className="profile-field">
          <label>Name:</label>
          <span>{currentProfile.name}</span>
          <button onClick={() => handleStepEdit(1)}>Edit</button>
        </div>
        <div className="profile-field">
          <label>Interests:</label>
          <span>{currentProfile.interests.join(", ")}</span>
          <button onClick={() => handleStepEdit(5)}>Edit</button>
        </div>
        <div className="profile-field">
          <label>Travel Plans:</label>
          <span>{currentProfile.placesToVisit}</span>
          <button onClick={() => handleStepEdit(7)}>Edit</button>
        </div>
        <div className="profile-field">
          <label>Instagram:</label>
          <span>{currentProfile.instagram}</span>
          <button onClick={() => handleStepEdit(9)}>Edit</button>
        </div>
        <div className="profile-field">
          <label>Location:</label>
          <span>{currentProfile.country}, {currentProfile.region}</span>
          <button onClick={() => handleStepEdit(10)}>Edit</button>
        </div>
        <div className="profile-field">
          <label>Looking For:</label>
          <span>{currentProfile.announcement}</span>
          <button onClick={() => handleStepEdit(11)}>Edit</button>
        </div>
      </div>
    </div>
  );
}

// Example 3: Profile Review with Inline Editing
export function ProfileReviewWithEditing() {
  const [currentProfile, setCurrentProfile] = useState<Profile>({
    id: "user123",
    username: "janedoe",
    name: "Jane Doe",
    dateOfBirth: "1988-11-20",
    interests: ["Art", "Music", "Cooking"],
    similarInterests: "",
    announcement: "Looking for cultural exchange partners!",
    profile: "",
    placesToVisit: "Italy, France, Spain",
    instagram: "@janedoe_art",
    photo: "",
    country: "Canada",
    region: "Ontario",
  });

  const [editingField, setEditingField] = useState<{step: number, field: string} | null>(null);

  const handleFieldEdit = (step: number, field: string) => {
    setEditingField({ step, field });
  };

  const handleEditComplete = (step: number, data: Partial<Profile>) => {
    setCurrentProfile(prev => ({ ...prev, ...data }));
    setEditingField(null);
  };

  const handleEditCancel = () => {
    setEditingField(null);
  };

  if (editingField) {
    return (
      <div className="inline-edit-modal">
        <div className="modal-backdrop" onClick={handleEditCancel} />
        <div className="modal-content">
          <FlexibleWizard
            mode="edit"
            initialStep={editingField.step}
            initialData={currentProfile}
            onStepComplete={handleEditComplete}
            onCancel={handleEditCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-review">
      <h2>Profile Review</h2>
      <div className="review-card">
        <div className="review-section">
          <h3>Basic Information</h3>
          <div className="review-item">
            <strong>Name:</strong> 
            <span>{currentProfile.name}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(1, 'name')}
            >
              ✏️
            </button>
          </div>
        </div>

        <div className="review-section">
          <h3>Interests & Hobbies</h3>
          <div className="review-item">
            <strong>Interests:</strong>
            <span>{currentProfile.interests.join(", ")}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(5, 'interests')}
            >
              ✏️
            </button>
          </div>
        </div>

        <div className="review-section">
          <h3>Travel Information</h3>
          <div className="review-item">
            <strong>Places to Visit:</strong>
            <span>{currentProfile.placesToVisit}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(7, 'placesToVisit')}
            >
              ✏️
            </button>
          </div>
          <div className="review-item">
            <strong>Current Location:</strong>
            <span>{currentProfile.country}, {currentProfile.region}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(10, 'location')}
            >
              ✏️
            </button>
          </div>
        </div>

        <div className="review-section">
          <h3>Social & Contact</h3>
          <div className="review-item">
            <strong>Instagram:</strong>
            <span>{currentProfile.instagram}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(9, 'instagram')}
            >
              ✏️
            </button>
          </div>
          <div className="review-item">
            <strong>Looking For:</strong>
            <span>{currentProfile.announcement}</span>
            <button 
              className="edit-btn"
              onClick={() => handleFieldEdit(11, 'announcement')}
            >
              ✏️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Example 4: Progressive Profile Completion
export function ProgressiveProfileCompletion() {
  const [currentProfile, setCurrentProfile] = useState<Partial<Profile>>({
    id: "user123",
    username: "progressiveuser",
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
  });

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number | null>(null);

  const requiredSteps = [1, 5, 7, 10, 11]; // Required steps for minimal profile
  const optionalSteps = [2, 3, 4, 6, 8, 9, 12]; // Optional steps

  const getNextIncompleteStep = () => {
    // First, find incomplete required steps
    for (const step of requiredSteps) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    // Then, find incomplete optional steps
    for (const step of optionalSteps) {
      if (!completedSteps.includes(step)) {
        return step;
      }
    }
    return null;
  };

  const handleStepComplete = (step: number, data: Partial<Profile>) => {
    setCurrentProfile(prev => ({ ...prev, ...data }));
    setCompletedSteps(prev => [...prev, step]);
    setCurrentStep(null);
  };

  const handleStartStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleCancel = () => {
    setCurrentStep(null);
  };

  const completionPercentage = Math.round((completedSteps.length / 13) * 100);
  const requiredCompletion = requiredSteps.every(step => completedSteps.includes(step));

  if (currentStep) {
    return (
      <FlexibleWizard
        mode="edit"
        initialStep={currentStep}
        initialData={currentProfile}
        onStepComplete={handleStepComplete}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="progressive-completion">
      <h2>Complete Your Profile</h2>
      
      <div className="completion-stats">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p>{completionPercentage}% Complete</p>
        {requiredCompletion ? (
          <div className="status-badge complete">✓ Ready to Match</div>
        ) : (
          <div className="status-badge incomplete">Complete required fields to start matching</div>
        )}
      </div>

      <div className="step-categories">
        <div className="category">
          <h3>Required Steps</h3>
          {requiredSteps.map(step => (
            <div key={step} className={`step-item ${completedSteps.includes(step) ? 'completed' : 'incomplete'}`}>
              <span>Step {step}</span>
              {completedSteps.includes(step) ? (
                <span className="status">✓ Complete</span>
              ) : (
                <button onClick={() => handleStartStep(step)}>Complete</button>
              )}
            </div>
          ))}
        </div>

        <div className="category">
          <h3>Optional Steps</h3>
          {optionalSteps.map(step => (
            <div key={step} className={`step-item ${completedSteps.includes(step) ? 'completed' : 'incomplete'}`}>
              <span>Step {step}</span>
              {completedSteps.includes(step) ? (
                <span className="status">✓ Complete</span>
              ) : (
                <button onClick={() => handleStartStep(step)}>Add Info</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {!requiredCompletion && (
        <div className="quick-start">
          <h3>Quick Start</h3>
          <button 
            onClick={() => {
              const nextStep = getNextIncompleteStep();
              if (nextStep) handleStartStep(nextStep);
            }}
            className="primary-button"
          >
            Continue Setup
          </button>
        </div>
      )}
    </div>
  );
} 