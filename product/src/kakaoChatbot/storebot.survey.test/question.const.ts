export enum QuesionType {
  CHOICE = "choice",
  ESSAY = "essay",
};

/**
 * 
 */
export const questions: Questions = [
  {
    id: 1,
    type: QuesionType.CHOICE,
    description: "질문1",
    choices: [
      "답변1-1",
      "답변1-2"
    ],
  },
  {
    id: 2,
    type: QuesionType.CHOICE,
    description: "질문2",
    choices: [
      "답변2-1",
      "답변2-2"
    ],
  },
  {
    id: 3,
    type: QuesionType.CHOICE,
    description: "질문3",
    choices: [
      "답변3-1",
      "답변3-2"
    ],
  },
];

export type QuestionId = number;

type Questions = Question[];

type Choices = string[];

export type Question<T extends QuesionType = QuesionType> = {
  id: QuestionId;
  type: T;
  title?: string;
  description: string;
  choices: T extends QuesionType.CHOICE ? Choices : null;
};

export const isChoiceQuestion = (
  question: Question
): question is Question<QuesionType.CHOICE> => {
  return question.type === QuesionType.CHOICE;
};

export const isEssayQuestion = (
  question: Question
): question is Question<QuesionType.ESSAY> => {
  return question.type === QuesionType.ESSAY;
};