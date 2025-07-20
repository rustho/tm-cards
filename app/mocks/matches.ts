import { Profile } from "@/models/types";

export const mockProfiles: Record<number, Profile> = {
  123456: {
    id: "123456",
    username: "anna.travels",
    name: "Anna",
    dateOfBirth: "1995-03-15",
    interests: ["Travel", "Photography", "Cooking"],
    similarInterests: "Travel, Photography",
    announcement:
      "I love exploring new cultures and meeting people from different backgrounds",
    profile: "Passionate traveler and photographer",
    instagram: "@anna.travels",
    country: "Вьетнам",
    region: "Да Нанг",
    placesToVisit: "Looking for travel buddies and cultural exchange",
    photo: "https://example.com/anna.jpg",
  },
  789012: {
    id: "789012",
    username: "mike.tech",
    name: "Mike",
    dateOfBirth: "1992-07-22",
    interests: ["Technology", "Travel", "Languages"],
    similarInterests: "Technology, Travel, Languages",
    announcement: "I enjoy slow travel and immersing myself in local cultures",
    profile: "Tech enthusiast who loves combining work and travel",
    instagram: "@mike.tech",
    country: "Бали",
    region: "Чангу",
    placesToVisit: "Seeking travel companions for exploring Southeast Asia",
    photo: "https://example.com/mike.jpg",
  },
};

export const mockMatches = ["789012"];
