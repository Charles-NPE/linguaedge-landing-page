
import { Author, Post, Reply, StudentProfile } from "@/types/class.types";

// Helper function to create a default author when data is missing
export const createDefaultAuthor = (authorId: string): Author => ({
  id: authorId,
  email: "Anonymous",
  avatar_url: undefined
});

// Helper function to get author name
export const authorName = (author?: Author | null): string => {
  if (!author) return 'Anonymous';
  return author.academy_name ?? author.full_name ?? author.email ?? 'Anonymous';
};

// Helper function to format date
export const formatDate = (dateString: string): string => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(dateString));
  } catch (error) {
    return 'some time ago';
  }
};

// Process student data to fit our Student interface
export const processStudentProfile = (student: any): StudentProfile | null => {
  // Handle the case where profile is a SelectQueryError
  let processedProfile: StudentProfile | null = null;
  if (student.profiles && typeof student.profiles === 'object' && 'id' in student.profiles) {
    processedProfile = student.profiles as StudentProfile;
  }
  
  return processedProfile;
};
