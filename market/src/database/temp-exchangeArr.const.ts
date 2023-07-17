// Todo: Production 환경이 아닌 특정 개발 환경에서만 사용되는 임시 데이터
// ts 파일 보다는 다른 데이터 파일 형식으로 두고 읽어서 몽고디비에 인서트하고 시작하도록 리팩터링하자.
export const TEMP_EXCHANGES = [
  { ISO_Code: 'BVMF', ISO_TimezoneName: 'America/Sao_Paulo' },
  { ISO_Code: 'XFRA', ISO_TimezoneName: 'Europe/Berlin' },
  { ISO_Code: 'XLON', ISO_TimezoneName: 'Europe/London' },
  { ISO_Code: 'XNYS', ISO_TimezoneName: 'America/New_York' },
  { ISO_Code: 'XSHG', ISO_TimezoneName: 'Asia/Shanghai' },
  { ISO_Code: 'XTKS', ISO_TimezoneName: 'Asia/Tokyo' },
  { ISO_Code: 'XTSE', ISO_TimezoneName: 'America/Toronto' },
  { ISO_Code: 'XCCC', ISO_TimezoneName: 'UTC' },
  { ISO_Code: 'XKRX', ISO_TimezoneName: 'Asia/Seoul' },
  { ISO_Code: 'XHKG', ISO_TimezoneName: 'Asia/Hong_Kong' }
];