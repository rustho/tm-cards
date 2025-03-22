"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Profile } from "@/models/types";
import { Button } from "@telegram-apps/telegram-ui";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { FooterMenu } from "@/components/FooterMenu";

export default function UserProfile() {
  const params = useParams();
  const user = useSignal(initData.user);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/profile/${params.userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.userId]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-6">
          {profile.photo && (
            <img
              src={profile.photo}
              alt={profile.name}
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{profile.name}</h1>
            <p className="text-gray-700 mb-4">{profile.announcement}</p>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Location</h2>
              <p>
                {profile.region}, {profile.country}
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Personality</h2>
              {/* <div className="flex flex-wrap gap-2">
                {profile.personality.map((trait) => (
                  <span
                    key={trait}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div> */}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest) => (
                  <span
                    key={interest}
                    className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Hobbies</h2>
              {/* <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((hobby) => (
                  <span
                    key={hobby}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                  >
                    {hobby}
                  </span>
                ))}
              </div> */}
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Travel Style</h2>
              <p className="text-gray-700">{profile.placesToVisit}</p>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Instagram</h2>
              <a
                href={`https://instagram.com/${profile.instagram.slice(1)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.instagram}
              </a>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Looking for</h2>
              <p className="text-gray-700">{profile.announcement}</p>
            </div>

            {user?.id !== parseInt(params.userId as string) && (
              <Button className="mt-4">Write to Match</Button>
            )}
          </div>
        </div>
      </div>
      <FooterMenu />
    </div>
  );
}
