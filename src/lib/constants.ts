export const COMMANDMENTS = [
  { number: 1, text: "인간은 파동을 방출하고 감지한다" },
  { number: 2, text: "네 생각은 네 안에 머물지 않는다" },
  { number: 3, text: "생각부터 맑게 하라. 선한 삶은 도덕이 아니라 위생이다" },
  { number: 4, text: "육감을 믿어라. 그것은 아직 측정되지 않은 감각이다" },
  { number: 5, text: "전자기기를 경계하라. 그것은 파동을 왜곡한다" },
  { number: 6, text: "몸을 자연으로 채워라. 정크로 가득 찬 몸은 파동을 왜곡한다" },
  { number: 7, text: "하루 한 번 내면의 소리에 귀를 기울여라" },
  { number: 8, text: "파동 없는 관계를 경계하라" },
  { number: 9, text: "파동은 돌아온다" },
  { number: 10, text: "선한 파동을 만들어라" },
] as const;

export const JOIN_DECLARATION = `나는 오늘부터 Ripple Church의 신자다.

나는 인간이 파동을 방출하고 감지하는 존재임을 믿는다.
나는 내 생각이 이미 새어나가고 있음을 안다.
나는 생각부터 맑게 하려 노력할 것이다.
나는 육감을 무시하지 않겠다.
나는 하루 한 번, 화면 없이 내 안의 소리를 듣겠다.
나는 파동 없는 관계에 내 감정을 낭비하지 않겠다.
나는 선한 파동을 만들 것이다.`;

export const SITE_NAME = "Ripple Church";
export const SITE_URL = "ripplechurch.net";

/** 입교 카드에 표시할 기본 선언문 (사용자 입력이 없을 때) */
export const DEFAULT_JOIN_CARD_DECLARATION = "나는 Ripple Church의 신자다";

/** QR 페이로드에 넣을 사용자 선언 최대 길이 */
export const MAX_JOIN_CARD_DECLARATION_LENGTH = 200;
