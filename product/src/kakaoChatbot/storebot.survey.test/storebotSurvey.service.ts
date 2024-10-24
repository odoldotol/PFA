import {
  Injectable,
  Logger
} from "@nestjs/common";
import { Document } from "mongoose";
import { StorebotSurveyRepository } from "./storebotSurvey.repository";
import { SkillResponseService } from "../skillResponse.service";
import { SkillResponse } from "../skillResponse/v2";
import { AuthService } from "../auth.service";
import { SkillPayloadDto } from "../dto";
import {
  AnswerSheet,
  StorebotSurvey,
  StorebotSurveyDocument
} from "./storebotSurvey.schema";
import {
  currentSurveyVersion,
  surveyMetadatas
} from "./surveyMetadata.const";
import {
  Question,
  questions
} from "./question.const";

@Injectable()
export class StorebotSurveyTestService {

  private readonly logger = new Logger(StorebotSurveyTestService.name);

  constructor(
    private readonly surveyRepo: StorebotSurveyRepository,
    private readonly skillResponseSrv: SkillResponseService,
    private readonly authSrv: AuthService,
  ) {}

  /**
   * 유저, 서베이 생성가능.
   */
  private async getSurvey(
    skillPayload: SkillPayloadDto
  ): Promise<StorebotSurveyDocument> {
    return this.surveyRepo.readOneOrCreate(
      (await this.authSrv.getUser(skillPayload)).id
    );
  }

  public async getEventSerial(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    let survey = await this.getSurvey(skillPayload);
    const lastComplete = this.findLastComplete(survey);
    if (lastComplete !== undefined) {
      return this.skillResponseSrv.ss_showEventSerial(
        survey,
        lastComplete.surveyVersion
      );
    } else {
      const {
        nextQuestion,
        isContinued
      } = await this.startTask(survey);

      return this.skillResponseSrv.ss_noEventSerial(
        nextQuestion,
        isContinued
      );
    }
  }

  private findLastComplete(
    survey: StorebotSurveyDocument
  ): AnswerSheet | undefined {
    let result: AnswerSheet | undefined = undefined;
    let lastIdx = survey.answers.length - 1;

    while (
      result === undefined &&
      0 < lastIdx
    ) {
      if (this.isAnswerSheetComplete(survey.answers[lastIdx]!)) {
        result = survey.answers[lastIdx];
      } else {
        lastIdx--;
      }
    }

    return result;
  }

  public async volunteer(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const survey = await this.getSurvey(skillPayload);
    if (this.isLastAnswerSheetValid(survey)) {
      return this.skillResponseSrv.ss_alreadyDone();
    } else {
      return this.start(survey);
    }
  }

  // 시트 만들꺼면 여기에서만 만들어야함.
  public async start(survey: StorebotSurveyDocument): Promise<SkillResponse>;
  public async start(skillPayload: SkillPayloadDto): Promise<SkillResponse>;
  public async start(
    param: StorebotSurveyDocument | SkillPayloadDto
  ): Promise<SkillResponse> {
    let survey = param instanceof Document ? param : await this.getSurvey(param);

    const {
      nextQuestion,
      isContinued
    } = await this.startTask(survey);

    return this.skillResponseSrv.ss_start(
      nextQuestion,
      isContinued
    );
  }

  private async startTask(
    survey: StorebotSurveyDocument,
  ): Promise<{
    nextQuestion: Question,
    isContinued: boolean
  }> {
    let isContinued: boolean;

    if (this.isLastAnswerSheetValid(survey) === false) {
      isContinued = false;
      survey = await this.createNewAnswerSheet(survey);
    } else {
      isContinued = true;
    }

    const nextQuestion = this.getNextQuestion(survey);
    if (nextQuestion === null) { // 여기 진입하면 문제가 있는거임
      throw new Error("Question is null");
    }

    return {
      nextQuestion,
      isContinued
    };
  }

  private createNewAnswerSheet(
    survey: StorebotSurveyDocument,
  ): Promise<StorebotSurveyDocument> {
    survey.answers.push({
      surveyVersion: currentSurveyVersion,
      answerArray: [],
    });
    survey.markModified("answers");
    return survey.save();
  }

  /**
   * 마지막시트있고 버전이 최신이고 완료된경우
   */
  private isLastAnswerSheetValid(
    survey: StorebotSurveyDocument,
  ): boolean {
    const lastAnswerSheet = this.getLastAnswerSheet(survey);
    return lastAnswerSheet !== null
    && this.isAnswerSheetVersionUpToDate(lastAnswerSheet) === true
    && this.isAnswerSheetComplete(lastAnswerSheet) === true;
  }

  private getNextQuestion(
    survey: StorebotSurveyDocument,
  ): Question | null {
    const answerSheet = this.getLastAnswerSheet(survey);
    if (answerSheet === null) {
      return null;
    }

    try {
      const questionId = surveyMetadatas[answerSheet.surveyVersion]!.questionIds[answerSheet.answerArray.length];
      if (questionId === undefined) {
        return null; // 다음 질문이 없음. 모든 답변을 받았다고 보면 됨.
      } else {
        const question = questions.find(question => question.id === questionId)
        if (question === undefined) {
          throw new Error(`Question not found (QuestionId: ${questionId})`);
        }
        return question;
      }
    } catch (e) {
      // ! assertion failed, etc.
      this.logger.warn(e);
      return null;
    }
  }

  public async answerQuestion(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const answerQuestionId = this.getAnswerQuestionId(skillPayload);
    const answerValue = this.getAnswerValue(skillPayload);
    
    let survey = await this.getSurvey(skillPayload);

    const lastAnswerSheet = this.getLastAnswerSheet(survey);
    if ( // 마지막시트가 완료이거나 시트가 없는 경우
      lastAnswerSheet === null ||
      this.isAnswerSheetComplete(lastAnswerSheet)
    ) {
      return this.skillResponseSrv.ss_invalidAnswer();
    }

    const question = this.getNextQuestion(survey);
    if (question === null) {
      return this.skillResponseSrv.ss_invalidAnswer();
    }

    if (question.id === answerQuestionId) {
      // 저장하고 다음 질문 주기
      lastAnswerSheet.answerArray.push({
        questionId: answerQuestionId,
        value: answerValue,
        date: new Date(),
      });
      survey.answers[survey.answers.length - 1] = lastAnswerSheet;
      survey.markModified("answers");
      await survey.save()
      .then(newSurvey => survey = newSurvey);

      if (this.isAnswerSheetComplete(lastAnswerSheet)) {
        return this.skillResponseSrv.ss_done(
          survey,
          lastAnswerSheet.surveyVersion
        );
      } else {
        const nextQuestion = this.getNextQuestion(survey);
        if (nextQuestion === null) { // 정상적으로 발생할 수 없음.
          throw new Error("Next question is null");
        } else {
          return this.skillResponseSrv.ss_question(nextQuestion);
        }
      }
    } else {
      return this.skillResponseSrv.ss_invalidAnswer();
    }
  }

  private getAnswerQuestionId(
    skillPayload: SkillPayloadDto
  ): number {
    const result = Number(skillPayload.action.clientExtra["questionId"]);
    if (isNaN(result)) {
      throw new Error("QuestionId is not a number");
    } else {
      return result;
    }
  }

  private getAnswerValue(
    skillPayload: SkillPayloadDto
  ): string {
    const result = skillPayload.action.clientExtra["value"];
    if (result === undefined) {
      throw new Error("Value is undefined");
    } else {
      return result;
    }
  }

  private isAnswerSheetComplete(
    answerSheet: AnswerSheet
  ): boolean {
    return answerSheet.answerArray.length === surveyMetadatas[answerSheet.surveyVersion]?.questionIds.length;
  }

  private isAnswerSheetVersionUpToDate(
    answerSheet: AnswerSheet
  ): boolean {
    return answerSheet.surveyVersion === currentSurveyVersion;
  }

  private getLastAnswerSheet(
    survey: StorebotSurvey
  ): AnswerSheet | null {
    return survey.answers[survey.answers.length - 1] || null;
  }

}
