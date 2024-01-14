// TODO
export interface SkillPayload {
  bot?: { id: string, name: string }
  intent?: { id: string, name: string, extra?: any }
  action: {
    id: string,
    name: string,
    params: { ticker: string },
    detailParams: { ticker?: any }
    clientExtra: any,
  }
  userRequest?: {
    block: { id: string, name: string },
    user: {
      id: string,
      type: string,
      properties: any
    }
    utterance: string,
    params: { ignoreMe: string, surface?: string },
    lang: any,
    timezone: string,
  },
  contexts?: any
}

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
