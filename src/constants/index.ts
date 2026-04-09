import { Subject } from "@/types";

export const DEPARTMENTS = ["CS", "Math", "Eng"];

export const DEPARTMENTS_OPTIONS = DEPARTMENTS.map((dep) => ({
  value: dep,
  label: dep,
}));

export const mockSubjects: Subject[] = [
  {
    id: 1,
    code: "CS101",
    department: "CS",
    name: "Introduction to Computer Science",
    description:
      "A foundational course covering algorithms, programming concepts, and computational thinking.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    code: "MATH205",
    name: "Linear Algebra",
    department: "Math",
    description:
      "An exploration of vector spaces, matrices, systems of equations, and their applications in engineering and science.",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    code: "ENG310",
    name: "Modern Literature",
    department: "Eng",
    description:
      "A study of twentieth- and twenty-first-century literary movements, authors, and thematic analysis.",
    createdAt: new Date().toISOString(),
  },
];
