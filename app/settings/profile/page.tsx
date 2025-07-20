"use client";

import { useState } from "react";
import { ProfileSettings } from "./ProfileSettings";
import { Profile } from "@/models/types";

export default function ProfileSettingsPage() {
  // Example initial profile data - this would come from your API/database
  const [profile, setProfile] = useState<Profile>({
    id: "user123",
    username: "johndoe",
    name: "John Doe",
    interests: ["Travel", "Photography", "Technology"],
    similarInterests: "",
    announcement: "Looking for travel companions in Southeast Asia!",
    profile: "",
    placesToVisit: "Japan, Thailand, Vietnam",
    instagram: "@johndoe_travel",
    photo: "",
    country: "USA",
    region: "California",
    dateOfBirth: "1995-03-15",
  });

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    
    // Here you would save to your API
    console.log("✅ Profile updated successfully!", updatedProfile);
    
    // Example API call:
    // try {
    //   await fetch('/api/user/profile', {
    //     method: 'PUT',
    //     headers: { 
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${userToken}`
    //     },
    //     body: JSON.stringify(updatedProfile)
    //   });
    //   
    //   // Show success toast/notification
    //   showSuccessMessage('Profile updated successfully!');
    // } catch (error) {
    //   console.error('Failed to save profile:', error);
    //   showErrorMessage('Failed to save changes. Please try again.');
    // }
  };

  return (
    <div className="settings-page">
      <ProfileSettings 
        initialProfile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
} 