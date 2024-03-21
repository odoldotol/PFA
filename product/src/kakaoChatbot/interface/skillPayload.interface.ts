/**
 * ### Kakao chatbot skill payload
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#skillpayload
 */
export type SkillPayload = {
  intent: Intent;
  userRequest: UserRequest;
  bot: Bot;
  action: Action;
  contexts: Context[];
};

/**
 * ### Intent in SkillPayload
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#intent
 */
export type Intent = {
  id: string;
  name: string;
  extra?: any; //
};

/**
 * ### UserRequest in SkillPayload
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#userrequest
 */
export type UserRequest = {
  timezone: string;
  block: Block;
  utterance: string;
  lang: string;
  user: User;
  params?: any; //
};

export type Block = {
  id: string;
  name: string;
};

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#user
 */
export type User = {
  id: string;
  type: string;
  properties: Properties;
};

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#user.properties
 */
export type Properties = {
  plusfriendUserKey: string;
  plusfriend_user_key?: string;
  appUserId: string;
  isFriend: boolean;
  botUserKey?: string;
  bot_user_key?: string;
};

/**
 * ### Bot in SkillPayload
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#bot
 */
export type Bot = {
  id: string;
  name: string;
};

/**
 * ### Action in SkillPayload
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#action
 */
export type Action = {
  id: string;
  name: string;
  params: ActionParams;
  detailParams: DetailParams;
  clientExtra: ClientExtra;
};

export type ActionParams = {
  [k: string]: string;
};

export type DetailParams = {
  [k: string]: DetailParam;
};

/**
 * https://kakaobusiness.gitbook.io/main/tool/chatbot/skill_guide/answer_json_format#detailparams
 */
type DetailParam = {
  groupName: string;
  origin: any;
  value: any;
};

export type ClientExtra = {
  [k: string]: any;
};

/**
 * ### Context in SkillPayload
 */
export type Context = {
  name: string;
  lifespan: number;
  ttl: number;
  params: ContextParams;
};

type ContextParams = {
  [k: string]: ContextParam;
};

type ContextParam = {
  value: any;
  resolvedValue: any;
};