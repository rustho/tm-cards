"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { Button } from "@telegram-apps/telegram-ui";
import { Profile } from "@/models/types";

export default function Home() {
  const router = useRouter();
  const user = useSignal(initData.user);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const userId = "135052006";
    const fetchMatches = async () => {
      try {
        const response = await fetch(`/api/matches/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleMatchClick = (match: Profile) => {
    const otherUserId = match.id;
    router.push(`/profile/${otherUserId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      <div className="space-y-4">
        {matches.map((match) => (
          <div
            key={match.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleMatchClick(match)}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Match #{match.id.slice(-6)}
                </h2>
                {/* <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      match.status === "current"
                        ? "text-green-600"
                        : match.status === "pending"
                        ? "text-yellow-600"
                        : "text-gray-600"
                    }`}
                  >
                    {match.status.charAt(0).toUpperCase() +
                      match.status.slice(1)}
                  </span>
                </p> */}
              </div>
              {/* {match.status === "current" && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle write to match
                    const otherUserId =
                      match.user1 === user?.id ? match.user2 : match.user1;
                    // Implement write to match functionality
                  }}
                >
                  Write to Match
                </Button>
              )} */}
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <div className="text-center text-gray-600">
            No matches found. Complete your profile to get started!
          </div>
        )}
      </div>
    </div>
  );
}
