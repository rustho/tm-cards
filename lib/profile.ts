import { Profile } from "@/models/types";

export async function fetchProfile(userId: string): Promise<Profile> {
  const response = await fetch(`/api/profile/${userId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  return response.json();
}

export async function updateProfile(
  userId: string,
  data: Partial<Profile>
): Promise<Profile> {
  const response = await fetch(`/api/profile/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update profile");
  }
  return response.json();
}

export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`/api/profile/${userId}/photo`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error("Failed to upload photo");
  }
  const { photoUrl } = await response.json();
  return photoUrl;
}
