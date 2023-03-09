interface SkillPayload {
    intent?: { id: string, name: string },
    userRequest?: {
      timezone: string,
      params: { ignoreMe: string },
      block: { id: string, name: string },
      utterance: string,
      lang: any,
      user: { id: string, type: string, properties: any }
    },
    bot?: { id: string, name: string },
    action?: {
      name: string,
      clientExtra: null,
      params: { ticker?: string },
      id: string,
      detailParams: { ticker?: any }
    }
}