import { Schema, model, models, Types, Document } from 'mongoose';
import { createBaseSchema } from './base.schema';

export interface IProfile extends Document {
  userId: Types.ObjectId;
  
  // Basic Info (from actual ProfileData)
  name: string;                 // from Profile.name
  age: string;                  // from ProfileData.age (string, not number!)
  occupation: string;           // from ProfileData.occupation
  about: string;               // from ProfileData.about
  
  // Location (from actual Profile)
  country: string;             // from Profile.country
  region: string;              // from Profile.region
  
  // Interests & Personality (from actual ProfileData arrays)
  interests: string[];         // from ProfileData.interests (strings, not ObjectIds!)
  hobbies: string[];          // from ProfileData.hobbies
  personalityTraits: string[]; // from ProfileData.personalityTraits
  
  // Travel & Social (from actual Profile)
  placesToVisit: string;       // from Profile.placesToVisit  
  instagram: string;           // from Profile.instagram
  announcement: string;        // from Profile.announcement (looking for)
  
  // Profile Status & Media
  photo: string;              // from Profile.photo
  profile: string;            // from Profile.profile (seems to be bio/description)
  
  // Profile Metadata
  isComplete: boolean;
  completionPercentage: number;
  isActive: boolean;
  lastProfileUpdate: Date;
}

const profileSchemaDefinition = {
  userId: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Info (from actual implementation)
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  age: {
    type: String,  // String, not Number! (as per actual implementation)
    required: true,
    validate: {
      validator: function(v: string) {
        const age = parseInt(v);
        return age >= 18 && age <= 100;
      },
      message: 'Age must be between 18 and 100'
    }
  },
  occupation: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  about: {
    type: String,
    required: true,
    trim: true,
    maxlength: 284  // Max chars as per Step8About component
  },
  
  // Location (from actual Profile interface)
  country: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  
  // Interests & Personality (arrays of strings)
  interests: {
    type: [String],
    required: true,
    validate: [
      {
        validator: function(v: string[]) { return v.length > 0; },
        message: 'At least one interest is required'
      },
      {
        validator: function(v: string[]) { return v.length <= 20; },
        message: 'Maximum 20 interests allowed'
      }
    ]
  },
  hobbies: {
    type: [String],
    validate: [arrayLimit20, 'Maximum 20 hobbies allowed']
  },
  personalityTraits: {
    type: [String],
    validate: [arrayLimit10, 'Maximum 10 personality traits allowed']
  },
  
  // Travel & Social
  placesToVisit: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  instagram: {
    type: String,
    trim: true,
    maxlength: 50
  },
  announcement: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  
  // Profile Status & Media
  photo: {
    type: String,
    trim: true
  },
  profile: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Profile Metadata
  isComplete: {
    type: Boolean,
    default: false,
    index: true
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  lastProfileUpdate: {
    type: Date,
    default: Date.now
  }
};

// Validation functions
function arrayLimit20(val: string[]) {
  return val.length <= 20;
}

function arrayLimit10(val: string[]) {
  return val.length <= 10;
}

const profileSchema = createBaseSchema(profileSchemaDefinition);

// Indexes for matching
profileSchema.index({ country: 1, region: 1 });
profileSchema.index({ isActive: 1, isComplete: 1 });
profileSchema.index({ interests: 1 });

// Calculate completion percentage before save
profileSchema.pre('save', function(next) {
  const requiredFields = ['name', 'age', 'occupation', 'about', 'country', 'region', 'interests', 'placesToVisit', 'announcement'];
  const optionalFields = ['hobbies', 'personalityTraits', 'instagram', 'photo', 'profile'];
  
  let completedRequired = 0;
  let completedOptional = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    const value = this.get(field);
    if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
      completedRequired++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = this.get(field);
    if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim().length > 0)) {
      completedOptional++;
    }
  });
  
  // Calculate percentage (80% for required, 20% for optional)
  this.completionPercentage = Math.round(
    (completedRequired / requiredFields.length) * 80 + 
    (completedOptional / optionalFields.length) * 20
  );
  
  this.isComplete = this.completionPercentage >= 70; // Profile is complete at 70%
  this.lastProfileUpdate = new Date();
  
  next();
});

export const Profile = models.Profile || model<IProfile>('Profile', profileSchema); 