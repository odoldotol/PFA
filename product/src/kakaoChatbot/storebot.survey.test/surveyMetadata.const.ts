import { QuestionId } from "./question.const";

/**
 * 
 */
export const surveyMetadatas: SurveyMetadatas = {
  1: {
      questionIds: [ 1, 2, 3 ]
    }
  };
  
export const currentSurveyVersion = 1;

type SurveyMetadata = {
  questionIds: QuestionId[];
};

type SurveyId = number;

type SurveyMetadatas = {
  [id: SurveyId]: SurveyMetadata;
};