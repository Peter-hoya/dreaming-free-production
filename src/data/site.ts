import type { LocalizedText, ToolDefinition } from "@/data/toolTypes";
import { globalTools } from "@/data/globalTools";
import { koreanTools } from "@/data/koreanTools";

export type { ToolDefinition } from "@/data/toolTypes";

export const locales = ["ko", "en"] as const;
export type Locale = (typeof locales)[number];

export type ToolSlug = string;

export type GameSlug = "merge-2048" | "memory-match" | "arcade-shooter";

export interface GameDefinition {
  slug: GameSlug;
  icon: string;
  title: LocalizedText;
  short: LocalizedText;
  description: LocalizedText;
}

export const siteCopy = {
  ko: {
    brand: "모아툴",
    brandLatin: "MoaTools",
    navTools: "도구",
    navGames: "게임",
    navGuides: "생활 가이드",
    navGuide: "콘텐츠 원칙",
    allTools: "모든 도구",
    games: "잠깐 쉬어가기",
    searchPlaceholder: "도구를 검색해 보세요",
    noResults: "일치하는 도구가 없습니다.",
    heroEyebrow: "필요한 답, 바로.",
    heroTitle: "무료 온라인 계산기와 도구",
    heroBody: "계산, 문서, 개발, 생활에 필요한 30개 도구와 3개 게임을 가입 없이 사용하세요.",
    browseTools: "도구 둘러보기",
    playGames: "게임 시작",
    popularTitle: "30개 도구를 한곳에서",
    popularBody: "검색하거나 분야를 골라 필요한 도구를 바로 찾으세요. 입력한 내용은 가능한 한 브라우저 안에서만 처리됩니다.",
    gamesTitle: "짧게 시작해 오래 즐기는 게임",
    gamesBody: "두뇌 게임부터 웨이브 슈팅까지 가볍게 시작하세요. 최고 기록은 이 기기에 저장됩니다.",
    trustTitle: "작은 도구도 기준은 분명하게",
    trustItems: [
      ["개인정보 우선", "계산과 텍스트 처리는 브라우저에서 수행되며 서버로 전송하지 않습니다."],
      ["설명 가능한 결과", "공식과 기준을 함께 보여주어 결과를 직접 확인할 수 있습니다."],
      ["두 언어 지원", "한국어와 영어 페이지를 각각 제공해 검색과 공유가 편리합니다."],
    ],
    faqTitle: "자주 묻는 질문",
    homeFaqs: [
      ["모아툴은 무료인가요?", "네. 현재 제공되는 모든 도구와 게임은 가입 없이 무료로 사용할 수 있습니다."],
      ["입력한 정보가 저장되나요?", "대부분의 계산은 브라우저 안에서 처리됩니다. 게임 최고 점수처럼 꼭 필요한 값만 기기에 저장됩니다."],
      ["계산 결과를 공식 문서에 써도 되나요?", "일상적인 참고에는 유용하지만 금융, 의료, 법률 결정은 관련 전문가나 공식 기관의 기준을 함께 확인하세요."],
    ],
    toolGuide: "사용 방법",
    useCases: "이럴 때 유용해요",
    related: "함께 쓰기 좋은 도구",
    openTool: "사용하기",
    openGame: "게임하기",
    backHome: "홈으로",
    privacy: "개인정보처리방침",
    terms: "이용약관",
    about: "사이트 소개",
    contact: "문의",
    editorial: "콘텐츠 원칙",
    footerLine: "일상의 계산과 변환을 더 단순하게.",
    updated: "검토일",
  },
  en: {
    brand: "MoaTools",
    brandLatin: "MoaTools",
    navTools: "Tools",
    navGames: "Games",
    navGuides: "Korean guides",
    navGuide: "Editorial policy",
    allTools: "All tools",
    games: "Take a quick break",
    searchPlaceholder: "Search for a tool",
    noResults: "No matching tools found.",
    heroEyebrow: "The answer you need, now.",
    heroTitle: "Free online calculators and tools",
    heroBody: "Use 30 browser tools plus 3 replayable games for calculations, documents, development, writing, and planning. No account needed.",
    browseTools: "Browse tools",
    playGames: "Play a game",
    popularTitle: "All 30 tools in one place",
    popularBody: "Search by name or task, or narrow the list by category. Your inputs stay in your browser whenever possible.",
    gamesTitle: "Quick to learn, built to replay",
    gamesBody: "Try a puzzle or survive another shooter wave. Your best score stays on this device.",
    trustTitle: "Small tools, clear standards",
    trustItems: [
      ["Privacy first", "Calculations and text processing happen in your browser and are not sent to our server."],
      ["Explainable results", "We show the relevant formula or standard so you can understand the answer."],
      ["Built for two languages", "Separate Korean and English pages make search, sharing, and reading straightforward."],
    ],
    faqTitle: "Frequently asked questions",
    homeFaqs: [
      ["Is MoaTools free?", "Yes. Every current tool and game is free to use without an account."],
      ["Do you save what I enter?", "Most calculations run only in your browser. Only necessary local values, such as a game high score, are saved on your device."],
      ["Can I use a result in an official document?", "The tools are useful for everyday reference. For financial, medical, or legal decisions, confirm the result with the relevant authority or a qualified professional."],
    ],
    toolGuide: "How to use it",
    useCases: "When it helps",
    related: "Useful next tools",
    openTool: "Open tool",
    openGame: "Play now",
    backHome: "Back home",
    privacy: "Privacy",
    terms: "Terms",
    about: "About",
    contact: "Contact",
    editorial: "Editorial policy",
    footerLine: "Making everyday calculations and conversions simpler.",
    updated: "Reviewed",
  },
} as const;

export const categoryLabels: Record<ToolDefinition["category"], LocalizedText> = {
  daily: { ko: "일상 계산", en: "Everyday" },
  finance: { ko: "금융", en: "Finance" },
  health: { ko: "건강", en: "Health" },
  writing: { ko: "글쓰기", en: "Writing" },
  digital: { ko: "디지털", en: "Digital" },
};

export const coreTools: ToolDefinition[] = [
  {
    slug: "age-calculator",
    icon: "cake",
    category: "daily",
    title: { ko: "만 나이 계산기", en: "Age Calculator" },
    short: { ko: "생년월일 기준 만 나이와 다음 생일까지 남은 날을 계산합니다.", en: "Find your exact age and the days until your next birthday." },
    description: {
      ko: "생년월일과 기준일을 비교해 만 나이, 살아온 총 일수, 다음 생일까지 남은 기간을 계산합니다. 대한민국의 행정상 나이는 원칙적으로 만 나이를 사용하며, 생일이 지났는지에 따라 현재 연도와 출생연도의 차이에서 0 또는 1을 조정합니다.",
      en: "Compare a birth date with any reference date to calculate exact age, total days lived, and time until the next birthday. The result accounts for whether the birthday has already occurred in the selected year.",
    },
    guide: {
      ko: ["생년월일을 선택하세요.", "오늘이 아닌 날짜의 나이가 필요하면 기준일을 바꾸세요.", "계산 결과에서 만 나이와 다음 생일까지 남은 날짜를 확인하세요."],
      en: ["Choose the date of birth.", "Change the reference date if you need age on a past or future date.", "Review exact age and the countdown to the next birthday."],
    },
    useCases: {
      ko: ["학교와 보험 서류에 정확한 만 나이가 필요할 때", "특정 날짜 기준 나이를 확인할 때", "다음 생일까지 남은 기간을 셀 때"],
      en: ["Checking age for a form or application", "Finding age on a specific date", "Counting down to the next birthday"],
    },
    keywords: { ko: ["만 나이 계산기", "나이 계산", "생년월일 계산"], en: ["age calculator", "exact age", "birthday calculator"] },
    faqs: {
      ko: [
        { question: "만 나이는 어떻게 계산하나요?", answer: "기준 연도에서 출생 연도를 뺀 뒤, 기준일에 올해 생일이 지나지 않았다면 1을 뺍니다." },
        { question: "태어난 날은 0세인가요?", answer: "만 나이는 태어난 날부터 첫 생일 전날까지 0세로 계산합니다." },
        { question: "미래 날짜의 나이도 계산할 수 있나요?", answer: "네. 기준일을 미래 날짜로 바꾸면 그날의 만 나이를 확인할 수 있습니다." },
      ],
      en: [
        { question: "How is exact age calculated?", answer: "Subtract the birth year from the reference year, then subtract one if the birthday has not yet occurred in that reference year." },
        { question: "Is a newborn zero years old?", answer: "Yes. Exact age counts a child as zero until the first birthday." },
        { question: "Can I calculate age on a future date?", answer: "Yes. Set the reference date to any future date to see the age on that day." },
      ],
    },
  },
  {
    slug: "percentage-calculator",
    icon: "percent",
    category: "daily",
    title: { ko: "퍼센트 계산기", en: "Percentage Calculator" },
    short: { ko: "비율, 증감률, 할인 후 가격을 한 번에 계산합니다.", en: "Calculate percentages, change rates, and discounted prices." },
    description: {
      ko: "전체의 몇 퍼센트인지, 한 값이 다른 값보다 얼마나 늘거나 줄었는지, 할인 후 금액이 얼마인지 계산합니다. 퍼센트는 기준값에 대한 상대적인 크기이므로 어떤 값을 기준으로 삼는지 확인하는 것이 중요합니다.",
      en: "Solve common percentage questions: a part of a whole, percentage change between two values, and a price after a discount. Because percentages are relative, always confirm which value is the baseline.",
    },
    guide: {
      ko: ["필요한 계산 유형을 선택하세요.", "기준값과 비율 또는 비교값을 입력하세요.", "결과와 함께 표시되는 계산식을 확인하세요."],
      en: ["Choose the type of percentage calculation.", "Enter the base value and percentage or comparison value.", "Check the answer and the displayed formula."],
    },
    useCases: { ko: ["세일 가격을 빠르게 확인할 때", "매출이나 지표의 증감률을 구할 때", "전체 중 일부의 비중을 계산할 때"], en: ["Checking a sale price", "Measuring growth or decline", "Finding a share of a total"] },
    keywords: { ko: ["퍼센트 계산기", "백분율 계산", "할인 계산기"], en: ["percentage calculator", "percent change", "discount calculator"] },
    faqs: {
      ko: [
        { question: "증가율은 어떻게 계산하나요?", answer: "새 값에서 이전 값을 뺀 뒤 이전 값으로 나누고 100을 곱합니다." },
        { question: "50% 증가 후 50% 감소하면 원래 값인가요?", answer: "아닙니다. 100이 150이 된 뒤 50% 감소하면 75가 됩니다. 감소의 기준값이 달라지기 때문입니다." },
        { question: "할인율과 할인 금액의 차이는 무엇인가요?", answer: "할인율은 원래 가격 대비 줄어드는 비율이고, 할인 금액은 실제로 차감되는 돈의 크기입니다." },
      ],
      en: [
        { question: "How do I calculate percentage increase?", answer: "Subtract the old value from the new value, divide by the old value, and multiply by 100." },
        { question: "Does a 50% rise followed by a 50% fall return to the start?", answer: "No. A value of 100 rises to 150, then a 50% fall results in 75 because the second percentage uses a different base." },
        { question: "What is the difference between discount rate and discount amount?", answer: "The rate is the share removed from the original price. The amount is the actual money deducted." },
      ],
    },
  },
  {
    slug: "unit-converter",
    icon: "ruler",
    category: "daily",
    title: { ko: "단위 변환기", en: "Unit Converter" },
    short: { ko: "길이, 무게, 온도, 넓이, 부피, 속도, 데이터 단위를 변환합니다.", en: "Convert measurement, speed, and digital storage units instantly." },
    description: {
      ko: "미터법과 미국 관습 단위를 포함한 길이, 무게, 온도, 넓이, 부피, 속도, 데이터 단위를 변환합니다. 입력값을 바꾸면 결과가 즉시 갱신되며, 온도는 단순 배수가 아닌 섭씨와 화씨의 변환식을 적용합니다.",
      en: "Convert commonly used metric and US customary units for measurement, speed, and decimal digital storage. Results update as you type, with the correct offset formula applied for temperature conversions.",
    },
    guide: { ko: ["길이, 무게 등 변환할 종류를 선택하세요.", "변환 전후 단위를 고르세요.", "값을 입력하면 결과가 바로 표시됩니다."], en: ["Choose a measurement category.", "Select the source and target units.", "Enter a value to see the result immediately."] },
    useCases: { ko: ["해외 레시피의 단위를 바꿀 때", "인치와 센티미터를 비교할 때", "여행 중 온도를 확인할 때"], en: ["Converting an international recipe", "Comparing inches and centimeters", "Understanding temperatures while traveling"] },
    keywords: { ko: ["단위 변환기", "길이 변환", "무게 변환"], en: ["unit converter", "metric converter", "measurement conversion"] },
    faqs: {
      ko: [
        { question: "1인치는 몇 센티미터인가요?", answer: "국제 기준으로 1인치는 정확히 2.54센티미터입니다." },
        { question: "파운드와 킬로그램은 어떻게 변환하나요?", answer: "파운드 값에 약 0.453592를 곱하면 킬로그램이 됩니다." },
        { question: "섭씨 0도는 화씨 몇 도인가요?", answer: "섭씨 0도는 화씨 32도입니다." },
      ],
      en: [
        { question: "How many centimeters are in one inch?", answer: "One international inch is exactly 2.54 centimeters." },
        { question: "How do I convert pounds to kilograms?", answer: "Multiply pounds by approximately 0.453592 to get kilograms." },
        { question: "What is 0 Celsius in Fahrenheit?", answer: "Zero degrees Celsius equals 32 degrees Fahrenheit." },
      ],
    },
  },
  {
    slug: "date-calculator",
    icon: "calendar",
    category: "daily",
    title: { ko: "날짜 계산기", en: "Date Calculator" },
    short: { ko: "두 날짜 사이의 일수와 원하는 날짜 전후의 날짜를 계산합니다.", en: "Count days between dates or add and subtract time." },
    description: {
      ko: "시작일과 종료일 사이의 기간을 달력 기준으로 계산하고, 특정 날짜에 정수 일수를 더하거나 뺍니다. 날짜 차이는 시작 시점을 0일로 보는 경과 일수와 평일 수로 표시합니다.",
      en: "Calculate the calendar distance and weekdays between two dates, or add and subtract a non-negative whole number of days from a starting date.",
    },
    guide: { ko: ["날짜 차이 또는 날짜 더하기를 선택하세요.", "시작일과 필요한 값을 입력하세요.", "달력 기준 결과와 요약을 확인하세요."], en: ["Choose date difference or date addition.", "Enter the starting date and requested values.", "Review the calendar result and summary."] },
    useCases: { ko: ["D-day와 프로젝트 기간을 계산할 때", "계약 또는 체류 기간을 셀 때", "며칠 후 날짜를 확인할 때"], en: ["Planning a deadline or project", "Counting a contract or travel period", "Finding the date a number of days from now"] },
    keywords: { ko: ["날짜 계산기", "날짜 차이", "디데이 계산"], en: ["date calculator", "days between dates", "add days to date"] },
    faqs: {
      ko: [
        { question: "날짜 차이는 시작일을 포함하나요?", answer: "아니요. 이 도구는 시작 시점을 0일로 보는 경과 일수를 표시합니다. 양 끝 날짜를 모두 세려면 결과에 하루를 더하세요." },
        { question: "윤년도 자동으로 반영되나요?", answer: "네. 브라우저의 표준 달력 계산을 사용해 2월 29일을 자동 반영합니다." },
        { question: "시간대 때문에 날짜가 달라질 수 있나요?", answer: "이 도구는 시각이나 시간대 변환 없이 입력한 달력 날짜 자체만 계산해 일반적인 날짜 이동 오류를 피합니다." },
      ],
      en: [
        { question: "Does the difference include the start date?", answer: "No. This tool treats the starting point as day zero. Add one to the result if you need to count both endpoints." },
        { question: "Are leap years handled automatically?", answer: "Yes. Standard calendar arithmetic accounts for February 29 in leap years." },
        { question: "Can time zones change the answer?", answer: "The tool calculates the entered calendar dates without converting a time or time zone, which avoids common date shifts." },
      ],
    },
  },
  {
    slug: "image-optimizer",
    icon: "image",
    category: "digital",
    title: { ko: "이미지 용량 줄이기", en: "Image Optimizer" },
    short: { ko: "사진 크기와 품질을 조절하고 JPG, PNG, WebP로 저장합니다.", en: "Resize, compress, and convert images to JPG, PNG, or WebP." },
    description: {
      ko: "사진의 가로 크기와 품질을 조절해 파일 용량을 줄이고 JPG, PNG, WebP 형식으로 변환합니다. 모든 처리는 현재 브라우저에서 이루어지며 선택한 이미지는 서버로 업로드되지 않습니다. 원본의 투명 배경은 JPG로 변환할 때 흰색으로 채워집니다.",
      en: "Resize and compress a photo, then convert it to JPG, PNG, or WebP. Processing happens entirely in the current browser and the selected image is not uploaded to our server. Transparent areas are filled with white when exporting to JPG.",
    },
    guide: { ko: ["최적화할 JPG, PNG 또는 WebP 이미지를 선택하세요.", "가로 크기, 품질, 출력 형식을 조절하세요.", "변환 결과의 실제 용량과 미리보기를 확인한 뒤 저장하세요."], en: ["Choose a JPG, PNG, or WebP image.", "Adjust width, quality, and output format.", "Check the converted file size and preview, then download the result."] },
    useCases: { ko: ["웹사이트 이미지의 로딩 속도를 줄일 때", "이메일 첨부 전에 사진 용량을 줄일 때", "PNG 사진을 효율적인 WebP로 바꿀 때"], en: ["Improving website image load time", "Reducing a photo before attaching it to email", "Converting a large PNG photo to WebP"] },
    keywords: { ko: ["이미지 용량 줄이기", "사진 압축", "WebP 변환"], en: ["image compressor", "resize image", "convert image to WebP"] },
    faqs: {
      ko: [
        { question: "이미지가 서버로 업로드되나요?", answer: "아닙니다. 파일 읽기, 크기 조절, 형식 변환은 브라우저 안에서만 진행됩니다." },
        { question: "어떤 형식이 가장 용량이 작나요?", answer: "사진은 보통 WebP 또는 JPG가 작습니다. 투명 배경이나 선명한 그래픽은 PNG가 더 적합할 수 있습니다." },
        { question: "품질 값을 낮추면 어떻게 되나요?", answer: "파일은 작아지지만 세부 묘사가 흐려지거나 압축 자국이 보일 수 있습니다. 미리보기를 확대해 확인하세요." },
      ],
      en: [
        { question: "Is my image uploaded to a server?", answer: "No. File reading, resizing, and conversion all happen inside your browser." },
        { question: "Which format produces the smallest file?", answer: "WebP or JPG is often smaller for photos. PNG can be better for transparency and crisp graphics." },
        { question: "What happens when I lower quality?", answer: "The file gets smaller, but fine detail may blur and compression artifacts may appear. Check the preview before downloading." },
      ],
    },
  },
  {
    slug: "loan-calculator",
    icon: "bank",
    category: "finance",
    title: { ko: "대출 상환 계산기", en: "Loan Calculator" },
    short: { ko: "원리금균등 방식의 월 상환액과 총이자를 계산합니다.", en: "Estimate monthly payments and total interest for a fixed-rate loan." },
    description: {
      ko: "대출 원금, 연이율, 기간을 바탕으로 원리금균등상환의 예상 월 납입액과 총이자를 계산합니다. 실제 금융기관의 결과는 납입일, 수수료, 변동금리, 중도상환 조건, 반올림 방식에 따라 달라질 수 있습니다.",
      en: "Estimate the monthly payment and total interest for a fixed-rate amortizing loan. Actual lender figures may differ because of fees, payment dates, variable rates, prepayment terms, taxes, insurance, and rounding rules.",
    },
    guide: { ko: ["대출 원금과 연이율을 입력하세요.", "상환 기간을 년 단위로 설정하세요.", "예상 월 납입액, 총이자, 총상환액을 비교하세요."], en: ["Enter principal and annual interest rate.", "Set the repayment term in years.", "Compare the estimated monthly payment, total interest, and total repayment."] },
    useCases: { ko: ["대출 가능 예산을 잡을 때", "금리별 월 부담을 비교할 때", "조기 상환 전 전체 이자를 확인할 때"], en: ["Planning an affordable borrowing amount", "Comparing monthly cost at different rates", "Understanding total interest before borrowing"] },
    keywords: { ko: ["대출 계산기", "원리금균등상환", "월 상환액 계산"], en: ["loan calculator", "monthly payment calculator", "amortization calculator"] },
    faqs: {
      ko: [
        { question: "원리금균등상환이란 무엇인가요?", answer: "매달 내는 원금과 이자의 합계가 거의 같도록 계산하는 방식입니다. 초기에는 이자 비중이 크고 시간이 지나며 원금 비중이 커집니다." },
        { question: "금리가 0%이면 어떻게 계산하나요?", answer: "원금을 전체 상환 개월 수로 단순히 나누어 월 납입액을 계산합니다." },
        { question: "실제 은행 금액과 다른 이유는 무엇인가요?", answer: "수수료, 납입일, 일할 이자, 변동금리, 보험과 세금, 반올림 규칙이 포함될 수 있기 때문입니다." },
      ],
      en: [
        { question: "What is an amortizing loan?", answer: "It uses nearly equal scheduled payments. Early payments contain more interest, while later payments contain more principal." },
        { question: "How is a zero-interest loan calculated?", answer: "The principal is divided evenly by the number of monthly payments." },
        { question: "Why might a lender quote a different amount?", answer: "Fees, daily interest, payment dates, insurance, taxes, variable rates, and rounding can change the final figure." },
      ],
    },
  },
  {
    slug: "compound-interest",
    icon: "chart",
    category: "finance",
    title: { ko: "복리 계산기", en: "Compound Interest Calculator" },
    short: { ko: "초기금과 정기 적립금의 미래 가치와 이자를 계산합니다.", en: "Project growth from principal, contributions, and compounding." },
    description: {
      ko: "초기 투자금, 정기 적립금, 예상 수익률, 기간을 조합해 미래 가치를 계산합니다. 복리는 발생한 수익이 원금에 더해져 다음 기간의 수익 계산에 포함되는 방식이며, 실제 투자 수익은 시장 변동과 세금, 비용의 영향을 받습니다.",
      en: "Project future value from an initial balance, recurring contributions, expected rate, and time. Compounding adds prior returns to the balance used for later growth. Real investment returns vary and may be reduced by taxes, fees, and market losses.",
    },
    guide: { ko: ["초기금과 매월 적립할 금액을 입력하세요.", "예상 연 수익률과 기간을 설정하세요.", "총 납입액, 예상 수익, 미래 가치를 비교하세요."], en: ["Enter the starting balance and recurring contribution.", "Set an expected annual return and time horizon.", "Compare total contributions, projected growth, and future value."] },
    useCases: { ko: ["장기 저축 목표를 계획할 때", "적립액에 따른 미래 가치를 비교할 때", "복리 효과를 이해할 때"], en: ["Planning a long-term savings target", "Comparing recurring contribution amounts", "Understanding the effect of compounding"] },
    keywords: { ko: ["복리 계산기", "적금 계산기", "투자 수익 계산"], en: ["compound interest calculator", "investment calculator", "savings growth calculator"] },
    faqs: {
      ko: [
        { question: "복리와 단리의 차이는 무엇인가요?", answer: "단리는 원금에만 이자가 붙고, 복리는 이전에 발생한 이자에도 이후 이자가 붙습니다." },
        { question: "예상 수익률은 보장되나요?", answer: "아닙니다. 계산 결과는 입력한 일정한 수익률을 가정한 예시이며 실제 시장 수익을 보장하지 않습니다." },
        { question: "매월 적립금은 언제 반영되나요?", answer: "이 계산기는 각 월 말에 적립하는 것으로 가정합니다." },
      ],
      en: [
        { question: "What is the difference between simple and compound interest?", answer: "Simple interest applies only to principal. Compound interest also earns returns on earlier returns." },
        { question: "Is the projected return guaranteed?", answer: "No. The projection assumes a constant rate and does not guarantee market performance." },
        { question: "When are monthly contributions added?", answer: "This calculator assumes contributions are added at the end of each month." },
      ],
    },
  },
  {
    slug: "text-counter",
    icon: "text",
    category: "writing",
    title: { ko: "글자수 세기", en: "Word and Character Counter" },
    short: { ko: "글자, 단어, 문장, 문단과 예상 읽기 시간을 셉니다.", en: "Count words, characters, sentences, paragraphs, and reading time." },
    description: {
      ko: "입력한 글의 공백 포함 글자 수, 공백 제외 글자 수, 단어, 문장, 문단과 예상 읽기 시간을 실시간으로 계산합니다. 텍스트는 서버로 보내지 않고 현재 브라우저에서만 처리합니다.",
      en: "Analyze text in real time for words, characters with and without spaces, sentences, paragraphs, and estimated reading time. The text is processed locally in the current browser and is not sent to our server.",
    },
    guide: { ko: ["입력 칸에 분석할 글을 붙여 넣거나 작성하세요.", "상단 지표에서 글자와 단어 수를 확인하세요.", "필요하면 텍스트를 지우거나 결과를 복사하세요."], en: ["Paste or type text into the editor.", "Review the live counts above the editor.", "Clear the text or copy the result when needed."] },
    useCases: { ko: ["자기소개서나 원고 분량을 확인할 때", "SNS 글자 제한을 맞출 때", "읽기 시간을 가늠할 때"], en: ["Checking an essay or manuscript length", "Meeting a social post limit", "Estimating reading time"] },
    keywords: { ko: ["글자수 세기", "공백 제외 글자수", "단어수 세기"], en: ["word counter", "character counter", "reading time calculator"] },
    faqs: {
      ko: [
        { question: "공백 포함과 제외는 어떻게 다른가요?", answer: "공백 포함은 띄어쓰기와 줄바꿈을 모두 세고, 공백 제외는 모든 공백 문자를 빼고 셉니다." },
        { question: "한국어 단어 수는 어떻게 세나요?", answer: "일반적인 문서 편집기처럼 공백으로 나뉜 덩어리를 단어로 계산합니다." },
        { question: "입력한 글이 서버에 저장되나요?", answer: "아닙니다. 글자 수 계산은 브라우저 안에서만 진행됩니다." },
      ],
      en: [
        { question: "What is the difference between character counts?", answer: "Characters with spaces include spaces and line breaks. Characters without spaces remove all whitespace first." },
        { question: "How are words counted?", answer: "The tool counts groups of characters separated by whitespace, similar to common text editors." },
        { question: "Is my text uploaded or saved?", answer: "No. Text analysis runs in your browser and is not sent to our server." },
      ],
    },
  },
  {
    slug: "qr-generator",
    icon: "qr",
    category: "digital",
    title: { ko: "QR 코드 생성기", en: "QR Code Generator" },
    short: { ko: "링크나 텍스트를 QR 코드로 만들고 PNG로 저장합니다.", en: "Turn a link or text into a QR code and download it as PNG." },
    description: {
      ko: "웹주소, 연락처, 짧은 안내문 등 원하는 텍스트를 QR 코드로 변환합니다. 생성 과정은 브라우저에서 진행되며 결과 이미지를 PNG 파일로 저장할 수 있습니다. 배포 전에는 실제 휴대전화 카메라로 스캔해 내용을 다시 확인하세요.",
      en: "Convert a URL, contact detail, or short message into a QR code. Generation happens in your browser and the result can be downloaded as a PNG image. Always scan the final code with a real phone before publishing it.",
    },
    guide: { ko: ["연결할 웹주소나 텍스트를 입력하세요.", "이미지 크기와 오류 복원 수준을 선택하세요.", "휴대전화로 테스트한 뒤 PNG 파일을 저장하세요."], en: ["Enter a URL or text to encode.", "Choose the image size and error correction level.", "Test with a phone, then download the PNG file."] },
    useCases: { ko: ["메뉴나 포스터에 링크를 넣을 때", "와이파이 또는 연락처 안내를 공유할 때", "인쇄물에서 모바일 페이지로 연결할 때"], en: ["Adding a link to a menu or poster", "Sharing contact or Wi-Fi instructions", "Connecting print material to a mobile page"] },
    keywords: { ko: ["QR 코드 생성기", "큐알코드 만들기", "QR PNG"], en: ["QR code generator", "create QR code", "QR code PNG"] },
    faqs: {
      ko: [
        { question: "생성한 QR 코드는 만료되나요?", answer: "입력한 내용을 직접 담는 정적 QR 코드는 만료되지 않습니다. 다만 연결한 웹주소가 바뀌거나 사라지면 열리지 않습니다." },
        { question: "오류 복원 수준은 무엇인가요?", answer: "코드 일부가 가려져도 읽을 수 있게 데이터를 중복 저장하는 정도입니다. 높을수록 코드가 더 복잡해집니다." },
        { question: "민감한 정보를 넣어도 되나요?", answer: "QR 코드는 누구나 스캔해 내용을 읽을 수 있으므로 비밀번호나 개인 식별정보를 넣지 마세요." },
      ],
      en: [
        { question: "Does a generated QR code expire?", answer: "A static QR code that directly stores your text does not expire. A linked page can still move or go offline." },
        { question: "What is error correction?", answer: "It adds redundant data so a code may still scan when partly damaged. Higher levels create a denser code." },
        { question: "Can I encode sensitive information?", answer: "Avoid it. Anyone who scans a QR code can read its contents, so do not include passwords or private identifiers." },
      ],
    },
  },
  {
    slug: "password-generator",
    icon: "lock",
    category: "digital",
    title: { ko: "비밀번호 생성기", en: "Password Generator" },
    short: { ko: "기기 안에서 강력한 무작위 비밀번호를 생성합니다.", en: "Create strong random passwords locally on your device." },
    description: {
      ko: "브라우저의 암호학적 난수 생성 기능을 사용해 원하는 길이와 문자 조합의 비밀번호를 만듭니다. 생성된 값은 서버로 전송하거나 저장하지 않습니다. 사이트마다 다른 비밀번호를 사용하고 신뢰할 수 있는 비밀번호 관리자를 함께 쓰는 것을 권합니다.",
      en: "Use the browser's cryptographically secure random generator to create passwords with your preferred length and character sets. Generated values are not sent to or stored on our server. Use a unique password for every account and keep them in a trusted password manager.",
    },
    guide: { ko: ["비밀번호 길이를 정하세요. 16자 이상을 권장합니다.", "대문자, 숫자, 기호 등 포함할 문자 종류를 선택하세요.", "생성 후 복사해 비밀번호 관리자에 바로 저장하세요."], en: ["Choose a length. At least 16 characters is recommended.", "Select the character groups to include.", "Copy the result directly into a trusted password manager."] },
    useCases: { ko: ["새 계정의 고유 비밀번호가 필요할 때", "오래된 비밀번호를 교체할 때", "보안 질문 대신 복구 코드를 보관할 때"], en: ["Creating a unique password for a new account", "Replacing an old or reused password", "Generating a random recovery phrase"] },
    keywords: { ko: ["비밀번호 생성기", "랜덤 비밀번호", "강력한 비밀번호"], en: ["password generator", "random password", "strong password generator"] },
    faqs: {
      ko: [
        { question: "몇 자가 안전한가요?", answer: "일반 계정에는 서로 다른 문자 종류를 포함한 16자 이상의 고유 비밀번호를 권장합니다." },
        { question: "생성된 비밀번호가 전송되나요?", answer: "아닙니다. 브라우저의 보안 난수 기능을 사용해 현재 기기에서만 생성합니다." },
        { question: "기호를 빼도 되나요?", answer: "사이트가 기호를 허용하지 않는 경우 뺄 수 있습니다. 대신 길이를 늘려 추측하기 어렵게 만드세요." },
      ],
      en: [
        { question: "How long should a password be?", answer: "For most accounts, use a unique password of at least 16 characters with multiple character types." },
        { question: "Is the generated password transmitted?", answer: "No. It is created locally with the browser's secure random number generator." },
        { question: "Can I exclude symbols?", answer: "Yes, if a site does not allow them. Increase the length to maintain strong resistance to guessing." },
      ],
    },
  },
];

export const tools: ToolDefinition[] = [...coreTools, ...koreanTools, ...globalTools];

export const games: GameDefinition[] = [
  {
    slug: "merge-2048",
    icon: "squares",
    title: { ko: "2048 숫자 합치기", en: "2048 Merge" },
    short: { ko: "같은 숫자를 합쳐 2048 타일에 도전하세요.", en: "Combine matching tiles and build your way to 2048." },
    description: { ko: "방향키나 화면 버튼으로 타일을 움직입니다. 같은 숫자가 만나면 하나로 합쳐집니다.", en: "Move tiles with arrow keys or on-screen controls. Matching numbers merge into one." },
  },
  {
    slug: "memory-match",
    icon: "cards",
    title: { ko: "기억력 카드 맞추기", en: "Memory Match" },
    short: { ko: "카드의 위치를 기억하고 모든 짝을 찾아보세요.", en: "Remember each card and find every matching pair." },
    description: { ko: "두 장씩 뒤집어 같은 기호를 찾습니다. 적은 횟수와 짧은 시간에 완료해 보세요.", en: "Flip two cards at a time and match the symbols in as few moves as possible." },
  },
  {
    slug: "arcade-shooter",
    icon: "crosshair",
    title: { ko: "코랄 스카이 슈터", en: "Coral Sky Shooter" },
    short: { ko: "움직이고 발사하며 점점 거세지는 적의 웨이브를 버티세요.", en: "Move, fire, and survive increasingly difficult enemy waves." },
    description: { ko: "키보드나 화면 버튼으로 기체를 움직이고 적을 격추합니다. 웨이브가 오를수록 적의 속도와 종류가 늘어나며 최고 점수는 현재 기기에 저장됩니다.", en: "Move with the keyboard or on-screen controls and shoot incoming enemies. Waves add speed and tougher enemy types, while your best score stays on this device." },
  },
];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getTool(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}
