import { QuestionId } from "./question.const";

/**
 * git 에서 제외하기
 */
export const surveyMetadatas: SurveyMetadatas = {
1: {
    questionIds: [ 1, 2, 3 ]
  },
2: {
    questionIds: [ 4, 5, 6 ]
  },
};

/**
 * git 에서 제외하기
 */
export const currentSurveyVersion = 2;

type SurveyMetadata = {
  questionIds: QuestionId[];
};

type SurveyId = number;

type SurveyMetadatas = {
  [id: SurveyId]: SurveyMetadata;
};