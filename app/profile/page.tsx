"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Section,
  Cell,
  Input,
  ButtonCell,
  Button,
} from "@telegram-apps/telegram-ui";
import { initData, useSignal } from "@telegram-apps/sdk-react";

interface ProfileData {
  name: string;
  nickname: string;
  bio: string;
}

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const initDataState = useSignal(initData.state);
  const user = useMemo(() => initDataState?.user, [initDataState]);
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.firstName + " " + user?.lastName || "John Doe",
    nickname: user?.username || "@JohnDoe",
    bio: "Frontend developer passionate about React and TypeScript",
  });

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/profile?telegramId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.name) {
            setProfile(data);
          } else {
            setProfile({
              name: user.firstName + " " + user.lastName || "John Doe",
              nickname: user.username || "@JohnDoe",
              bio: "Frontend developer passionate about React and TypeScript",
            });
          }
        });
    }
  }, [user]);

  const { register, handleSubmit, reset } = useForm<ProfileData>({
    defaultValues: profile,
  });

  const onSubmit = async (data: ProfileData) => {
    console.log(data);
    if (user?.id) {
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            telegramId: user.id,
            ...data,
          }),
        });

        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    }
  };

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg p-6">
        {!isEditing ? (
          // View Mode
          <Section
            footer="The official Telegram app is available for Android, iPhone, iPad, Windows, macOS and Linux."
            header="Profile Information"
          >
            <Cell before={<span className="font-semibold">Name:</span>}>
              {profile.name}
            </Cell>
            <Cell before={<span className="font-semibold">Email:</span>}>
              {profile.nickname}
            </Cell>
            <Cell before={<span className="font-semibold">Bio:</span>}>
              {profile.bio}
            </Cell>
            <ButtonCell
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Edit Profile
            </ButtonCell>
          </Section>
        ) : (
          <Section
            footer={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "8px",
                }}
              >
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleSubmit(onSubmit)}
                >
                  Save Changes
                </Button>
              </div>
            }
            header="Edit Profile"
          >
            <form className="space-y-4">
              <Input
                header="Name"
                placeholder="Enter your name"
                {...register("name")}
              />
              <Input
                header="Email"
                placeholder="Enter your email"
                {...register("nickname")}
              />
              <Input
                header="Bio"
                placeholder="Enter your bio"
                {...register("bio")}
              />
            </form>
          </Section>
        )}
      </div>
    </div>
  );
}
