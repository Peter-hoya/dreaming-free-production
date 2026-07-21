import type { Locale } from "@/data/site";

export type InfoSlug = "about" | "editorial" | "privacy" | "terms" | "contact";

interface InfoSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  partnerLink?: boolean;
  contactLink?: boolean;
}

export interface InfoPage {
  title: string;
  intro: string;
  sections: InfoSection[];
}

export const infoPageOrder: InfoSlug[] = ["about", "editorial", "privacy", "terms", "contact"];

export const infoPages: Record<Locale, Record<InfoSlug, InfoPage>> = {
  ko: {
    about: {
      title: "모아툴 소개",
      intro: "복잡한 일상의 계산을 더 빠르고 이해하기 쉽게 만드는 작은 도구 모음입니다.",
      sections: [
        {
          heading: "왜 만들었나요",
          paragraphs: [
            "간단한 계산 하나를 위해 회원가입을 하거나 광고 사이에서 입력창을 찾아야 하는 경험을 줄이고 싶었습니다. 모아툴은 질문을 입력하면 답과 기준을 함께 보여주는 것을 목표로 합니다.",
            "한국어 사용자에게 익숙한 표현과 국제적으로 통용되는 단위를 함께 다루며, 한국어와 영어를 각각 독립된 페이지로 제공합니다.",
          ],
        },
        {
          heading: "우리가 지키는 기준",
          bullets: [
            "도구는 가입 없이 핵심 기능을 사용할 수 있어야 합니다.",
            "계산 결과만 보여주지 않고 공식, 가정, 한계를 설명합니다.",
            "입력 데이터는 가능한 한 브라우저 안에서만 처리합니다.",
            "광고를 기능 버튼처럼 보이게 만들거나 사용을 방해하지 않습니다.",
            "오류 제보를 확인하고 검증 가능한 수정 기록을 남깁니다.",
          ],
        },
        {
          heading: "현재 제공 범위",
          paragraphs: ["일상 계산, 금융 시뮬레이션, 글쓰기, 이미지 처리, 디지털 보조 도구, 짧은 웹 게임과 기존 생활 가이드 아카이브를 제공합니다. 새 도구는 검색량보다 정확하게 유지할 수 있는지와 실제 생활에서 반복 사용되는지를 먼저 검토합니다."],
        },
        {
          heading: "중요한 안내",
          paragraphs: ["모아툴의 결과는 일반적인 정보와 계획을 돕기 위한 참고값입니다. 금융, 의료, 법률, 세무처럼 결과의 영향이 큰 결정은 공식 기관의 자료와 자격을 갖춘 전문가의 조언을 함께 확인하세요."],
        },
      ],
    },
    editorial: {
      title: "콘텐츠와 검수 원칙",
      intro: "도구의 공식과 설명을 어떤 기준으로 작성하고 확인하는지 공개합니다.",
      sections: [
        {
          heading: "작성 원칙",
          bullets: [
            "사용자가 가장 먼저 묻는 질문에 첫 문단에서 직접 답합니다.",
            "공식이나 변환 계수는 국제 표준, 공식 기관, 널리 인정된 1차 자료를 우선합니다.",
            "예시는 결과를 과장하지 않고 사용자가 직접 다시 계산할 수 있게 만듭니다.",
            "한국어와 영어 문장은 각 언어의 검색 의도와 표현에 맞게 별도로 검토합니다.",
          ],
        },
        {
          heading: "도구 검증",
          paragraphs: ["경계값, 0, 음수, 윤년, 큰 수, 잘못된 입력을 포함한 사례를 확인합니다. 브라우저마다 달라질 수 있는 파일 처리와 날짜 계산은 실제 화면에서 다시 테스트합니다."],
        },
        {
          heading: "금융 도구의 범위",
          paragraphs: ["대출과 복리 계산기는 입력한 고정 조건이 계속된다는 가정 아래 예상값을 제공합니다. 세금, 수수료, 보험, 일할 계산, 시장 변동은 실제 결과를 바꿀 수 있으며 투자 수익을 보장하지 않습니다."],
        },
        {
          heading: "업데이트와 수정",
          paragraphs: ["기준이 바뀌거나 오류가 확인되면 관련 계산과 설명을 함께 수정합니다. 중요한 수정은 페이지의 검토일을 갱신합니다. 오류를 발견했다면 문의 페이지에서 입력값, 예상 결과, 실제 결과를 알려주세요."],
        },
        {
          heading: "생활 가이드와 제휴 링크",
          paragraphs: ["이전한 생활 가이드는 원래 작성일과 수정일을 그대로 표시합니다. 가격, 일정, 지원 제도와 신청 절차처럼 바뀔 수 있는 정보에는 최신 공식 안내를 다시 확인하라는 고지를 제공합니다. 일부 글에는 구매 시 운영자에게 수수료가 지급될 수 있는 제휴 링크가 있으며, 해당 링크는 일반 링크와 구분해 검색 엔진에도 제휴 관계를 표시합니다."],
        },
        {
          heading: "자동화 도구 사용",
          paragraphs: ["초안 작성이나 코드 검토에 자동화 도구를 사용할 수 있지만, 공개 전에는 사람이 문장, 공식, 상호작용과 출처를 확인합니다. 도구 이름만 바꾼 대량 페이지나 검토되지 않은 자동 번역 콘텐츠는 게시하지 않습니다."],
        },
      ],
    },
    privacy: {
      title: "개인정보처리방침",
      intro: "모아툴은 필요한 정보만 처리하고, 브라우저 안에서 끝낼 수 있는 작업은 서버로 보내지 않습니다.",
      sections: [
        {
          heading: "브라우저 안에서 처리되는 정보",
          paragraphs: ["도구에 입력한 숫자, 날짜, 텍스트, JSON, 선택지와 타자 연습 내용, 생성한 비밀번호와 QR 코드, 선택한 PDF·이미지 파일은 현재 브라우저에서 처리됩니다. 기본 구현에서는 이 정보를 모아툴 서버로 전송하거나 저장하지 않습니다."],
        },
        {
          heading: "기기에 저장되는 정보",
          paragraphs: ["게임 최고 점수와 같이 다시 방문했을 때 유용한 값은 브라우저의 로컬 저장소에 보관될 수 있습니다. 브라우저 설정에서 사이트 데이터를 삭제하면 함께 사라집니다."],
        },
        {
          heading: "접속 기록과 분석",
          paragraphs: ["운영자가 Google Analytics를 활성화하고 사용자가 분석에 동의한 경우 Google LLC가 페이지 방문, 기기 유형, 대략적인 지역, 성능과 오류 같은 사용 통계를 처리할 수 있습니다. 비밀번호나 도구 입력 내용은 분석 이벤트에 포함하지 않습니다. 보관 기간과 삭제 설정은 실제 Google Analytics 속성 설정에 따르며, 배포 전 운영 설정에 맞게 이 방침을 갱신해야 합니다."],
        },
        {
          heading: "광고와 쿠키",
          paragraphs: ["Google AdSense를 활성화하면 Google과 파트너가 광고 제공, 빈도 조절, 측정과 부정 사용 방지를 위해 쿠키, 웹 비콘, IP 주소 또는 유사 식별자를 사용할 수 있습니다. 필요한 지역에서는 Google이 인증한 동의 관리 플랫폼을 통해 선택권을 제공합니다."],
          partnerLink: true,
        },
        {
          heading: "외부 링크",
          paragraphs: ["모아툴에서 연결한 외부 사이트에는 해당 운영자의 개인정보처리방침이 적용됩니다. 링크된 사이트의 내용이나 데이터 처리 방식은 모아툴이 통제하지 않습니다."],
        },
        {
          heading: "문의와 권리",
          paragraphs: ["개인정보 관련 질문, 열람 또는 삭제 요청은 문의 이메일로 보내주세요. 모아툴이 직접 보관한 정보가 없는 경우 브라우저의 사이트 데이터 삭제 방법을 안내할 수 있습니다."],
          contactLink: true,
        },
      ],
    },
    terms: {
      title: "이용약관",
      intro: "모아툴을 사용하면 아래 조건에 동의한 것으로 봅니다. 중요한 결정에는 공식 자료를 함께 확인하세요.",
      sections: [
        {
          heading: "서비스의 목적",
          paragraphs: ["모아툴은 일상적인 계산, 변환, 작성과 오락을 돕는 정보 서비스입니다. 로그인 없이 제공되며 일부 기능은 브라우저 지원 여부에 따라 달라질 수 있습니다."],
        },
        {
          heading: "결과의 한계",
          paragraphs: ["정확한 계산을 위해 노력하지만 모든 결과의 완전성, 최신성, 특정 목적 적합성을 보장하지 않습니다. 입력 오류, 반올림, 브라우저 차이, 제도 변경으로 결과가 달라질 수 있습니다."],
          bullets: [
            "대출과 복리 결과는 예측이며 금융 조언이 아닙니다.",
            "날짜와 나이 결과는 입력한 달력 날짜와 기준일을 따릅니다.",
            "파일 변환 결과는 원본의 품질과 브라우저 인코더에 따라 달라집니다.",
            "생성한 비밀번호는 사용자가 안전하게 보관하고 계정마다 다르게 사용해야 합니다.",
          ],
        },
        {
          heading: "허용되지 않는 사용",
          bullets: [
            "서비스를 방해하거나 과도한 자동 요청을 보내는 행위",
            "보안 기능을 우회하거나 다른 사용자의 권리를 침해하는 행위",
            "불법 콘텐츠를 생성, 배포 또는 은폐하는 데 도구를 사용하는 행위",
            "모아툴의 콘텐츠를 검색 조작용 대량 페이지에 그대로 복제하는 행위",
          ],
        },
        {
          heading: "변경과 중단",
          paragraphs: ["정확성, 보안, 법적 요구 또는 운영상 필요에 따라 도구를 수정하거나 중단할 수 있습니다. 약관이 중요하게 바뀌면 이 페이지의 검토일과 내용을 갱신합니다."],
        },
        {
          heading: "책임 범위",
          paragraphs: ["관련 법이 허용하는 범위에서 모아툴은 서비스 사용 또는 사용 불가로 생긴 간접 손해나 결과에 책임을 지지 않습니다. 소비자에게 법으로 보장된 권리는 이 약관으로 제한되지 않습니다."],
        },
      ],
    },
    contact: {
      title: "문의",
      intro: "오류 제보, 기능 제안, 개인정보 문의를 받습니다. 가능한 한 구체적으로 알려주세요.",
      sections: [
        {
          heading: "이메일 문의",
          paragraphs: ["아래 이메일 링크를 이용해 문의할 수 있습니다. 개인정보나 생성한 비밀번호, 민감한 금융정보는 보내지 마세요."],
          contactLink: true,
        },
        {
          heading: "오류를 제보할 때",
          bullets: [
            "사용한 도구와 언어 페이지",
            "입력값과 기대한 결과",
            "화면에 표시된 결과 또는 오류 문구",
            "사용한 브라우저와 기기 종류",
          ],
        },
        {
          heading: "답변 범위",
          paragraphs: ["개별 금융, 의료, 법률 상담은 제공하지 않습니다. 도구의 계산 방식, 개인정보 처리, 접근성 문제와 기술 오류에 관한 문의를 우선 확인합니다."],
        },
      ],
    },
  },
  en: {
    about: {
      title: "About MoaTools",
      intro: "A focused collection of small tools that make everyday calculations faster and easier to understand.",
      sections: [
        {
          heading: "Why we built it",
          paragraphs: [
            "A simple calculation should not require an account or a hunt for an input hidden between ads. MoaTools aims to show the answer together with the standard or assumption behind it.",
            "We support familiar Korean contexts and internationally used units, with separate Korean and English pages for clear reading and sharing.",
          ],
        },
        {
          heading: "Our standards",
          bullets: [
            "Core tool functions work without an account.",
            "Results include formulas, assumptions, and limitations where relevant.",
            "Inputs stay in the browser whenever the task can be completed locally.",
            "Ads never imitate controls or interrupt a calculation.",
            "Reported errors are investigated and corrected with a review date.",
          ],
        },
        {
          heading: "What we cover",
          paragraphs: ["The current collection includes everyday calculations, financial projections, writing analysis, image processing, digital utilities, short browser games, and an archive of Korean practical guides. New tools are judged by repeat usefulness and whether we can keep them accurate, not search volume alone."],
        },
        {
          heading: "Important note",
          paragraphs: ["MoaTools results are general references for planning and everyday use. For financial, medical, legal, or tax decisions, also consult an official source and a qualified professional."],
        },
      ],
    },
    editorial: {
      title: "Editorial and Review Policy",
      intro: "How we write, test, and maintain formulas, explanations, and browser tools.",
      sections: [
        {
          heading: "Writing principles",
          bullets: [
            "Answer the user's main question directly in the opening text.",
            "Prefer international standards, public authorities, and recognized primary sources for formulas and conversion factors.",
            "Use examples that a reader can reproduce without inflated claims.",
            "Review Korean and English copy separately for natural language and local search intent.",
          ],
        },
        {
          heading: "Tool testing",
          paragraphs: ["We check typical inputs along with boundaries, zero, negative values, leap years, large numbers, and invalid input. File processing and date behavior are retested in a real browser because browser implementations can differ."],
        },
        {
          heading: "Financial tool scope",
          paragraphs: ["Loan and compound growth tools project results under constant input assumptions. Taxes, fees, insurance, daily accrual, market changes, and losses can change actual outcomes. No projected return is guaranteed."],
        },
        {
          heading: "Updates and corrections",
          paragraphs: ["When a standard changes or an error is confirmed, we update the calculation and its explanation together. Material changes receive a new review date. To report an issue, include the input, expected result, and displayed result."],
        },
        {
          heading: "Korean guides and affiliate links",
          paragraphs: ["Migrated Korean guides retain their original publication and modification dates. Pages covering prices, schedules, public programs, or application steps tell readers to confirm current official guidance. Some articles contain affiliate links that may earn the operator a commission after a qualifying purchase; those links are marked as sponsored for search engines."],
        },
        {
          heading: "Use of automated tools",
          paragraphs: ["Automated tools may help with drafting or code review, but a person checks wording, formulas, interactions, and sources before publication. We do not publish unreviewed translations or mass pages that only swap a tool name."],
        },
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro: "MoaTools processes only what is needed, and keeps work in your browser whenever possible.",
      sections: [
        {
          heading: "Data processed in your browser",
          paragraphs: ["Numbers, dates, text, JSON, choice lists, typing-practice input, generated passwords and QR contents, and selected PDF or image files are processed in the current browser. The default implementation does not send or store these inputs on a MoaTools server."],
        },
        {
          heading: "Data stored on your device",
          paragraphs: ["Useful return-visit values, such as a game high score, may be saved in browser local storage. They are removed when you clear this site's browser data."],
        },
        {
          heading: "Logs and analytics",
          paragraphs: ["If the operator enables Google Analytics and the visitor consents to analytics, Google LLC may process page visits, device type, approximate region, performance, and error statistics. Passwords and tool input contents are not included in analytics events. Retention and deletion follow the deployed Google Analytics property settings, and this policy must be updated to match those settings before production tracking is enabled."],
        },
        {
          heading: "Advertising and cookies",
          paragraphs: ["If Google AdSense is enabled, Google and its partners may use cookies, web beacons, IP addresses, or similar identifiers for ad delivery, frequency controls, measurement, and abuse prevention. In regions where consent is required, choices are collected through a Google-certified consent management platform."],
          partnerLink: true,
        },
        {
          heading: "External links",
          paragraphs: ["External sites linked from MoaTools apply their own privacy policies. We do not control their content or data practices."],
        },
        {
          heading: "Questions and rights",
          paragraphs: ["Send privacy questions, access requests, or deletion requests to the contact email. When no information is stored by MoaTools, we can explain how to remove local browser data."],
          contactLink: true,
        },
      ],
    },
    terms: {
      title: "Terms of Use",
      intro: "By using MoaTools, you agree to these terms. Confirm important decisions with an official source.",
      sections: [
        {
          heading: "Purpose of the service",
          paragraphs: ["MoaTools provides general information tools for everyday calculations, conversions, writing, and entertainment. Core pages are available without an account, and some functions depend on browser support."],
        },
        {
          heading: "Limits of results",
          paragraphs: ["We work to provide accurate calculations but do not guarantee completeness, currency, or suitability for every purpose. Input mistakes, rounding, browser differences, and changing rules can alter results."],
          bullets: [
            "Loan and compound growth results are projections, not financial advice.",
            "Date and age results follow the entered calendar dates and reference date.",
            "File conversion quality depends on the source file and browser encoder.",
            "Users must store generated passwords safely and use a different one for each account.",
          ],
        },
        {
          heading: "Prohibited use",
          bullets: [
            "Disrupting the service or sending excessive automated requests",
            "Bypassing security features or violating another person's rights",
            "Using a tool to create, distribute, or conceal illegal material",
            "Copying MoaTools content into mass pages intended to manipulate search",
          ],
        },
        {
          heading: "Changes and availability",
          paragraphs: ["We may change or retire a tool for accuracy, security, legal, or operational reasons. Material terms changes will update this page and its review date."],
        },
        {
          heading: "Liability",
          paragraphs: ["To the extent allowed by applicable law, MoaTools is not liable for indirect loss caused by use of or inability to use the service. These terms do not limit consumer rights that cannot be waived by law."],
        },
      ],
    },
    contact: {
      title: "Contact",
      intro: "Send error reports, feature suggestions, and privacy questions. Specific details help us investigate faster.",
      sections: [
        {
          heading: "Email",
          paragraphs: ["Use the email link below. Do not send personal credentials, generated passwords, or sensitive financial information."],
          contactLink: true,
        },
        {
          heading: "Reporting an error",
          bullets: [
            "The tool and language page you used",
            "The entered value and expected result",
            "The displayed result or error message",
            "Your browser and device type",
          ],
        },
        {
          heading: "What we can answer",
          paragraphs: ["We do not provide individual financial, medical, or legal advice. We prioritize questions about tool methods, privacy, accessibility, and technical errors."],
        },
      ],
    },
  },
};

export function isInfoSlug(value: string): value is InfoSlug {
  return infoPageOrder.includes(value as InfoSlug);
}
