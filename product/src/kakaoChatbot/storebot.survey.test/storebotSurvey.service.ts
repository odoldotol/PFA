import {
  Injectable,
  Logger
} from "@nestjs/common";
import { StorebotSurveyRepository } from "./storebotSurvey.repository";
import { SkillResponseService } from "../skillResponse.service";
import { SkillResponse } from "../skillResponse/v2";
import { AuthService } from "../auth.service";
import { SkillPayloadDto } from "../dto";
import { AnswerSheet, StorebotSurvey, StorebotSurveyDocument } from "./storebotSurvey.schema";
import { currentSurveyVersion, surveyMetadatas } from "./surveyMetadata.const";
import { Question, questions } from "./question.const";

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
    const survey = await this.getSurvey(skillPayload);

    const firstCompleted = survey.answers.find((answerSheet) => {
      if (this.isAnswerSheetComplete(answerSheet)) {
        return true;
      } else {
        return false;
      }
    });

    if (firstCompleted) {
      return this.skillResponseSrv.ss_showEventSerial(survey);
    } else {
      return this.skillResponseSrv.ss_noEventSerial();
    }
  }

  public async volunteer(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const survey = await this.getSurvey(skillPayload);
    const lastAnswerSheet = this.getLastAnswerSheet(survey);
    if (
      lastAnswerSheet &&
      this.isAnswerSheetVersionUpToDate(lastAnswerSheet) &&
      this.isAnswerSheetComplete(lastAnswerSheet)
    ) {
      return this.skillResponseSrv.ss_alreadyDone(survey);
    } else {
      return this.enter();
    }
  }

  public async enter(): Promise<SkillResponse> {
    return this.skillResponseSrv.ss_enter();
  }

  // 시트 만들꺼면 여기에서만 만들어야함.
  public async start(
    skillPayload: SkillPayloadDto
  ): Promise<SkillResponse> {
    const survey = await this.getSurvey(skillPayload);
    let lastAnswerSheet = this.getLastAnswerSheet(survey);
    let isContinued = false;

    if ( // 마지막시트가 완료이거나 시트가 없는 경우
      lastAnswerSheet === null ||
      this.isAnswerSheetComplete(lastAnswerSheet)
    ) {
      lastAnswerSheet = {
        surveyVersion: currentSurveyVersion,
        answerArray: [],
      };
      survey.answers.push(lastAnswerSheet);
      survey.markModified("answers");
      await survey.save();
    } else {
      isContinued = true;
    }

    const question = this.getNextQuestion(lastAnswerSheet);
    if (question === null) { // 여기 진입하면 문제가 있는거임
      throw new Error("Question is null");
    }
    return this.skillResponseSrv.ss_question(
      question,
      isContinued,
    );
  }

  private getNextQuestion(
    answerSheet: AnswerSheet
  ): Question | null {
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
    const survey = await this.getSurvey(skillPayload);
    const answerValue = this.getAnswerValue(skillPayload);

    let lastAnswerSheet = this.getLastAnswerSheet(survey);
    if ( // 마지막시트가 완료이거나 시트가 없는 경우
      lastAnswerSheet === null ||
      this.isAnswerSheetComplete(lastAnswerSheet)
    ) {
      return this.skillResponseSrv.ss_invalidAnswer();
    }

    const question = this.getNextQuestion(lastAnswerSheet);
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
      await survey.save();

      if (this.isAnswerSheetComplete(lastAnswerSheet)) {
        return this.skillResponseSrv.ss_done(survey);
      } else {
        const nextQuestion = this.getNextQuestion(lastAnswerSheet);
        if (nextQuestion === null) { // 정상적으로 발생할 수 없음.
          throw new Error("Next question is null");
        } else {
          return this.skillResponseSrv.ss_question(
            nextQuestion,
            false,
          );
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
