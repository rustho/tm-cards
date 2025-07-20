import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { userService } from '@/lib/services/user.service';
import { profileService } from '@/lib/services/profile.service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Testing database connection...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    // Test basic operations
    const userCount = await userService.count();
    const profileCount = await profileService.count();
    
    console.log(`📊 Found ${userCount} users and ${profileCount} profiles`);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      stats: {
        users: userCount,
        profiles: profileCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Create a test user
    const testUser = await userService.createUser({
      telegramId: `test_${Date.now()}`,
      firstName: 'Test User',
      lastName: 'TestLast',
      username: 'testuser',
      languageCode: 'en',
      chatId: `chat_${Date.now()}`
    });

    // Create a test profile
    const testProfile = await profileService.createProfile(testUser._id.toString(), {
      name: 'Test User',
      age: '25',
      occupation: 'Software Developer',
      about: 'Test user for database validation',
      country: 'Вьетнам',
      region: 'Да Нанг',
      interests: ['Путешествия', 'Технологии'],
      hobbies: ['Программирование'],
      personalityTraits: ['Креативный'],
      placesToVisit: 'Вьетнам, Да Нанг и другие места',
      instagram: 'testuser',
      announcement: 'Ищу компанию для путешествий',
      photo: 'https://via.placeholder.com/400',
      profile: 'Test profile description'
    });

    return NextResponse.json({
      success: true,
      message: 'Test user and profile created successfully',
      data: {
        userId: testUser._id,
        profileId: testProfile._id,
        completionPercentage: testProfile.completionPercentage,
        isComplete: testProfile.isComplete
      }
    });

  } catch (error: any) {
    console.error('❌ Test creation failed:', error);
    return NextResponse.json(
      { 
        error: 'Test creation failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 