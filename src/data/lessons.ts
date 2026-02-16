// Interfaces for lesson data
export interface DictionaryWord {
  word: string;
  translation: string;
  example: string;
  example_translation: string;
}

export interface DictionarySection {
  id: string;
  headingId: string;
  title: string;
  words: DictionaryWord[];
}

export interface LessonSentence {
  text: string;
  translation: string;
}

/** One bone: German term + Bulgarian translation */
export interface SkeletonBone {
  de: string;
  bg: string;
}

/** Group of bones (e.g. "1.Kopf – Gesichtsschädel") */
export interface SkeletonPart {
  groupLabel: string;
  groupLabelBg?: string;
  /** Optional image for this group (e.g. Scheitelbein/Schläfenbein diagram) */
  imageUrl?: string;
  bones: SkeletonBone[];
}

export interface Exercise {
  id: number;
  title: string;
  titleBg?: string;
  type: string;
  leftItems?: any[];
  rightItems?: any[];
  correctPairs?: any[];
  /** Model answer for type "question" (open-ended). */
  answer?: string;
  answerBg?: string;
  /** For type "skeleton": optional main image; parts = grouped bones */
  skeletonImageUrl?: string;
  skeletonParts?: SkeletonPart[];
}

export interface Resource {
  id: number;
  type: string;
  title: string;
  titleBg?: string;
  description: string;
  descriptionBg?: string;
  embedUrl?: string;
}

export interface TestOption {
  id: string;
  text: string;
  textBg?: string;
  correct: boolean;
}

export interface TestQuestion {
  id: number;
  question: string;
  questionBg?: string;
  /** Optional image URL (e.g. /images/...) shown above the question */
  image?: string;
  options: TestOption[];
}

export interface LessonTest {
  title: string;
  titleBg?: string;
  questions: TestQuestion[];
}

export interface LessonContent {
  id: string;
  courseId: number;
  title: string;
  subtitle: string;
  dictionary: DictionarySection[];
  sentences?: LessonSentence[];
  content?: string;
  images?: { [key: string]: string[] };
  exercises?: Exercise[];
  resources?: Resource[];
  /** Multiple-choice test; when set with testOnly, lesson shows only Test tab */
  test?: LessonTest;
  testOnly?: boolean;
}

// Import lesson data from separate JSON files
import lesson2_1 from "./lessons/2-1.json";
import lesson2_2 from "./lessons/2-2.json";
import lesson2_3 from "./lessons/2-3.json";
import lesson2_4 from "./lessons/2-4.json";
import lesson4_1 from "./lessons/4-1.json";
import lesson4_2 from "./lessons/4-2.json";
import lesson4_3 from "./lessons/4-3.json";
import lesson4_4 from "./lessons/4-4.json";
import lesson2_summary from "./lessons/2-summary.json";
import lesson3_1 from "./lessons/3-1.json";
import lesson3_2 from "./lessons/3-2.json";
import lesson3_3 from "./lessons/3-3.json";

// Combine all lessons into a single array
export const lessonsData: LessonContent[] = [
  lesson2_1 as LessonContent,
  lesson2_2 as LessonContent,
  lesson2_3 as LessonContent,
  lesson2_4 as LessonContent,
  lesson2_summary as LessonContent,
  lesson4_2 as LessonContent,
  lesson4_3 as LessonContent,
  lesson4_4 as LessonContent,
  lesson4_1 as LessonContent,
  lesson3_1 as LessonContent,
  lesson3_2 as LessonContent,
  lesson3_3 as LessonContent,
];

// Helper function to get a lesson by course ID and lesson ID
export const getLessonById = (
  courseId: number,
  lessonId: string
): LessonContent | undefined => {
  const lessonKey = `${courseId}-${lessonId}`;
  return lessonsData.find((lesson) => lesson.id === lessonKey);
};
