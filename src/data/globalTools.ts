import type { ToolDefinition } from "@/data/toolTypes";

export const globalTools: ToolDefinition[] = [
  {
    slug: "pdf-toolkit",
    icon: "pdf",
    category: "digital",
    title: { ko: "PDF 합치기와 페이지 추출", en: "PDF Merge and Page Extractor" },
    short: {
      ko: "여러 PDF를 하나로 합치거나 필요한 페이지 범위만 새 파일로 저장합니다.",
      en: "Merge multiple PDFs or save a selected page range as a new file.",
    },
    description: {
      ko: "선택한 PDF를 목록 순서대로 합치거나 한 PDF에서 연속된 페이지 범위를 추출해 새 문서로 만듭니다. 파일 읽기와 결과 생성은 브라우저 안에서 처리되며 PDF가 서버로 업로드되지 않습니다. 암호화되었거나 손상된 문서는 처리되지 않을 수 있으므로 중요한 원본은 별도로 보관하세요.",
      en: "Combine selected PDFs in list order, or extract one continuous page range into a new document. Files are read and rebuilt locally in your browser, so their contents are not uploaded to our server. Encrypted or damaged documents may not process, and important originals should be kept separately.",
    },
    guide: {
      ko: [
        "PDF 합치기 또는 페이지 추출 모드를 선택하세요.",
        "합칠 파일을 순서대로 고르거나 추출할 PDF와 페이지 범위를 입력하세요.",
        "결과의 페이지 수와 파일 크기를 확인한 뒤 새 PDF를 내려받으세요.",
      ],
      en: [
        "Choose Merge PDFs or Extract pages.",
        "Select files in merge order, or choose one PDF and enter a page range.",
        "Check the output page count and file size, then download the new PDF.",
      ],
    },
    useCases: {
      ko: [
        "여러 영수증이나 보고서를 한 파일로 묶을 때",
        "긴 자료에서 제출할 페이지만 따로 저장할 때",
        "서버 업로드 없이 민감한 PDF를 간단히 정리할 때",
      ],
      en: [
        "Combining receipts or reports into one document",
        "Saving only the pages required for a submission",
        "Handling sensitive PDFs without a server upload",
      ],
    },
    keywords: {
      ko: ["PDF 합치기", "PDF 페이지 추출", "PDF 병합 무료"],
      en: ["merge PDF online", "extract PDF pages", "private PDF tool"],
    },
    faqs: {
      ko: [
        {
          question: "PDF 파일이 서버로 전송되나요?",
          answer: "아닙니다. 선택한 파일의 읽기, 병합, 페이지 추출과 새 파일 생성은 현재 브라우저에서 처리됩니다.",
        },
        {
          question: "페이지를 여러 구간으로 나누어 추출할 수 있나요?",
          answer: "현재는 시작 페이지부터 끝 페이지까지 하나의 연속된 범위를 추출합니다. 서로 떨어진 구간은 각각 추출한 뒤 합치기 기능으로 묶을 수 있습니다.",
        },
        {
          question: "암호가 걸린 PDF도 처리할 수 있나요?",
          answer: "암호화된 PDF나 구조가 손상된 PDF는 열리지 않을 수 있습니다. 먼저 신뢰할 수 있는 원본 프로그램에서 잠금을 해제하고 복사본으로 시도하세요.",
        },
      ],
      en: [
        {
          question: "Are my PDF files sent to a server?",
          answer: "No. Reading, merging, extracting pages, and building the new file all happen in your current browser.",
        },
        {
          question: "Can I extract several separate page ranges at once?",
          answer: "The current extractor accepts one continuous range from a start page to an end page. You can extract separate ranges individually and then merge those files.",
        },
        {
          question: "Can the tool open a password-protected PDF?",
          answer: "Encrypted or structurally damaged PDFs may not open. Unlock the document in a trusted source application first and work from a copy.",
        },
      ],
    },
  },
  {
    slug: "bmi-calculator",
    icon: "heartbeat",
    category: "health",
    title: { ko: "성인 BMI 계산기", en: "Adult BMI Calculator" },
    short: {
      ko: "키와 몸무게로 성인 체질량지수와 참고 범위를 확인합니다.",
      en: "Estimate adult body mass index and its reference range from height and weight.",
    },
    description: {
      ko: "몸무게를 키의 제곱으로 나누는 BMI 공식을 사용하며 cm와 kg 또는 ft, in, lb 입력을 지원합니다. 표시되는 구간은 일반 성인 선별 기준으로 임신 중이거나 성장기인 사람, 근육량이 많은 사람에게 그대로 적용하기 어렵습니다. 입력값은 브라우저에서만 계산되며 이 결과는 의학적 진단이나 개인별 건강 평가가 아닙니다.",
      en: "Calculate BMI by dividing weight by height squared, using either cm and kg or ft, in, and lb. The displayed categories are general adult screening ranges and may not fit pregnancy, children, adolescents, or people with high muscle mass. Measurements are processed only in your browser, and the result is not a diagnosis or individualized medical assessment.",
    },
    guide: {
      ko: [
        "미터법 또는 영미 단위를 선택하세요.",
        "현재 키와 몸무게를 같은 시점의 값으로 입력하세요.",
        "계산된 BMI와 성인 참고 범위를 확인하고 필요하면 전문가와 상담하세요.",
      ],
      en: [
        "Choose metric or imperial measurements.",
        "Enter current height and weight measured at a similar time.",
        "Review the BMI and adult reference range, then seek professional advice when appropriate.",
      ],
    },
    useCases: {
      ko: [
        "건강검진 전 현재 BMI를 참고로 확인할 때",
        "cm와 kg 또는 ft와 lb 기준 결과를 비교할 때",
        "생활 습관 기록에 같은 방식의 지표를 남길 때",
      ],
      en: [
        "Checking a reference BMI before a routine health visit",
        "Comparing metric and imperial measurement results",
        "Tracking a consistently calculated indicator over time",
      ],
    },
    keywords: {
      ko: ["BMI 계산기", "체질량지수 계산", "성인 비만도 계산"],
      en: ["BMI calculator", "adult body mass index", "BMI kg cm"],
    },
    sources: {
      ko: [{ label: "미국 질병통제예방센터 성인 BMI 기준", url: "https://www.cdc.gov/bmi/adult-calculator/" }],
      en: [{ label: "CDC adult BMI calculator and categories", url: "https://www.cdc.gov/bmi/adult-calculator/" }],
    },
    faqs: {
      ko: [
        {
          question: "BMI는 어떻게 계산하나요?",
          answer: "kg 단위 몸무게를 m 단위 키의 제곱으로 나눕니다. 영미 단위 입력도 내부에서 같은 기준으로 변환해 계산합니다.",
        },
        {
          question: "BMI만으로 비만을 진단할 수 있나요?",
          answer: "아닙니다. BMI는 성인의 집단 선별에 쓰이는 참고 지표이며 체지방 분포, 근육량, 질환과 개인 상황을 모두 반영하지 않습니다.",
        },
        {
          question: "어린이도 이 계산 결과를 사용해도 되나요?",
          answer: "이 도구의 범주는 성인 기준입니다. 어린이와 청소년은 나이와 성별에 따른 성장도표를 의료 전문가와 함께 확인해야 합니다.",
        },
      ],
      en: [
        {
          question: "How is BMI calculated?",
          answer: "Weight in kilograms is divided by height in meters squared. Imperial entries are converted internally to the same formula.",
        },
        {
          question: "Can BMI diagnose obesity or a health condition?",
          answer: "No. BMI is an adult screening indicator and does not fully account for fat distribution, muscle mass, illness, or individual circumstances.",
        },
        {
          question: "Should children use these BMI categories?",
          answer: "No. The categories shown are for adults. Children and adolescents need age-specific and sex-specific growth charts reviewed with a health professional.",
        },
      ],
    },
  },
  {
    slug: "time-zone-converter",
    icon: "globe",
    category: "daily",
    title: { ko: "세계 시간대 변환기", en: "World Time Zone Converter" },
    short: {
      ko: "한 지역의 날짜와 시간을 다른 지역 시각으로 변환합니다.",
      en: "Convert a date and time from one world region to another.",
    },
    description: {
      ko: "출발 지역의 현지 시각을 하나의 시점으로 해석한 뒤 선택한 도착 지역의 시각으로 변환합니다. 브라우저가 제공하는 IANA 시간대 규칙을 사용해 해당 날짜의 일광 절약 시간과 날짜 변경을 반영합니다. 입력한 일정은 서버로 전송되지 않지만 중요한 회의와 항공 일정은 최신 공식 안내 및 시간대 이름과 함께 다시 확인하세요.",
      en: "Interpret the entered wall-clock time in the source region, then show the same instant in the selected destination region. The browser's IANA time zone data is used to account for daylight saving time and date changes on that day. Entries stay in the browser, but critical meetings and flights should also be checked against current official information and the named time zone.",
    },
    guide: {
      ko: [
        "변환할 날짜와 출발 지역의 현지 시간을 입력하세요.",
        "출발 시간대와 도착 시간대를 IANA 지역 이름으로 선택하세요.",
        "변환된 날짜, 시각, 약어와 일광 절약 시간 적용 여부를 확인하세요.",
      ],
      en: [
        "Enter the calendar date and local time in the source region.",
        "Select source and destination zones by their IANA region names.",
        "Review the converted date, time, zone abbreviation, and daylight saving status.",
      ],
    },
    useCases: {
      ko: [
        "해외 팀과 화상회의 시간을 정할 때",
        "여행지 도착 시각을 현지 기준으로 확인할 때",
        "일광 절약 시간 전환 전후의 일정을 검토할 때",
      ],
      en: [
        "Scheduling a video call with an international team",
        "Checking the local arrival time for a trip",
        "Reviewing an event near a daylight saving transition",
      ],
    },
    keywords: {
      ko: ["시간대 변환기", "세계 시간 계산", "해외 시간 변환"],
      en: ["time zone converter", "world time converter", "DST time conversion"],
    },
    sources: {
      ko: [{ label: "IANA 시간대 데이터베이스", url: "https://www.iana.org/time-zones" }],
      en: [{ label: "IANA Time Zone Database", url: "https://www.iana.org/time-zones" }],
    },
    faqs: {
      ko: [
        {
          question: "일광 절약 시간도 자동으로 반영되나요?",
          answer: "네. 선택한 날짜와 IANA 지역 시간대에 대해 브라우저가 보유한 일광 절약 시간 규칙을 적용합니다.",
        },
        {
          question: "UTC 오프셋만 고르는 것과 무엇이 다른가요?",
          answer: "고정 오프셋은 계절별 변화를 알 수 없습니다. IANA 지역 이름은 날짜에 따라 표준시와 일광 절약 시간 규칙을 적용할 수 있습니다.",
        },
        {
          question: "일부 과거 또는 미래 일정이 공식 시각과 다를 수 있나요?",
          answer: "각국 정부가 시간대 규칙을 바꾸면 브라우저 데이터가 갱신되기 전까지 차이가 생길 수 있습니다. 중요한 일정은 공식 출처로 재확인하세요.",
        },
      ],
      en: [
        {
          question: "Does the converter handle daylight saving time automatically?",
          answer: "Yes. It applies the browser's IANA rules for the selected region and calendar date.",
        },
        {
          question: "Why use a named zone instead of only a UTC offset?",
          answer: "A fixed offset cannot describe seasonal changes. An IANA region name can apply standard time and daylight saving rules according to the date.",
        },
        {
          question: "Could a historical or future result differ from an official schedule?",
          answer: "Yes. Governments can change time zone rules before browser data is updated. Verify important events with a current official source.",
        },
      ],
    },
  },
  {
    slug: "pomodoro-timer",
    icon: "timer",
    category: "daily",
    title: { ko: "포모도로 집중 타이머", en: "Pomodoro Focus Timer" },
    short: {
      ko: "집중과 휴식 시간을 반복하며 완료한 집중 세션을 확인합니다.",
      en: "Cycle through focus and break periods while tracking completed sessions.",
    },
    description: {
      ko: "설정한 집중 시간이 끝나면 휴식으로, 휴식이 끝나면 다시 집중으로 전환하는 반복 타이머입니다. 남은 시간은 단순한 화면 갱신 횟수가 아니라 실제 기기 시각과 마감 시각의 차이로 계산해 다른 탭에 다녀온 뒤에도 보정합니다. 설정과 완료 횟수는 현재 페이지에서만 다루며 서버에 활동 기록을 보내지 않습니다.",
      en: "Run repeating focus and break intervals, switching phase whenever the current period ends. Remaining time is derived from the difference between the device clock and a deadline, rather than from display ticks, so it can correct after background tab activity. Settings and session counts remain on the current page and no activity log is sent to our server.",
    },
    guide: {
      ko: [
        "집중 시간과 휴식 시간을 각각 1분부터 180분 사이로 설정하세요.",
        "타이머를 시작하고 현재 집중 또는 휴식 구간을 진행하세요.",
        "필요할 때 일시 정지하거나 초기화하고 완료한 집중 횟수를 확인하세요.",
      ],
      en: [
        "Set focus and break lengths between 1 and 180 minutes.",
        "Start the timer and work through the current focus or rest phase.",
        "Pause or reset when needed, and review the completed focus-session count.",
      ],
    },
    useCases: {
      ko: [
        "공부 시간을 짧은 단위로 나누어 집중할 때",
        "반복 업무 사이에 규칙적인 휴식을 넣을 때",
        "한 번에 완료한 집중 세션 수를 점검할 때",
      ],
      en: [
        "Breaking a study block into manageable focus periods",
        "Adding regular rest to repetitive work",
        "Reviewing how many focused intervals you completed",
      ],
    },
    keywords: {
      ko: ["포모도로 타이머", "집중 타이머", "공부 시간 관리"],
      en: ["Pomodoro timer", "focus timer online", "study interval timer"],
    },
    faqs: {
      ko: [
        {
          question: "포모도로는 꼭 25분 집중과 5분 휴식이어야 하나요?",
          answer: "아닙니다. 25분과 5분은 널리 쓰이는 시작값일 뿐입니다. 업무 난이도와 집중 지속 시간에 맞춰 두 구간을 조절하세요.",
        },
        {
          question: "다른 탭을 열어도 타이머가 맞게 가나요?",
          answer: "돌아왔을 때 실제 기기 시각을 기준으로 남은 시간을 다시 계산합니다. 다만 기기나 브라우저가 완전히 중단되면 화면 전환 알림이 늦을 수 있습니다.",
        },
        {
          question: "완료한 세션 기록이 다음 방문에도 남나요?",
          answer: "아닙니다. 현재 세션 수는 이 페이지를 열어 둔 동안만 유지되며 초기화하거나 페이지를 닫으면 사라집니다.",
        },
      ],
      en: [
        {
          question: "Must every Pomodoro use 25 minutes of focus and 5 minutes of rest?",
          answer: "No. Those are common starting values. Adjust both intervals to suit the task and your sustainable attention span.",
        },
        {
          question: "Does the timer stay accurate in another tab?",
          answer: "It recalculates from the actual device clock when you return. A fully suspended browser or device can still delay the visible phase transition.",
        },
        {
          question: "Will completed sessions remain on my next visit?",
          answer: "No. The count lasts only while the current page state is open and disappears after a reset or page close.",
        },
      ],
    },
  },
  {
    slug: "random-wheel",
    icon: "shuffle",
    category: "daily",
    title: { ko: "랜덤 선택 룰렛", en: "Random Choice Wheel" },
    short: {
      ko: "최대 100개의 선택지 중 하나를 같은 확률로 무작위 선택합니다.",
      en: "Pick one item at equal probability from as many as 100 choices.",
    },
    description: {
      ko: "한 줄에 하나씩 입력한 중복 없는 항목에 같은 선택 확률을 부여하고 브라우저의 암호학적 난수를 우선 사용해 결과를 뽑습니다. 한 번 나온 항목을 다음 추첨에서 제외하는 방식도 선택할 수 있으며 입력 목록과 최근 결과는 현재 페이지에서만 처리됩니다. 공인 추첨, 도박, 법적 감사가 필요한 선발을 위한 인증 도구는 아닙니다.",
      en: "Give every unique line an equal chance and select an index using browser cryptographic randomness when available. You can also remove each picked item from later draws, while the choice list and recent results stay in the current page. This is not a certified system for legal drawings, gambling, or audited selections.",
    },
    guide: {
      ko: [
        "서로 다른 선택지를 한 줄에 하나씩 입력하세요.",
        "필요하면 이미 뽑힌 항목을 다음 추첨에서 제외하도록 설정하세요.",
        "무작위로 뽑기를 누르고 결과와 최근 추첨 기록을 확인하세요.",
      ],
      en: [
        "Enter one distinct choice on each line.",
        "Optionally remove previously picked items from later draws.",
        "Select Pick at random and review the result and recent history.",
      ],
    },
    useCases: {
      ko: [
        "점심 메뉴나 오늘 할 일을 하나 고를 때",
        "수업 발표 순서를 중복 없이 정할 때",
        "여러 아이디어 중 다음에 검토할 항목을 뽑을 때",
      ],
      en: [
        "Choosing a meal or next task",
        "Setting a classroom presentation order without repeats",
        "Picking the next idea for a team to review",
      ],
    },
    keywords: {
      ko: ["랜덤 룰렛", "무작위 뽑기", "랜덤 선택기"],
      en: ["random wheel", "random choice picker", "name picker online"],
    },
    faqs: {
      ko: [
        {
          question: "각 선택지가 뽑힐 확률은 같나요?",
          answer: "네. 비어 있거나 중복된 줄을 정리한 뒤 남은 각 항목에 같은 확률을 적용합니다. 제외 옵션을 쓰면 남아 있는 항목끼리 다시 같은 확률을 가집니다.",
        },
        {
          question: "암호학적 난수는 무엇인가요?",
          answer: "일반적인 의사 난수보다 예측하기 어렵도록 운영체제와 브라우저가 제공하는 난수입니다. 이 도구는 지원되는 환경에서 해당 기능을 우선 사용합니다.",
        },
        {
          question: "경품 행사 당첨자 선정에 사용할 수 있나요?",
          answer: "개인적이고 비공식적인 선택에는 편리하지만 공인 감사 기록을 제공하지 않습니다. 규정이 있는 경품 행사는 승인된 추첨 절차를 사용하세요.",
        },
      ],
      en: [
        {
          question: "Does every choice have the same probability?",
          answer: "Yes. Empty and duplicate lines are removed, then each remaining item receives equal probability. With removal enabled, probability is shared equally among items still available.",
        },
        {
          question: "What is cryptographic randomness?",
          answer: "It is randomness supplied by the operating system and browser that is designed to be harder to predict than an ordinary pseudo-random call. The tool prefers it when available.",
        },
        {
          question: "Can I use this for a regulated prize drawing?",
          answer: "It is useful for informal choices but provides no certified audit trail. Use an approved drawing process for promotions governed by rules or law.",
        },
      ],
    },
  },
  {
    slug: "json-formatter",
    icon: "brackets",
    category: "digital",
    title: { ko: "JSON 포맷터와 문법 검사", en: "JSON Formatter and Validator" },
    short: {
      ko: "JSON 문법을 확인하고 보기 좋은 형식 또는 한 줄 형식으로 변환합니다.",
      en: "Validate JSON syntax and convert it to readable or compact output.",
    },
    description: {
      ko: "큰 정수의 원문 값을 보존하는 JSON 파서로 입력이 RFC 8259 JSON 문법에 맞는지 확인하고, 공백 2칸 또는 4칸으로 정리하거나 불필요한 공백을 제거해 한 줄로 만듭니다. 객체 속성의 의미나 외부 스키마까지 검사하는 도구는 아닙니다. 최대 허용 크기 안의 텍스트는 브라우저에서만 처리되므로 API 응답이나 설정값이 서버로 전송되지 않습니다.",
      en: "Use a lossless JSON parser that preserves large integer values while checking RFC 8259 syntax, then pretty-print with two or four spaces or remove insignificant whitespace for compact output. This checks syntax, not property meaning or compliance with an external schema. Text within the size limit is processed locally, so API responses and configuration values are not sent to our server.",
    },
    guide: {
      ko: [
        "원본 JSON을 입력 영역에 붙여 넣거나 작성하세요.",
        "문법 검사, 읽기 좋게 정리, 한 줄 압축 중 필요한 작업을 선택하세요.",
        "상태 메시지와 결과를 확인한 뒤 복사하거나 JSON 파일로 저장하세요.",
      ],
      en: [
        "Paste or type the original JSON into the input area.",
        "Choose validation, readable formatting, or one-line minification.",
        "Review the status and output, then copy it or download a JSON file.",
      ],
    },
    useCases: {
      ko: [
        "API 응답 구조를 빠르게 읽어야 할 때",
        "설정 파일의 쉼표와 따옴표 오류를 확인할 때",
        "전송 전 JSON의 불필요한 공백을 줄일 때",
      ],
      en: [
        "Making an API response easier to inspect",
        "Finding comma or quotation errors in a configuration file",
        "Removing unnecessary whitespace before transmission",
      ],
    },
    keywords: {
      ko: ["JSON 포맷터", "JSON 문법 검사", "JSON 한 줄 변환"],
      en: ["JSON formatter", "JSON validator", "JSON minifier"],
    },
    sources: {
      ko: [{ label: "RFC 8259 JSON 표준", url: "https://www.rfc-editor.org/info/rfc8259" }],
      en: [{ label: "RFC 8259 JSON standard", url: "https://www.rfc-editor.org/info/rfc8259" }],
    },
    faqs: {
      ko: [
        {
          question: "올바른 JSON인데 자바스크립트 객체와 다르게 보이는 이유는 무엇인가요?",
          answer: "RFC 8259 JSON은 속성 이름과 문자열에 큰따옴표를 사용하며 주석, 함수, undefined와 끝의 불필요한 쉼표를 허용하지 않습니다.",
        },
        {
          question: "이 도구가 JSON 스키마도 검사하나요?",
          answer: "아닙니다. JSON으로 파싱 가능한 문법인지만 확인합니다. 필수 속성, 값의 자료형 같은 스키마 규칙은 별도 검증기가 필요합니다.",
        },
        {
          question: "입력한 API 데이터가 저장되나요?",
          answer: "아닙니다. 파싱과 형식 변환은 현재 브라우저에서 수행됩니다. 그래도 공유 기기에서는 민감한 값을 클립보드와 화면에 남기지 않도록 주의하세요.",
        },
      ],
      en: [
        {
          question: "Why can valid JavaScript object syntax still fail as JSON?",
          answer: "RFC 8259 JSON requires double quotes for property names and strings, and it does not allow comments, functions, undefined, or trailing commas.",
        },
        {
          question: "Does this tool validate a JSON Schema?",
          answer: "No. It only checks whether the text can be parsed as JSON. Schema rules such as required properties and value types need a dedicated validator.",
        },
        {
          question: "Is my API data stored?",
          answer: "No. Parsing and transformation happen in the current browser. On a shared device, still take care not to leave sensitive values visible or in the clipboard.",
        },
      ],
    },
  },
  {
    slug: "unix-timestamp",
    icon: "binary",
    category: "digital",
    title: { ko: "유닉스 타임스탬프 변환기", en: "Unix Timestamp Converter" },
    short: {
      ko: "초 또는 밀리초 타임스탬프와 날짜를 양방향으로 변환합니다.",
      en: "Convert seconds or milliseconds between Unix timestamps and dates.",
    },
    description: {
      ko: "1970년 1월 1일 00:00:00 UTC부터 흐른 시간을 초 또는 밀리초 단위로 해석해 UTC ISO 날짜와 기기 현지 시각을 함께 표시합니다. 반대로 입력한 현지 날짜는 현재 기기의 시간대 설정을 가정해 두 단위의 타임스탬프로 계산합니다. 모든 변환은 브라우저에서 수행되며 서버 시각이나 네트워크 시간과 동기화하지 않습니다.",
      en: "Interpret a value as seconds or milliseconds elapsed since 1970-01-01 00:00:00 UTC, showing both a UTC ISO date and the device's local representation. In the other direction, the entered local date is interpreted with the current device time zone and returned in both units. Conversion stays in the browser and is not synchronized with server or network time.",
    },
    guide: {
      ko: [
        "타임스탬프를 입력하고 초 또는 밀리초 단위를 선택하세요.",
        "UTC ISO 날짜와 브라우저 현지 시각을 함께 확인하세요.",
        "역변환이 필요하면 현지 날짜와 시간을 입력해 두 단위의 값을 복사하세요.",
      ],
      en: [
        "Enter a timestamp and select seconds or milliseconds.",
        "Compare the UTC ISO output with the browser-local date and time.",
        "For reverse conversion, enter a local date-time and copy either unit.",
      ],
    },
    useCases: {
      ko: [
        "로그에 기록된 숫자 시각을 읽을 때",
        "API 요청에 넣을 만료 시각을 변환할 때",
        "초 단위와 밀리초 단위 혼동을 확인할 때",
      ],
      en: [
        "Reading numeric times from application logs",
        "Converting an expiry time for an API request",
        "Checking whether a value uses seconds or milliseconds",
      ],
    },
    keywords: {
      ko: ["유닉스 타임스탬프 변환", "에포크 시간 계산", "밀리초 날짜 변환"],
      en: ["Unix timestamp converter", "epoch time converter", "milliseconds to date"],
    },
    faqs: {
      ko: [
        {
          question: "10자리와 13자리 타임스탬프의 차이는 무엇인가요?",
          answer: "현재 시점 부근에서는 보통 10자리가 초, 13자리가 밀리초 단위입니다. 자릿수만 추측하지 말고 데이터 명세의 단위를 확인하세요.",
        },
        {
          question: "유닉스 타임스탬프에 시간대가 포함되나요?",
          answer: "아닙니다. 타임스탬프는 UTC 기준 에포크부터의 경과량입니다. 시간대는 같은 시점을 사람이 읽는 현지 날짜로 표시할 때 적용됩니다.",
        },
        {
          question: "변환 결과가 다른 기기와 다를 수 있나요?",
          answer: "UTC ISO 결과는 같은 값에 대해 일관되지만 현지 표시는 기기의 시간대와 관련 데이터 설정에 따라 달라질 수 있습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between 10-digit and 13-digit timestamps?",
          answer: "Near the present era, 10 digits commonly indicate seconds and 13 digits commonly indicate milliseconds. Confirm the unit in the data specification instead of relying only on length.",
        },
        {
          question: "Does a Unix timestamp contain a time zone?",
          answer: "No. It represents elapsed time from the UTC epoch. A time zone is applied only when displaying that instant as a human-readable local date.",
        },
        {
          question: "Can the converted result differ across devices?",
          answer: "The UTC ISO result is consistent for the same value, while the local display can differ according to the device time zone and its supporting data.",
        },
      ],
    },
  },
  {
    slug: "uuid-generator",
    icon: "fingerprint",
    category: "digital",
    title: { ko: "UUID v4 생성기", en: "UUID v4 Generator" },
    short: {
      ko: "암호학적 난수로 표준 UUID v4를 한 번에 최대 100개 생성합니다.",
      en: "Generate up to 100 standard UUID v4 values with cryptographic randomness.",
    },
    description: {
      ko: "브라우저의 암호학적 난수 기능으로 122비트의 무작위 값을 만들고 버전과 변형 비트를 설정해 RFC 9562의 UUID 버전 4 형식으로 출력합니다. 생성은 현재 기기에서만 이루어지며 결과를 서버에 저장하거나 전송하지 않습니다. 충돌 가능성을 매우 낮추는 식별자이지만 비밀값은 아니므로 비밀번호, 세션 토큰, API 키로 사용해서는 안 됩니다.",
      en: "Create 122 random bits with the browser's cryptographic generator, set the required version and variant bits, and format each value as an RFC 9562 UUID version 4. Generation happens only on the current device and results are not stored or sent to our server. UUIDs make collisions extremely unlikely, but they are public identifiers rather than passwords, session tokens, or API keys.",
    },
    guide: {
      ko: [
        "한 번에 생성할 UUID 개수를 1개부터 100개 사이로 입력하세요.",
        "생성 버튼을 눌러 새 UUID v4 목록을 만드세요.",
        "결과를 복사하거나 줄바꿈된 텍스트 파일로 저장하세요.",
      ],
      en: [
        "Enter a batch size from 1 to 100 UUIDs.",
        "Select Generate to create a fresh UUID v4 list.",
        "Copy the output or download it as a line-separated text file.",
      ],
    },
    useCases: {
      ko: [
        "데이터베이스 테스트 레코드 식별자가 필요할 때",
        "분산 시스템의 임시 객체 ID를 만들 때",
        "개발 문서와 목업에 표준 형식의 예시 값을 넣을 때",
      ],
      en: [
        "Creating identifiers for database test records",
        "Assigning temporary object IDs in distributed systems",
        "Adding correctly formatted sample values to technical mockups",
      ],
    },
    keywords: {
      ko: ["UUID 생성기", "UUID v4 만들기", "랜덤 고유 식별자"],
      en: ["UUID generator", "UUID v4 generator", "bulk UUID creator"],
    },
    sources: {
      ko: [{ label: "RFC 9562 UUID 표준", url: "https://www.rfc-editor.org/rfc/rfc9562.html" }],
      en: [{ label: "RFC 9562 UUID standard", url: "https://www.rfc-editor.org/rfc/rfc9562.html" }],
    },
    faqs: {
      ko: [
        {
          question: "UUID v4 형식은 어떤 표준을 따르나요?",
          answer: "현재 UUID 표준인 RFC 9562의 버전 4 배치와 변형 비트를 적용한 8-4-4-4-12 16진수 형식입니다.",
        },
        {
          question: "두 UUID가 같아질 수 있나요?",
          answer: "이론적으로는 가능하지만 안전한 난수로 올바르게 생성한 UUID v4의 충돌 가능성은 매우 낮습니다. 시스템의 위험 수준에 맞는 고유성 검사는 별도로 적용할 수 있습니다.",
        },
        {
          question: "UUID를 로그인 토큰으로 사용해도 되나요?",
          answer: "권장하지 않습니다. UUID는 식별을 위한 공개 값으로 취급하고 인증에는 충분한 엔트로피와 만료, 폐기 정책을 갖춘 전용 보안 토큰을 사용하세요.",
        },
      ],
      en: [
        {
          question: "Which standard defines this UUID v4 format?",
          answer: "It follows the version 4 layout and variant bits in RFC 9562, displayed in the familiar 8-4-4-4-12 hexadecimal form.",
        },
        {
          question: "Can two generated UUIDs ever be identical?",
          answer: "It is theoretically possible, but the collision probability is extremely low when UUID v4 values use secure randomness. Add uniqueness checks when your system's risk model requires them.",
        },
        {
          question: "Can I use a UUID as a login token?",
          answer: "It is not recommended. Treat UUIDs as public identifiers and use purpose-built security tokens with sufficient entropy, expiration, and revocation for authentication.",
        },
      ],
    },
  },
  {
    slug: "fuel-cost-calculator",
    icon: "fuel",
    category: "finance",
    title: { ko: "여행 주유비 계산기", en: "Trip Fuel Cost Calculator" },
    short: {
      ko: "거리, 연비, 연료 단가로 예상 사용량과 여행 주유비를 계산합니다.",
      en: "Estimate trip fuel use and cost from distance, economy, and local price.",
    },
    description: {
      ko: "이동 거리를 km 또는 mi로 받고 L/100km, 미국 MPG, 영국 MPG 방식에 맞춰 예상 연료 사용량을 계산한 뒤 입력한 단가를 곱합니다. 미국 갤런과 영국 갤런의 서로 다른 부피를 구분하며 선택한 통화는 결과 표시에만 사용하고 실시간 환율을 적용하지 않습니다. 입력값은 브라우저에 머물며 실제 비용은 교통, 노면, 공회전, 적재량, 차량 상태와 가격 변동에 따라 달라질 수 있습니다.",
      en: "Accept distance in km or mi, calculate fuel use from L/100km, US MPG, or Imperial MPG, then multiply by the price entered for the matching volume unit. US and Imperial gallons are treated separately, while the selected currency only labels the result and no live exchange rate is applied. Inputs stay in the browser, and actual cost can vary with traffic, roads, idling, load, vehicle condition, and price changes.",
    },
    guide: {
      ko: [
        "여행 거리와 km 또는 mi 단위를 입력하세요.",
        "차량의 연비 표기 방식, 연비, 같은 부피 단위의 연료 가격을 입력하세요.",
        "예상 사용량과 선택한 통화의 비용을 확인하고 여유 예산을 더하세요.",
      ],
      en: [
        "Enter trip distance and choose km or mi.",
        "Select the vehicle's economy format, then enter economy and price for the matching volume unit.",
        "Review estimated fuel use and cost in the selected currency, then add an appropriate contingency.",
      ],
    },
    useCases: {
      ko: [
        "장거리 자동차 여행의 주유 예산을 잡을 때",
        "서로 다른 연비 차량의 예상 비용을 비교할 때",
        "해외 렌터카의 MPG와 갤런 기준을 확인할 때",
      ],
      en: [
        "Budgeting fuel for a long road trip",
        "Comparing estimated cost between vehicles",
        "Checking MPG and gallon conventions for an overseas rental",
      ],
    },
    keywords: {
      ko: ["주유비 계산기", "여행 기름값 계산", "연비 비용 계산"],
      en: ["fuel cost calculator", "trip gas calculator", "MPG trip cost"],
    },
    faqs: {
      ko: [
        {
          question: "L/100km 연비로 사용량을 어떻게 계산하나요?",
          answer: "이동 거리 km에 L/100km 값을 곱한 뒤 100으로 나눕니다. 예를 들어 300km를 8L/100km로 달리면 약 24L입니다.",
        },
        {
          question: "미국 MPG와 영국 MPG는 같은 값인가요?",
          answer: "아닙니다. 미국 갤런과 영국 임페리얼 갤런의 부피가 달라 같은 차량도 숫자가 다르게 표시됩니다. 가격도 선택한 방식의 갤런당 값으로 입력하세요.",
        },
        {
          question: "통화를 바꾸면 환율도 자동 적용되나요?",
          answer: "아닙니다. 통화 선택은 기호와 숫자 형식을 바꿀 뿐입니다. 해당 통화로 표시된 실제 현지 연료 단가를 직접 입력해야 합니다.",
        },
      ],
      en: [
        {
          question: "How is fuel use calculated from L/100km?",
          answer: "Multiply trip distance in kilometers by the L/100km value, then divide by 100. A 300 km trip at 8 L/100km uses about 24 liters.",
        },
        {
          question: "Are US MPG and Imperial MPG the same?",
          answer: "No. US and Imperial gallons have different volumes, so the same vehicle has different numerical ratings. Enter price per gallon for the selected convention.",
        },
        {
          question: "Does changing currency apply a live exchange rate?",
          answer: "No. Currency selection changes only the symbol and number formatting. Enter the actual local fuel price already denominated in that currency.",
        },
      ],
    },
  },
  {
    slug: "typing-speed-test",
    icon: "keyboard",
    category: "writing",
    title: { ko: "한영 타자 속도 테스트", en: "Typing Speed Test" },
    short: {
      ko: "고정 문장을 입력해 WPM, 분당 글자 수와 정확도를 측정합니다.",
      en: "Type a fixed prompt to measure WPM, characters per minute, and accuracy.",
    },
    description: {
      ko: "첫 글자를 입력한 순간부터 경과 시간을 재고 원문과 같은 위치에 정확히 입력한 글자를 셉니다. WPM은 정확한 5글자를 한 단어로 환산하며 한국어 비교에 유용한 분당 글자 수와 입력 정확도도 함께 표시합니다. 입력 내용과 결과는 브라우저에서만 계산되고 서버에 타자 기록을 보내지 않으며 키보드, 언어, 문장 난이도에 따라 결과가 달라질 수 있습니다.",
      en: "Start timing with the first keystroke and count characters that match the prompt at the same position. WPM uses the conventional estimate of five correct characters per word, alongside characters per minute and accuracy. Typed content and results are calculated in the browser and no keystroke record is sent to our server; keyboard, language, and prompt difficulty can affect the score.",
    },
    guide: {
      ko: [
        "30초, 60초, 120초 중 테스트 시간을 선택하세요.",
        "제시된 문장을 보며 입력 영역에 첫 글자부터 직접 타이핑하세요.",
        "완료 후 WPM, 분당 글자 수, 정확도와 경과 시간을 함께 확인하세요.",
      ],
      en: [
        "Choose a 30, 60, or 120 second test.",
        "Read the displayed prompt and type it manually from the first character.",
        "Review WPM, characters per minute, accuracy, and elapsed time together.",
      ],
    },
    useCases: {
      ko: [
        "키보드 연습 전후의 속도 변화를 비교할 때",
        "정확도를 유지하며 입력 속도를 높이는 훈련을 할 때",
        "새 키보드 배열이나 입력 장치에 적응했는지 확인할 때",
      ],
      en: [
        "Comparing speed before and after typing practice",
        "Training to improve pace without sacrificing accuracy",
        "Testing adaptation to a new keyboard layout or input device",
      ],
    },
    keywords: {
      ko: ["타자 속도 테스트", "한글 타자 측정", "분당 타자수"],
      en: ["typing speed test", "WPM test", "typing accuracy test"],
    },
    faqs: {
      ko: [
        {
          question: "WPM은 어떻게 계산하나요?",
          answer: "원문과 같은 위치에 정확히 입력한 글자 수를 5로 나누어 환산 단어 수를 구하고 실제 입력 시간의 분 단위 값으로 나눕니다.",
        },
        {
          question: "한글 타자는 WPM과 분당 글자 중 무엇을 봐야 하나요?",
          answer: "WPM은 언어 간 비교를 위한 공통 추정치이고 분당 글자는 한글 입력량을 더 직관적으로 보여줍니다. 정확도와 세 지표를 함께 보는 것이 좋습니다.",
        },
        {
          question: "붙여넣기로 테스트할 수 있나요?",
          answer: "아닙니다. 실제 입력 속도를 측정하기 위해 테스트 영역의 붙여넣기는 막혀 있습니다. 자동 완성과 입력 보조 기능도 결과에 영향을 줄 수 있습니다.",
        },
      ],
      en: [
        {
          question: "How is WPM calculated?",
          answer: "Correct characters in their matching prompt positions are divided by five to estimate words, then divided by the elapsed time in minutes.",
        },
        {
          question: "Why does the test also show characters per minute?",
          answer: "CPM gives a direct view of correct character output and is especially useful when comparing scripts or languages where conventional word boundaries differ.",
        },
        {
          question: "Can I paste the prompt into the test?",
          answer: "No. Paste is disabled so the result reflects manual typing. Autocomplete and other input assistance can still influence a score.",
        },
      ],
    },
  },
];
