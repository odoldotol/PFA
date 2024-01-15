export type SkillPayload = {
  bot: Bot
  intent: Intent
  action: Action
  userRequest: UserRequest,
  contexts?: any[] //
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

type DetailParams = any; //

/*
Skill Payload SkillPayloadDto {
  bot: { id: '640727274bf87514c5161748', name: '라피키' },
  intent: {
    id: '64072d6adc6c2b665b751843',
    name: '조회하기',
    extra: { reason: [Object] }
  },
  action: {
    id: '640895c3dc6c2b665b75293f',
    name: '조회하기',
    params: { ticker: 'AAPL' },
    detailParams: { ticker: [Object] },
    clientExtra: {}
  },
  userRequest: {
    block: { id: '64072d6adc6c2b665b751843', name: '조회하기' },
    user: {
      id: '1f56271376f3c6d4ad545a0bf302f6c28b192d3b205b47377bda3c7d9d08ab4f51',
      type: 'botUserKey',
      properties: [Object]
    },
    utterance: '다른것 조회하기',
    params: { surface: 'Kakaotalk.plusfriend' },
    lang: 'ko',
    timezone: 'Asia/Seoul'
  },
  contexts: []
}

payload.userRequest?.user.properties {
  botUserKey: '1f56271376f3c6d4ad545a0bf302f6c28b192d3b205b47377bda3c7d9d08ab4f51',
  isFriend: true,
  plusfriendUserKey: 'IIkOL1ZSZdLE',
  bot_user_key: '1f56271376f3c6d4ad545a0bf302f6c28b192d3b205b47377bda3c7d9d08ab4f51',
  plusfriend_user_key: 'IIkOL1ZSZdLE'
}

 */
