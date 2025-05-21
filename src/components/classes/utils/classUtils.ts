
import { Author, Post, Reply, StudentProfile } from "@/types/class.types";

// Helper function to create a default author when data is missing
export const createDefaultAuthor = (authorId: string): Author => ({
  id: authorId,
  full_name: "Unknown",
  role: null
});

// Helper function to get author name
export const authorName = (author?: Author | null): string => {
  if (!author) return 'Anonymous';
  return author.full_name || 'Unknown';
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
    const p = student.profiles;
    processedProfile = {
      id: p.id || student.student_id,
      full_name: p.full_name ?? null,
      phone: p.phone ?? null,
      email: p.email,
      avatar_url: p.avatar_url
    };
  }
  
  return processedProfile;
};
