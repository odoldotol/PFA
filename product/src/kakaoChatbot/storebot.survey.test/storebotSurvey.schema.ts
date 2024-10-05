import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type StorebotSurveyDocument = StorebotSurvey & Document;

type Answer = {
  questionId: number,
  value: string,
  date: Date,
};

export type AnswerSheet = {
  surveyVersion: number;
  answerArray: Answer[];
};

type Answers = AnswerSheet[];

@Schema({
  timestamps: true,
  strict: true,
})
export class StorebotSurvey {

  // 유저id 이자 이벤트시리얼 역할 // 유저id 가 노출되기에 좋지않은 선택이지만 테스트설문이기떄문에 심플하고 빠른방법 선택해버리기.
  @Prop({
    required: true,
    type: Number,
  })
  userId!: number;

  @Prop({
    required: true,
    type: Array<AnswerSheet>,
    default: [],
  })
  answers!: Answers;

}

export const StorebotSurveySchema = SchemaFactory.createForClass(StorebotSurvey);