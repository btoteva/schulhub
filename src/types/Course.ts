export interface Course {
  id: number;
  title: string;
  description: string;
  level: "beginner" | "grade8" | "b1";
  lessons: number;
}
