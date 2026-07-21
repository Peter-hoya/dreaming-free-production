import type { ToolDefinition } from "@/data/toolTypes";

export const koreanTools: ToolDefinition[] = [
  {
    slug: "salary-converter",
    icon: "wallet",
    category: "finance",
    title: { ko: "연봉 월급 시급 변환기", en: "Korean Salary Converter" },
    short: {
      ko: "연봉, 월급, 시급을 바꾸고 사용자 공제율로 예상 수령액을 계산합니다.",
      en: "Convert annual, monthly, and hourly Korean pay with an editable deduction estimate.",
    },
    description: {
      ko: "연봉을 12개월 월급과 월 209시간 기준 시급으로 환산하거나 반대로 계산합니다. 비과세 월액과 사용자가 직접 정한 공제율을 적용해 비교용 예상 수령액도 보여주지만, 국세청 간이세액표를 대신하는 세금 계산기는 아닙니다.",
      en: "Convert Korean annual salary into monthly pay and an hourly equivalent based on 209 hours per month, or convert in the other direction. An editable deduction rate and monthly non-taxable amount provide a planning estimate, not an official payroll tax result.",
    },
    guide: {
      ko: ["기준이 될 연봉, 월급 또는 시급을 선택하세요.", "금액과 비과세 월액, 비교용 공제율을 입력하세요.", "세전 환산액과 예상 공제 후 금액을 함께 비교하세요."],
      en: ["Choose annual, monthly, or hourly pay as the starting point.", "Enter the amount, monthly non-taxable pay, and a planning deduction rate.", "Compare gross equivalents with the editable net estimate."],
    },
    useCases: {
      ko: ["채용 제안의 연봉과 월급을 비교할 때", "시급 근무를 월급 기준으로 환산할 때", "공제율별 생활비 예산을 잡을 때"],
      en: ["Comparing Korean job offers", "Converting hourly work into monthly pay", "Testing a take-home budget at different deduction rates"],
    },
    keywords: {
      ko: ["연봉 계산기", "월급 계산기", "시급 계산기"],
      en: ["Korean salary converter", "annual to monthly salary", "Korea hourly pay calculator"],
    },
    faqs: {
      ko: [
        { question: "월 209시간은 무엇인가요?", answer: "주 40시간 근무와 유급 주휴 시간을 월평균으로 환산할 때 흔히 쓰는 기준입니다. 실제 계약 시간이 다르면 시급 환산 결과도 달라집니다." },
        { question: "예상 수령액이 급여명세서와 같은가요?", answer: "아닙니다. 이 도구는 사용자가 입력한 단일 공제율을 적용한 예산용 값입니다. 소득세, 부양가족, 4대보험 상한과 회사 규정은 별도로 확인하세요." },
        { question: "비과세 금액은 어떻게 반영되나요?", answer: "입력한 월 비과세액은 공제율을 적용할 기준 금액에서 제외합니다. 실제 비과세 인정 여부와 한도는 급여 담당자에게 확인해야 합니다." },
      ],
      en: [
        { question: "Why is 209 hours used?", answer: "It is a common Korean monthly equivalent for a 40-hour workweek plus paid weekly rest time. Your contract may use a different basis." },
        { question: "Will the estimated net pay match a payslip?", answer: "No. It applies one editable planning rate. Income tax tables, dependants, insurance caps, and employer rules require a full payroll calculation." },
        { question: "How is non-taxable pay handled?", answer: "The monthly amount you enter is excluded from the base used for the custom deduction estimate. Confirm actual eligibility with payroll staff." },
      ],
    },
  },
  {
    slug: "severance-pay",
    icon: "coins",
    category: "finance",
    title: { ko: "퇴직금 계산기", en: "Korean Severance Pay Calculator" },
    short: {
      ko: "근속기간과 최근 3개월 임금으로 퇴직금 예상액을 계산합니다.",
      en: "Estimate Korean severance pay from service dates and the prior three months of wages.",
    },
    description: {
      ko: "최근 3개월 임금 총액을 해당 달력 일수로 나눈 1일 평균임금과 1일 통상임금을 비교한 뒤, 더 높은 기준에 30일과 근속일수 비율을 적용합니다. 실제 산정에는 상여금, 연차수당, 제외기간, 재직 형태가 영향을 줄 수 있습니다.",
      en: "Estimate severance using the higher of average daily wage for the prior three calendar months and entered ordinary daily wage, multiplied by 30 and the service-day ratio. Bonuses, unused leave, excluded periods, and eligibility can change the official amount.",
    },
    guide: {
      ko: ["입사일과 퇴사일을 입력하세요.", "최근 3개월 임금 총액과 그 기간의 달력 일수를 확인하세요.", "통상임금 비교값과 산식, 예상액을 검토하세요."],
      en: ["Enter employment start and end dates.", "Enter total eligible wages and calendar days for the prior three months.", "Review the wage basis, formula, and estimate."],
    },
    useCases: {
      ko: ["퇴사 전 예상 정산액을 확인할 때", "회사 계산 내역의 산식을 이해할 때", "상여금 반영 전후를 비교할 때"],
      en: ["Planning finances before leaving a Korean job", "Understanding an employer calculation", "Comparing wage totals with and without eligible additions"],
    },
    keywords: {
      ko: ["퇴직금 계산기", "평균임금 계산", "퇴직금 예상액"],
      en: ["Korean severance calculator", "Korea retirement pay", "average daily wage"],
    },
    sources: {
      ko: [{ label: "고용노동부 퇴직금 계산 안내", url: "https://www.moel.go.kr/retirementpayCal.do" }],
      en: [{ label: "Korean Ministry of Employment and Labor severance guide", url: "https://www.moel.go.kr/retirementpayCal.do" }],
    },
    faqs: {
      ko: [
        { question: "누구나 퇴직금을 받을 수 있나요?", answer: "일반적으로 계속근로 1년 이상이고 4주 평균 주 소정근로시간이 15시간 이상인 근로자가 대상이지만, 개별 계약과 법적 판단은 고용노동부 기준을 확인하세요." },
        { question: "최근 3개월은 90일인가요?", answer: "항상 90일은 아닙니다. 퇴직 전 3개월에 해당하는 실제 달력 일수를 사용하므로 월 구성에 따라 달라집니다." },
        { question: "상여금과 연차수당도 넣나요?", answer: "법정 기준에 따라 일정 부분이 평균임금에 포함될 수 있습니다. 이 도구에는 반영할 금액을 임금 총액에 포함해 비교하고 공식 계산기로 다시 확인하세요." },
      ],
      en: [
        { question: "Is every worker eligible?", answer: "A common rule is at least one year of continuous service and an average of 15 or more scheduled weekly hours, but the Ministry of Employment and Labor should confirm individual eligibility." },
        { question: "Are the prior three months always 90 days?", answer: "No. Use the actual calendar-day count in the three-month period before separation." },
        { question: "Do bonuses and unused leave count?", answer: "Eligible portions may affect average wage. Include the amount you want to compare, then confirm the official treatment." },
      ],
    },
  },
  {
    slug: "four-major-insurance",
    icon: "shield",
    category: "finance",
    title: { ko: "4대보험 계산기", en: "Korean Social Insurance Calculator" },
    short: {
      ko: "2026년 근로자 기준 국민연금, 건강보험, 장기요양, 고용보험을 추정합니다.",
      en: "Estimate 2026 Korean employee pension, health, long-term care, and employment insurance.",
    },
    description: {
      ko: "2026년 7월 검토 기준으로 국민연금 근로자 4.75%, 건강보험 3.595%, 장기요양보험의 건강보험료 연동 비율, 고용보험 근로자 0.9%를 적용합니다. 보수월액 상하한, 원 단위 절사, 사업장 조건에 따라 실제 고지액은 달라질 수 있습니다.",
      en: "Use reviewed 2026 employee rates for National Pension, health insurance, long-term care linked to the health premium, and employment insurance. Monthly-base caps, rounding, workplace conditions, and official notices can change the billed amount.",
    },
    guide: {
      ko: ["월 과세 보수액을 입력하세요.", "2026년 기준일과 적용 요율을 확인하세요.", "항목별 근로자 부담액과 합계를 급여명세서와 비교하세요."],
      en: ["Enter monthly taxable remuneration.", "Check the displayed 2026 basis date and rates.", "Compare each employee contribution and the total with payroll records."],
    },
    useCases: {
      ko: ["월급 공제액을 미리 가늠할 때", "급여명세서의 보험 항목을 확인할 때", "보수 변경 전후 부담액을 비교할 때"],
      en: ["Planning Korean payroll deductions", "Checking social-insurance lines on a payslip", "Comparing contributions before and after a pay change"],
    },
    keywords: {
      ko: ["4대보험 계산기", "2026 국민연금 계산", "건강보험료 계산"],
      en: ["Korea social insurance calculator", "2026 Korean pension rate", "Korean payroll insurance"],
    },
    sources: {
      ko: [
        { label: "국민연금공단 2026년 보험료 안내", url: "https://www.nps.or.kr/pnsgdnc/newgdnc/getOHAE0001M1.do?pstId=ZZ202600000000000147" },
        { label: "국민건강보험 2026년 보험료율 안내", url: "https://edi.nhis.or.kr/portal/images/popup/20251204_pop01longdesc.html" },
        { label: "국민건강보험 월별 보험료 상하한 고시", url: "https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39&SEQ_HISTORY=593928" },
      ],
      en: [
        { label: "National Pension Service 2026 contribution notice", url: "https://www.nps.or.kr/pnsgdnc/newgdnc/getOHAE0001M1.do?pstId=ZZ202600000000000147" },
        { label: "National Health Insurance 2026 rate notice", url: "https://edi.nhis.or.kr/portal/images/popup/20251204_pop01longdesc.html" },
        { label: "National Health Insurance monthly premium limits", url: "https://www.nhis.or.kr/lm/lmxsrv/law/lawFullContent.do?SEQ=39&SEQ_HISTORY=593928" },
      ],
    },
    faqs: {
      ko: [
        { question: "산재보험은 왜 합계에 없나요?", answer: "산재보험은 업종별 요율이 다르고 일반적으로 사업주가 부담하므로 근로자 예상 공제 합계에 포함하지 않습니다." },
        { question: "국민연금은 모든 월급에 같은 비율인가요?", answer: "기준소득월액의 하한과 상한이 있어 낮거나 높은 보수에서는 단순히 월급에 비율을 곱한 값과 달라질 수 있습니다." },
        { question: "언제 요율을 다시 확인해야 하나요?", answer: "보험료율과 상하한은 연도 중에도 시행 시점이 다를 수 있습니다. 새 급여명세서를 받거나 해가 바뀌면 각 공단 공지를 확인하세요." },
      ],
      en: [
        { question: "Why is workers compensation excluded?", answer: "Its rate varies by industry and is generally employer-paid, so it is not included in the employee deduction total." },
        { question: "Is pension always a flat share of salary?", answer: "No. The pension remuneration base has lower and upper limits, so very low or high pay can produce a different effective rate." },
        { question: "When should I recheck the rates?", answer: "Rates and base limits can have different effective dates. Recheck agency notices when the year or your payslip changes." },
      ],
    },
  },
  {
    slug: "weekly-holiday-pay",
    icon: "clock",
    category: "finance",
    title: { ko: "주휴수당 계산기", en: "Korean Weekly Holiday Pay Calculator" },
    short: {
      ko: "시급과 소정근로시간으로 주휴수당과 예상 주급을 계산합니다.",
      en: "Estimate Korean paid weekly rest allowance from hourly pay and scheduled hours.",
    },
    description: {
      ko: "4주 평균 주 소정근로시간 15시간 이상과 소정근로일 개근을 전제로, 주 40시간·5일제 사업장의 ‘주 소정근로시간 ÷ 40 × 8’ 비례식을 적용해 주휴수당을 추정합니다. 근로형태와 계약 구조에 따라 실제 법정 산식은 달라질 수 있습니다.",
      en: "Estimate paid weekly rest allowance when average scheduled hours are at least 15 per week and scheduled workdays were completed. The tool uses scheduled weekly hours divided by 40, multiplied by 8, for a standard 40-hour, five-day workplace; individual arrangements can require a different legal calculation.",
    },
    guide: {
      ko: ["시급과 주 소정근로일, 주 소정근로시간을 입력하세요.", "소정근로일 개근 여부를 선택하세요.", "주휴 유급시간과 예상 주휴수당을 확인하세요."],
      en: ["Enter hourly pay, scheduled days, and total scheduled weekly hours.", "Confirm whether scheduled workdays were completed.", "Review the paid-rest hours and estimated allowance."],
    },
    useCases: {
      ko: ["아르바이트 급여를 확인할 때", "근무시간 변경 전 주급을 비교할 때", "2026년 최저임금과 시급을 비교할 때"],
      en: ["Checking part-time pay in Korea", "Comparing weekly pay after a schedule change", "Reviewing pay against the 2026 Korean minimum wage"],
    },
    keywords: {
      ko: ["주휴수당 계산기", "알바 주급 계산", "2026 최저임금"],
      en: ["Korean weekly holiday pay", "Korea part-time pay calculator", "2026 Korean minimum wage"],
    },
    sources: {
      ko: [
        { label: "고용노동부 주휴수당 상담 안내", url: "https://1350.moel.go.kr/rtmview.do?id=1000059852" },
        { label: "최저임금위원회", url: "https://www.minimumwage.go.kr/" },
      ],
      en: [
        { label: "Korean labor guidance on paid weekly rest", url: "https://1350.moel.go.kr/rtmview.do?id=1000059852" },
        { label: "Korean Minimum Wage Commission", url: "https://www.minimumwage.go.kr/" },
      ],
    },
    faqs: {
      ko: [
        { question: "주 15시간 미만이면 주휴수당이 없나요?", answer: "일반적으로 4주 평균 주 소정근로시간이 15시간 미만이면 적용 대상에서 제외됩니다. 근로계약과 예외 여부는 고용노동부에 확인하세요." },
        { question: "2026년 최저임금은 얼마인가요?", answer: "이 도구의 참고값은 시간당 10,320원입니다. 실제 적용 시점과 업종 예외는 최저임금위원회 공지를 확인하세요." },
        { question: "근무일수로 나눈 하루 시간과 다른 이유는 무엇인가요?", answer: "이 도구는 주 40시간·5일제 사업장을 전제로 주 소정근로시간에 비례하는 산식을 사용합니다. 교대제나 특수한 계약은 고용노동부에 별도로 확인하세요." },
      ],
      en: [
        { question: "What if I work under 15 hours a week?", answer: "A common rule excludes schedules averaging under 15 hours a week over four weeks. Confirm your contract and exceptions with the labor authority." },
        { question: "What is the 2026 Korean minimum wage?", answer: "The reference used here is KRW 10,320 per hour. Check the Minimum Wage Commission for effective dates and exceptions." },
        { question: "Why not simply divide hours by workdays?", answer: "This tool uses a weekly-hours proportional formula for a standard 40-hour, five-day workplace. Shift work and special contracts should be checked with the labor authority." },
      ],
    },
  },
  {
    slug: "vat-calculator",
    icon: "receipt",
    category: "finance",
    title: { ko: "부가세 계산기", en: "VAT Calculator" },
    short: {
      ko: "공급가액과 10% 부가세, 합계금액을 양방향으로 계산합니다.",
      en: "Split or add Korean 10% VAT for quotes and invoices.",
    },
    description: {
      ko: "부가세 별도 공급가액에 10%를 더하거나, 부가세 포함 합계금액을 공급가액과 세액으로 나눕니다. 수량과 원 단위 처리 방식을 선택할 수 있으며 간이과세자의 신고세액을 계산하는 도구는 아닙니다.",
      en: "Add 10% Korean VAT to a supply amount or split a tax-inclusive total into supply value and VAT. Quantity and won-rounding options are included, but this is not a tax-return calculator for simplified businesses.",
    },
    guide: {
      ko: ["부가세 별도 또는 포함 금액을 선택하세요.", "단가, 수량, 원 단위 처리 방식을 입력하세요.", "공급가액, 세액, 최종 합계를 복사하세요."],
      en: ["Choose tax-exclusive or tax-inclusive input.", "Enter price, quantity, and the won-rounding method.", "Copy the supply value, VAT, and final total."],
    },
    useCases: {
      ko: ["견적서에 부가세를 더할 때", "세금계산서 합계를 공급가액과 나눌 때", "수량별 거래 합계를 확인할 때"],
      en: ["Adding Korean VAT to a quote", "Splitting an invoice total", "Checking totals for multiple items"],
    },
    keywords: {
      ko: ["부가세 계산기", "공급가액 계산", "부가세 포함 계산"],
      en: ["Korean VAT calculator", "10 percent VAT", "VAT inclusive calculator"],
    },
    sources: {
      ko: [{ label: "국세청 부가가치세 안내", url: "https://i.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2401" }],
      en: [{ label: "National Tax Service VAT guidance", url: "https://i.nts.go.kr/nts/cm/cntnts/cntntsView.do?cntntsId=7693&mi=2401" }],
    },
    faqs: {
      ko: [
        { question: "부가세 포함 금액은 어떻게 나누나요?", answer: "일반적인 10% 과세 거래에서는 합계금액을 1.1로 나눈 값이 공급가액이고 나머지가 부가세입니다." },
        { question: "반올림 때문에 1원이 달라질 수 있나요?", answer: "네. 품목별 계산과 합계 계산의 순서, 절사 또는 반올림 규칙에 따라 소액 차이가 생길 수 있습니다." },
        { question: "모든 거래에 10%가 적용되나요?", answer: "아닙니다. 영세율, 면세, 간이과세 등은 다르게 처리될 수 있으므로 거래 유형을 확인하세요." },
      ],
      en: [
        { question: "How is an inclusive amount split?", answer: "For a standard 10% taxable transaction, divide the total by 1.1 for supply value and treat the remainder as VAT." },
        { question: "Can rounding create a one-won difference?", answer: "Yes. Item-level versus total-level calculation and rounding rules can produce a small difference." },
        { question: "Does every Korean transaction use 10%?", answer: "No. Zero-rated, exempt, and simplified-tax transactions can be treated differently." },
      ],
    },
  },
  {
    slug: "pyeong-calculator",
    icon: "house",
    category: "daily",
    title: { ko: "평수 계산기", en: "Pyeong Area Calculator" },
    short: {
      ko: "제곱미터와 평을 변환하고 가로와 세로로 면적을 계산합니다.",
      en: "Convert square meters and Korean pyeong, or calculate area from dimensions.",
    },
    description: {
      ko: "1평을 약 3.305785제곱미터로 적용해 아파트, 사무실, 토지 면적을 양방향 변환합니다. 가로와 세로 길이를 입력해 제곱미터와 평을 동시에 구할 수도 있습니다.",
      en: "Convert property area using one pyeong as approximately 3.305785 square meters. Width and length inputs can also produce both square-meter and pyeong results.",
    },
    guide: {
      ko: ["제곱미터, 평, 가로와 세로 중 입력 방식을 고르세요.", "면적 또는 길이를 입력하세요.", "변환값과 자주 쓰는 면적 비교를 확인하세요."],
      en: ["Choose square meters, pyeong, or width and length.", "Enter an area or dimensions.", "Review both converted units and the formula."],
    },
    useCases: {
      ko: ["부동산 매물의 전용면적을 평으로 볼 때", "방 크기를 가로와 세로로 잴 때", "인테리어 견적 면적을 확인할 때"],
      en: ["Reading Korean property listings", "Measuring a room", "Checking an interior quote area"],
    },
    keywords: {
      ko: ["평수 계산기", "제곱미터 평 변환", "아파트 평수"],
      en: ["pyeong calculator", "square meter to pyeong", "Korean apartment size"],
    },
    faqs: {
      ko: [
        { question: "1평은 몇 제곱미터인가요?", answer: "이 도구는 1평을 약 3.305785제곱미터로 계산합니다." },
        { question: "공급면적과 전용면적은 같은가요?", answer: "아닙니다. 전용면적은 실제 독립 사용 공간이고 공급면적에는 공용면적 일부가 포함될 수 있으므로 같은 단위라도 기준을 확인하세요." },
        { question: "가로와 세로는 어떤 단위인가요?", answer: "미터 단위로 입력합니다. 센티미터로 잰 값은 100으로 나눈 뒤 입력하세요." },
      ],
      en: [
        { question: "How many square meters are in one pyeong?", answer: "This tool uses approximately 3.305785 square meters per pyeong." },
        { question: "Are gross and exclusive areas the same?", answer: "No. Korean listings can include shared space in gross area, while exclusive area refers to independently used space." },
        { question: "Which unit should dimensions use?", answer: "Enter width and length in meters. Divide centimeter measurements by 100 first." },
      ],
    },
  },
  {
    slug: "real-estate-brokerage-fee",
    icon: "buildings",
    category: "finance",
    title: { ko: "부동산 중개보수 계산기", en: "Korean Brokerage Fee Calculator" },
    short: {
      ko: "서울 주택 기준 매매와 임대차 중개보수 상한을 추정합니다.",
      en: "Estimate Seoul residential brokerage-fee ceilings for sales and leases.",
    },
    description: {
      ko: "2026년 7월 검토한 서울특별시 주택 중개보수 상한 요율을 적용합니다. 월세 거래금액은 보증금과 월세 환산액을 합산하고, 입력한 협의 요율이 상한을 넘지 않도록 비교합니다. 지역, 주택 외 부동산, 부가세 여부에 따라 실제 금액은 달라집니다.",
      en: "Apply Seoul residential brokerage-fee ceiling brackets reviewed in July 2026. Monthly rent is converted into a deemed transaction value, and a negotiated rate is checked against the ceiling. Other regions, property types, and VAT treatment can differ.",
    },
    guide: {
      ko: ["매매, 전세, 월세 중 거래 유형을 선택하세요.", "거래금액과 협의 요율을 입력하세요.", "적용 상한 요율, 한도액, 예상 보수를 확인하세요."],
      en: ["Choose sale, jeonse, or monthly rent.", "Enter transaction values and the negotiated rate.", "Review the bracket ceiling, cap, and estimated fee."],
    },
    useCases: {
      ko: ["서울에서 이사 비용을 잡을 때", "계약 전 중개보수 상한을 확인할 때", "월세의 환산 거래금액을 이해할 때"],
      en: ["Budgeting a move in Seoul", "Checking a fee ceiling before signing", "Understanding monthly-rent transaction value"],
    },
    keywords: {
      ko: ["부동산 중개보수 계산기", "서울 복비 계산", "월세 중개수수료"],
      en: ["Seoul brokerage fee calculator", "Korean realtor fee", "Korea rental commission"],
    },
    sources: {
      ko: [{ label: "서울부동산정보광장 중개보수 안내", url: "https://land.seoul.go.kr/land/broker/brokerageCommission.do" }],
      en: [{ label: "Seoul real-estate brokerage commission guide", url: "https://land.seoul.go.kr/land/broker/brokerageCommission.do" }],
    },
    faqs: {
      ko: [
        { question: "상한요율은 반드시 내야 하는 고정요율인가요?", answer: "아닙니다. 상한 안에서 중개의뢰인과 개업공인중개사가 협의할 수 있습니다." },
        { question: "월세 거래금액은 어떻게 계산하나요?", answer: "일반적으로 보증금에 월세의 100배를 더하고, 그 결과가 5천만원 미만이면 월세의 70배를 더하는 방식을 사용합니다." },
        { question: "부가세가 포함된 금액인가요?", answer: "표시된 중개보수와 부가세는 별도일 수 있습니다. 중개업자의 과세 유형과 계약서를 확인하세요." },
      ],
      en: [
        { question: "Is the ceiling a mandatory fixed rate?", answer: "No. The client and licensed broker can negotiate at or below the legal ceiling." },
        { question: "How is monthly rent converted?", answer: "A common rule adds deposit and 100 times monthly rent, using 70 times rent when that result is under KRW 50 million." },
        { question: "Does the estimate include VAT?", answer: "Brokerage remuneration and VAT may be separate. Check the broker's tax status and contract." },
      ],
    },
  },
  {
    slug: "appliance-energy-cost",
    icon: "lightning",
    category: "daily",
    title: { ko: "가전제품 전기요금 계산기", en: "Appliance Energy Cost Calculator" },
    short: {
      ko: "소비전력과 사용시간으로 전력사용량과 예상 비용을 계산합니다.",
      en: "Estimate appliance energy use and cost from watts and running time.",
    },
    description: {
      ko: "제품 소비전력, 하루 사용시간, 사용일수, 대수와 사용자가 입력한 kWh당 단가로 소비전력량과 예상 비용을 계산합니다. 누진제, 기후환경요금, 연료비조정액, 할인과 세금이 포함된 한국전력 최종 청구액 계산기는 아닙니다.",
      en: "Calculate kilowatt-hours and estimated cost from appliance wattage, daily use, days, quantity, and an editable price per kWh. It does not reproduce KEPCO tiered billing, adjustments, discounts, taxes, or the final household bill.",
    },
    guide: {
      ko: ["제품 라벨의 소비전력 W를 입력하세요.", "하루 사용시간, 일수, 대수와 kWh당 단가를 입력하세요.", "총 kWh와 제품별 예상 비용을 확인하세요."],
      en: ["Enter wattage from the appliance label.", "Add daily hours, days, quantity, and price per kWh.", "Review total kWh and estimated running cost."],
    },
    useCases: {
      ko: ["에어컨 사용시간별 비용을 비교할 때", "새 가전의 월 전력량을 가늠할 때", "대기전력 절감 효과를 확인할 때"],
      en: ["Comparing air-conditioner schedules", "Estimating a new appliance's monthly use", "Checking potential standby-power savings"],
    },
    keywords: {
      ko: ["전기요금 계산기", "가전 소비전력 계산", "kWh 계산"],
      en: ["appliance electricity cost", "kWh calculator", "wattage cost calculator"],
    },
    sources: {
      ko: [{ label: "한국전력 전기요금 계산기", url: "https://home.kepco.co.kr/kepco/front/html/CY/J/A/CYJAPP006.html" }],
      en: [{ label: "KEPCO official electricity bill calculator", url: "https://home.kepco.co.kr/kepco/front/html/CY/J/A/CYJAPP006.html" }],
    },
    faqs: {
      ko: [
        { question: "kWh는 어떻게 계산하나요?", answer: "소비전력 W에 사용시간과 대수를 곱하고 1,000으로 나누면 kWh가 됩니다." },
        { question: "왜 실제 전기요금과 다른가요?", answer: "가정용 청구액은 누진 구간, 계절, 각종 조정액, 부가세, 전력기금과 할인에 따라 달라지기 때문입니다." },
        { question: "제품의 W 값은 항상 일정한가요?", answer: "아닙니다. 인버터 제품이나 온도 제어 제품은 작동 상태에 따라 소비전력이 변하므로 결과는 추정값입니다." },
      ],
      en: [
        { question: "How are kWh calculated?", answer: "Multiply watts by running hours and quantity, then divide by 1,000." },
        { question: "Why can the utility bill differ?", answer: "Household bills can include tiers, seasonal rules, adjustments, VAT, funds, and discounts." },
        { question: "Is appliance wattage constant?", answer: "Not always. Inverter and thermostat-controlled devices vary their draw, so the result is an estimate." },
      ],
    },
  },
  {
    slug: "lunar-solar-converter",
    icon: "moon",
    category: "daily",
    title: { ko: "음력 양력 변환기", en: "Korean Lunar Date Converter" },
    short: {
      ko: "한국 음력과 양력 날짜를 양방향으로 변환합니다.",
      en: "Convert dates between the Korean lunar calendar and Gregorian calendar.",
    },
    description: {
      ko: "생일, 기념일, 제례 날짜에 쓰는 한국 음력 날짜와 양력 날짜를 변환합니다. 음력 입력에서는 윤달 여부를 구분하며, 내장 달력 데이터가 지원하는 범위 안에서만 계산합니다.",
      en: "Convert Korean lunar dates used for birthdays, anniversaries, and memorial observances to and from Gregorian dates. Lunar input distinguishes leap months and is limited to the bundled calendar data range.",
    },
    guide: {
      ko: ["양력을 음력으로 또는 음력을 양력으로 선택하세요.", "날짜를 입력하고 음력이라면 윤달 여부를 확인하세요.", "변환된 날짜와 윤달 표시를 확인하세요."],
      en: ["Choose Gregorian-to-lunar or lunar-to-Gregorian.", "Enter the date and mark a lunar leap month when applicable.", "Review the converted date and calendar details."],
    },
    useCases: {
      ko: ["음력 생일의 양력 날짜를 확인할 때", "제사나 기념일 날짜를 변환할 때", "가족 달력의 날짜를 정리할 때"],
      en: ["Finding a Gregorian date for a lunar birthday", "Converting a memorial date", "Organizing a Korean family calendar"],
    },
    keywords: {
      ko: ["음력 양력 변환기", "음력 생일 계산", "윤달 변환"],
      en: ["Korean lunar calendar converter", "lunar birthday Korea", "Korean leap month date"],
    },
    sources: {
      ko: [{ label: "한국천문연구원 생활천문관", url: "https://astro.kasi.re.kr/" }],
      en: [{ label: "Korea Astronomy and Space Science Institute calendar service", url: "https://astro.kasi.re.kr/" }],
    },
    faqs: {
      ko: [
        { question: "윤달은 무엇인가요?", answer: "음력의 계절 차이를 맞추기 위해 특정 해에 추가하는 달입니다. 같은 월 이름이 반복될 수 있어 변환할 때 윤달 여부가 중요합니다." },
        { question: "모든 과거와 미래 날짜를 변환할 수 있나요?", answer: "아닙니다. 내장된 한국 음력 데이터의 지원 범위 밖 날짜는 변환하지 않습니다." },
        { question: "매년 음력 생일의 양력 날짜가 같은가요?", answer: "아닙니다. 음력과 양력의 달 길이와 윤달 구조가 달라 양력 날짜는 해마다 바뀔 수 있습니다." },
      ],
      en: [
        { question: "What is a lunar leap month?", answer: "It is an extra month inserted in some years to keep the lunar calendar aligned with seasons. The leap-month flag matters because a month name can repeat." },
        { question: "Can every historical or future date be converted?", answer: "No. Conversion is restricted to the supported range of the bundled Korean lunar data." },
        { question: "Does a lunar birthday use the same Gregorian date every year?", answer: "No. Different month lengths and leap months cause the Gregorian date to change." },
      ],
    },
  },
  {
    slug: "lotto-number-generator",
    icon: "clover",
    category: "daily",
    title: { ko: "로또 번호 생성기", en: "Korean Lotto Number Generator" },
    short: {
      ko: "1부터 45까지 중복 없는 번호 6개를 안전한 난수로 생성합니다.",
      en: "Generate six unique Korean Lotto 6/45 numbers with secure randomness.",
    },
    description: {
      ko: "포함할 번호와 제외할 번호를 선택한 뒤 1부터 45 사이에서 중복 없이 여섯 개를 뽑습니다. 브라우저의 암호학적 난수를 사용하지만 어떤 조합도 당첨 가능성을 높이지 않으며 오락용입니다.",
      en: "Choose required and excluded values, then draw six unique numbers from 1 through 45 using browser cryptographic randomness. No combination improves the chance of winning, and the tool is for entertainment only.",
    },
    guide: {
      ko: ["원하면 포함 번호와 제외 번호를 입력하세요.", "생성할 게임 수를 선택하세요.", "조합을 생성하고 중복이나 조건을 확인하세요."],
      en: ["Optionally enter required and excluded numbers.", "Choose how many lines to generate.", "Generate combinations and review the applied conditions."],
    },
    useCases: {
      ko: ["번호를 무작위로 정하고 싶을 때", "여러 게임 조합을 빠르게 만들 때", "자주 고른 번호를 포함해 조합할 때"],
      en: ["Choosing Korean Lotto numbers randomly", "Creating several lines quickly", "Including a few personally selected numbers"],
    },
    keywords: {
      ko: ["로또 번호 생성기", "로또 번호 추천", "로또 자동 번호"],
      en: ["Korean lotto number generator", "Lotto 6/45 random numbers", "Korea lottery picker"],
    },
    faqs: {
      ko: [
        { question: "이 번호가 당첨 확률을 높이나요?", answer: "아닙니다. 유효한 모든 6개 조합의 1등 당첨 확률은 같습니다." },
        { question: "같은 줄에 번호가 중복되나요?", answer: "아닙니다. 한 줄 안에서는 1부터 45 사이의 서로 다른 번호 6개만 생성합니다." },
        { question: "생성한 번호가 서버에 저장되나요?", answer: "아닙니다. 번호는 현재 브라우저에서 만들며 서버로 전송하지 않습니다." },
      ],
      en: [
        { question: "Do these numbers improve winning odds?", answer: "No. Every valid six-number combination has the same jackpot probability." },
        { question: "Can a line contain duplicates?", answer: "No. Each line contains six different numbers from 1 to 45." },
        { question: "Are generated numbers stored on a server?", answer: "No. They are created in the current browser and are not sent to our server." },
      ],
    },
  },
];
