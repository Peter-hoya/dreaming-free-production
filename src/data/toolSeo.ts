export type ToolSearchLocale = "ko" | "en";

export interface ToolSearchLocaleMetadata {
  heading: string;
  title: string;
  description: string;
  queries: readonly [string, string, string, string];
}

export type ToolSearchMetadata = Record<ToolSearchLocale, ToolSearchLocaleMetadata>;

export const toolSearchMetadata = {
  "age-calculator": {
    ko: {
      heading: "만 나이 계산기",
      title: "만 나이 계산기 - 생년월일 기준 정확한 나이 계산",
      description: "생년월일과 기준일을 입력하면 만 나이, 살아온 총 일수, 다음 생일까지 남은 날짜를 계산합니다. 과거·미래 기준일도 선택할 수 있습니다.",
      queries: ["만 나이 계산기", "나이 계산기", "생년월일 나이 계산", "다음 생일 계산"],
    },
    en: {
      heading: "Age Calculator",
      title: "Age Calculator - Exact Age & Birthday Countdown",
      description: "Enter a birth date and reference date to calculate exact age, total days lived, and the countdown to the next birthday.",
      queries: ["age calculator", "exact age calculator", "birthday calculator", "days until birthday"],
    },
  },
  "percentage-calculator": {
    ko: {
      heading: "퍼센트 계산기",
      title: "퍼센트 계산기 - 백분율·증감률·할인 계산",
      description: "기준값과 비교값을 입력해 전체 대비 비율, 퍼센트 증감률, 할인 금액과 할인 후 가격을 계산식과 함께 바로 확인합니다.",
      queries: ["퍼센트 계산기", "백분율 계산기", "증감률 계산기", "할인율 계산기"],
    },
    en: {
      heading: "Percentage Calculator",
      title: "Percentage Calculator - Percent Change & Discounts",
      description: "Calculate a percentage of a total, percent increase or decrease, and a discounted price with the formula shown.",
      queries: ["percentage calculator", "percent change calculator", "discount calculator", "percentage increase calculator"],
    },
  },
  "unit-converter": {
    ko: {
      heading: "단위 변환기",
      title: "단위 변환기 - 길이·무게·온도·넓이 환산",
      description: "길이, 무게, 온도, 넓이, 부피, 속도와 데이터 용량을 원하는 단위로 즉시 변환합니다. 인치·센티미터와 섭씨·화씨도 지원합니다.",
      queries: ["단위 변환기", "길이 단위 변환", "무게 단위 변환", "온도 변환"],
    },
    en: {
      heading: "Unit Converter",
      title: "Unit Converter - Length, Weight & Temperature",
      description: "Convert length, weight, temperature, area, volume, speed, and data units between metric and common US units.",
      queries: ["unit converter", "metric converter", "measurement converter", "temperature converter"],
    },
  },
  "date-calculator": {
    ko: {
      heading: "날짜 계산기",
      title: "날짜 계산기 - 날짜 차이·디데이·날짜 더하기",
      description: "두 날짜 사이의 일수와 디데이를 계산하고 특정 날짜에 일수·주·개월을 더하거나 빼서 결과 날짜를 확인합니다.",
      queries: ["날짜 계산기", "날짜 차이 계산", "디데이 계산기", "날짜 더하기"],
    },
    en: {
      heading: "Date Calculator",
      title: "Date Calculator - Days Between or Add Dates",
      description: "Find days between two dates or add and subtract days, weeks, and months to calculate a new calendar date.",
      queries: ["date calculator", "days between dates", "add days to date", "date difference calculator"],
    },
  },
  "image-optimizer": {
    ko: {
      heading: "이미지 용량 줄이기",
      title: "이미지 용량 줄이기 - 사진 압축·크기 변경·WebP 변환",
      description: "JPG, PNG, WebP 이미지의 가로 크기와 품질을 조절해 용량을 줄이고 다른 형식으로 변환합니다. 파일은 브라우저 안에서만 처리됩니다.",
      queries: ["이미지 용량 줄이기", "사진 용량 줄이기", "이미지 압축", "WebP 변환"],
    },
    en: {
      heading: "Image Compressor",
      title: "Image Compressor - Resize & Convert to WebP",
      description: "Compress JPG and PNG images in your browser, resize dimensions, adjust quality, and download JPG, PNG, or WebP output.",
      queries: ["image compressor", "compress image online", "resize image", "convert image to WebP"],
    },
  },
  "loan-calculator": {
    ko: {
      heading: "대출 이자 계산기",
      title: "대출 이자 계산기 - 원리금균등 월 상환액 계산",
      description: "대출 원금, 연이율, 상환 기간을 입력해 원리금균등상환의 예상 월 납입액, 총 상환액과 총이자를 계산합니다.",
      queries: ["대출 이자 계산기", "원리금균등상환 계산기", "월 상환액 계산기", "대출 총이자 계산"],
    },
    en: {
      heading: "Loan Calculator",
      title: "Loan Calculator - Payments, Interest & Schedule",
      description: "Enter principal, annual interest rate, and term to estimate monthly payments, total interest, and an amortization schedule.",
      queries: ["loan calculator", "monthly payment calculator", "loan interest calculator", "amortization calculator"],
    },
  },
  "compound-interest": {
    ko: {
      heading: "복리 계산기",
      title: "복리 계산기 - 투자·적금 미래가치 계산",
      description: "초기 투자금, 정기 적립금, 예상 수익률과 기간을 입력해 복리 적용 후 미래 가치, 총 납입금과 예상 수익을 계산합니다.",
      queries: ["복리 계산기", "적금 계산기", "투자 수익 계산기", "미래가치 계산기"],
    },
    en: {
      heading: "Compound Interest Calculator",
      title: "Compound Interest Calculator - Savings Growth",
      description: "Project future value from a starting balance, recurring contributions, expected return, and investment duration.",
      queries: ["compound interest calculator", "savings calculator", "investment growth calculator", "future value calculator"],
    },
  },
  "text-counter": {
    ko: {
      heading: "글자수 세기",
      title: "글자수 세기 - 공백 제외·단어수·읽기 시간",
      description: "텍스트를 입력하면 공백 포함·제외 글자 수, 단어, 문장, 문단 수와 예상 읽기 시간을 실시간으로 계산합니다. 입력 내용은 서버로 보내지 않습니다.",
      queries: ["글자수 세기", "공백 제외 글자수", "단어수 세기", "읽기 시간 계산"],
    },
    en: {
      heading: "Word Counter",
      title: "Word Counter - Characters, Words & Reading Time",
      description: "Count words, characters with or without spaces, sentences, paragraphs, and estimated reading time directly in your browser.",
      queries: ["word counter", "character counter", "word count online", "reading time calculator"],
    },
  },
  "qr-generator": {
    ko: {
      heading: "QR 코드 생성기",
      title: "QR 코드 생성기 - 링크·텍스트 QR 만들기",
      description: "웹주소, 연락처나 짧은 텍스트를 QR 코드로 생성하고 PNG 이미지로 저장합니다. 생성 과정은 브라우저에서 처리되며 서버에 전송되지 않습니다.",
      queries: ["QR 코드 생성기", "QR 코드 만들기", "큐알코드 만들기", "QR PNG 생성"],
    },
    en: {
      heading: "QR Code Generator",
      title: "QR Code Generator - Create & Download PNG Codes",
      description: "Turn a URL or text into a QR code, choose size and error correction, then download the finished code as a PNG file.",
      queries: ["QR code generator", "create QR code", "QR code maker", "QR code PNG download"],
    },
  },
  "password-generator": {
    ko: {
      heading: "비밀번호 생성기",
      title: "비밀번호 생성기 - 안전한 랜덤 비밀번호 만들기",
      description: "길이와 대문자, 소문자, 숫자, 특수문자 포함 여부를 선택해 무작위 비밀번호를 생성합니다. 암호학적 난수를 사용하며 서버에 저장하지 않습니다.",
      queries: ["비밀번호 생성기", "랜덤 비밀번호 생성", "강력한 비밀번호 만들기", "안전한 비밀번호 생성기"],
    },
    en: {
      heading: "Password Generator",
      title: "Password Generator - Create Strong Random Passwords",
      description: "Create strong random passwords with your chosen length and character sets using the browser's secure random generator.",
      queries: ["password generator", "random password generator", "strong password generator", "secure password creator"],
    },
  },
  "salary-converter": {
    ko: {
      heading: "연봉 계산기",
      title: "연봉 계산기 - 월급·시급·예상 수령액 변환",
      description: "연봉, 월급 또는 시급을 입력해 세전 금액을 서로 변환하고 비과세액과 사용자 공제율을 반영한 예상 수령액을 확인합니다.",
      queries: ["연봉 계산기", "월급 계산기", "시급 계산기", "연봉 실수령액 계산기"],
    },
    en: {
      heading: "Korea Salary Calculator",
      title: "Korea Salary Calculator - Annual, Monthly & Hourly Pay",
      description: "Convert Korean annual, monthly, and hourly pay and estimate take-home pay using editable non-taxable income and deduction assumptions.",
      queries: ["Korea salary calculator", "Korea monthly salary calculator", "annual to monthly salary Korea", "Korea hourly pay calculator"],
    },
  },
  "severance-pay": {
    ko: {
      heading: "퇴직금 계산기",
      title: "퇴직금 계산기 - 평균임금·예상 퇴직금 계산",
      description: "입사일, 퇴직일과 최근 3개월 임금을 입력해 평균임금·통상임금을 비교하고 법정 산식에 따른 예상 퇴직금을 계산합니다.",
      queries: ["퇴직금 계산기", "평균임금 계산기", "예상 퇴직금 계산", "퇴직금 예상액"],
    },
    en: {
      heading: "Korea Severance Pay Calculator",
      title: "Korea Severance Pay Calculator - Retirement Pay Estimate",
      description: "Estimate Korean severance pay from employment dates, recent wages, bonuses, and the calculated average daily wage.",
      queries: ["Korea severance pay calculator", "Korea retirement pay calculator", "Korean average wage calculator", "Korea severance estimate"],
    },
  },
  "four-major-insurance": {
    ko: {
      heading: "4대보험 계산기",
      title: "4대보험 계산기 - 2026년 근로자 보험료 계산",
      description: "월 과세 보수액을 입력하면 2026년 근로자 기준 국민연금, 건강보험, 장기요양보험과 고용보험 부담액을 추정합니다.",
      queries: ["4대보험 계산기", "2026 4대보험 계산기", "국민연금 계산기", "건강보험료 계산기"],
    },
    en: {
      heading: "Korea Social Insurance Calculator",
      title: "Korea Social Insurance Calculator - Pension & Health",
      description: "Estimate 2026 Korean employee contributions for national pension, health, long-term care, and employment insurance.",
      queries: ["Korea social insurance calculator", "Korean pension calculator", "Korea health insurance calculator", "Korean payroll insurance calculator"],
    },
  },
  "weekly-holiday-pay": {
    ko: {
      heading: "주휴수당 계산기",
      title: "주휴수당 계산기 - 2026 최저임금·주급 계산",
      description: "시급, 주 소정근로시간과 근무일수를 입력해 주휴수당 지급 요건을 확인하고 예상 주휴수당과 주급을 계산합니다.",
      queries: ["주휴수당 계산기", "알바 주급 계산기", "2026 최저임금 계산", "주휴수당 조건 계산"],
    },
    en: {
      heading: "Korea Weekly Holiday Pay Calculator",
      title: "Korea Weekly Holiday Pay Calculator - 2026 Estimate",
      description: "Estimate Korean weekly holiday pay and weekly wages from hours and hourly pay, with a 2026 minimum-wage check.",
      queries: ["Korea weekly holiday pay calculator", "Korea part time pay calculator", "2026 Korean minimum wage calculator", "Korean weekly pay calculator"],
    },
  },
  "vat-calculator": {
    ko: {
      heading: "부가세 계산기",
      title: "부가세 계산기 - 공급가액·세액·합계 계산",
      description: "공급가액에 10% 부가세를 더하거나 부가세 포함 합계금액을 공급가액과 세액으로 나눕니다. 수량과 원 단위 처리 방식도 선택할 수 있습니다.",
      queries: ["부가세 계산기", "공급가액 계산기", "부가세 포함 계산", "10% 부가세 계산"],
    },
    en: {
      heading: "Korea VAT Calculator",
      title: "Korea VAT Calculator - Price Before or After 10% VAT",
      description: "Calculate Korean 10% VAT from a tax-inclusive total or add VAT to a net price to find tax and gross amounts.",
      queries: ["Korea VAT calculator", "Korea 10 percent VAT calculator", "VAT inclusive calculator Korea", "Korean tax invoice calculator"],
    },
  },
  "pyeong-calculator": {
    ko: {
      heading: "평수 계산기",
      title: "평수 계산기 - 제곱미터(㎡)·평 변환",
      description: "제곱미터를 평으로, 평을 제곱미터로 즉시 변환합니다. 가로와 세로 길이를 입력해 면적을 구하고 평수까지 함께 확인할 수 있습니다.",
      queries: ["평수 계산기", "제곱미터 평 변환", "아파트 평수 계산", "평 제곱미터 변환"],
    },
    en: {
      heading: "Pyeong Calculator",
      title: "Pyeong Calculator - Square Meters to Korean Pyeong",
      description: "Convert square meters to Korean pyeong and pyeong to square meters for apartments, homes, and floor areas.",
      queries: ["pyeong calculator", "square meter to pyeong", "pyeong to square meter", "Korean apartment size calculator"],
    },
  },
  "real-estate-brokerage-fee": {
    ko: {
      heading: "부동산 중개수수료 계산기",
      title: "부동산 중개수수료 계산기 - 서울 매매·전월세 복비",
      description: "서울 주택의 매매·교환 또는 전월세 거래금액을 입력해 적용 상한요율과 부동산 중개수수료 최대 금액을 계산합니다.",
      queries: ["부동산 중개수수료 계산기", "복비 계산기", "전세 중개수수료", "월세 복비 계산"],
    },
    en: {
      heading: "Seoul Real Estate Commission Calculator",
      title: "Seoul Real Estate Commission Calculator - Sale & Rental",
      description: "Estimate the legal maximum brokerage commission for Seoul home sales, jeonse, and monthly rental agreements.",
      queries: ["Seoul real estate commission calculator", "Seoul brokerage fee calculator", "Seoul rental commission", "Korea apartment broker fee"],
    },
  },
  "appliance-energy-cost": {
    ko: {
      heading: "가전제품 전기요금 계산기",
      title: "가전제품 전기요금 계산기 - 소비전력·사용시간별 비용",
      description: "가전제품 소비전력, 하루 사용시간, 사용일수와 kWh 단가를 입력해 예상 전력 사용량과 전기 비용을 계산합니다.",
      queries: ["가전제품 전기요금 계산기", "가전 소비전력 계산", "kWh 계산기", "전기 사용량 계산기"],
    },
    en: {
      heading: "Appliance Electricity Cost Calculator",
      title: "Appliance Electricity Cost Calculator - Watts & kWh",
      description: "Estimate appliance electricity use in kWh and running cost from wattage, daily hours, days used, and energy price.",
      queries: ["electricity cost calculator", "appliance energy cost calculator", "kWh cost calculator", "wattage cost calculator"],
    },
  },
  "lunar-solar-converter": {
    ko: {
      heading: "음력 양력 변환기",
      title: "음력 양력 변환기 - 음력 생일·윤달 날짜 변환",
      description: "한국 음력과 양력 날짜를 양방향으로 변환합니다. 음력 날짜의 평달·윤달을 구분하며 생일, 기념일과 제례 날짜 확인에 활용할 수 있습니다.",
      queries: ["음력 양력 변환기", "음력 생일 계산", "양력 음력 변환", "윤달 날짜 변환"],
    },
    en: {
      heading: "Korean Lunar Calendar Converter",
      title: "Korean Lunar Calendar Converter - Lunar & Solar Dates",
      description: "Convert Korean lunar calendar dates to solar dates and back, including leap-month handling for birthdays.",
      queries: ["Korean lunar calendar converter", "Korean lunar birthday converter", "lunar to solar date Korea", "Korean leap month converter"],
    },
  },
  "lotto-number-generator": {
    ko: {
      heading: "로또 번호 생성기",
      title: "로또 번호 생성기 - 로또 6/45 무작위 번호",
      description: "로또 6/45 규칙에 맞는 중복 없는 번호 조합을 무작위로 생성합니다. 당첨 가능성을 예측하거나 높이지 않습니다.",
      queries: ["로또 번호 생성기", "로또 번호 추천", "로또 자동 번호", "로또 6/45 번호 생성"],
    },
    en: {
      heading: "Korean Lotto 6/45 Number Generator",
      title: "Korean Lotto 6/45 Number Generator - Random Picks",
      description: "Generate unique random numbers for Korea's Lotto 6/45 format. The generator does not predict or improve winning odds.",
      queries: ["Korean Lotto 6/45 number generator", "Lotto 6/45 random numbers", "Korea lottery number picker", "Korean lotto quick pick"],
    },
  },
  "pdf-toolkit": {
    ko: {
      heading: "PDF 합치기",
      title: "PDF 합치기 - 무료 병합·페이지 추출",
      description: "여러 PDF 파일을 브라우저에서 하나로 합치거나 선택한 페이지를 새 PDF로 추출합니다. 파일은 서버에 업로드하지 않습니다.",
      queries: ["PDF 합치기", "PDF 병합", "PDF 페이지 추출", "무료 PDF 합치기"],
    },
    en: {
      heading: "Merge PDF Online",
      title: "Merge PDF Online - Combine PDFs & Extract Pages",
      description: "Merge multiple PDF files or extract selected pages in your browser without uploading documents to a server.",
      queries: ["merge PDF online", "combine PDF files", "extract PDF pages", "private PDF merger"],
    },
  },
  "bmi-calculator": {
    ko: {
      heading: "BMI 계산기",
      title: "BMI 계산기 - 성인 체질량지수·비만도 계산",
      description: "키와 몸무게를 입력해 성인 BMI와 일반 참고 구간을 계산합니다. cm·kg와 ft·in·lb 단위를 지원하며 결과는 의료 진단을 대신하지 않습니다.",
      queries: ["BMI 계산기", "체질량지수 계산기", "성인 비만도 계산", "키 몸무게 BMI"],
    },
    en: {
      heading: "BMI Calculator",
      title: "BMI Calculator - Adult Body Mass Index",
      description: "Calculate adult BMI from height and weight and compare the result with the displayed reference ranges.",
      queries: ["BMI calculator", "adult BMI calculator", "body mass index calculator", "BMI height weight calculator"],
    },
  },
  "time-zone-converter": {
    ko: {
      heading: "세계 시간 변환기",
      title: "세계 시간 변환기 - 해외 시간대·시차 계산",
      description: "출발 지역의 날짜와 시간을 다른 지역의 현지 시각으로 변환합니다. 해당 날짜의 일광 절약 시간과 날짜 변경을 자동으로 반영합니다.",
      queries: ["세계 시간 변환기", "시간대 변환기", "해외 시간 계산", "시차 계산기"],
    },
    en: {
      heading: "Time Zone Converter",
      title: "Time Zone Converter - World Time & DST",
      description: "Convert a date and time between world cities while accounting for the daylight-saving rules that apply on that date.",
      queries: ["time zone converter", "world time converter", "time difference calculator", "DST time converter"],
    },
  },
  "pomodoro-timer": {
    ko: {
      heading: "포모도로 타이머",
      title: "포모도로 타이머 - 온라인 집중·공부 타이머",
      description: "집중 시간과 휴식 시간을 설정해 반복 실행하고 완료한 집중 세션 수를 확인합니다. 다른 탭을 다녀와도 기기 시각을 기준으로 남은 시간을 보정합니다.",
      queries: ["포모도로 타이머", "집중 타이머", "공부 타이머", "온라인 포모도로"],
    },
    en: {
      heading: "Pomodoro Timer",
      title: "Pomodoro Timer - Online Focus & Study Timer",
      description: "Run configurable focus and break intervals with an online Pomodoro timer and track completed sessions on your device.",
      queries: ["Pomodoro timer", "online focus timer", "study timer", "Pomodoro clock online"],
    },
  },
  "random-wheel": {
    ko: {
      heading: "랜덤 룰렛",
      title: "랜덤 룰렛 - 이름·항목 무작위 뽑기",
      description: "최대 100개 선택지를 입력해 같은 확률로 한 항목을 무작위 추첨합니다. 당첨 항목을 다음 추첨에서 제외하는 중복 방지 옵션도 제공합니다.",
      queries: ["랜덤 룰렛", "무작위 뽑기", "랜덤 선택기", "이름 뽑기 룰렛"],
    },
    en: {
      heading: "Random Wheel",
      title: "Random Wheel - Spin a Name or Choice Picker",
      description: "Add names or choices, spin a random wheel, and select one item with an unbiased browser-based random method.",
      queries: ["random wheel", "random name picker", "choice wheel", "spin the wheel online"],
    },
  },
  "json-formatter": {
    ko: {
      heading: "JSON 포맷터",
      title: "JSON 포맷터 - 문법 검사·정렬·압축",
      description: "JSON을 보기 좋게 정렬하거나 한 줄로 압축하고 문법 오류 위치를 서버 전송 없이 브라우저에서 확인합니다.",
      queries: ["JSON 포맷터", "JSON 문법 검사", "JSON 정렬", "JSON 압축"],
    },
    en: {
      heading: "JSON Formatter",
      title: "JSON Formatter - Validate, Beautify & Minify",
      description: "Beautify, validate, and minify JSON in your browser, with clear parsing errors and no server upload.",
      queries: ["JSON formatter", "JSON validator", "JSON beautifier", "JSON minifier"],
    },
  },
  "unix-timestamp": {
    ko: {
      heading: "유닉스 타임스탬프 변환기",
      title: "유닉스 타임스탬프 변환기 - 에포크 시간·날짜 변환",
      description: "초 또는 밀리초 유닉스 타임스탬프를 UTC와 현지 날짜로 변환하고, 입력한 날짜와 시간을 에포크 값으로 역변환합니다.",
      queries: ["유닉스 타임스탬프 변환기", "에포크 시간 변환", "밀리초 날짜 변환", "날짜 타임스탬프 변환"],
    },
    en: {
      heading: "Unix Timestamp Converter",
      title: "Unix Timestamp Converter - Epoch Time to Date",
      description: "Convert Unix timestamps in seconds or milliseconds to readable dates, or turn a selected date into epoch time.",
      queries: ["Unix timestamp converter", "epoch time converter", "milliseconds to date", "date to Unix timestamp"],
    },
  },
  "uuid-generator": {
    ko: {
      heading: "UUID 생성기",
      title: "UUID 생성기 - UUID v4 대량 생성",
      description: "브라우저의 보안 난수 기능으로 RFC 4122 UUID v4를 한 개 또는 여러 개 생성하고 바로 복사합니다.",
      queries: ["UUID 생성기", "UUID v4 생성", "UUID 대량 생성", "랜덤 고유 식별자"],
    },
    en: {
      heading: "UUID Generator",
      title: "UUID Generator - Create UUID v4 IDs in Bulk",
      description: "Generate one or many RFC 4122 UUID v4 identifiers with the browser's secure random number generator.",
      queries: ["UUID generator", "UUID v4 generator", "bulk UUID generator", "random UUID creator"],
    },
  },
  "fuel-cost-calculator": {
    ko: {
      heading: "주유비 계산기",
      title: "주유비 계산기 - 거리·연비·기름값 여행비 계산",
      description: "이동 거리, 차량 연비와 연료 단가를 입력해 여행에 필요한 예상 연료량과 주유비를 계산합니다. km·mi와 L/100km·MPG를 지원합니다.",
      queries: ["주유비 계산기", "여행 기름값 계산", "연비 비용 계산기", "왕복 주유비 계산"],
    },
    en: {
      heading: "Fuel Cost Calculator",
      title: "Fuel Cost Calculator - Distance, MPG & Gas Cost",
      description: "Estimate trip fuel volume and cost from distance, fuel economy, fuel price, and one-way or round-trip travel.",
      queries: ["fuel cost calculator", "trip gas calculator", "MPG trip cost calculator", "road trip fuel calculator"],
    },
  },
  "typing-speed-test": {
    ko: {
      heading: "타자 속도 테스트",
      title: "타자 속도 테스트 - 한글·영문 WPM 정확도 측정",
      description: "한글 또는 영문 문장을 입력해 분당 타수와 WPM, 정확도와 오타를 측정하고 현재 기기에 최고 기록을 저장합니다.",
      queries: ["타자 속도 테스트", "한글 타자 측정", "영문 WPM 테스트", "타자 정확도 테스트"],
    },
    en: {
      heading: "Typing Speed Test",
      title: "Typing Speed Test - WPM & Accuracy Practice",
      description: "Measure English WPM or Korean typing speed, accuracy, and errors while keeping your best score on the current device.",
      queries: ["typing speed test", "WPM test", "typing accuracy test", "online typing practice"],
    },
  },
} as const satisfies Record<string, ToolSearchMetadata>;

export type ToolSearchSlug = keyof typeof toolSearchMetadata;

export function getToolSearchMetadata(slug: string, locale: ToolSearchLocale) {
  const metadata = toolSearchMetadata[slug as ToolSearchSlug];
  if (!metadata) throw new Error(`Missing search metadata for tool: ${slug}`);
  return metadata[locale];
}
