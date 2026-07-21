"use client";

import KoreanLunarCalendar from "korean-lunar-calendar";
import { useMemo, useState, type ReactNode } from "react";

type WidgetProps = { slug: string; locale: string };

const DAY_MS = 86_400_000;
const MINIMUM_WAGE_2026 = 10_320;
const MAX_MONEY_INPUT = 1_000_000_000_000_000;
const MAX_RATE_INPUT = 1_000_000_000;

function isKo(locale: string) {
  return locale.toLowerCase().startsWith("ko");
}

function t(locale: string, korean: string, english: string) {
  return isKo(locale) ? korean : english;
}

function localeTag(locale: string) {
  return isKo(locale) ? "ko-KR" : "en-US";
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, locale: string, maxDigits = 0) {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: maxDigits,
  }).format(value);
}

function formatWon(value: number, locale: string) {
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (
    date.getUTCFullYear() !== Number(match[1]) ||
    date.getUTCMonth() !== Number(match[2]) - 1 ||
    date.getUTCDate() !== Number(match[3])
  ) return null;
  return date;
}

function parseLunarDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1000 || year > 2050 || month < 1 || month > 12 || day < 1 || day > 30) return null;
  return { year, month, day };
}

async function copyText(value: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Copy failed");
}

function ToolFrame({ locale, title, description, children }: {
  locale: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="tool-widget" aria-labelledby="korean-tool-widget-title">
      <header className="tool-widget__header">
        <p className="tool-widget__eyebrow">
          {t(locale, "기기에서 바로 계산", "Private, on-device utility")}
        </p>
        <h2 id="korean-tool-widget-title">{title}</h2>
        <p>{description}</p>
      </header>
      <div className="tool-widget__body">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="tool-field">
      <span className="tool-field__label">{label}</span>
      {children}
      {hint ? <span className="tool-field__hint">{hint}</span> : null}
    </label>
  );
}

function ErrorMessage({ children }: { children?: ReactNode }) {
  return children ? <p className="tool-error" role="alert">{children}</p> : null;
}

function ResultPanel({ label, primary, children }: {
  label: string;
  primary: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="tool-result" aria-live="polite" aria-atomic="true">
      <span className="tool-result__label">{label}</span>
      <strong className="tool-result__primary">{primary}</strong>
      {children}
    </div>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="tool-actions">{children}</div>;
}

function CopyButton({ value, locale }: { value: string; locale: string }) {
  const [copiedValue, setCopiedValue] = useState("");
  return (
    <button
      className="tool-button tool-button--secondary"
      type="button"
      disabled={!value}
      onClick={() => void copyText(value).then(() => setCopiedValue(value)).catch(() => setCopiedValue(""))}
      aria-live="polite"
    >
      {value && copiedValue === value ? t(locale, "복사됨", "Copied") : t(locale, "결과 복사", "Copy result")}
    </button>
  );
}

function ResetButton({ locale, onClick }: { locale: string; onClick: () => void }) {
  return <button className="tool-button tool-button--ghost" type="button" onClick={onClick}>{t(locale, "초기화", "Reset")}</button>;
}

function SalaryConverter({ locale }: { locale: string }) {
  const [basis, setBasis] = useState<"annual" | "monthly" | "hourly">("annual");
  const [amount, setAmount] = useState("42000000");
  const [nonTaxable, setNonTaxable] = useState("200000");
  const [deductionRate, setDeductionRate] = useState("12");

  const calculation = useMemo(() => {
    const rawAmount = parseNumber(amount);
    const exempt = parseNumber(nonTaxable);
    const rate = parseNumber(deductionRate);
    if (rawAmount === null || exempt === null || rate === null) return { error: t(locale, "모든 칸에 숫자를 입력해 주세요.", "Enter a number in every field."), value: null };
    if (rawAmount < 0 || exempt < 0 || rate < 0 || rate > 100) return { error: t(locale, "금액은 0 이상, 공제율은 0%에서 100% 사이여야 합니다.", "Amounts must be non-negative and the deduction rate must be from 0% to 100%."), value: null };
    if (rawAmount > MAX_MONEY_INPUT || exempt > MAX_MONEY_INPUT) return { error: t(locale, "금액이 너무 큽니다. 원 단위 입력인지 확인해 주세요.", "An amount is too large. Check that the value is entered in KRW."), value: null };
    const annual = basis === "annual" ? rawAmount : basis === "monthly" ? rawAmount * 12 : rawAmount * 209 * 12;
    const monthly = annual / 12;
    const hourly = monthly / 209;
    const estimatedDeduction = Math.max(0, monthly - exempt) * rate / 100;
    return { error: "", value: { annual, monthly, hourly, estimatedDeduction, takeHome: monthly - estimatedDeduction } };
  }, [amount, basis, deductionRate, locale, nonTaxable]);

  const summary = calculation.value
    ? `${t(locale, "연봉", "Annual")}: ${formatWon(calculation.value.annual, locale)}\n${t(locale, "월급", "Monthly")}: ${formatWon(calculation.value.monthly, locale)}\n${t(locale, "시급", "Hourly")}: ${formatWon(calculation.value.hourly, locale)}\n${t(locale, "월 예상 수령액", "Estimated monthly take-home")}: ${formatWon(calculation.value.takeHome, locale)}`
    : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "연봉, 월급, 시급 변환기", "Korean salary converter")} description={t(locale, "연봉과 월급, 시급을 209시간 기준으로 바꾸고 사용자 공제율로 월 예상 수령액을 계산합니다.", "Convert annual, monthly, and hourly pay using 209 monthly hours, then estimate take-home pay with your own deduction rate.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "입력 기준", "Input basis")}>
          <select className="tool-select" value={basis} onChange={(event) => setBasis(event.target.value as typeof basis)}>
            <option value="annual">{t(locale, "연봉", "Annual salary")}</option>
            <option value="monthly">{t(locale, "월급", "Monthly salary")}</option>
            <option value="hourly">{t(locale, "시급", "Hourly wage")}</option>
          </select>
        </Field>
        <Field label={t(locale, "세전 금액 (원)", "Gross amount (KRW)")}>
          <input className="tool-input" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
        </Field>
        <Field label={t(locale, "월 비과세액 (원)", "Monthly non-taxable amount (KRW)")}>
          <input className="tool-input" inputMode="decimal" value={nonTaxable} onChange={(event) => setNonTaxable(event.target.value)} />
        </Field>
        <Field label={t(locale, "사용자 공제율 (%)", "Custom deduction rate (%)")}>
          <input className="tool-input" inputMode="decimal" value={deductionRate} onChange={(event) => setDeductionRate(event.target.value)} />
        </Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel label={t(locale, "월 예상 수령액", "Estimated monthly take-home")} primary={calculation.value ? formatWon(calculation.value.takeHome, locale) : "-"}>
        {calculation.value ? <div className="tool-stat-grid">
          <span><b>{formatWon(calculation.value.annual, locale)}</b>{t(locale, "세전 연봉", "gross annual")}</span>
          <span><b>{formatWon(calculation.value.monthly, locale)}</b>{t(locale, "세전 월급", "gross monthly")}</span>
          <span><b>{formatWon(calculation.value.hourly, locale)}</b>{t(locale, "209시간 기준 시급", "hourly at 209 hours")}</span>
          <span><b>{formatWon(calculation.value.estimatedDeduction, locale)}</b>{t(locale, "사용자 설정 월 공제액", "custom monthly deduction")}</span>
        </div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "실제 세금과 4대보험을 계산하지 않는 단순 추정치입니다. 급여명세서와 공식 계산 결과를 확인하세요.", "This is a simple estimate, not an exact tax or social-insurance calculation. Check your payslip and official results.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setBasis("annual"); setAmount("42000000"); setNonTaxable("200000"); setDeductionRate("12"); }} /></Actions>
    </ToolFrame>
  );
}

function SeverancePayCalculator({ locale }: { locale: string }) {
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2026-01-01");
  const [wageTotal, setWageTotal] = useState("9000000");
  const [periodDays, setPeriodDays] = useState("92");
  const [ordinaryDailyWage, setOrdinaryDailyWage] = useState("");

  const calculation = useMemo(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    const wages = parseNumber(wageTotal);
    const days = parseNumber(periodDays);
    const ordinary = ordinaryDailyWage.trim() ? parseNumber(ordinaryDailyWage) : 0;
    if (!start || !end || wages === null || days === null || ordinary === null) return { error: t(locale, "올바른 날짜와 숫자를 입력해 주세요.", "Enter valid dates and numbers."), value: null };
    if (end < start) return { error: t(locale, "마지막 근무일은 입사일보다 빠를 수 없습니다.", "The last working day cannot be before the start date."), value: null };
    if (wages < 0 || days <= 0 || !Number.isInteger(days) || ordinary < 0) return { error: t(locale, "임금은 0 이상, 역일수는 1 이상의 정수여야 합니다.", "Wages must be non-negative and calendar days must be a positive integer."), value: null };
    if (wages > MAX_MONEY_INPUT || ordinary > MAX_MONEY_INPUT || days > 366) return { error: t(locale, "임금 또는 역일수가 너무 큽니다. 입력 단위를 확인해 주세요.", "A wage or calendar-day value is too large. Check the inputs and units."), value: null };
    const serviceDays = Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
    const averageDailyWage = wages / days;
    const appliedDailyWage = Math.max(averageDailyWage, ordinary);
    const eligible = serviceDays >= 365;
    const severance = eligible ? appliedDailyWage * 30 * serviceDays / 365 : 0;
    return { error: "", value: { serviceDays, averageDailyWage, appliedDailyWage, eligible, severance } };
  }, [endDate, locale, ordinaryDailyWage, periodDays, startDate, wageTotal]);

  const summary = calculation.value ? `${t(locale, "계속근로일", "Service days")}: ${calculation.value.serviceDays}\n${t(locale, "적용 일급", "Applied daily wage")}: ${formatWon(calculation.value.appliedDailyWage, locale)}\n${t(locale, "예상 퇴직금", "Estimated severance")}: ${formatWon(calculation.value.severance, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "퇴직금 계산기", "Korean severance pay estimator")} description={t(locale, "계속근로기간과 퇴직 전 3개월 임금으로 법정 산식에 가까운 예상액을 계산합니다.", "Estimate Korean severance pay from service time and wages during the final three calendar months.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "입사일", "Employment start date")}><input className="tool-input" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></Field>
        <Field label={t(locale, "마지막 근무일", "Last working day")} hint={t(locale, "마지막으로 근무한 날을 계속근로일에 포함합니다.", "The final day worked is included in the service period.")}><input className="tool-input" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></Field>
        <Field label={t(locale, "퇴직 전 3개월 임금 총액 (원)", "Wages in final 3 calendar months (KRW)")}><input className="tool-input" inputMode="decimal" value={wageTotal} onChange={(event) => setWageTotal(event.target.value)} /></Field>
        <Field label={t(locale, "해당 3개월의 역일수", "Calendar days in that period")} hint={t(locale, "월별 날짜를 합친 실제 역일수를 입력하세요.", "Enter the actual calendar-day total for those months.")}><input className="tool-input" inputMode="numeric" value={periodDays} onChange={(event) => setPeriodDays(event.target.value)} /></Field>
        <Field label={t(locale, "통상 일급 (선택, 원)", "Ordinary daily wage (optional, KRW)")} hint={t(locale, "평균임금보다 높을 때 대체 적용합니다.", "Used when it is higher than average daily wage.")}><input className="tool-input" inputMode="decimal" value={ordinaryDailyWage} onChange={(event) => setOrdinaryDailyWage(event.target.value)} /></Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel label={t(locale, "예상 퇴직금", "Estimated severance pay")} primary={calculation.value ? formatWon(calculation.value.severance, locale) : "-"}>
        {calculation.value ? <div className="tool-stat-grid">
          <span><b>{formatNumber(calculation.value.serviceDays, locale)}{t(locale, "일", " days")}</b>{t(locale, "계속근로기간", "service period")}</span>
          <span><b>{formatWon(calculation.value.averageDailyWage, locale)}</b>{t(locale, "평균 일급", "average daily wage")}</span>
          <span><b>{formatWon(calculation.value.appliedDailyWage, locale)}</b>{t(locale, "적용 일급", "applied daily wage")}</span>
          <span><b>{calculation.value.eligible ? t(locale, "1년 이상", "At least 1 year") : t(locale, "1년 미만", "Under 1 year")}</b>{t(locale, "기간 기준", "service threshold")}</span>
        </div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "주 15시간 이상 근무와 1년 이상 계속근로를 가정합니다. 상여금, 연차수당, 휴직, 제외 기간 등 실제 평균임금 산정 요소는 노무 전문가 또는 고용노동부에서 확인하세요.", "Assumes at least 15 weekly hours and one year of continuous service. Bonuses, leave pay, absences, and excluded periods can change the legal result. Confirm with the labor authority or a qualified adviser.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setStartDate("2024-01-01"); setEndDate("2026-01-01"); setWageTotal("9000000"); setPeriodDays("92"); setOrdinaryDailyWage(""); }} /></Actions>
    </ToolFrame>
  );
}

function FourMajorInsuranceCalculator({ locale }: { locale: string }) {
  const [monthlySalary, setMonthlySalary] = useState("3000000");
  const salary = parseNumber(monthlySalary);
  const inputError = salary === null
    ? t(locale, "월 보수액을 입력해 주세요.", "Enter monthly remuneration.")
    : salary <= 0
      ? t(locale, "월 보수액은 0원보다 커야 합니다.", "Monthly remuneration must be greater than zero.")
      : salary > 1_000_000_000
        ? t(locale, "월 보수액이 너무 큽니다. 금액 단위를 확인해 주세요.", "The monthly remuneration is too large. Check the amount and unit.")
        : "";
  const calculatedValue = !inputError && salary !== null ? (() => {
    const pensionBase = Math.min(6_590_000, Math.max(410_000, salary));
    const pension = Math.round(pensionBase * 0.0475);
    const health = Math.round(Math.min(4_591_740, Math.max(10_080, salary * 0.03595)));
    const longTermCare = Math.round(health * 0.9448 / 7.19);
    const employment = Math.round(salary * 0.009);
    return { pensionBase, pension, health, longTermCare, employment, total: pension + health + longTermCare + employment, takeHome: salary - pension - health - longTermCare - employment };
  })() : null;
  const derivedError = calculatedValue && calculatedValue.takeHome < 0
    ? t(locale, "이 보수액은 보험료 하한을 단순 적용하면 공제액이 보수보다 커집니다. 가입 제외나 납부예외 여부를 각 공단에서 확인해 주세요.", "Applying statutory premium floors to this amount would exceed the remuneration. Check enrollment exclusions or payment exceptions with the relevant agencies.")
    : "";
  const error = inputError || derivedError;
  const value = error ? null : calculatedValue;
  const summary = value ? `${t(locale, "국민연금", "National pension")}: ${formatWon(value.pension, locale)}\n${t(locale, "건강보험", "Health insurance")}: ${formatWon(value.health, locale)}\n${t(locale, "장기요양", "Long-term care")}: ${formatWon(value.longTermCare, locale)}\n${t(locale, "고용보험", "Employment insurance")}: ${formatWon(value.employment, locale)}\n${t(locale, "근로자 부담 합계", "Employee total")}: ${formatWon(value.total, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "4대보험 계산기", "Korean social insurance estimator")} description={t(locale, "2026년 근로자 부담 요율을 적용해 월 보험료와 공제 후 금액을 추정합니다.", "Estimate monthly employee contributions using the stated 2026 Korean social-insurance rates.")}>
      <Field label={t(locale, "월 보수액 (원)", "Monthly remuneration (KRW)")}><input className="tool-input" inputMode="decimal" value={monthlySalary} onChange={(event) => setMonthlySalary(event.target.value)} /></Field>
      <ErrorMessage>{error}</ErrorMessage>
      <ResultPanel label={t(locale, "근로자 부담 합계", "Estimated employee total")} primary={value ? formatWon(value.total, locale) : "-"}>
        {value ? <div className="tool-stat-grid">
          <span><b>{formatWon(value.pension, locale)}</b>{t(locale, "국민연금 4.75%", "pension 4.75%")}</span>
          <span><b>{formatWon(value.health, locale)}</b>{t(locale, "건강보험 3.595%", "health 3.595%")}</span>
          <span><b>{formatWon(value.longTermCare, locale)}</b>{t(locale, "장기요양", "long-term care")}</span>
          <span><b>{formatWon(value.employment, locale)}</b>{t(locale, "고용보험 0.9%", "employment 0.9%")}</span>
          <span><b>{formatWon(value.takeHome, locale)}</b>{t(locale, "보험료만 공제한 금액", "after these contributions")}</span>
        </div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "기준일: 2026년 7월 1일. 국민연금 기준소득월액은 410,000원에서 6,590,000원으로 제한했습니다. 건강보험 근로자 부담액은 월 10,080원에서 4,591,740원 범위로 적용하고, 장기요양은 건강보험료에 0.9448 ÷ 7.19를 곱했습니다. 산재보험은 사업주 전액 부담이라 제외했습니다. 가입 제외, 납부예외, 세금, 신고와 정산에 따라 실제 금액은 다를 수 있습니다.", "Basis date: July 1, 2026. The pension base is clamped from KRW 410,000 to KRW 6,590,000. The employee health contribution is limited from KRW 10,080 to KRW 4,591,740, and long-term care multiplies the health contribution by 0.9448 divided by 7.19. Workers compensation is employer-paid and excluded. Enrollment exclusions, payment exceptions, taxes, reporting, and adjustments can change the actual amount.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => setMonthlySalary("3000000")} /></Actions>
    </ToolFrame>
  );
}

function WeeklyHolidayPayCalculator({ locale }: { locale: string }) {
  const [hourlyWage, setHourlyWage] = useState(String(MINIMUM_WAGE_2026));
  const [days, setDays] = useState("5");
  const [hours, setHours] = useState("40");
  const [completed, setCompleted] = useState(true);
  const wage = parseNumber(hourlyWage);
  const scheduledDays = parseNumber(days);
  const weeklyHours = parseNumber(hours);
  const error = wage === null || scheduledDays === null || weeklyHours === null
    ? t(locale, "모든 칸에 숫자를 입력해 주세요.", "Enter a number in every field.")
    : wage < 0 || wage > MAX_RATE_INPUT || !Number.isInteger(scheduledDays) || scheduledDays < 1 || scheduledDays > 6 || weeklyHours < 0 || weeklyHours > 40
      ? t(locale, "시급은 0원에서 10억원, 근무일은 1일에서 6일, 소정근로시간은 주 0시간에서 40시간으로 입력해 주세요.", "Use an hourly wage from 0 to KRW 1 billion, 1 to 6 scheduled days, and 0 to 40 scheduled weekly hours.")
      : weeklyHours / scheduledDays > 8
        ? t(locale, "하루 평균 소정근로시간은 8시간을 넘을 수 없습니다.", "Average scheduled hours per day cannot exceed 8.")
        : "";
  const eligible = !error && completed && weeklyHours !== null && weeklyHours >= 15;
  const paidHours = eligible ? Math.min(8, weeklyHours! / 40 * 8) : 0;
  const pay = wage !== null ? wage * paidHours : 0;
  const summary = !error ? `${t(locale, "주휴 유급시간", "Paid weekly-rest hours")}: ${formatNumber(paidHours, locale, 2)}\n${t(locale, "예상 주휴수당", "Estimated weekly-rest pay")}: ${formatWon(pay, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "주휴수당 계산기", "Korean weekly holiday pay calculator")} description={t(locale, "주 40시간·5일제 사업장의 비례 산식을 기준으로 예상 주휴 유급시간과 수당을 계산합니다.", "Estimate paid weekly-rest hours and pay with the proportional formula for a standard 40-hour, five-day workplace.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "시급 (원)", "Hourly wage (KRW)")}><input className="tool-input" inputMode="decimal" value={hourlyWage} onChange={(event) => setHourlyWage(event.target.value)} /></Field>
        <Field label={t(locale, "주 소정근로일", "Scheduled days per week")}><input className="tool-input" inputMode="numeric" value={days} onChange={(event) => setDays(event.target.value)} /></Field>
        <Field label={t(locale, "주 소정근로시간", "Scheduled hours per week")}><input className="tool-input" inputMode="decimal" value={hours} onChange={(event) => setHours(event.target.value)} /></Field>
      </div>
      <fieldset className="tool-option-grid"><legend>{t(locale, "소정근로일 개근", "Completed all scheduled days")}</legend><label><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} />{t(locale, "이번 주 소정근로일을 모두 근무했습니다.", "All scheduled workdays were completed.")}</label></fieldset>
      <ErrorMessage>{error}</ErrorMessage>
      <ResultPanel label={t(locale, "예상 주휴수당", "Estimated weekly holiday pay")} primary={!error ? formatWon(pay, locale) : "-"}>
        {!error ? <div className="tool-stat-grid"><span><b>{formatNumber(paidHours, locale, 2)}{t(locale, "시간", " hours")}</b>{t(locale, "주휴 유급시간", "paid rest hours")}</span><span><b>{eligible ? t(locale, "계산 대상", "Eligible") : t(locale, "대상 아님", "Not eligible")}</b>{t(locale, "입력 조건 기준", "based on inputs")}</span></div> : null}
      </ResultPanel>
      {wage !== null && wage < MINIMUM_WAGE_2026 ? <p className="tool-error" role="status">{t(locale, "입력 시급이 2026년 최저임금 10,320원보다 낮습니다.", "The entered wage is below the 2026 minimum wage reference of KRW 10,320.")}</p> : null}
      <p className="tool-disclaimer">{t(locale, "2026년 최저임금 10,320원을 참고값으로 표시합니다. 주 40시간·5일제 사업장을 전제로 ‘주 소정근로시간 ÷ 40 × 8’ 비례식을 적용하며, 주 15시간 이상과 소정근로일 개근을 단순 확인합니다. 근로형태와 법 적용 예외에 따라 달라질 수 있습니다.", "Shows the 2026 minimum-wage reference of KRW 10,320. It assumes a standard 40-hour, five-day workplace and uses scheduled weekly hours divided by 40, multiplied by 8, while checking the 15-hour threshold and full attendance. Employment arrangements and legal exceptions may change the result.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setHourlyWage(String(MINIMUM_WAGE_2026)); setDays("5"); setHours("40"); setCompleted(true); }} /></Actions>
    </ToolFrame>
  );
}

function VatCalculator({ locale }: { locale: string }) {
  const [direction, setDirection] = useState<"supply" | "inclusive">("supply");
  const [amount, setAmount] = useState("100000");
  const [quantity, setQuantity] = useState("1");
  const [rounding, setRounding] = useState<"round" | "floor" | "ceil">("round");
  const rawAmount = parseNumber(amount);
  const qty = parseNumber(quantity);
  const error = rawAmount === null || qty === null
    ? t(locale, "금액과 수량을 입력해 주세요.", "Enter an amount and quantity.")
    : rawAmount < 0 || rawAmount > MAX_MONEY_INPUT || !Number.isInteger(qty) || qty < 1 || qty > 1_000_000
      ? t(locale, "금액 단위와 수량을 확인해 주세요. 수량은 1에서 1,000,000 사이의 정수여야 합니다.", "Check the amount and its unit. Quantity must be an integer from 1 to 1,000,000.")
      : "";
  const roundValue = (value: number) => rounding === "floor" ? Math.floor(value) : rounding === "ceil" ? Math.ceil(value) : Math.round(value);
  const value = !error && rawAmount !== null && qty !== null ? (() => {
    const enteredTotal = roundValue(rawAmount * qty);
    if (direction === "supply") {
      const supply = enteredTotal;
      const vat = roundValue(supply * 0.1);
      return { supply, vat, inclusive: supply + vat };
    }
    const inclusive = enteredTotal;
    const supply = roundValue(inclusive / 1.1);
    return { supply, vat: inclusive - supply, inclusive };
  })() : null;
  const summary = value ? `${t(locale, "공급가액", "Supply value")}: ${formatWon(value.supply, locale)}\n${t(locale, "부가세", "VAT")}: ${formatWon(value.vat, locale)}\n${t(locale, "합계", "Total")}: ${formatWon(value.inclusive, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "부가세 계산기", "Korean VAT calculator")} description={t(locale, "10% 부가세의 공급가액과 세액, 합계금액을 양방향으로 계산합니다.", "Calculate Korean 10% VAT from either supply value or VAT-inclusive price.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "입력 금액 종류", "Entered amount type")}><select className="tool-select" value={direction} onChange={(event) => setDirection(event.target.value as typeof direction)}><option value="supply">{t(locale, "공급가액", "Supply value")}</option><option value="inclusive">{t(locale, "부가세 포함 금액", "VAT-inclusive price")}</option></select></Field>
        <Field label={t(locale, "개당 금액 (원)", "Amount per item (KRW)")}><input className="tool-input" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></Field>
        <Field label={t(locale, "수량", "Quantity")}><input className="tool-input" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></Field>
        <Field label={t(locale, "원 단위 처리", "KRW rounding")}><select className="tool-select" value={rounding} onChange={(event) => setRounding(event.target.value as typeof rounding)}><option value="round">{t(locale, "반올림", "Round to nearest")}</option><option value="floor">{t(locale, "버림", "Round down")}</option><option value="ceil">{t(locale, "올림", "Round up")}</option></select></Field>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <ResultPanel label={t(locale, "부가세 포함 합계", "VAT-inclusive total")} primary={value ? formatWon(value.inclusive, locale) : "-"}>{value ? <div className="tool-stat-grid"><span><b>{formatWon(value.supply, locale)}</b>{t(locale, "공급가액", "supply value")}</span><span><b>{formatWon(value.vat, locale)}</b>{t(locale, "부가세 10%", "VAT at 10%")}</span></div> : null}</ResultPanel>
      <p className="tool-disclaimer">{t(locale, "선택한 원 단위 처리 방법을 수량 합계에 적용합니다. 실제 세금계산서의 품목별 반올림 방식에 따라 1원 이상 차이가 날 수 있습니다.", "The selected KRW rounding rule is applied to the quantity total. Item-level rounding on an actual tax invoice can produce a small difference.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setDirection("supply"); setAmount("100000"); setQuantity("1"); setRounding("round"); }} /></Actions>
    </ToolFrame>
  );
}

function PyeongCalculator({ locale }: { locale: string }) {
  const [basis, setBasis] = useState<"sqm" | "pyeong">("sqm");
  const [area, setArea] = useState("84");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const rawArea = parseNumber(area);
  const widthValue = width.trim() ? parseNumber(width) : null;
  const lengthValue = length.trim() ? parseNumber(length) : null;
  const areaError = area.trim() && (rawArea === null || rawArea < 0 || rawArea > 1_000_000_000_000)
    ? t(locale, "면적은 0 이상이며 지원 범위 안의 숫자로 입력해 주세요.", "Enter a non-negative area within the supported range.")
    : "";
  const dimensionsRequested = Boolean(width.trim() || length.trim());
  const dimensionsError = dimensionsRequested && (widthValue === null || lengthValue === null || widthValue < 0 || lengthValue < 0 || widthValue > 1_000_000_000 || lengthValue > 1_000_000_000)
    ? t(locale, "가로와 세로를 모두 0 이상이며 지원 범위 안의 숫자로 입력해 주세요.", "Enter non-negative width and length values within the supported range.")
    : "";
  const squareMetres = !areaError && rawArea !== null ? basis === "sqm" ? rawArea : rawArea * 3.305785 : null;
  const pyeong = squareMetres === null ? null : squareMetres / 3.305785;
  const dimensionSquareMetres = !dimensionsError && widthValue !== null && lengthValue !== null ? widthValue * lengthValue : null;
  const dimensionPyeong = dimensionSquareMetres === null ? null : dimensionSquareMetres / 3.305785;
  const summary = [
    squareMetres !== null && pyeong !== null ? `${formatNumber(squareMetres, locale, 4)} m² = ${formatNumber(pyeong, locale, 4)} ${t(locale, "평", "pyeong")}` : "",
    dimensionSquareMetres !== null && dimensionPyeong !== null ? `${t(locale, "가로와 세로 면적", "Width by length area")}: ${formatNumber(dimensionSquareMetres, locale, 4)} m², ${formatNumber(dimensionPyeong, locale, 4)} ${t(locale, "평", "pyeong")}` : "",
  ].filter(Boolean).join("\n");

  return (
    <ToolFrame locale={locale} title={t(locale, "평수 계산기", "Pyeong area converter")} description={t(locale, "제곱미터와 평을 양방향으로 변환하고 가로와 세로 길이로 면적을 계산합니다.", "Convert square metres and pyeong in either direction, or calculate area from width and length.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "입력 단위", "Input unit")}><select className="tool-select" value={basis} onChange={(event) => setBasis(event.target.value as typeof basis)}><option value="sqm">{t(locale, "제곱미터 (m²)", "Square metres (m²)")}</option><option value="pyeong">{t(locale, "평", "Pyeong")}</option></select></Field>
        <Field label={t(locale, "면적", "Area")}><input className="tool-input" inputMode="decimal" value={area} onChange={(event) => setArea(event.target.value)} /></Field>
      </div>
      <section className="tool-subcard">
        <h3>{t(locale, "가로와 세로로 면적 계산", "Area from dimensions")}</h3>
        <div className="tool-grid tool-grid--2">
          <Field label={t(locale, "가로 (m)", "Width (m)")}><input className="tool-input" inputMode="decimal" value={width} onChange={(event) => setWidth(event.target.value)} placeholder="8" /></Field>
          <Field label={t(locale, "세로 (m)", "Length (m)")}><input className="tool-input" inputMode="decimal" value={length} onChange={(event) => setLength(event.target.value)} placeholder="10.5" /></Field>
        </div>
      </section>
      <ErrorMessage>{areaError || dimensionsError}</ErrorMessage>
      <ResultPanel label={t(locale, "변환 결과", "Converted area")} primary={squareMetres !== null ? `${formatNumber(squareMetres, locale, 4)} m²` : dimensionSquareMetres !== null ? `${formatNumber(dimensionSquareMetres, locale, 4)} m²` : "-"}>
        {squareMetres !== null || dimensionSquareMetres !== null ? <div className="tool-stat-grid">{pyeong !== null ? <span><b>{formatNumber(pyeong, locale, 4)} {t(locale, "평", "pyeong")}</b>{t(locale, "1평은 약 3.305785m²", "1 pyeong is about 3.305785m²")}</span> : null}{dimensionSquareMetres !== null ? <span><b>{formatNumber(dimensionSquareMetres, locale, 4)} m²</b>{formatNumber(dimensionPyeong!, locale, 4)} {t(locale, "평", "pyeong")}</span> : null}</div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "부동산 표시 면적은 전용면적, 공급면적, 계약면적 기준이 서로 다를 수 있으므로 면적 종류를 함께 확인하세요.", "Property listings can use exclusive, supply, or contract area. Check which area definition is being shown.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setBasis("sqm"); setArea("84"); setWidth(""); setLength(""); }} /></Actions>
    </ToolFrame>
  );
}

type BrokerageBracket = { maxExclusive: number; rate: number; cap?: number };
type BrokerageResult = {
  transactionValue: number;
  ceilingPercent: number;
  appliedRate: number;
  fee: number;
  vat: number;
};

const SALE_BRACKETS: BrokerageBracket[] = [
  { maxExclusive: 50_000_000, rate: 0.006, cap: 250_000 },
  { maxExclusive: 200_000_000, rate: 0.005, cap: 800_000 },
  { maxExclusive: 900_000_000, rate: 0.004 },
  { maxExclusive: 1_200_000_000, rate: 0.005 },
  { maxExclusive: 1_500_000_000, rate: 0.006 },
  { maxExclusive: Number.POSITIVE_INFINITY, rate: 0.007 },
];

const LEASE_BRACKETS: BrokerageBracket[] = [
  { maxExclusive: 50_000_000, rate: 0.005, cap: 200_000 },
  { maxExclusive: 100_000_000, rate: 0.004, cap: 300_000 },
  { maxExclusive: 600_000_000, rate: 0.003 },
  { maxExclusive: 1_200_000_000, rate: 0.004 },
  { maxExclusive: 1_500_000_000, rate: 0.005 },
  { maxExclusive: Number.POSITIVE_INFINITY, rate: 0.006 },
];

function brokerageBracket(value: number, sale: boolean) {
  return (sale ? SALE_BRACKETS : LEASE_BRACKETS).find((bracket) => value < bracket.maxExclusive)!;
}

function RealEstateBrokerageFee({ locale }: { locale: string }) {
  const [dealType, setDealType] = useState<"sale" | "jeonse" | "monthly">("sale");
  const [mainAmount, setMainAmount] = useState("500000000");
  const [monthlyRent, setMonthlyRent] = useState("500000");
  const [negotiatedRate, setNegotiatedRate] = useState("");
  const amount = parseNumber(mainAmount);
  const rent = dealType === "monthly" ? parseNumber(monthlyRent) : 0;
  const hasRequestedRate = Boolean(negotiatedRate.trim());
  const requestedRate = hasRequestedRate ? parseNumber(negotiatedRate) : null;
  const basicError = amount === null || rent === null
    ? t(locale, "거래 금액을 숫자로 입력해 주세요.", "Enter transaction amounts as numbers.")
    : amount < 0 || rent < 0
      ? t(locale, "거래 금액은 0 이상이어야 합니다.", "Transaction amounts must be non-negative.")
      : amount > 10_000_000_000_000 || rent > 100_000_000_000
        ? t(locale, "거래 금액이 너무 큽니다. 금액 단위를 확인해 주세요.", "A transaction amount is too large. Check the amount and unit.")
        : hasRequestedRate && requestedRate === null
          ? t(locale, "협의 요율을 숫자로 입력하거나 비워 주세요.", "Enter the negotiated rate as a number or leave it blank.")
          : requestedRate !== null && (requestedRate < 0 || requestedRate > 10)
        ? t(locale, "협의 요율을 0%에서 10% 사이로 입력해 주세요.", "Enter a negotiated rate from 0% to 10%.")
        : "";
  const calculation: { rateError: string; result: BrokerageResult | null } | null = !basicError && amount !== null && rent !== null ? (() => {
    let transactionValue = amount;
    if (dealType === "monthly") {
      transactionValue = amount + rent * 100;
      if (transactionValue < 50_000_000) transactionValue = amount + rent * 70;
    }
    const bracket = brokerageBracket(transactionValue, dealType === "sale");
    const ceilingPercent = bracket.rate * 100;
    if (requestedRate !== null && requestedRate > ceilingPercent) return { rateError: t(locale, `협의 요율은 이 구간 상한인 ${ceilingPercent}%를 넘을 수 없습니다.`, `The negotiated rate cannot exceed this bracket's ${ceilingPercent}% ceiling.`), result: null };
    const appliedRate = requestedRate === null ? bracket.rate : requestedRate / 100;
    const rawFee = transactionValue * appliedRate;
    const fee = Math.floor(bracket.cap === undefined ? rawFee : Math.min(rawFee, bracket.cap));
    return { rateError: "", result: { transactionValue, ceilingPercent, appliedRate, fee, vat: Math.floor(fee * 0.1) } };
  })() : null;
  const rateError = calculation?.rateError ?? "";
  const result = calculation?.result ?? null;
  const summary = result ? `${t(locale, "환산 거래금액", "Transaction value")}: ${formatWon(result.transactionValue, locale)}\n${t(locale, "적용 요율", "Applied rate")}: ${formatNumber(result.appliedRate * 100, locale, 3)}%\n${t(locale, "중개보수", "Brokerage fee")}: ${formatWon(result.fee, locale)}\n${t(locale, "부가세 별도 예상", "VAT if separately charged")}: ${formatWon(result.vat, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "부동산 중개보수 계산기", "Seoul residential brokerage fee estimator")} description={t(locale, "서울 주택의 매매, 전세, 월세 거래금액별 중개보수 상한을 계산합니다.", "Estimate the brokerage-fee ceiling for Seoul residential sales, jeonse, and monthly rentals.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "거래 종류", "Transaction type")}><select className="tool-select" value={dealType} onChange={(event) => setDealType(event.target.value as typeof dealType)}><option value="sale">{t(locale, "매매와 교환", "Sale or exchange")}</option><option value="jeonse">{t(locale, "전세와 보증부 임대", "Jeonse or deposit lease")}</option><option value="monthly">{t(locale, "월세", "Monthly rent")}</option></select></Field>
        <Field label={dealType === "sale" ? t(locale, "매매가 (원)", "Sale price (KRW)") : t(locale, "보증금 (원)", "Deposit (KRW)")}><input className="tool-input" inputMode="decimal" value={mainAmount} onChange={(event) => setMainAmount(event.target.value)} /></Field>
        {dealType === "monthly" ? <Field label={t(locale, "월 차임 (원)", "Monthly rent (KRW)")}><input className="tool-input" inputMode="decimal" value={monthlyRent} onChange={(event) => setMonthlyRent(event.target.value)} /></Field> : null}
        <Field label={t(locale, "협의 요율 (선택, %)", "Negotiated rate (optional, %)")} hint={t(locale, "비우면 법정 상한 요율을 적용합니다.", "Leave blank to use the bracket ceiling.")}><input className="tool-input" inputMode="decimal" value={negotiatedRate} onChange={(event) => setNegotiatedRate(event.target.value)} /></Field>
      </div>
      <ErrorMessage>{basicError || rateError}</ErrorMessage>
      <ResultPanel label={t(locale, "중개보수 예상 상한", "Estimated brokerage fee")} primary={result ? formatWon(result.fee, locale) : "-"}>
        {result ? <div className="tool-stat-grid">
          <span><b>{formatWon(result.transactionValue, locale)}</b>{t(locale, "환산 거래금액", "transaction value")}</span>
          <span><b>{formatNumber(result.ceilingPercent, locale, 3)}%</b>{t(locale, "구간 상한 요율", "bracket ceiling")}</span>
          <span><b>{formatNumber(result.appliedRate * 100, locale, 3)}%</b>{t(locale, "적용 요율", "applied rate")}</span>
          <span><b>{formatWon(result.vat, locale)}</b>{t(locale, "부가세 10% 별도 예상", "possible separate 10% VAT")}</span>
        </div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "서울특별시 주택 중개보수 상한표를 바탕으로 한 2026년 참고용 추정입니다. 월세 거래금액은 보증금에 월 차임의 100배를 더하고, 5천만원 미만이면 70배로 다시 계산합니다. 보수는 상한 이내에서 협의하며 부가세는 별도일 수 있습니다. 오피스텔, 토지, 상가와 다른 지역은 기준이 다릅니다.", "Reference estimate based on Seoul residential fee ceilings for 2026. Monthly-rent value adds 100 times monthly rent to the deposit, then uses 70 times rent if the first result is below KRW 50 million. The fee is negotiated within the ceiling and VAT may be separate. Offices, land, commercial property, and other regions use different rules.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setDealType("sale"); setMainAmount("500000000"); setMonthlyRent("500000"); setNegotiatedRate(""); }} /></Actions>
    </ToolFrame>
  );
}

function ApplianceEnergyCost({ locale }: { locale: string }) {
  const [watts, setWatts] = useState("1000");
  const [hours, setHours] = useState("3");
  const [days, setDays] = useState("30");
  const [devices, setDevices] = useState("1");
  const [rate, setRate] = useState("200");
  const values = [watts, hours, days, devices, rate].map(parseNumber);
  const error = values.some((value) => value === null)
    ? t(locale, "모든 칸에 숫자를 입력해 주세요.", "Enter a number in every field.")
    : values.some((value) => value! < 0) || values[0]! > MAX_RATE_INPUT || values[4]! > MAX_RATE_INPUT || !Number.isInteger(values[2]) || !Number.isInteger(values[3]) || values[1]! > 24 || values[2]! > 366 || values[3]! < 1 || values[3]! > 100_000
      ? t(locale, "소비전력과 요율의 단위를 확인하고, 시간은 하루 0시간에서 24시간, 일수는 0일에서 366일, 기기 수는 1대 이상의 정수로 입력해 주세요.", "Check the power and rate units, use 0 to 24 hours per day, 0 to 366 days, and a positive whole number of devices.")
      : "";
  const value = !error ? (() => {
    const kwh = values[0]! / 1000 * values[1]! * values[2]! * values[3]!;
    return { kwh, cost: kwh * values[4]!, dailyKwh: values[2] ? kwh / values[2]! : 0 };
  })() : null;
  const summary = value ? `${t(locale, "예상 사용량", "Estimated usage")}: ${formatNumber(value.kwh, locale, 3)} kWh\n${t(locale, "단순 예상 비용", "Simple estimated cost")}: ${formatWon(value.cost, locale)}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "가전제품 전기요금 계산기", "Appliance energy cost calculator")} description={t(locale, "소비전력과 사용시간, 기기 수, 사용자 요율로 전력 사용량과 단순 비용을 계산합니다.", "Estimate energy use and simple cost from wattage, run time, device count, and your own electricity rate.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "기기당 소비전력 (W)", "Power per device (W)")}><input className="tool-input" inputMode="decimal" value={watts} onChange={(event) => setWatts(event.target.value)} /></Field>
        <Field label={t(locale, "하루 사용시간", "Hours per day")}><input className="tool-input" inputMode="decimal" value={hours} onChange={(event) => setHours(event.target.value)} /></Field>
        <Field label={t(locale, "사용 일수", "Number of days")}><input className="tool-input" inputMode="numeric" value={days} onChange={(event) => setDays(event.target.value)} /></Field>
        <Field label={t(locale, "기기 수", "Number of devices")}><input className="tool-input" inputMode="numeric" value={devices} onChange={(event) => setDevices(event.target.value)} /></Field>
        <Field label={t(locale, "사용자 요율 (원/kWh)", "Your rate (KRW/kWh)")} hint={t(locale, "고지서 평균 단가나 비교용 단가를 입력하세요.", "Enter an average bill rate or a rate for comparison.")}><input className="tool-input" inputMode="decimal" value={rate} onChange={(event) => setRate(event.target.value)} /></Field>
      </div>
      <ErrorMessage>{error}</ErrorMessage>
      <ResultPanel label={t(locale, "단순 예상 비용", "Simple estimated cost")} primary={value ? formatWon(value.cost, locale) : "-"}>
        {value ? <div className="tool-stat-grid"><span><b>{formatNumber(value.kwh, locale, 3)} kWh</b>{t(locale, "전체 사용량", "total usage")}</span><span><b>{formatNumber(value.dailyKwh, locale, 3)} kWh</b>{t(locale, "하루 평균", "daily average")}</span></div> : null}
      </ResultPanel>
      <p className="tool-disclaimer">{t(locale, "입력한 단일 요율을 곱한 비교용 값이며 한국전력의 실제 청구액이 아닙니다. 누진구간, 기본요금, 기후환경요금, 연료비조정액, 부가세, 전력산업기반기금은 반영하지 않습니다.", "This comparison multiplies usage by one user-entered rate and is not an exact KEPCO bill. It excludes tiered pricing, base charges, environmental and fuel adjustments, VAT, and other levies.")}</p>
      <Actions><CopyButton value={summary} locale={locale} /><ResetButton locale={locale} onClick={() => { setWatts("1000"); setHours("3"); setDays("30"); setDevices("1"); setRate("200"); }} /></Actions>
    </ToolFrame>
  );
}

function formatCalendarDate(year: number, month: number, day: number, locale: string) {
  return isKo(locale) ? `${year}년 ${month}월 ${day}일` : `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function LunarSolarConverter({ locale }: { locale: string }) {
  const [direction, setDirection] = useState<"solar-to-lunar" | "lunar-to-solar">("solar-to-lunar");
  const [date, setDate] = useState("2026-01-01");
  const [leapMonth, setLeapMonth] = useState(false);
  const calculation = useMemo(() => {
    const calendar = new KoreanLunarCalendar();
    if (direction === "solar-to-lunar") {
      const parsed = parseDate(date);
      if (!parsed) return { error: t(locale, "올바른 양력 날짜를 입력해 주세요.", "Enter a valid solar date."), value: null };
      const year = parsed.getUTCFullYear();
      const month = parsed.getUTCMonth() + 1;
      const day = parsed.getUTCDate();
      if (!calendar.setSolarDate(year, month, day)) return { error: t(locale, "지원 범위 밖의 양력 날짜입니다. 1000년부터 2050년 사이의 유효한 날짜를 사용하세요.", "That solar date is outside the supported range. Use a valid date from 1000 through 2050."), value: null };
      const result = calendar.getLunarCalendar();
      return { error: "", value: { calendar: result, label: t(locale, "음력", "Lunar"), leap: Boolean(result.intercalation) } };
    }
    const parsed = parseLunarDate(date);
    if (!parsed) return { error: t(locale, "음력 날짜를 YYYY-MM-DD 형식으로 입력해 주세요. 음력 날짜는 월 1~12, 일 1~30을 사용할 수 있습니다.", "Enter the lunar date as YYYY-MM-DD, using month 1 to 12 and day 1 to 30."), value: null };
    if (!calendar.setLunarDate(parsed.year, parsed.month, parsed.day, leapMonth)) return { error: t(locale, "지원 범위 밖이거나 존재하지 않는 음력 날짜입니다. 윤달을 선택했다면 해당 연도에 그 윤달이 있는지 확인하세요.", "That lunar date is outside the supported range or does not exist. If leap month is selected, confirm that the year contains that leap month."), value: null };
    return { error: "", value: { calendar: calendar.getSolarCalendar(), label: t(locale, "양력", "Solar"), leap: false } };
  }, [date, direction, leapMonth, locale]);
  const resultText = calculation.value ? `${calculation.value.label} ${formatCalendarDate(calculation.value.calendar.year, calculation.value.calendar.month, calculation.value.calendar.day, locale)}${calculation.value.leap ? t(locale, " 윤달", " leap month") : ""}` : "";

  return (
    <ToolFrame locale={locale} title={t(locale, "음력 양력 변환기", "Korean lunar and solar date converter")} description={t(locale, "한국 음력 날짜와 양력 날짜를 기기 안에서 양방향으로 변환합니다.", "Convert Korean lunar and Gregorian solar dates in either direction on your device.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "변환 방향", "Conversion direction")}><select className="tool-select" value={direction} onChange={(event) => { setDirection(event.target.value as typeof direction); setLeapMonth(false); }}><option value="solar-to-lunar">{t(locale, "양력에서 음력", "Solar to lunar")}</option><option value="lunar-to-solar">{t(locale, "음력에서 양력", "Lunar to solar")}</option></select></Field>
        <Field label={direction === "solar-to-lunar" ? t(locale, "양력 날짜", "Solar date") : t(locale, "음력 날짜 (YYYY-MM-DD)", "Lunar date (YYYY-MM-DD)")} hint={direction === "lunar-to-solar" ? t(locale, "양력에 없는 음력 2월 30일도 직접 입력할 수 있습니다.", "You can enter lunar dates such as month 2, day 30 that do not exist in the Gregorian calendar.") : undefined}>{direction === "solar-to-lunar" ? <input className="tool-input" type="date" value={date} min="1000-02-13" max="2050-12-31" onChange={(event) => setDate(event.target.value)} /> : <input className="tool-input" type="text" inputMode="numeric" pattern="\d{4}-\d{2}-\d{2}" placeholder="2024-02-30" value={date} onChange={(event) => setDate(event.target.value)} />}</Field>
      </div>
      {direction === "lunar-to-solar" ? <fieldset className="tool-option-grid"><legend>{t(locale, "윤달 설정", "Leap-month setting")}</legend><label><input type="checkbox" checked={leapMonth} onChange={(event) => setLeapMonth(event.target.checked)} />{t(locale, "입력한 음력 월을 윤달로 해석합니다.", "Interpret the entered lunar month as a leap month.")}</label></fieldset> : null}
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel label={t(locale, "변환된 날짜", "Converted date")} primary={resultText || "-"} />
      <p className="tool-disclaimer">{t(locale, "korean-lunar-calendar 0.4.0의 한국 달력 데이터를 사용합니다. 양력은 1000-02-13~2050-12-31, 음력은 1000-01-01~2050-11-18 범위를 지원합니다. 역사적 달력 표기나 공식 행정 판단에는 원자료를 함께 확인하세요.", "Uses Korean calendar data from korean-lunar-calendar 0.4.0. Supported ranges are 1000-02-13 to 2050-12-31 for solar dates and 1000-01-01 to 2050-11-18 for lunar dates. Check an authoritative source for historical notation or official administrative use.")}</p>
      <Actions><CopyButton value={resultText} locale={locale} /><ResetButton locale={locale} onClick={() => { setDirection("solar-to-lunar"); setDate("2026-01-01"); setLeapMonth(false); }} /></Actions>
    </ToolFrame>
  );
}

function secureRandomInt(max: number) {
  if (!Number.isSafeInteger(max) || max <= 0) throw new Error("Invalid random range");
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const random = new Uint32Array(1);
  do crypto.getRandomValues(random); while (random[0] >= limit);
  return random[0] % max;
}

function parseLottoNumbers(value: string) {
  if (!value.trim()) return { numbers: [] as number[], invalid: [] as string[] };
  const tokens = value.trim().split(/[\s,]+/u).filter(Boolean);
  const parsed = tokens.map((token) => Number(token));
  return {
    numbers: parsed.filter((number) => Number.isInteger(number) && number >= 1 && number <= 45),
    invalid: tokens.filter((_, index) => !Number.isInteger(parsed[index]) || parsed[index] < 1 || parsed[index] > 45),
  };
}

function LottoNumberGenerator({ locale }: { locale: string }) {
  const [lineCount, setLineCount] = useState("5");
  const [includeText, setIncludeText] = useState("");
  const [excludeText, setExcludeText] = useState("");
  const [lines, setLines] = useState<number[][]>([]);
  const [actionError, setActionError] = useState("");
  const count = parseNumber(lineCount);
  const includes = parseLottoNumbers(includeText);
  const excludes = parseLottoNumbers(excludeText);
  const uniqueIncludes = Array.from(new Set(includes.numbers));
  const uniqueExcludes = Array.from(new Set(excludes.numbers));
  const overlap = uniqueIncludes.filter((number) => uniqueExcludes.includes(number));
  const inputError = count === null || !Number.isInteger(count) || count < 1 || count > 5
    ? t(locale, "게임 수는 1에서 5 사이의 정수여야 합니다.", "The number of lines must be an integer from 1 to 5.")
    : includes.invalid.length || excludes.invalid.length
      ? t(locale, "포함과 제외 번호는 1에서 45 사이의 정수만 입력해 주세요.", "Included and excluded numbers must be integers from 1 to 45.")
      : uniqueIncludes.length !== includes.numbers.length || uniqueExcludes.length !== excludes.numbers.length
        ? t(locale, "같은 번호를 중복 입력하지 마세요.", "Do not enter duplicate numbers.")
        : uniqueIncludes.length > 6
          ? t(locale, "포함 번호는 최대 6개까지 선택할 수 있습니다.", "You can include at most 6 numbers.")
          : overlap.length
            ? t(locale, "같은 번호를 포함과 제외에 동시에 넣을 수 없습니다.", "A number cannot be both included and excluded.")
            : 45 - uniqueExcludes.length < 6
              ? t(locale, "제외하지 않은 번호가 6개 이상 남아야 합니다.", "At least 6 non-excluded numbers must remain.")
              : "";

  function generate() {
    if (inputError || count === null) { setLines([]); setActionError(inputError); return; }
    try {
      const generated = Array.from({ length: count }, () => {
        const selected = [...uniqueIncludes];
        const pool = Array.from({ length: 45 }, (_, index) => index + 1).filter((number) => !uniqueExcludes.includes(number) && !selected.includes(number));
        while (selected.length < 6) {
          const index = secureRandomInt(pool.length);
          selected.push(pool[index]);
          pool.splice(index, 1);
        }
        return selected.sort((a, b) => a - b);
      });
      setLines(generated);
      setActionError("");
    } catch {
      setLines([]);
      setActionError(t(locale, "이 브라우저에서는 안전한 무작위 번호를 만들 수 없습니다.", "Secure random generation is unavailable in this browser."));
    }
  }

  const copyValue = lines.map((line, index) => `${index + 1}. ${line.join(", ")}`).join("\n");
  return (
    <ToolFrame locale={locale} title={t(locale, "로또 번호 생성기", "Korean lotto number generator")} description={t(locale, "암호학적으로 안전한 난수로 1부터 45까지 중복 없는 번호 6개를 최대 5게임 만듭니다.", "Create up to five lines of six unique numbers from 1 to 45 using secure random values.")}>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "게임 수", "Number of lines")}><select className="tool-select" value={lineCount} onChange={(event) => { setLineCount(event.target.value); setLines([]); }}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></Field>
        <Field label={t(locale, "반드시 포함할 번호", "Numbers to include")} hint={t(locale, "쉼표나 공백으로 구분, 최대 6개", "Separate with commas or spaces, up to 6")}><input className="tool-input" inputMode="numeric" value={includeText} onChange={(event) => { setIncludeText(event.target.value); setLines([]); }} placeholder="3, 7" /></Field>
        <Field label={t(locale, "제외할 번호", "Numbers to exclude")} hint={t(locale, "1부터 45 사이 번호", "Numbers from 1 to 45")}><input className="tool-input" inputMode="numeric" value={excludeText} onChange={(event) => { setExcludeText(event.target.value); setLines([]); }} placeholder="1, 2, 45" /></Field>
      </div>
      <ErrorMessage>{inputError || actionError}</ErrorMessage>
      <div className="tool-calculation-list" aria-live="polite">
        {lines.length ? lines.map((line, index) => <section className="tool-subcard" key={`${index}-${line.join("-")}`}><h3>{t(locale, `${index + 1}게임`, `Line ${index + 1}`)}</h3><output className="tool-inline-result">{line.join("  ")}</output></section>) : <ResultPanel label={t(locale, "생성된 번호", "Generated numbers")} primary="-" />}
      </div>
      <p className="tool-disclaimer">{t(locale, "모든 번호 조합의 당첨 확률은 같습니다. 이 도구는 당첨을 예측하거나 보장하지 않습니다. 예산을 정하고 책임감 있게 이용하세요.", "Every number combination has the same chance. This tool does not predict or guarantee a win. Set a budget and play responsibly.")}</p>
      <Actions><button className="tool-button tool-button--primary" type="button" onClick={generate}>{t(locale, "새 번호 생성", "Generate new numbers")}</button><CopyButton value={copyValue} locale={locale} /><ResetButton locale={locale} onClick={() => { setLineCount("5"); setIncludeText(""); setExcludeText(""); setLines([]); setActionError(""); }} /></Actions>
    </ToolFrame>
  );
}

export function KoreanToolWidget({ slug, locale }: WidgetProps): ReactNode | null {
  const normalizedSlug = slug.toLowerCase().replace(/^\/+|\/+$/g, "").replace(/_/g, "-");
  switch (normalizedSlug) {
    case "salary-converter": return <SalaryConverter locale={locale} />;
    case "severance-pay": return <SeverancePayCalculator locale={locale} />;
    case "four-major-insurance": return <FourMajorInsuranceCalculator locale={locale} />;
    case "weekly-holiday-pay": return <WeeklyHolidayPayCalculator locale={locale} />;
    case "vat-calculator": return <VatCalculator locale={locale} />;
    case "pyeong-calculator": return <PyeongCalculator locale={locale} />;
    case "real-estate-brokerage-fee": return <RealEstateBrokerageFee locale={locale} />;
    case "appliance-energy-cost": return <ApplianceEnergyCost locale={locale} />;
    case "lunar-solar-converter": return <LunarSolarConverter locale={locale} />;
    case "lotto-number-generator": return <LottoNumberGenerator locale={locale} />;
    default: return null;
  }
}

export default KoreanToolWidget;
