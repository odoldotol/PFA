export type SkillPayload = {
  bot: Bot
  intent: Intent
  action: Action
  userRequest: UserRequest,
  contexts: Context[],
};

type Intent = {
  id: string,
  name: string,
  extra?: any //
};

type UserRequest = {
  timezone: string,
  block: Block,
  utterance: string,
  lang: string,
  user: User,
  params?: any //
};

type Bot = {
  id: string,
  name: string,
};

type Action = {
  id: string,
  name: string,
  params: { [k: string]: string },
  detailParams: { [k: string]: DetailParams },
  clientExtra: { [k: string]: any },
};

type Context = {
  name: string,
  lifespan: number,
  ttl: number,
  params: {
    [k: string]: {
      value: any,
      resolvedValue: any
    }
  },
};

type Block = {
  id: string,
  name: string,
};

type User = {
  id: string,
  type: string,
  properties: {
    plusfriendUserKey: string,
    plusfriend_user_key?: string,
    appUserId: string,
    isFriend: boolean,
    botUserKey?: string,
    bot_user_key?: string,
  }
};

type DetailParams = {
  groupName: string,
  origin: any,
  value: any,
};