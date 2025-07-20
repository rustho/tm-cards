import connectDB from '@/lib/mongodb';
import { userService } from '@/lib/services/user.service';
import { profileService } from '@/lib/services/profile.service';
import { INTERESTS, HOBBIES, PERSONALITY_TRAITS, LOCATIONS } from '@/models/types';

interface SeedUser {
  telegramId: string;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode: string;
  chatId: string;
  profile: {
    name: string;
    age: string;
    occupation: string;
    about: string;
    country: string;
    region: string;
    interests: string[];
    hobbies: string[];
    personalityTraits: string[];
    placesToVisit: string;
    instagram: string;
    announcement: string;
    photo: string;
    profile: string;
  };
}

const sampleOccupations = [
  'Software Developer', 'Designer', 'Marketing Manager', 'Teacher', 'Doctor',
  'Engineer', 'Artist', 'Photographer', 'Entrepreneur', 'Consultant',
  'Writer', 'Analyst', 'Project Manager', 'Sales Manager', 'Architect'
];

const samplePhotos = [
  'https://images.unsplash.com/photo-1494790108755-2616b9b5c9dc?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1522075469751-3847ad4b9a89?w=400',
  'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=400'
];

const sampleAbouts = [
  'Люблю путешествовать и открывать новые места. В свободное время читаю книги и готовлю.',
  'Активный человек, люблю спорт и природу. Работаю в IT, но хобби у меня творческие.',
  'Творческая личность, увлекаюсь искусством и музыкой. Мечтаю посетить Японию.',
  'Предприниматель и любитель приключений. Изучаю новые языки и культуры.',
  'Доктор по профессии, путешественник по духу. Люблю помогать людям и исследовать мир.'
];

const sampleAnnouncements = [
  'Ищу компанию для путешествий по Азии. Интересны культурные места и местная кухня.',
  'Хочу найти единомышленников для активного отдыха. Горы, море, новые впечатления!',
  'Планирую поездку в Европу, ищу попутчиков или местных гидов.',
  'Интересуют необычные места и скрытые жемчужины. Давайте исследовать мир вместе!',
  'Люблю фотографировать в путешествиях. Ищу модели и красивые локации.'
];

function getRandomItems<T>(array: readonly T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomItem<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateUsers(): SeedUser[] {
  const users: SeedUser[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const telegramId = `telegram_${i.toString().padStart(3, '0')}`;
    const firstName = `User${i}`;
    const location = getRandomItem(LOCATIONS);
    const region = getRandomItem(location.regions);
    
    users.push({
      telegramId,
      firstName,
      lastName: Math.random() > 0.5 ? `Lastname${i}` : undefined,
      username: Math.random() > 0.3 ? `user${i}` : undefined,
      languageCode: Math.random() > 0.7 ? 'en' : 'ru',
      chatId: `chat_${i}`,
      profile: {
        name: firstName,
        age: (Math.floor(Math.random() * 30) + 20).toString(), // 20-50
        occupation: getRandomItem(sampleOccupations),
        about: getRandomItem(sampleAbouts),
        country: location.country,
        region: region,
        interests: getRandomItems(INTERESTS, Math.floor(Math.random() * 5) + 3), // 3-7 interests
        hobbies: getRandomItems(HOBBIES, Math.floor(Math.random() * 4) + 2), // 2-5 hobbies
        personalityTraits: getRandomItems(PERSONALITY_TRAITS, Math.floor(Math.random() * 3) + 2), // 2-4 traits
        placesToVisit: `${location.country}, ${region} и другие удивительные места`,
        instagram: Math.random() > 0.4 ? `user${i}_travel` : '',
        announcement: getRandomItem(sampleAnnouncements),
        photo: getRandomItem(samplePhotos),
        profile: `${getRandomItem(sampleAbouts)} Моя цель - найти единомышленников для путешествий.`
      }
    });
  }
  
  return users;
}

async function seedDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected to MongoDB');

    console.log('🗑️ Clearing existing data...');
    
    // Clear existing data
    await userService.model.deleteMany({});
    await profileService.model.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('🌱 Generating seed data...');
    const seedUsers = generateUsers();

    console.log('👥 Creating users and profiles...');
    let createdCount = 0;
    
    for (const seedUser of seedUsers) {
      try {
        // Create user
        const user = await userService.createUser({
          telegramId: seedUser.telegramId,
          firstName: seedUser.firstName,
          lastName: seedUser.lastName,
          username: seedUser.username,
          languageCode: seedUser.languageCode,
          chatId: seedUser.chatId
        });

        // Create profile
        await profileService.createProfile(user._id.toString(), seedUser.profile);
        
        createdCount++;
        if (createdCount % 10 === 0) {
          console.log(`✅ Created ${createdCount} users...`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${seedUser.telegramId}:`, error);
      }
    }

    console.log(`🎉 Successfully seeded database with ${createdCount} users and profiles!`);
    
    // Print some statistics
    const totalUsers = await userService.count();
    const totalProfiles = await profileService.count();
    const completeProfiles = await profileService.count({ isComplete: true });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Users: ${totalUsers}`);
    console.log(`   Profiles: ${totalProfiles}`);
    console.log(`   Complete Profiles: ${completeProfiles}`);
    console.log(`   Completion Rate: ${Math.round((completeProfiles / totalProfiles) * 100)}%`);
    
    // Print locations distribution
    const locationStats = await profileService.aggregate([
      { $group: { _id: { country: '$country', region: '$region' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n🌍 Location Distribution:');
    locationStats.forEach((stat: any) => {
      console.log(`   ${stat._id.country}, ${stat._id.region}: ${stat.count} users`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎯 Seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

export { seedDatabase }; 