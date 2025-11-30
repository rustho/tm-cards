import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to calculate age from date string (DD.MM.YYYY or YYYY-MM-DD)
function calculateAge(dateString: string): number | null {
  if (!dateString) return null;

  let birthDate: Date;

  // Check format
  if (dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
          // DD.MM.YYYY
          birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
          return null;
      }
  } else {
      // Assume ISO or standard format
      birthDate = new Date(dateString);
  }

  if (isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Ensure we have a telegramId.
    const telegramId = data.id || data.telegramId;
    if (!telegramId || telegramId === "") {
        console.error("Missing telegramId. Received data:", JSON.stringify(data, null, 2));
        return NextResponse.json(
            { error: "User ID is missing. Please ensure you are logged in." },
            { status: 400 }
        );
    }

    // Construct update data dynamically to support partial updates
    const updateData: any = {
        updatedAt: new Date()
    };

    // Only add fields that are present in the request
    if (data.username !== undefined) updateData.username = data.username;
    if (data.name !== undefined) updateData.name = data.name;

    if (data.dateOfBirth !== undefined) {
        updateData.dateOfBirth = data.dateOfBirth;
        // Calculate and save age
        const age = calculateAge(data.dateOfBirth);
        if (age !== null) {
            updateData.age = age;
        }
    }

    if (data.country !== undefined) updateData.country = data.country;
    if (data.region !== undefined) updateData.region = data.region;
    if (data.interests !== undefined) updateData.interests = data.interests;
    if (data.hobbies !== undefined) updateData.hobbies = data.hobbies;
    if (data.personalityTraits !== undefined) updateData.personalityTraits = data.personalityTraits;
    if (data.goal !== undefined) updateData.goal = data.goal;

    if (data.placesToVisit !== undefined) {
         // Check if it's already an array or needs splitting
         if (Array.isArray(data.placesToVisit)) {
             updateData.placesToVisit = data.placesToVisit;
         } else if (typeof data.placesToVisit === 'string') {
             updateData.placesToVisit = data.placesToVisit.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
         }
    }
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.photo !== undefined) updateData.photo = data.photo;
    if (data.announcement !== undefined) updateData.announcement = data.announcement;

    // Support mapping 'profile' or 'about' to 'profile' field in DB
    if (data.profile !== undefined) updateData.profile = data.profile;
    else if (data.about !== undefined) updateData.profile = data.about;

    // Set active status if this is an initialization or explicit set
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Upsert user (PATCH behavior) using Prisma
    const user = await prisma.matchingUser.upsert({
        where: { telegramId: telegramId.toString() },
        update: updateData,
        create: {
            telegramId: telegramId.toString(),
            ...updateData,
            // Provide defaults for required fields if they are missing in initial creation
            interests: updateData.interests || [],
            hobbies: updateData.hobbies || [],
            personalityTraits: updateData.personalityTraits || [],
            placesToVisit: updateData.placesToVisit || [],
            previousMatches: []
        }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error saving profile:", error);
    
    // Handle Prisma validation errors
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: "A user with this ID already exists" },
        { status: 400 }
      );
    }
    
    // Handle Prisma validation errors
    if (error?.code === 'P2003' || error?.code === 'P2011') {
      return NextResponse.json(
        { error: `Validation error: ${error.message || 'Invalid data provided'}` },
        { status: 400 }
      );
    }
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Internal Server Error'
      : 'Internal Server Error';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.code?.startsWith('P') ? 400 : 500 }
    );
  }
}
