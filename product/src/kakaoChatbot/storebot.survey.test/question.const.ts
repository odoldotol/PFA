export enum QuesionType {
  CHOICE = "choice",
  ESSAY = "essay",
};

/**
 * git 에서 제외하기
 * 
 * TextCard 의 버튼은 최대 3개까지 가능 => TextCard 의 버튼에 Choice 넣으려면 3개까지만 넣자.
 */
export const questions: Questions = [
  {
    id: 1,
    type: QuesionType.CHOICE,
    description: "질문1",
    choices: [
      "답변1-1",
      "답변1-2"
    ],
  },
  {
    id: 2,
    type: QuesionType.CHOICE,
    description: "질문2",
    choices: [
      "답변2-1",
      "답변2-2"
    ],
  },
  {
    id: 3,
    type: QuesionType.CHOICE,
    description: "질문3",
    choices: [
      "답변3-1",
      "답변3-2"
    ],
  },
  {
    id: 4,
    type: QuesionType.CHOICE,
    description: "태이 커피 로스터스에 얼마나 자주 방문하시나요?",
    choices: [
      "처음 방문했어요",
      "한 달에 1~2회 정도?",
      "매주 방문해요!",
    ],
  },
  {
    id: 5,
    type: QuesionType.CHOICE,
    description: "카카오톡으로 태이 커피 로스터스의 음료를 주문, 예약, 결제가 가능하다면 이용하실 의향이 있으신가요?",
    choices: [
      "네, 물론이죠!",
      "이용하지 않을 것 같아요",
      "잘 모르겠어요",
    ],
  },
  {
    id: 6,
    type: QuesionType.CHOICE,
    title: "카카오톡으로 주문 시 카카오페이로 간편하게 결제하는 것 어떠세요?",
    description: "(카카오페이에서 신용카드, 체크카드, 카카오머니로 간편결제가 가능해요)",
    choices: [
      "좋아요!",
      "별로에요",
      "잘 모르겠어요",
    ],
  },
];

export type QuestionId = number;

type Questions = Question[];

type Choices = string[];

export type Question<T extends QuesionType = QuesionType> = {
  id: QuestionId;
  type: T;
  title?: string;
  description: string;
  choices: T extends QuesionType.CHOICE ? Choices : null;
};

export const isChoiceQuestion = (
  question: Question
): question is Question<QuesionType.CHOICE> => {
  return question.type === QuesionType.CHOICE;
};

export const isEssayQuestion = (
  question: Question
): question is Question<QuesionType.ESSAY> => {
  return question.type === QuesionType.ESSAY;
};