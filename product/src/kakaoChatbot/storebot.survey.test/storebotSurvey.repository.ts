import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  StorebotSurvey,
  StorebotSurveyDocument
} from "./storebotSurvey.schema";
import { Model } from "mongoose";

@Injectable()
export class StorebotSurveyRepository {

  constructor(
    @InjectModel(StorebotSurvey.name)
    private readonly storebotSurveyModel: Model<StorebotSurveyDocument>,
  ) {}

  public async readOneOrCreate(
    userId: number,
    // subjectId: number,
  ): Promise<StorebotSurveyDocument> {
    const survey = await this.storebotSurveyModel.findOne({
      userId,
      // subjectId,
    });

    if (survey) {
      return survey;
    } else {
      return new this.storebotSurveyModel({
        userId,
        // subjectId,
      }).save();
    }
  }

}
