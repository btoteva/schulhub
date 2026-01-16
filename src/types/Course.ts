export interface Course {
  id: number;
  title: string;
  description: string;
  level: "beginner" | "grade8";
  lessons: number;
}
