"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSignal, initData } from "@telegram-apps/sdk-react";
import { Profile } from "@/models/types";
// import { Button } from "@telegram-apps/telegram-ui";
import { FooterMenu } from "@/components/FooterMenu";

export default function Home() {
  const router = useRouter();
  const t = useTranslations('home');
  const user = useSignal(initData.user);
  const [matches, setMatches] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMatches() {
      try {
        const response = await fetch(`/api/matches/${user?.id}`);
        
        if (response.ok) {
          const data = await response.json();
          // Ensure data is an array before setting matches
          setMatches(Array.isArray(data) ? data : []);
        } else {
          // API returned an error, set empty array
          console.error("API Error:", response.status, response.statusText);
          setMatches([]);
        }
      } catch (error) {
        console.error("Error fetching matches:", error);
        setMatches([]); // Ensure matches is always an array
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, [user?.id]);

  const handleMatchClick = (match: Profile) => {
    const otherUserId = match.id;
    router.push(`/profile/${otherUserId}`);
  };

  if (isLoading) {
    return (
      <div style={{ background: 'var(--theme-bg-primary)', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="theme-card">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary"></div>
            <p style={{ color: 'var(--theme-text-primary)' }}>Loading matches...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            🎯 {t('title')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--theme-text-secondary)' }}>
            Your travel companions await
          </p>
        </div>

        <div className="space-y-4 mb-20">
          {matches.map((match) => (
            <div
              key={match.id}
              className="theme-card cursor-pointer transition-all duration-200 hover:transform hover:scale-102"
              onClick={() => handleMatchClick(match)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold">
                      {match.id.slice(-2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                      {t('matchNumber')}{match.id.slice(-6)}
                    </h2>
                    <p style={{ color: 'var(--theme-text-secondary)' }}>
                      Click to explore this match
                    </p>
                  </div>
                </div>
                <div className="text-2xl">
                  ➡️
                </div>
              </div>
            </div>
          ))}
          
          {matches.length === 0 && (
            <div className="theme-card text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                No matches yet
              </h3>
              <p style={{ color: 'var(--theme-text-secondary)' }}>
                {t('noMatches')}
              </p>
              <div className="mt-6">
                <button className="theme-btn-primary">
                  Complete your profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <FooterMenu />
    </div>
  );
}
