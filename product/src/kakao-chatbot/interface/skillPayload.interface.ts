// TODO: SkillPayloadI 구현
interface SkillPayloadI {
  bot?: { id: string, name: string }
  intent?: { id: string, name: string, extra?: any }
  action?: {
    id: string,
    name: string,
    params: { ticker?: string },
    detailParams: { ticker?: any }
    clientExtra: any,
  }
  userRequest?: {
    block: { id: string, name: string },
    user: { id: string, type: string, properties: any }
    utterance: string,
    params: { ignoreMe: string, surface?: string },
    lang: any,
    timezone: string,
  },
  contexts?: any
}