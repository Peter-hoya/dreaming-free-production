"use client";

/* Blob and data-URL previews intentionally use native img elements. */
/* eslint-disable @next/next/no-img-element */

import QRCode from "qrcode";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

function WidgetLoading() {
  return (
    <section className="tool-widget tool-widget--loading" aria-busy="true">
      <span className="sr-only">Loading tool</span>
      <div aria-hidden="true" className="tool-loading-bar" />
      <div aria-hidden="true" className="tool-loading-panel" />
    </section>
  );
}

const GlobalToolWidget = dynamic(
  () => import("@/components/tools/GlobalToolWidgets").then((module) => module.GlobalToolWidget),
  { loading: WidgetLoading },
);
const KoreanToolWidget = dynamic(
  () => import("@/components/tools/KoreanToolWidgets").then((module) => module.KoreanToolWidget),
  { loading: WidgetLoading },
);

export type ToolLocale = "ko" | "en";

export type ToolWidgetProps = {
  slug: string;
  locale: ToolLocale | string;
};

const DAY_MS = 86_400_000;

function isKo(locale: string) {
  return locale.toLowerCase().startsWith("ko");
}

function t(locale: string, korean: string, english: string) {
  return isKo(locale) ? korean : english;
}

function localeTag(locale: string) {
  return isKo(locale) ? "ko-KR" : "en-US";
}

function todayInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(localeTag(locale), {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function clampedUTCDate(year: number, month: number, day: number) {
  return new Date(
    Date.UTC(year, month, Math.min(day, daysInMonth(year, month))),
  );
}

function addYearsClamped(date: Date, years: number) {
  return clampedUTCDate(
    date.getUTCFullYear() + years,
    date.getUTCMonth(),
    date.getUTCDate(),
  );
}

function addMonthsClamped(date: Date, months: number) {
  const absoluteMonth = date.getUTCFullYear() * 12 + date.getUTCMonth() + months;
  const year = Math.floor(absoluteMonth / 12);
  const month = ((absoluteMonth % 12) + 12) % 12;
  return clampedUTCDate(year, month, date.getUTCDate());
}

function calendarDifference(start: Date, end: Date) {
  let years = end.getUTCFullYear() - start.getUTCFullYear();
  let cursor = addYearsClamped(start, years);
  if (cursor > end) {
    years -= 1;
    cursor = addYearsClamped(start, years);
  }

  let months =
    (end.getUTCFullYear() - cursor.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    cursor.getUTCMonth();
  let monthCursor = addMonthsClamped(cursor, months);
  if (monthCursor > end) {
    months -= 1;
    monthCursor = addMonthsClamped(cursor, months);
  }

  const days = Math.round((end.getTime() - monthCursor.getTime()) / DAY_MS);
  return { years, months, days };
}

function parseNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function formatNumber(value: number, locale: string, maxDigits = 4) {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: maxDigits,
  }).format(value);
}

type Currency = "KRW" | "USD" | "EUR" | "GBP" | "JPY";

function formatCurrency(value: number, currency: Currency, locale: string) {
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
  }).format(value);
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

function CopyButton({ value, locale }: { value: string; locale: string }) {
  const [feedback, setFeedback] = useState<{
    state: "idle" | "copied" | "error";
    value: string;
  }>({ state: "idle", value: "" });
  const state = feedback.value === value ? feedback.state : "idle";

  async function handleCopy() {
    if (!value) return;
    try {
      await copyText(value);
      setFeedback({ state: "copied", value });
    } catch {
      setFeedback({ state: "error", value });
    }
  }

  return (
    <button
      className="tool-button tool-button--secondary"
      type="button"
      onClick={handleCopy}
      disabled={!value}
      aria-live="polite"
    >
      {state === "copied"
        ? t(locale, "복사됨", "Copied")
        : state === "error"
          ? t(locale, "복사 실패", "Copy failed")
          : t(locale, "결과 복사", "Copy result")}
    </button>
  );
}

function ToolFrame({
  locale,
  title,
  description,
  children,
}: {
  locale: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="tool-widget" aria-labelledby="tool-widget-title">
      <header className="tool-widget__header">
        <p className="tool-widget__eyebrow">
          {t(locale, "브라우저에서 안전하게 계산", "Private, on-device utility")}
        </p>
        <h2 id="tool-widget-title">{title}</h2>
        <p>{description}</p>
      </header>
      <div className="tool-widget__body">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="tool-field">
      <span className="tool-field__label">{label}</span>
      {children}
      {hint ? <span className="tool-field__hint">{hint}</span> : null}
    </label>
  );
}

function ErrorMessage({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className="tool-error" role="alert">
      {children}
    </p>
  );
}

function ResultPanel({
  label,
  primary,
  children,
  tone,
}: {
  label: string;
  primary: ReactNode;
  children?: ReactNode;
  tone?: string;
}) {
  return (
    <div
      className={`tool-result${tone ? ` tool-result--${tone}` : ""}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="tool-result__label">{label}</span>
      <strong className="tool-result__primary">{primary}</strong>
      {children}
    </div>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="tool-actions">{children}</div>;
}

function ResetButton({ onClick, locale }: { onClick: () => void; locale: string }) {
  return (
    <button className="tool-button tool-button--ghost" type="button" onClick={onClick}>
      {t(locale, "초기화", "Reset")}
    </button>
  );
}

function AgeCalculator({ locale }: { locale: string }) {
  const [birthDate, setBirthDate] = useState("");
  const [referenceDate, setReferenceDate] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => setReferenceDate(todayInputValue()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const calculation = useMemo(() => {
    if (!birthDate) return { result: null, error: "" };
    const birth = parseDateInput(birthDate);
    const reference = parseDateInput(referenceDate);
    if (!birth || !reference) {
      return {
        result: null,
        error: t(locale, "올바른 날짜를 입력해 주세요.", "Enter valid dates."),
      };
    }
    if (birth > reference) {
      return {
        result: null,
        error: t(
          locale,
          "생년월일은 기준일보다 늦을 수 없습니다.",
          "Birth date cannot be after the reference date.",
        ),
      };
    }

    const age = calendarDifference(birth, reference);
    const totalDays = Math.round((reference.getTime() - birth.getTime()) / DAY_MS);
    let nextBirthday = clampedUTCDate(
      reference.getUTCFullYear(),
      birth.getUTCMonth(),
      birth.getUTCDate(),
    );
    if (nextBirthday < reference) {
      nextBirthday = clampedUTCDate(
        reference.getUTCFullYear() + 1,
        birth.getUTCMonth(),
        birth.getUTCDate(),
      );
    }
    const daysUntilBirthday = Math.round(
      (nextBirthday.getTime() - reference.getTime()) / DAY_MS,
    );

    return {
      error: "",
      result: { ...age, totalDays, daysUntilBirthday, nextBirthday },
    };
  }, [birthDate, referenceDate, locale]);

  const summary = calculation.result
    ? t(
        locale,
        `만 ${calculation.result.years}세 ${calculation.result.months}개월 ${calculation.result.days}일`,
        `${calculation.result.years} years, ${calculation.result.months} months, ${calculation.result.days} days`,
      )
    : "";

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "만 나이 계산기", "Age calculator")}
      description={t(
        locale,
        "생년월일을 기준으로 정확한 만 나이와 다음 생일까지 남은 날을 계산합니다.",
        "Calculate exact age, total days lived, and the countdown to the next birthday.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "생년월일", "Date of birth")}>
          <input
            className="tool-input"
            type="date"
            value={birthDate}
            max={referenceDate || undefined}
            onChange={(event) => setBirthDate(event.target.value)}
          />
        </Field>
        <Field label={t(locale, "기준일", "Reference date")}>
          <input
            className="tool-input"
            type="date"
            value={referenceDate}
            onChange={(event) => setReferenceDate(event.target.value)}
          />
        </Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel label={t(locale, "계산된 만 나이", "Exact age")} primary={summary || "-"}>
        {calculation.result ? (
          <div className="tool-stat-grid">
            <span>
              <b>{formatNumber(calculation.result.totalDays, locale, 0)}</b>
              {t(locale, "일 살아왔어요", "days lived")}
            </span>
            <span>
              <b>{formatNumber(calculation.result.daysUntilBirthday, locale, 0)}</b>
              {calculation.result.daysUntilBirthday === 0
                ? t(locale, "오늘이 생일이에요", "birthday is today")
                : t(locale, "일 뒤 다음 생일", "days to next birthday")}
            </span>
            <span>
              <b>{formatDate(calculation.result.nextBirthday, locale)}</b>
              {t(locale, "다음 생일", "next birthday")}
            </span>
          </div>
        ) : null}
      </ResultPanel>
      <Actions>
        <CopyButton value={summary} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            setBirthDate("");
            setReferenceDate(todayInputValue());
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

type NumericCalculation = { value: number | null; error: string };

function PercentageCalculator({ locale }: { locale: string }) {
  const [percent, setPercent] = useState("");
  const [base, setBase] = useState("");
  const [part, setPart] = useState("");
  const [whole, setWhole] = useState("");
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");

  function calculatePair(
    left: string,
    right: string,
    operation: "of" | "ratio" | "change",
  ): NumericCalculation {
    if (!left && !right) return { value: null, error: "" };
    const a = parseNumber(left);
    const b = parseNumber(right);
    if (a === null || b === null) {
      return {
        value: null,
        error: t(locale, "두 칸에 숫자를 입력해 주세요.", "Enter a number in both fields."),
      };
    }
    if (operation === "ratio" && b === 0) {
      return {
        value: null,
        error: t(locale, "0으로 나눌 수 없습니다.", "Cannot divide by zero."),
      };
    }
    if (operation === "change" && a <= 0) {
      return {
        value: null,
        error: t(
          locale,
          "증감률의 이전값은 0보다 커야 합니다.",
          "The old value must be greater than zero for percentage change.",
        ),
      };
    }
    if (operation === "of") return { value: (a / 100) * b, error: "" };
    if (operation === "ratio") return { value: (a / b) * 100, error: "" };
    return { value: ((b - a) / a) * 100, error: "" };
  }

  const ofResult = calculatePair(percent, base, "of");
  const ratioResult = calculatePair(part, whole, "ratio");
  const changeResult = calculatePair(oldValue, newValue, "change");
  const rawDiscountResult = calculatePair(discount, price, "of");
  const parsedPrice = parseNumber(price);
  const parsedDiscount = parseNumber(discount);
  const discountResult: NumericCalculation = rawDiscountResult.error || rawDiscountResult.value === null
    ? rawDiscountResult
    : parsedPrice !== null && parsedDiscount !== null && parsedPrice >= 0 && parsedDiscount >= 0 && parsedDiscount <= 100
      ? rawDiscountResult
      : { value: null, error: t(locale, "가격은 0 이상, 할인율은 0~100%로 입력해 주세요.", "Use a non-negative price and a discount from 0-100%.") };
  const discountedPrice = discountResult.value === null || parsedPrice === null
    ? null
    : parsedPrice - discountResult.value;
  const copyValue = [
    ofResult.value === null ? "" : `${percent}% × ${base} = ${formatNumber(ofResult.value, locale)}`,
    ratioResult.value === null
      ? ""
      : `${part} / ${whole} = ${formatNumber(ratioResult.value, locale)}%`,
    changeResult.value === null
      ? ""
      : `${oldValue} → ${newValue}: ${formatNumber(changeResult.value, locale)}%`,
    discountedPrice === null
      ? ""
      : `${price} - ${discount}% = ${formatNumber(discountedPrice, locale)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "퍼센트 계산기", "Percentage calculator")}
      description={t(
        locale,
        "비율값, 전체 대비 비율, 증감률, 할인 가격을 한 번에 계산합니다.",
        "Solve percentage-of, ratio, percentage-change, and discount questions in one place.",
      )}
    >
      <div className="tool-calculation-list">
        <section className="tool-subcard">
          <h3>{t(locale, "어떤 수의 몇 퍼센트", "What is X% of Y?")}</h3>
          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "퍼센트 (%)", "Percentage (%)")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={percent}
                onChange={(event) => setPercent(event.target.value)}
                placeholder="15"
              />
            </Field>
            <Field label={t(locale, "기준값", "Base value")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={base}
                onChange={(event) => setBase(event.target.value)}
                placeholder="200"
              />
            </Field>
          </div>
          <ErrorMessage>{ofResult.error}</ErrorMessage>
          <output className="tool-inline-result">
            {ofResult.value === null ? "-" : formatNumber(ofResult.value, locale)}
          </output>
        </section>

        <section className="tool-subcard">
          <h3>{t(locale, "전체 중 일부의 비율", "X is what percent of Y?")}</h3>
          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "일부값", "Part")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={part}
                onChange={(event) => setPart(event.target.value)}
                placeholder="30"
              />
            </Field>
            <Field label={t(locale, "전체값", "Whole")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={whole}
                onChange={(event) => setWhole(event.target.value)}
                placeholder="120"
              />
            </Field>
          </div>
          <ErrorMessage>{ratioResult.error}</ErrorMessage>
          <output className="tool-inline-result">
            {ratioResult.value === null
              ? "-"
              : `${formatNumber(ratioResult.value, locale)}%`}
          </output>
        </section>

        <section className="tool-subcard">
          <h3>{t(locale, "증가율과 감소율", "Percentage change")}</h3>
          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "이전값", "Old value")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={oldValue}
                onChange={(event) => setOldValue(event.target.value)}
                placeholder="80"
              />
            </Field>
            <Field label={t(locale, "새 값", "New value")}>
              <input
                className="tool-input"
                inputMode="decimal"
                value={newValue}
                onChange={(event) => setNewValue(event.target.value)}
                placeholder="100"
              />
            </Field>
          </div>
          <ErrorMessage>{changeResult.error}</ErrorMessage>
          <output className="tool-inline-result">
            {changeResult.value === null
              ? "-"
              : `${changeResult.value > 0 ? "+" : ""}${formatNumber(changeResult.value, locale)}%`}
          </output>
        </section>

        <section className="tool-subcard">
          <h3>{t(locale, "할인 후 가격", "Price after discount")}</h3>
          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "원래 가격", "Original price") }>
              <input
                className="tool-input"
                inputMode="decimal"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="50000"
              />
            </Field>
            <Field label={t(locale, "할인율 (%)", "Discount (%)") }>
              <input
                className="tool-input"
                inputMode="decimal"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                placeholder="20"
              />
            </Field>
          </div>
          <ErrorMessage>{discountResult.error}</ErrorMessage>
          <output className="tool-inline-result">
            {discountedPrice === null ? "-" : formatNumber(discountedPrice, locale)}
          </output>
        </section>
      </div>
      <Actions>
        <CopyButton value={copyValue} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            setPercent("");
            setBase("");
            setPart("");
            setWhole("");
            setOldValue("");
            setNewValue("");
            setPrice("");
            setDiscount("");
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

type UnitDefinition = {
  ko: string;
  en: string;
  factor: number;
};

const UNIT_GROUPS = {
  length: {
    ko: "길이",
    en: "Length",
    units: {
      mm: { ko: "밀리미터 (mm)", en: "Millimeters (mm)", factor: 0.001 },
      cm: { ko: "센티미터 (cm)", en: "Centimeters (cm)", factor: 0.01 },
      m: { ko: "미터 (m)", en: "Meters (m)", factor: 1 },
      km: { ko: "킬로미터 (km)", en: "Kilometers (km)", factor: 1000 },
      in: { ko: "인치 (in)", en: "Inches (in)", factor: 0.0254 },
      ft: { ko: "피트 (ft)", en: "Feet (ft)", factor: 0.3048 },
      yd: { ko: "야드 (yd)", en: "Yards (yd)", factor: 0.9144 },
      mi: { ko: "마일 (mi)", en: "Miles (mi)", factor: 1609.344 },
    },
  },
  mass: {
    ko: "무게",
    en: "Mass",
    units: {
      mg: { ko: "밀리그램 (mg)", en: "Milligrams (mg)", factor: 0.000001 },
      g: { ko: "그램 (g)", en: "Grams (g)", factor: 0.001 },
      kg: { ko: "킬로그램 (kg)", en: "Kilograms (kg)", factor: 1 },
      t: { ko: "미터톤 (t)", en: "Metric tonnes (t)", factor: 1000 },
      oz: { ko: "온스 (oz)", en: "Ounces (oz)", factor: 0.028349523125 },
      lb: { ko: "파운드 (lb)", en: "Pounds (lb)", factor: 0.45359237 },
    },
  },
  temperature: {
    ko: "온도",
    en: "Temperature",
    units: {
      c: { ko: "섭씨 (°C)", en: "Celsius (°C)", factor: 1 },
      f: { ko: "화씨 (°F)", en: "Fahrenheit (°F)", factor: 1 },
      k: { ko: "켈빈 (K)", en: "Kelvin (K)", factor: 1 },
    },
  },
  area: {
    ko: "면적",
    en: "Area",
    units: {
      sqm: { ko: "제곱미터 (m²)", en: "Square meters (m²)", factor: 1 },
      sqkm: { ko: "제곱킬로미터 (km²)", en: "Square kilometers (km²)", factor: 1_000_000 },
      sqft: { ko: "제곱피트 (ft²)", en: "Square feet (ft²)", factor: 0.09290304 },
      sqyd: { ko: "제곱야드 (yd²)", en: "Square yards (yd²)", factor: 0.83612736 },
      acre: { ko: "에이커", en: "Acres", factor: 4046.8564224 },
      ha: { ko: "헥타르", en: "Hectares", factor: 10000 },
      pyeong: { ko: "평", en: "Pyeong", factor: 3.305785 },
    },
  },
  volume: {
    ko: "부피",
    en: "Volume",
    units: {
      ml: { ko: "밀리리터 (mL)", en: "Milliliters (mL)", factor: 0.001 },
      l: { ko: "리터 (L)", en: "Liters (L)", factor: 1 },
      cubicm: { ko: "세제곱미터 (m³)", en: "Cubic meters (m³)", factor: 1000 },
      tsp: { ko: "티스푼 (US)", en: "Teaspoons (US)", factor: 0.00492892159375 },
      tbsp: { ko: "테이블스푼 (US)", en: "Tablespoons (US)", factor: 0.01478676478125 },
      cup: { ko: "컵 (US)", en: "Cups (US)", factor: 0.2365882365 },
      gallon: { ko: "갤런 (US)", en: "Gallons (US)", factor: 3.785411784 },
    },
  },
  speed: {
    ko: "속도",
    en: "Speed",
    units: {
      mps: { ko: "미터/초 (m/s)", en: "Meters/second (m/s)", factor: 1 },
      kph: { ko: "킬로미터/시 (km/h)", en: "Kilometers/hour (km/h)", factor: 0.2777777778 },
      mph: { ko: "마일/시 (mph)", en: "Miles/hour (mph)", factor: 0.44704 },
      knot: { ko: "노트 (kn)", en: "Knots (kn)", factor: 0.5144444444 },
    },
  },
  data: {
    ko: "데이터",
    en: "Digital storage",
    units: {
      b: { ko: "바이트 (B)", en: "Bytes (B)", factor: 1 },
      kb: { ko: "킬로바이트 (KB)", en: "Kilobytes (KB)", factor: 1_000 },
      mb: { ko: "메가바이트 (MB)", en: "Megabytes (MB)", factor: 1_000 ** 2 },
      gb: { ko: "기가바이트 (GB)", en: "Gigabytes (GB)", factor: 1_000 ** 3 },
      tb: { ko: "테라바이트 (TB)", en: "Terabytes (TB)", factor: 1_000 ** 4 },
    },
  },
} as const;

type UnitCategory = keyof typeof UNIT_GROUPS;

function convertTemperature(value: number, from: string, to: string) {
  let celsius = value;
  if (from === "f") celsius = ((value - 32) * 5) / 9;
  if (from === "k") celsius = value - 273.15;
  if (to === "f") return (celsius * 9) / 5 + 32;
  if (to === "k") return celsius + 273.15;
  return celsius;
}

function formatConvertedNumber(value: number, locale: string) {
  const absolute = Math.abs(value);
  return new Intl.NumberFormat(localeTag(locale), {
    maximumSignificantDigits: 12,
    notation: absolute !== 0 && (absolute < 0.000001 || absolute >= 1_000_000_000_000)
      ? "scientific"
      : "standard",
  }).format(value);
}

function UnitConverter({ locale }: { locale: string }) {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [value, setValue] = useState("");
  const [fromUnit, setFromUnit] = useState("cm");
  const [toUnit, setToUnit] = useState("m");

  const units = UNIT_GROUPS[category].units as Record<string, UnitDefinition>;
  const converted = useMemo(() => {
    if (!value) return { value: null, error: "" };
    const parsed = parseNumber(value);
    if (parsed === null) {
      return {
        value: null,
        error: t(locale, "올바른 숫자를 입력해 주세요.", "Enter a valid number."),
      };
    }
    if (!units[fromUnit] || !units[toUnit]) {
      return { value: null, error: t(locale, "단위를 선택해 주세요.", "Choose valid units.") };
    }
    const result =
      category === "temperature"
        ? convertTemperature(parsed, fromUnit, toUnit)
        : (parsed * units[fromUnit].factor) / units[toUnit].factor;
    return { value: result, error: "" };
  }, [category, fromUnit, locale, toUnit, units, value]);

  function changeCategory(nextCategory: UnitCategory) {
    const keys = Object.keys(UNIT_GROUPS[nextCategory].units);
    setCategory(nextCategory);
    setFromUnit(keys[0]);
    setToUnit(keys[1] ?? keys[0]);
  }

  const resultText =
    converted.value === null
      ? ""
      : `${value} ${fromUnit} = ${formatConvertedNumber(converted.value, locale)} ${toUnit}`;

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "단위 변환기", "Unit converter")}
      description={t(
        locale,
        "길이, 무게, 온도, 면적, 부피, 속도와 데이터 단위를 즉시 변환합니다.",
        "Instantly convert length, mass, temperature, area, volume, speed, and storage units.",
      )}
    >
      <Field label={t(locale, "변환 종류", "Conversion category")}>
        <select
          className="tool-select"
          value={category}
          onChange={(event) => changeCategory(event.target.value as UnitCategory)}
        >
          {(Object.keys(UNIT_GROUPS) as UnitCategory[]).map((key) => (
            <option key={key} value={key}>
              {isKo(locale) ? UNIT_GROUPS[key].ko : UNIT_GROUPS[key].en}
            </option>
          ))}
        </select>
      </Field>

      <div className="tool-converter-row">
        <div className="tool-converter-side">
          <Field label={t(locale, "변환할 값", "Value to convert")}>
            <input
              className="tool-input"
              inputMode="decimal"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="100"
            />
          </Field>
          <Field label={t(locale, "단위", "From unit")}>
            <select
              className="tool-select"
              value={fromUnit}
              onChange={(event) => setFromUnit(event.target.value)}
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>
                  {isKo(locale) ? unit.ko : unit.en}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <button
          className="tool-swap-button"
          type="button"
          onClick={() => {
            setFromUnit(toUnit);
            setToUnit(fromUnit);
          }}
          aria-label={t(locale, "두 단위 바꾸기", "Swap units")}
          title={t(locale, "단위 바꾸기", "Swap units")}
        >
          ⇄
        </button>

        <div className="tool-converter-side">
          <Field label={t(locale, "변환 결과", "Converted value")}>
            <output className="tool-output-box">
              {converted.value === null ? "-" : formatConvertedNumber(converted.value, locale)}
            </output>
          </Field>
          <Field label={t(locale, "단위", "To unit")}>
            <select
              className="tool-select"
              value={toUnit}
              onChange={(event) => setToUnit(event.target.value)}
            >
              {Object.entries(units).map(([key, unit]) => (
                <option key={key} value={key}>
                  {isKo(locale) ? unit.ko : unit.en}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <ErrorMessage>{converted.error}</ErrorMessage>
      <Actions>
        <CopyButton value={resultText} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            setCategory("length");
            setValue("");
            setFromUnit("cm");
            setToUnit("m");
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

function businessDaysBetween(start: Date, end: Date) {
  const first = start <= end ? start : end;
  const last = start <= end ? end : start;
  const totalDays = Math.round((last.getTime() - first.getTime()) / DAY_MS);
  const fullWeeks = Math.floor(totalDays / 7);
  let weekdays = fullWeeks * 5;
  const remainder = totalDays % 7;
  for (let offset = 1; offset <= remainder; offset += 1) {
    const weekday = (first.getUTCDay() + offset) % 7;
    if (weekday !== 0 && weekday !== 6) weekdays += 1;
  }
  return weekdays;
}

function DateCalculator({ locale }: { locale: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [baseDate, setBaseDate] = useState("");
  const [daysToAdd, setDaysToAdd] = useState("");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  useEffect(() => {
    const timeout = window.setTimeout(() => setBaseDate(todayInputValue()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const difference = useMemo(() => {
    if (!startDate && !endDate) return { value: null, error: "" };
    const first = parseDateInput(startDate);
    const second = parseDateInput(endDate);
    if (!first || !second) {
      return {
        value: null,
        error: t(locale, "시작일과 종료일을 입력해 주세요.", "Enter both start and end dates."),
      };
    }
    const earlier = first <= second ? first : second;
    const later = first <= second ? second : first;
    const totalDays = Math.round((later.getTime() - earlier.getTime()) / DAY_MS);
    return {
      error: "",
      value: {
        totalDays,
        weeks: Math.floor(totalDays / 7),
        extraDays: totalDays % 7,
        businessDays: businessDaysBetween(first, second),
        calendar: calendarDifference(earlier, later),
        reversed: first > second,
      },
    };
  }, [endDate, locale, startDate]);

  const adjustedDate = useMemo(() => {
    if (!daysToAdd) return { value: null, error: "" };
    const base = parseDateInput(baseDate);
    const amount = parseNumber(daysToAdd);
    if (!base || amount === null || !Number.isInteger(amount) || amount < 0) {
      return {
        value: null,
        error: t(locale, "날짜와 0 이상의 정수 일수를 입력해 주세요.", "Enter a date and a non-negative whole number of days."),
      };
    }
    if (amount > 1_000_000) {
      return {
        value: null,
        error: t(locale, "일수는 1,000,000 이하로 입력해 주세요.", "Use 1,000,000 days or fewer."),
      };
    }
    const direction = operation === "add" ? 1 : -1;
    const date = new Date(base.getTime() + amount * direction * DAY_MS);
    return { value: date, error: "" };
  }, [baseDate, daysToAdd, locale, operation]);

  const differenceSummary = difference.value
    ? t(
        locale,
        `두 날짜의 차이: ${formatNumber(difference.value.totalDays, locale, 0)}일`,
        `Difference: ${formatNumber(difference.value.totalDays, locale, 0)} days`,
      )
    : "";
  const adjustedSummary = adjustedDate.value ? formatDate(adjustedDate.value, locale) : "";

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "날짜 계산기", "Date calculator")}
      description={t(
        locale,
        "두 날짜 사이의 기간을 비교하거나 특정 날짜에서 원하는 일수를 더하고 뺍니다.",
        "Compare the time between two dates or add and subtract days from any date.",
      )}
    >
      <section className="tool-subcard">
        <h3>{t(locale, "날짜 사이 기간", "Time between dates")}</h3>
        <div className="tool-grid tool-grid--2">
          <Field label={t(locale, "시작일", "Start date")}>
            <input
              className="tool-input"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </Field>
          <Field label={t(locale, "종료일", "End date")}>
            <input
              className="tool-input"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </Field>
        </div>
        <ErrorMessage>{difference.error}</ErrorMessage>
        <ResultPanel
          label={t(locale, "총 날짜 차이", "Total difference")}
          primary={
            difference.value
              ? t(
                  locale,
                  `${formatNumber(difference.value.totalDays, locale, 0)}일`,
                  `${formatNumber(difference.value.totalDays, locale, 0)} days`,
                )
              : "-"
          }
        >
          {difference.value ? (
            <div className="tool-stat-grid">
              <span>
                <b>
                  {difference.value.calendar.years} / {difference.value.calendar.months} /{" "}
                  {difference.value.calendar.days}
                </b>
                {t(locale, "년 / 개월 / 일", "years / months / days")}
              </span>
              <span>
                <b>
                  {difference.value.weeks} + {difference.value.extraDays}
                </b>
                {t(locale, "주 + 일", "weeks + days")}
              </span>
              <span>
                <b>{formatNumber(difference.value.businessDays, locale, 0)}</b>
                {t(locale, "평일 (공휴일 제외 안 함)", "weekdays (holidays not excluded)")}
              </span>
            </div>
          ) : null}
        </ResultPanel>
      </section>

      <section className="tool-subcard">
        <h3>{t(locale, "날짜 더하기와 빼기", "Add or subtract days")}</h3>
        <div className="tool-grid tool-grid--3">
          <Field label={t(locale, "기준 날짜", "Base date")}>
            <input
              className="tool-input"
              type="date"
              value={baseDate}
              onChange={(event) => setBaseDate(event.target.value)}
            />
          </Field>
          <Field label={t(locale, "계산 방식", "Operation")}>
            <select
              className="tool-select"
              value={operation}
              onChange={(event) => setOperation(event.target.value as "add" | "subtract")}
            >
              <option value="add">{t(locale, "더하기", "Add")}</option>
              <option value="subtract">{t(locale, "빼기", "Subtract")}</option>
            </select>
          </Field>
          <Field label={t(locale, "일수", "Number of days")}>
            <input
              className="tool-input"
              inputMode="numeric"
              value={daysToAdd}
              onChange={(event) => setDaysToAdd(event.target.value)}
              placeholder="30"
            />
          </Field>
        </div>
        <ErrorMessage>{adjustedDate.error}</ErrorMessage>
        <ResultPanel
          label={t(locale, "계산된 날짜", "Calculated date")}
          primary={adjustedSummary || "-"}
        />
      </section>

      <Actions>
        <CopyButton
          value={[differenceSummary, adjustedSummary].filter(Boolean).join("\n")}
          locale={locale}
        />
        <ResetButton
          locale={locale}
          onClick={() => {
            setStartDate("");
            setEndDate("");
            setBaseDate(todayInputValue());
            setDaysToAdd("");
            setOperation("add");
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

type ImageFormat = "image/jpeg" | "image/png" | "image/webp";

type ImageSource = {
  file: File;
  url: string;
  width: number;
  height: number;
};

type OptimizedImage = {
  url: string;
  blob: Blob;
  width: number;
  height: number;
  filename: string;
};

function formatBytes(bytes: number, locale: string) {
  if (bytes < 1_024) return `${formatNumber(bytes, locale, 0)} B`;
  if (bytes < 1_024 ** 2) return `${formatNumber(bytes / 1_024, locale, 1)} KB`;
  return `${formatNumber(bytes / 1_024 ** 2, locale, 2)} MB`;
}

function imageFormatFromFile(file: File): ImageFormat | null {
  if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp") {
    return file.type;
  }
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  return null;
}

function loadBrowserImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image decode failed"));
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image encoding failed"));
      },
      format,
      quality,
    );
  });
}

function ImageOptimizer({ locale }: { locale: string }) {
  const [source, setSource] = useState<ImageSource | null>(null);
  const [optimized, setOptimized] = useState<OptimizedImage | null>(null);
  const [targetWidth, setTargetWidth] = useState("");
  const [targetHeight, setTargetHeight] = useState("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [quality, setQuality] = useState(82);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const imageOperationRef = useRef(0);

  useEffect(() => () => {
    imageOperationRef.current += 1;
  }, []);

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  useEffect(() => {
    return () => {
      if (optimized) URL.revokeObjectURL(optimized.url);
    };
  }, [optimized]);

  function clearOutput() {
    imageOperationRef.current += 1;
    setOptimized(null);
    setBusy(false);
  }

  async function selectFile(file?: File) {
    if (!file) return;
    const operationId = imageOperationRef.current + 1;
    imageOperationRef.current = operationId;
    setError("");
    setOptimized(null);
    setBusy(false);
    setSource(null);
    if (!imageFormatFromFile(file)) {
      setError(
        t(
          locale,
          "JPG, PNG 또는 WebP 이미지 파일을 선택해 주세요.",
          "Choose a JPG, PNG, or WebP image file.",
        ),
      );
      return;
    }
    if (file.size > 25 * 1_024 ** 2) {
      setError(t(locale, "파일 크기는 25MB 이하여야 합니다.", "The file must be 25 MB or smaller."));
      return;
    }

    const url = URL.createObjectURL(file);
    try {
      const image = await loadBrowserImage(url);
      if (operationId !== imageOperationRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("Empty image");
      if (image.naturalWidth * image.naturalHeight > 40_000_000) {
        URL.revokeObjectURL(url);
        setError(
          t(
            locale,
            "안전한 처리를 위해 4천만 픽셀 이하의 이미지를 사용해 주세요.",
            "For safe browser processing, use an image under 40 megapixels.",
          ),
        );
        return;
      }
      const width = Math.min(image.naturalWidth, 1_920);
      const height = Math.max(1, Math.round((width / image.naturalWidth) * image.naturalHeight));
      setSource({ file, url, width: image.naturalWidth, height: image.naturalHeight });
      setTargetWidth(String(width));
      setTargetHeight(String(height));
      setFormat(imageFormatFromFile(file) === "image/png" ? "image/png" : "image/webp");
    } catch {
      URL.revokeObjectURL(url);
      if (operationId !== imageOperationRef.current) return;
      setError(
        t(
          locale,
          "이미지를 읽을 수 없습니다. 파일이 손상되지 않았는지 확인해 주세요.",
          "Could not read the image. Check that the file is not damaged.",
        ),
      );
    }
  }

  function changeWidth(value: string) {
    setTargetWidth(value);
    clearOutput();
    const width = parseNumber(value);
    if (lockAspectRatio && source && width !== null && width > 0) {
      setTargetHeight(String(Math.max(1, Math.round((width / source.width) * source.height))));
    }
  }

  function changeHeight(value: string) {
    setTargetHeight(value);
    clearOutput();
    const height = parseNumber(value);
    if (lockAspectRatio && source && height !== null && height > 0) {
      setTargetWidth(String(Math.max(1, Math.round((height / source.height) * source.width))));
    }
  }

  async function optimize() {
    if (!source) {
      setError(t(locale, "먼저 이미지를 선택해 주세요.", "Choose an image first."));
      return;
    }
    const width = parseNumber(targetWidth);
    const height = parseNumber(targetHeight);
    if (
      width === null ||
      height === null ||
      !Number.isInteger(width) ||
      !Number.isInteger(height) ||
      width < 1 ||
      height < 1 ||
      width > 12_000 ||
      height > 12_000 ||
      width * height > 40_000_000
    ) {
      setError(
        t(
          locale,
          "가로와 세로는 1~12,000px의 정수이고 총 4천만 픽셀 이하여야 합니다.",
          "Width and height must be whole numbers from 1-12,000 px and under 40 megapixels total.",
        ),
      );
      return;
    }

    const operationId = imageOperationRef.current + 1;
    imageOperationRef.current = operationId;
    setBusy(true);
    setError("");
    setOptimized(null);
    try {
      const image = await loadBrowserImage(source.url);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
      }
      context.drawImage(image, 0, 0, width, height);
      const blob = await canvasToBlob(canvas, format, quality / 100);
      if (blob.type && blob.type !== format) {
        throw new Error("Format unsupported");
      }
      const extension = format === "image/jpeg" ? "jpg" : format.split("/")[1];
      const basename = source.file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9가-힣_-]+/g, "-") || "image";
      const optimizedUrl = URL.createObjectURL(blob);
      if (operationId !== imageOperationRef.current) {
        URL.revokeObjectURL(optimizedUrl);
        return;
      }
      setOptimized({
        url: optimizedUrl,
        blob,
        width,
        height,
        filename: `${basename}-optimized.${extension}`,
      });
    } catch {
      if (operationId !== imageOperationRef.current) return;
      setError(
        t(
          locale,
          "이 브라우저에서 이미지를 변환할 수 없습니다. 다른 형식을 선택해 보세요.",
          "The browser could not convert this image. Try another output format.",
        ),
      );
    } finally {
      if (operationId === imageOperationRef.current) setBusy(false);
    }
  }

  function download() {
    if (!optimized) return;
    const anchor = document.createElement("a");
    anchor.href = optimized.url;
    anchor.download = optimized.filename;
    anchor.click();
  }

  function reset() {
    imageOperationRef.current += 1;
    setSource(null);
    setOptimized(null);
    setTargetWidth("");
    setTargetHeight("");
    setLockAspectRatio(true);
    setFormat("image/webp");
    setQuality(82);
    setError("");
    setBusy(false);
    setInputKey((value) => value + 1);
  }

  const reduction =
    source && optimized ? ((source.file.size - optimized.blob.size) / source.file.size) * 100 : null;

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "이미지 용량 줄이기", "Image optimizer")}
      description={t(
        locale,
        "JPG, PNG, WebP 이미지를 원하는 크기와 품질로 브라우저에서 바로 변환합니다.",
        "Resize and compress JPG, PNG, and WebP images locally in your browser.",
      )}
    >
      <Field
        label={t(locale, "원본 이미지", "Source image")}
        hint={t(
          locale,
          "JPG, PNG, WebP, 최대 25MB. 이미지는 서버로 업로드되지 않습니다.",
          "JPG, PNG, WebP, up to 25 MB. The image is never uploaded.",
        )}
      >
        <input
          key={inputKey}
          className="tool-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={(event) => void selectFile(event.target.files?.[0])}
        />
      </Field>
      <ErrorMessage>{error}</ErrorMessage>

      {source ? (
        <>
          <div className="tool-image-workspace">
            <figure className="tool-image-preview">
              <img src={source.url} alt={t(locale, "원본 이미지 미리보기", "Source image preview")} />
              <figcaption>
                <strong>{source.file.name}</strong>
                <span>{source.width} × {source.height}px, {formatBytes(source.file.size, locale)}</span>
              </figcaption>
            </figure>
            {optimized ? (
              <figure className="tool-image-preview tool-image-preview--result">
                <img src={optimized.url} alt={t(locale, "최적화된 이미지 미리보기", "Optimized image preview")} />
                <figcaption>
                  <strong>{t(locale, "변환 결과", "Optimized result")}</strong>
                  <span>{optimized.width} × {optimized.height}px, {formatBytes(optimized.blob.size, locale)}</span>
                </figcaption>
              </figure>
            ) : null}
          </div>

          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "가로 (px)", "Width (px)")}>
              <input className="tool-input" inputMode="numeric" value={targetWidth} onChange={(event) => changeWidth(event.target.value)} />
            </Field>
            <Field label={t(locale, "세로 (px)", "Height (px)")}>
              <input className="tool-input" inputMode="numeric" value={targetHeight} onChange={(event) => changeHeight(event.target.value)} />
            </Field>
          </div>
          <label className="tool-check">
            <input type="checkbox" checked={lockAspectRatio} onChange={(event) => setLockAspectRatio(event.target.checked)} />
            {t(locale, "원본 비율 유지", "Lock aspect ratio")}
          </label>

          <div className="tool-grid tool-grid--2">
            <Field label={t(locale, "출력 형식", "Output format")}>
              <select className="tool-select" value={format} onChange={(event) => { setFormat(event.target.value as ImageFormat); clearOutput(); }}>
                <option value="image/webp">WebP</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/png">PNG</option>
              </select>
            </Field>
            <Field
              label={`${t(locale, "품질", "Quality")}: ${quality}%`}
              hint={
                format === "image/png"
                  ? t(locale, "PNG는 무손실 형식이라 품질 설정이 적용되지 않습니다.", "PNG is lossless, so quality is not applied.")
                  : undefined
              }
            >
              <input
                className="tool-range"
                type="range"
                min="10"
                max="100"
                value={quality}
                disabled={format === "image/png"}
                onChange={(event) => { setQuality(Number(event.target.value)); clearOutput(); }}
              />
            </Field>
          </div>

          {optimized ? (
            <ResultPanel
              label={t(locale, "최적화 결과", "Optimization result")}
              primary={formatBytes(optimized.blob.size, locale)}
              tone={reduction !== null && reduction >= 0 ? "healthy" : "overweight"}
            >
              <div className="tool-result__details">
                <strong>
                  {reduction !== null && reduction >= 0
                    ? t(locale, `${formatNumber(reduction, locale, 1)}% 감소`, `${formatNumber(reduction, locale, 1)}% smaller`)
                    : t(locale, `${formatNumber(Math.abs(reduction ?? 0), locale, 1)}% 증가`, `${formatNumber(Math.abs(reduction ?? 0), locale, 1)}% larger`)}
                </strong>
                <span>{t(locale, "변환 후에는 EXIF 등 원본 메타데이터가 제거됩니다.", "Original metadata such as EXIF is removed during conversion.")}</span>
              </div>
            </ResultPanel>
          ) : null}

          <Actions>
            <button className="tool-button tool-button--primary" type="button" onClick={() => void optimize()} disabled={busy}>
              {busy ? t(locale, "최적화 중…", "Optimizing…") : t(locale, "이미지 최적화", "Optimize image")}
            </button>
            <button className="tool-button tool-button--secondary" type="button" onClick={download} disabled={!optimized}>
              {t(locale, "이미지 다운로드", "Download image")}
            </button>
            <ResetButton locale={locale} onClick={reset} />
          </Actions>
        </>
      ) : null}
    </ToolFrame>
  );
}

const CURRENCIES: Currency[] = ["KRW", "USD", "EUR", "GBP", "JPY"];

function LoanCalculator({ locale }: { locale: string }) {
  const korean = isKo(locale);
  const initialPrincipal = korean ? "300000000" : "250000";
  const [principal, setPrincipal] = useState(initialPrincipal);
  const [annualRate, setAnnualRate] = useState("4.5");
  const [termYears, setTermYears] = useState("30");
  const [currency, setCurrency] = useState<Currency>(korean ? "KRW" : "USD");

  const calculation = useMemo(() => {
    const amount = parseNumber(principal);
    const rate = parseNumber(annualRate);
    const years = parseNumber(termYears);
    if (amount === null || rate === null || years === null) {
      return {
        value: null,
        error: t(locale, "모든 칸에 숫자를 입력해 주세요.", "Enter numbers in every field."),
      };
    }
    if (amount <= 0 || rate < 0 || rate > 1_000 || years <= 0 || years > 100) {
      return {
        value: null,
        error: t(
          locale,
          "대출금은 양수, 금리는 0~1,000%, 기간은 0~100년으로 입력해 주세요.",
          "Use a positive amount, a 0-1,000% rate, and a term of up to 100 years.",
        ),
      };
    }
    const payments = Math.round(years * 12);
    if (payments < 1) {
      return { value: null, error: t(locale, "상환 기간이 너무 짧습니다.", "The term is too short.") };
    }
    const monthlyRate = rate / 100 / 12;
    const monthlyPayment =
      monthlyRate === 0
        ? amount / payments
        : (amount * monthlyRate) / (1 - (1 + monthlyRate) ** -payments);
    const totalPayment = monthlyPayment * payments;
    if (!Number.isFinite(monthlyPayment) || !Number.isFinite(totalPayment)) {
      return {
        value: null,
        error: t(locale, "계산 범위를 벗어난 입력값입니다.", "These values exceed the calculation range."),
      };
    }
    return {
      error: "",
      value: {
        monthlyPayment,
        totalPayment,
        totalInterest: totalPayment - amount,
        payments,
      },
    };
  }, [annualRate, locale, principal, termYears]);

  const summary = calculation.value
    ? [
        `${t(locale, "월 상환액", "Monthly payment")}: ${formatCurrency(calculation.value.monthlyPayment, currency, locale)}`,
        `${t(locale, "총 이자", "Total interest")}: ${formatCurrency(calculation.value.totalInterest, currency, locale)}`,
        `${t(locale, "총 상환액", "Total repaid")}: ${formatCurrency(calculation.value.totalPayment, currency, locale)}`,
      ].join("\n")
    : "";

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "대출 상환 계산기", "Loan payment calculator")}
      description={t(
        locale,
        "원리금균등상환 방식의 월 납입액과 총 이자 비용을 빠르게 추정합니다.",
        "Estimate monthly payments and total interest for a fixed-rate amortizing loan.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "대출 금액", "Loan amount")}>
          <div className="tool-input-group">
            <input
              className="tool-input"
              inputMode="decimal"
              value={principal}
              onChange={(event) => setPrincipal(event.target.value)}
            />
            <select
              className="tool-select tool-select--compact"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
              aria-label={t(locale, "통화", "Currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label={t(locale, "연 이자율 (%)", "Annual interest rate (%)")}>
          <input
            className="tool-input"
            inputMode="decimal"
            value={annualRate}
            onChange={(event) => setAnnualRate(event.target.value)}
          />
        </Field>
        <Field label={t(locale, "상환 기간 (년)", "Loan term (years)")}>
          <input
            className="tool-input"
            inputMode="decimal"
            value={termYears}
            onChange={(event) => setTermYears(event.target.value)}
          />
        </Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel
        label={t(locale, "예상 월 상환액", "Estimated monthly payment")}
        primary={
          calculation.value
            ? formatCurrency(calculation.value.monthlyPayment, currency, locale)
            : "-"
        }
      >
        {calculation.value ? (
          <div className="tool-stat-grid">
            <span>
              <b>{formatCurrency(calculation.value.totalInterest, currency, locale)}</b>
              {t(locale, "총 이자", "total interest")}
            </span>
            <span>
              <b>{formatCurrency(calculation.value.totalPayment, currency, locale)}</b>
              {t(locale, "총 상환액", "total repaid")}
            </span>
            <span>
              <b>{formatNumber(calculation.value.payments, locale, 0)}</b>
              {t(locale, "회 납부", "payments")}
            </span>
          </div>
        ) : null}
      </ResultPanel>
      <p className="tool-disclaimer">
        {t(
          locale,
          "수수료, 세금, 변동금리 조건은 포함하지 않은 참고용 추정치입니다.",
          "This estimate excludes fees, taxes, and variable-rate terms.",
        )}
      </p>
      <Actions>
        <CopyButton value={summary} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            setPrincipal(initialPrincipal);
            setAnnualRate("4.5");
            setTermYears("30");
            setCurrency(korean ? "KRW" : "USD");
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

const COMPOUND_FREQUENCIES = [1, 2, 4, 12, 365] as const;

function CompoundInterestCalculator({ locale }: { locale: string }) {
  const korean = isKo(locale);
  const initialStart = korean ? "10000000" : "10000";
  const initialMonthly = korean ? "500000" : "500";
  const [startingAmount, setStartingAmount] = useState(initialStart);
  const [monthlyContribution, setMonthlyContribution] = useState(initialMonthly);
  const [annualRate, setAnnualRate] = useState("7");
  const [years, setYears] = useState("10");
  const [frequency, setFrequency] = useState<(typeof COMPOUND_FREQUENCIES)[number]>(12);
  const [currency, setCurrency] = useState<Currency>(korean ? "KRW" : "USD");

  const calculation = useMemo(() => {
    const initial = parseNumber(startingAmount);
    const contribution = parseNumber(monthlyContribution);
    const rate = parseNumber(annualRate);
    const duration = parseNumber(years);
    if (initial === null || contribution === null || rate === null || duration === null) {
      return {
        value: null,
        error: t(locale, "모든 칸에 숫자를 입력해 주세요.", "Enter numbers in every field."),
      };
    }
    if (
      initial < 0 ||
      contribution < 0 ||
      rate < 0 ||
      rate > 1_000 ||
      duration <= 0 ||
      duration > 100
    ) {
      return {
        value: null,
        error: t(
          locale,
          "금액과 금리는 0 이상, 기간은 0~100년으로 입력해 주세요.",
          "Use non-negative amounts and rates, with a term of up to 100 years.",
        ),
      };
    }
    const months = Math.round(duration * 12);
    if (months < 1) {
      return { value: null, error: t(locale, "투자 기간이 너무 짧습니다.", "The term is too short.") };
    }
    const nominalRate = rate / 100;
    const monthlyEquivalentRate =
      nominalRate === 0 ? 0 : (1 + nominalRate / frequency) ** (frequency / 12) - 1;
    let balance = initial;
    for (let month = 0; month < months; month += 1) {
      balance *= 1 + monthlyEquivalentRate;
      balance += contribution;
    }
    const contributed = initial + contribution * months;
    if (!Number.isFinite(balance) || !Number.isFinite(contributed)) {
      return {
        value: null,
        error: t(locale, "계산 범위를 벗어난 입력값입니다.", "These values exceed the calculation range."),
      };
    }
    return {
      error: "",
      value: {
        balance,
        contributed,
        interest: balance - contributed,
        months,
      },
    };
  }, [annualRate, frequency, locale, monthlyContribution, startingAmount, years]);

  const frequencyLabel = (value: number) => {
    const labels: Record<number, [string, string]> = {
      1: ["연 1회", "Annually"],
      2: ["반기", "Semiannually"],
      4: ["분기", "Quarterly"],
      12: ["매월", "Monthly"],
      365: ["매일", "Daily"],
    };
    return isKo(locale) ? labels[value][0] : labels[value][1];
  };
  const summary = calculation.value
    ? [
        `${t(locale, "예상 최종 금액", "Estimated future value")}: ${formatCurrency(calculation.value.balance, currency, locale)}`,
        `${t(locale, "총 납입 원금", "Total contributions")}: ${formatCurrency(calculation.value.contributed, currency, locale)}`,
        `${t(locale, "예상 이자", "Estimated interest")}: ${formatCurrency(calculation.value.interest, currency, locale)}`,
      ].join("\n")
    : "";

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "복리 계산기", "Compound interest calculator")}
      description={t(
        locale,
        "초기 금액과 월 적립액이 복리로 성장할 때의 미래 가치를 계산합니다.",
        "Project how an initial deposit and monthly contributions may grow with compounding.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "초기 금액", "Starting amount")}>
          <div className="tool-input-group">
            <input
              className="tool-input"
              inputMode="decimal"
              value={startingAmount}
              onChange={(event) => setStartingAmount(event.target.value)}
            />
            <select
              className="tool-select tool-select--compact"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as Currency)}
              aria-label={t(locale, "통화", "Currency")}
            >
              {CURRENCIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
        </Field>
        <Field label={t(locale, "월 적립액", "Monthly contribution")}>
          <input
            className="tool-input"
            inputMode="decimal"
            value={monthlyContribution}
            onChange={(event) => setMonthlyContribution(event.target.value)}
          />
        </Field>
        <Field label={t(locale, "연 수익률 (%)", "Annual return (%)")}>
          <input
            className="tool-input"
            inputMode="decimal"
            value={annualRate}
            onChange={(event) => setAnnualRate(event.target.value)}
          />
        </Field>
        <Field label={t(locale, "투자 기간 (년)", "Time horizon (years)")}>
          <input
            className="tool-input"
            inputMode="decimal"
            value={years}
            onChange={(event) => setYears(event.target.value)}
          />
        </Field>
        <Field label={t(locale, "복리 적용 주기", "Compounding frequency")}>
          <select
            className="tool-select"
            value={frequency}
            onChange={(event) =>
              setFrequency(
                Number(event.target.value) as (typeof COMPOUND_FREQUENCIES)[number],
              )
            }
          >
            {COMPOUND_FREQUENCIES.map((item) => (
              <option key={item} value={item}>
                {frequencyLabel(item)}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      <ResultPanel
        label={t(locale, "예상 최종 금액", "Estimated future value")}
        primary={
          calculation.value ? formatCurrency(calculation.value.balance, currency, locale) : "-"
        }
      >
        {calculation.value ? (
          <div className="tool-stat-grid">
            <span>
              <b>{formatCurrency(calculation.value.contributed, currency, locale)}</b>
              {t(locale, "총 납입 원금", "contributions")}
            </span>
            <span>
              <b>{formatCurrency(calculation.value.interest, currency, locale)}</b>
              {t(locale, "예상 이자 수익", "estimated interest")}
            </span>
            <span>
              <b>{formatNumber(calculation.value.months, locale, 0)}</b>
              {t(locale, "개월 적립", "months invested")}
            </span>
          </div>
        ) : null}
      </ResultPanel>
      <p className="tool-disclaimer">
        {t(
          locale,
          "세금, 수수료, 수익률 변동을 반영하지 않은 가정 기반 예측이며 투자 조언이 아닙니다.",
          "This projection assumes a constant return, excludes taxes and fees, and is not investment advice.",
        )}
      </p>
      <Actions>
        <CopyButton value={summary} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            setStartingAmount(initialStart);
            setMonthlyContribution(initialMonthly);
            setAnnualRate("7");
            setYears("10");
            setFrequency(12);
            setCurrency(korean ? "KRW" : "USD");
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

function countGraphemes(value: string, locale: string) {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(
      new Intl.Segmenter(localeTag(locale), { granularity: "grapheme" }).segment(value),
    ).length;
  }
  return Array.from(value).length;
}

function TextCounter({ locale }: { locale: string }) {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/u).length : 0;
    const sentences = trimmed
      ? trimmed.split(/[.!?。！？]+/u).filter((part) => part.trim()).length
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n\s*\n/u).filter((part) => part.trim()).length
      : 0;
    const lines = text ? text.split(/\r?\n/u).length : 0;
    const readingMinutes = words / (isKo(locale) ? 300 : 200);
    return {
      characters: countGraphemes(text, locale),
      charactersNoSpaces: countGraphemes(text.replace(/\s/gu, ""), locale),
      words,
      sentences,
      paragraphs,
      lines,
      readingMinutes,
    };
  }, [locale, text]);

  const readingLabel =
    stats.readingMinutes === 0
      ? "0"
      : stats.readingMinutes < 1
        ? t(locale, "1분 미만", "Under 1 min")
        : t(
            locale,
            `약 ${Math.ceil(stats.readingMinutes)}분`,
            `About ${Math.ceil(stats.readingMinutes)} min`,
          );
  const summary = [
    `${t(locale, "글자", "Characters")}: ${stats.characters}`,
    `${t(locale, "공백 제외", "Without spaces")}: ${stats.charactersNoSpaces}`,
    `${t(locale, "단어", "Words")}: ${stats.words}`,
    `${t(locale, "문장", "Sentences")}: ${stats.sentences}`,
    `${t(locale, "문단", "Paragraphs")}: ${stats.paragraphs}`,
    `${t(locale, "줄", "Lines")}: ${stats.lines}`,
    `${t(locale, "읽기 시간", "Reading time")}: ${readingLabel}`,
  ].join("\n");

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "글자수 세기", "Text counter")}
      description={t(
        locale,
        "글자, 단어, 문장, 문단 수와 예상 읽기 시간을 실시간으로 확인합니다.",
        "Count characters, words, sentences, paragraphs, lines, and estimated reading time live.",
      )}
    >
      <Field
        label={t(locale, "분석할 텍스트", "Text to analyze")}
        hint={t(locale, "입력 내용은 브라우저 밖으로 전송되지 않습니다.", "Your text never leaves this browser.")}
      >
        <textarea
          className="tool-textarea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={12}
          placeholder={t(locale, "여기에 텍스트를 입력하거나 붙여넣으세요…", "Type or paste text here…")}
          spellCheck
        />
      </Field>
      <div className="tool-metric-grid" aria-live="polite">
        <div><strong>{formatNumber(stats.characters, locale, 0)}</strong><span>{t(locale, "글자", "Characters")}</span></div>
        <div><strong>{formatNumber(stats.charactersNoSpaces, locale, 0)}</strong><span>{t(locale, "공백 제외", "No spaces")}</span></div>
        <div><strong>{formatNumber(stats.words, locale, 0)}</strong><span>{t(locale, "단어", "Words")}</span></div>
        <div><strong>{formatNumber(stats.sentences, locale, 0)}</strong><span>{t(locale, "문장", "Sentences")}</span></div>
        <div><strong>{formatNumber(stats.paragraphs, locale, 0)}</strong><span>{t(locale, "문단", "Paragraphs")}</span></div>
        <div><strong>{formatNumber(stats.lines, locale, 0)}</strong><span>{t(locale, "줄", "Lines")}</span></div>
        <div><strong>{readingLabel}</strong><span>{t(locale, "읽기 시간", "Reading time")}</span></div>
      </div>
      <Actions>
        <CopyButton value={summary} locale={locale} />
        <button
          className="tool-button tool-button--secondary"
          type="button"
          disabled={!text}
          onClick={() => void copyText(text).catch(() => undefined)}
        >
          {t(locale, "본문 복사", "Copy text")}
        </button>
        <ResetButton locale={locale} onClick={() => setText("")} />
      </Actions>
    </ToolFrame>
  );
}

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

function QrGenerator({ locale }: { locale: string }) {
  const [value, setValue] = useState("");
  const [size, setSize] = useState("320");
  const [level, setLevel] = useState<ErrorCorrectionLevel>("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const qrGenerationRef = useRef(0);

  useEffect(() => () => {
    qrGenerationRef.current += 1;
  }, []);

  function invalidateQr() {
    qrGenerationRef.current += 1;
    setDataUrl("");
    setError("");
    setBusy(false);
  }

  async function generate(event?: FormEvent) {
    event?.preventDefault();
    const generationId = qrGenerationRef.current + 1;
    qrGenerationRef.current = generationId;
    setDataUrl("");
    setBusy(false);
    const content = value.trim();
    const width = Number(size);
    if (!content) {
      setDataUrl("");
      setError(t(locale, "QR 코드에 담을 내용을 입력해 주세요.", "Enter content for the QR code."));
      return;
    }
    if (content.length > 2_000) {
      setDataUrl("");
      setError(t(locale, "내용은 2,000자 이하로 입력해 주세요.", "Keep the content under 2,000 characters."));
      return;
    }
    if (!Number.isInteger(width) || width < 160 || width > 1_024) {
      setDataUrl("");
      setError(t(locale, "크기는 160~1,024px로 선택해 주세요.", "Choose a size from 160 to 1,024 px."));
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = await QRCode.toDataURL(content, {
        width,
        margin: 2,
        errorCorrectionLevel: level,
        color: { dark: "#142117", light: "#ffffff" },
      });
      if (generationId !== qrGenerationRef.current) return;
      setDataUrl(image);
    } catch {
      if (generationId !== qrGenerationRef.current) return;
      setDataUrl("");
      setError(t(locale, "QR 코드를 만들 수 없습니다. 내용을 줄여 보세요.", "Could not create the QR code. Try shorter content."));
    } finally {
      if (generationId === qrGenerationRef.current) setBusy(false);
    }
  }

  function download() {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = "moatools-qr-code.png";
    anchor.click();
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "QR 코드 생성기", "QR code generator")}
      description={t(
        locale,
        "URL, 연락처, 와이파이 정보 또는 텍스트를 다운로드 가능한 QR 코드로 만듭니다.",
        "Turn a URL, contact detail, Wi-Fi string, or text into a downloadable QR code.",
      )}
    >
      <form onSubmit={generate} className="tool-form">
        <Field
          label={t(locale, "QR 코드 내용", "QR code content")}
          hint={`${formatNumber(value.length, locale, 0)} / 2,000`}
        >
          <textarea
            className="tool-textarea"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              invalidateQr();
            }}
            rows={5}
            maxLength={2_000}
            placeholder="https://example.com"
          />
        </Field>
        <div className="tool-grid tool-grid--2">
          <Field label={t(locale, "이미지 크기", "Image size")}>
            <select
              className="tool-select"
              value={size}
              onChange={(event) => {
                setSize(event.target.value);
                invalidateQr();
              }}
            >
              <option value="240">240 × 240 px</option>
              <option value="320">320 × 320 px</option>
              <option value="512">512 × 512 px</option>
              <option value="1024">1024 × 1024 px</option>
            </select>
          </Field>
          <Field
            label={t(locale, "오류 복원 수준", "Error correction")}
            hint={t(locale, "높을수록 일부가 가려져도 인식하기 쉽습니다.", "Higher levels tolerate more obstruction.")}
          >
            <select
              className="tool-select"
              value={level}
              onChange={(event) => {
                setLevel(event.target.value as ErrorCorrectionLevel);
                invalidateQr();
              }}
            >
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </Field>
        </div>
        <ErrorMessage>{error}</ErrorMessage>
        <button className="tool-button tool-button--primary" type="submit" disabled={busy}>
          {busy ? t(locale, "생성 중…", "Generating…") : t(locale, "QR 코드 만들기", "Generate QR code")}
        </button>
      </form>

      <div className="tool-qr-preview" aria-live="polite">
        {dataUrl ? (
          <img src={dataUrl} alt={t(locale, "생성된 QR 코드", "Generated QR code")} width={320} height={320} />
        ) : (
          <div className="tool-qr-placeholder" aria-hidden="true">▦</div>
        )}
      </div>
      <Actions>
        <button
          className="tool-button tool-button--primary"
          type="button"
          onClick={download}
          disabled={!dataUrl}
        >
          {t(locale, "PNG 다운로드", "Download PNG")}
        </button>
        <CopyButton value={value.trim()} locale={locale} />
        <ResetButton
          locale={locale}
          onClick={() => {
            qrGenerationRef.current += 1;
            setValue("");
            setSize("320");
            setLevel("M");
            setDataUrl("");
            setError("");
            setBusy(false);
          }}
        />
      </Actions>
    </ToolFrame>
  );
}

const PASSWORD_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

const AMBIGUOUS_CHARACTERS = new Set("Il1O0o");

function secureRandomInt(max: number) {
  if (!Number.isSafeInteger(max) || max <= 0) throw new Error("Invalid random range");
  const maxUintPlusOne = 0x1_0000_0000;
  const limit = Math.floor(maxUintPlusOne / max) * max;
  const random = new Uint32Array(1);
  do {
    crypto.getRandomValues(random);
  } while (random[0] >= limit);
  return random[0] % max;
}

function randomCharacter(characters: string) {
  return characters[secureRandomInt(characters.length)];
}

function createSecurePassword(length: number, sets: string[]) {
  const pool = sets.join("");
  const characters = sets.map(randomCharacter);
  while (characters.length < length) characters.push(randomCharacter(pool));
  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInt(index + 1);
    [characters[index], characters[swapIndex]] = [characters[swapIndex], characters[index]];
  }
  return characters.join("");
}

function PasswordGenerator({ locale }: { locale: string }) {
  const [length, setLength] = useState(20);
  const [lowercase, setLowercase] = useState(true);
  const [uppercase, setUppercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const selectedSets = useMemo(() => {
    const rawSets = [
      lowercase ? PASSWORD_SETS.lowercase : "",
      uppercase ? PASSWORD_SETS.uppercase : "",
      numbers ? PASSWORD_SETS.numbers : "",
      symbols ? PASSWORD_SETS.symbols : "",
    ].filter(Boolean);
    return excludeAmbiguous
      ? rawSets.map((set) =>
          Array.from(set)
            .filter((character) => !AMBIGUOUS_CHARACTERS.has(character))
            .join(""),
        )
      : rawSets;
  }, [excludeAmbiguous, lowercase, numbers, symbols, uppercase]);

  const generate = useCallback(() => {
    if (selectedSets.length === 0) {
      setPassword("");
      setError(t(locale, "문자 종류를 하나 이상 선택해 주세요.", "Select at least one character type."));
      return;
    }
    if (length < Math.max(8, selectedSets.length) || length > 64) {
      setPassword("");
      setError(t(locale, "길이는 8~64자로 설정해 주세요.", "Choose a length from 8 to 64."));
      return;
    }
    try {
      setPassword(createSecurePassword(length, selectedSets));
      setError("");
    } catch {
      setPassword("");
      setError(t(locale, "이 브라우저에서는 안전한 비밀번호를 만들 수 없습니다.", "Secure password generation is unavailable in this browser."));
    }
  }, [length, locale, selectedSets]);

  const poolSize = selectedSets.reduce((total, set) => total + set.length, 0);
  const entropy = poolSize ? length * Math.log2(poolSize) : 0;
  const strength =
    entropy < 40
      ? { key: "weak", label: t(locale, "약함", "Weak") }
      : entropy < 60
        ? { key: "fair", label: t(locale, "보통", "Fair") }
        : entropy < 80
          ? { key: "good", label: t(locale, "강함", "Strong") }
          : { key: "excellent", label: t(locale, "매우 강함", "Very strong") };

  function invalidatePassword() {
    setPassword("");
    setError("");
  }

  function reset() {
    setLength(20);
    setLowercase(true);
    setUppercase(true);
    setNumbers(true);
    setSymbols(true);
    setExcludeAmbiguous(true);
    setPassword("");
    setError("");
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "안전한 비밀번호 생성기", "Secure password generator")}
      description={t(
        locale,
        "암호학적으로 안전한 난수로 강력한 비밀번호를 기기 안에서 생성합니다.",
        "Create strong passwords on your device using cryptographically secure randomness.",
      )}
    >
      <div className="tool-password-output">
        <output aria-live="polite">{password || "-"}</output>
        <CopyButton value={password} locale={locale} />
      </div>
      <ErrorMessage>{error}</ErrorMessage>

      <Field label={`${t(locale, "길이", "Length")}: ${length}`}>
        <input
          className="tool-range"
          type="range"
          min="8"
          max="64"
          step="1"
          value={length}
          onChange={(event) => {
            setLength(Number(event.target.value));
            invalidatePassword();
          }}
        />
      </Field>

      <fieldset className="tool-option-grid">
        <legend>{t(locale, "포함할 문자", "Characters to include")}</legend>
        <label><input type="checkbox" checked={lowercase} onChange={(event) => { setLowercase(event.target.checked); invalidatePassword(); }} />{t(locale, "소문자 (a-z)", "Lowercase (a-z)")}</label>
        <label><input type="checkbox" checked={uppercase} onChange={(event) => { setUppercase(event.target.checked); invalidatePassword(); }} />{t(locale, "대문자 (A-Z)", "Uppercase (A-Z)")}</label>
        <label><input type="checkbox" checked={numbers} onChange={(event) => { setNumbers(event.target.checked); invalidatePassword(); }} />{t(locale, "숫자 (0-9)", "Numbers (0-9)")}</label>
        <label><input type="checkbox" checked={symbols} onChange={(event) => { setSymbols(event.target.checked); invalidatePassword(); }} />{t(locale, "특수문자", "Symbols")}</label>
        <label><input type="checkbox" checked={excludeAmbiguous} onChange={(event) => { setExcludeAmbiguous(event.target.checked); invalidatePassword(); }} />{t(locale, "헷갈리는 문자 제외 (I, l, 1, O, 0, o)", "Exclude ambiguous characters (I, l, 1, O, 0, o)")}</label>
      </fieldset>

      <div className={`tool-strength tool-strength--${strength.key}`} aria-live="polite">
        <span>{t(locale, "예상 강도", "Estimated strength")}</span>
        <strong>{strength.label}</strong>
        <span>{formatNumber(entropy, locale, 0)} {t(locale, "비트", "bits")}</span>
      </div>
      <Actions>
        <button className="tool-button tool-button--primary" type="button" onClick={generate}>
          {t(locale, "새 비밀번호 생성", "Generate new password")}
        </button>
        <ResetButton locale={locale} onClick={reset} />
      </Actions>
    </ToolFrame>
  );
}

function UnknownTool({ locale, slug }: { locale: string; slug: string }) {
  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "도구를 찾을 수 없습니다", "Tool not found")}
      description={t(
        locale,
        `“${slug}” 도구는 아직 준비되지 않았습니다.`,
        `The “${slug}” tool is not available yet.`,
      )}
    >
      <p className="tool-error" role="status">
        {t(locale, "주소를 확인하거나 도구 목록으로 돌아가 주세요.", "Check the address or return to the tool directory.")}
      </p>
    </ToolFrame>
  );
}

const KOREAN_TOOL_SLUGS = new Set([
  "salary-converter",
  "severance-pay",
  "four-major-insurance",
  "weekly-holiday-pay",
  "vat-calculator",
  "pyeong-calculator",
  "real-estate-brokerage-fee",
  "appliance-energy-cost",
  "lunar-solar-converter",
  "lotto-number-generator",
]);

const GLOBAL_TOOL_SLUGS = new Set([
  "pdf-toolkit",
  "bmi-calculator",
  "time-zone-converter",
  "pomodoro-timer",
  "random-wheel",
  "json-formatter",
  "unix-timestamp",
  "uuid-generator",
  "fuel-cost-calculator",
  "typing-speed-test",
]);

/**
 * Renders one of the browser-only utilities. Both concise slugs and the
 * SEO-friendly `*-calculator` / `*-generator` forms are accepted.
 */
export function ToolWidget({ slug, locale }: ToolWidgetProps) {
  const normalizedSlug = slug
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/_/g, "-");

  switch (normalizedSlug) {
    case "age":
    case "age-calculator":
      return <AgeCalculator locale={locale} />;
    case "percentage":
    case "percentage-calculator":
      return <PercentageCalculator locale={locale} />;
    case "unit":
    case "unit-converter":
      return <UnitConverter locale={locale} />;
    case "date":
    case "date-calculator":
      return <DateCalculator locale={locale} />;
    case "image":
    case "image-compressor":
    case "image-resizer":
    case "image-optimizer":
      return <ImageOptimizer locale={locale} />;
    case "loan":
    case "loan-calculator":
      return <LoanCalculator locale={locale} />;
    case "compound-interest":
    case "compound-interest-calculator":
      return <CompoundInterestCalculator locale={locale} />;
    case "text-counter":
    case "word-counter":
      return <TextCounter locale={locale} />;
    case "qr":
    case "qr-code":
    case "qr-generator":
    case "qr-code-generator":
      return <QrGenerator locale={locale} />;
    case "password":
    case "password-generator":
      return <PasswordGenerator locale={locale} />;
    default:
      if (KOREAN_TOOL_SLUGS.has(normalizedSlug)) {
        return <KoreanToolWidget slug={normalizedSlug} locale={locale} />;
      }
      if (GLOBAL_TOOL_SLUGS.has(normalizedSlug)) {
        return <GlobalToolWidget slug={normalizedSlug} locale={locale} />;
      }
      return <UnknownTool locale={locale} slug={slug} />;
  }
}

export default ToolWidget;
