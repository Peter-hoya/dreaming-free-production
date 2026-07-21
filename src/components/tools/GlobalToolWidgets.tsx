"use client";

import { DateTime } from "luxon";
import { parse as parseLosslessJson, stringify as stringifyLosslessJson } from "lossless-json";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type * as React from "react";

type LocaleProps = { locale: string };

function isKo(locale: string) {
  return locale.toLowerCase().startsWith("ko");
}

function t(locale: string, korean: string, english: string) {
  return isKo(locale) ? korean : english;
}

function localeTag(locale: string) {
  return isKo(locale) ? "ko-KR" : "en-US";
}

function parsePositive(value: string) {
  if (!value.trim()) return null;
  const number = Number(value.replace(/,/g, "").trim());
  return Number.isFinite(number) && number > 0 ? number : null;
}

function formatNumber(value: number, locale: string, digits = 2) {
  return new Intl.NumberFormat(localeTag(locale), {
    maximumFractionDigits: digits,
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function ToolFrame({
  locale,
  title,
  description,
  children,
}: LocaleProps & {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="tool-widget" aria-labelledby="global-tool-widget-title">
      <header className="tool-widget__header">
        <p className="tool-widget__eyebrow">
          {t(locale, "브라우저에서 안전하게 사용", "Private, on-device utility")}
        </p>
        <h2 id="global-tool-widget-title">{title}</h2>
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
  return children ? (
    <p className="tool-error" role="alert">
      {children}
    </p>
  ) : null;
}

function ResultPanel({
  label,
  primary,
  children,
  tone,
  live = true,
}: {
  label: string;
  primary: ReactNode;
  children?: ReactNode;
  tone?: string;
  live?: boolean;
}) {
  return (
    <div
      className={`tool-result${tone ? ` tool-result--${tone}` : ""}`}
      aria-live={live ? "polite" : undefined}
      aria-atomic={live ? "true" : undefined}
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

function CopyButton({ value, locale }: { value: string; locale: string }) {
  const [status, setStatus] = useState<{
    value: string;
    state: "copied" | "error";
  } | null>(null);

  async function handleCopy() {
    try {
      await copyText(value);
      setStatus({ value, state: "copied" });
    } catch {
      setStatus({ value, state: "error" });
    }
  }

  const currentStatus = status?.value === value ? status.state : "idle";

  return (
    <button
      className="tool-button tool-button--secondary"
      type="button"
      onClick={handleCopy}
      disabled={!value}
    >
      {currentStatus === "copied"
        ? t(locale, "복사됨", "Copied")
        : currentStatus === "error"
          ? t(locale, "복사 실패", "Copy failed")
          : t(locale, "복사", "Copy")}
    </button>
  );
}

type PdfOutput = {
  url: string;
  filename: string;
  byteLength: number;
  pages: number;
};

class UserFacingError extends Error {}

const MAX_PDF_FILE_BYTES = 20 * 1024 * 1024;
const MAX_PDF_TOTAL_BYTES = 40 * 1024 * 1024;
const MAX_PDF_PAGES = 500;

function parsePageRange(value: string, pageCount: number) {
  const match = /^\s*(\d+)\s*(?:-\s*(\d+)\s*)?$/.exec(value);
  if (!match) return null;
  const start = Number(match[1]);
  const end = Number(match[2] ?? match[1]);
  if (start < 1 || end < start || end > pageCount) return null;
  return { start, end };
}

function PdfToolkit({ locale }: LocaleProps) {
  const [mode, setMode] = useState<"merge" | "extract">("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [range, setRange] = useState("1-1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState<PdfOutput | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const operationRef = useRef(0);
  const outputUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, []);

  const clearOutput = useCallback(() => {
    operationRef.current += 1;
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
    setBusy(false);
    setError("");
    setOutput(null);
  }, []);

  function changeMode(nextMode: "merge" | "extract") {
    clearOutput();
    setFiles([]);
    setFileInputKey((key) => key + 1);
    setMode(nextMode);
    setRange("1-1");
  }

  function selectFiles(event: React.ChangeEvent<HTMLInputElement>) {
    clearOutput();
    const selected = Array.from(event.target.files ?? []);
    setFiles(mode === "extract" ? selected.slice(0, 1) : selected.slice(0, 10));
  }

  async function processPdf() {
    const operationId = operationRef.current + 1;
    operationRef.current = operationId;
    if (outputUrlRef.current) {
      URL.revokeObjectURL(outputUrlRef.current);
      outputUrlRef.current = null;
    }
    setBusy(true);
    setError("");
    setOutput(null);

    try {
      if (mode === "merge" && files.length < 2) {
        throw new UserFacingError(
          t(locale, "합칠 PDF를 2개 이상 선택해 주세요.", "Select at least two PDFs to merge."),
        );
      }
      if (mode === "extract" && files.length !== 1) {
        throw new UserFacingError(
          t(locale, "페이지를 추출할 PDF를 선택해 주세요.", "Select one PDF to extract pages from."),
        );
      }
      if (
        files.some(
          (file) =>
            file.size > MAX_PDF_FILE_BYTES ||
            (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf"),
        )
      ) {
        throw new UserFacingError(
          t(
            locale,
            "각 파일은 20MB 이하의 PDF여야 합니다.",
            "Each file must be a PDF no larger than 20MB.",
          ),
        );
      }
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      if (totalBytes > MAX_PDF_TOTAL_BYTES) {
        throw new UserFacingError(
          t(locale, "전체 파일 크기는 40MB 이하여야 합니다.", "Total file size must not exceed 40MB."),
        );
      }

      const { PDFDocument } = await import("pdf-lib");
      if (operationRef.current !== operationId) return;

      let saved: Uint8Array;
      let outputPages = 0;
      let filename = "moatools-merged.pdf";

      if (mode === "merge") {
        const destination = await PDFDocument.create();
        for (const file of files) {
          if (operationRef.current !== operationId) return;
          const source = await PDFDocument.load(await file.arrayBuffer());
          outputPages += source.getPageCount();
          if (outputPages > MAX_PDF_PAGES) {
            throw new UserFacingError(
              t(locale, "전체 페이지는 500쪽 이하여야 합니다.", "Combined PDFs must contain no more than 500 pages."),
            );
          }
          const copied = await destination.copyPages(source, source.getPageIndices());
          copied.forEach((page) => destination.addPage(page));
        }
        saved = await destination.save({ useObjectStreams: true });
      } else {
        const source = await PDFDocument.load(await files[0].arrayBuffer());
        const pageCount = source.getPageCount();
        if (pageCount > MAX_PDF_PAGES) {
          throw new UserFacingError(
            t(locale, "PDF는 500쪽 이하여야 합니다.", "The PDF must contain no more than 500 pages."),
          );
        }
        const parsedRange = parsePageRange(range, pageCount);
        if (!parsedRange) {
          throw new UserFacingError(
            t(
              locale,
              `1부터 ${pageCount} 사이의 올바른 페이지 범위를 입력해 주세요.`,
              `Enter a valid page range between 1 and ${pageCount}.`,
            ),
          );
        }
        const destination = await PDFDocument.create();
        const indices = Array.from(
          { length: parsedRange.end - parsedRange.start + 1 },
          (_, index) => parsedRange.start - 1 + index,
        );
        const copied = await destination.copyPages(source, indices);
        copied.forEach((page) => destination.addPage(page));
        outputPages = copied.length;
        filename = `moatools-pages-${parsedRange.start}-${parsedRange.end}.pdf`;
        saved = await destination.save({ useObjectStreams: true });
      }

      if (operationRef.current !== operationId) return;
      const blob = new Blob([saved as unknown as BlobPart], { type: "application/pdf" });
      const outputUrl = URL.createObjectURL(blob);
      if (operationRef.current !== operationId) {
        URL.revokeObjectURL(outputUrl);
        return;
      }
      outputUrlRef.current = outputUrl;
      setOutput({
        url: outputUrl,
        filename,
        byteLength: blob.size,
        pages: outputPages,
      });
    } catch (caught) {
      if (operationRef.current !== operationId) return;
      setError(
        caught instanceof UserFacingError
          ? caught.message
          : t(
              locale,
              "PDF를 처리하지 못했습니다. 파일이 암호화되었거나 손상되었는지 확인해 주세요.",
              "The PDF could not be processed. Check whether the file is encrypted or damaged.",
            ),
      );
    } finally {
      if (operationRef.current === operationId) setBusy(false);
    }
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "PDF 합치기와 페이지 추출", "Merge PDFs and extract pages")}
      description={t(
        locale,
        "파일을 서버에 올리지 않고 브라우저에서 바로 처리합니다.",
        "Process files locally in your browser without uploading them to a server.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <button
          className={`tool-button ${mode === "merge" ? "tool-button--primary" : "tool-button--secondary"}`}
          type="button"
          onClick={() => changeMode("merge")}
          aria-pressed={mode === "merge"}
        >
          {t(locale, "PDF 합치기", "Merge PDFs")}
        </button>
        <button
          className={`tool-button ${mode === "extract" ? "tool-button--primary" : "tool-button--secondary"}`}
          type="button"
          onClick={() => changeMode("extract")}
          aria-pressed={mode === "extract"}
        >
          {t(locale, "페이지 추출", "Extract pages")}
        </button>
      </div>
      <Field
        label={t(locale, "PDF 파일", "PDF files")}
        hint={t(
          locale,
          mode === "merge"
            ? "최대 10개, 파일당 20MB, 전체 40MB까지 선택할 수 있습니다."
            : "파일당 20MB, 최대 500쪽까지 처리할 수 있습니다.",
          mode === "merge"
            ? "Choose up to 10 files, 20MB each and 40MB total."
            : "Process one file up to 20MB and 500 pages.",
        )}
      >
        <input
          key={fileInputKey}
          className="tool-file-input"
          type="file"
          accept="application/pdf,.pdf"
          multiple={mode === "merge"}
          onChange={selectFiles}
        />
      </Field>
      {files.length ? (
        <div className="tool-subcard" aria-live="polite">
          <h3>{t(locale, "선택한 파일", "Selected files")}</h3>
          <div className="tool-result__details">
            <span>
              {files.map((file) => file.name).join(", ")}
            </span>
            <strong>
              {formatNumber(files.reduce((sum, file) => sum + file.size, 0) / 1_048_576, locale)} MB
            </strong>
          </div>
        </div>
      ) : null}
      {mode === "extract" ? (
        <Field
          label={t(locale, "추출할 페이지 범위", "Page range to extract")}
          hint={t(locale, "예: 2-7 또는 4", "Example: 2-7 or 4")}
        >
          <input
            className="tool-input"
            value={range}
            onChange={(event) => {
              clearOutput();
              setRange(event.target.value);
            }}
            inputMode="numeric"
            placeholder="1-3"
          />
        </Field>
      ) : null}
      <ErrorMessage>{error}</ErrorMessage>
      <Actions>
        <button
          className="tool-button tool-button--primary"
          type="button"
          onClick={processPdf}
          disabled={busy || !files.length}
        >
          {busy
            ? t(locale, "처리 중", "Processing")
            : mode === "merge"
              ? t(locale, "PDF 합치기", "Merge PDFs")
              : t(locale, "페이지 추출", "Extract pages")}
        </button>
        <button
          className="tool-button tool-button--ghost"
          type="button"
          onClick={() => {
            clearOutput();
            setFiles([]);
            setFileInputKey((key) => key + 1);
            setRange("1-1");
          }}
        >
          {t(locale, "초기화", "Reset")}
        </button>
      </Actions>
      {output ? (
        <ResultPanel
          label={t(locale, "처리 완료", "Ready to download")}
          primary={output.filename}
        >
          <div className="tool-result__details">
            <span>{t(locale, `${output.pages}쪽`, `${output.pages} pages`)}</span>
            <span>{formatNumber(output.byteLength / 1_048_576, locale)} MB</span>
          </div>
          <Actions>
            <a className="tool-button tool-button--primary" href={output.url} download={output.filename}>
              {t(locale, "PDF 다운로드", "Download PDF")}
            </a>
          </Actions>
        </ResultPanel>
      ) : null}
      <p className="tool-disclaimer">
        {t(
          locale,
          "암호화되거나 손상된 PDF는 처리되지 않을 수 있습니다. 중요한 파일은 원본을 보관해 주세요.",
          "Encrypted or damaged PDFs may not process. Keep the original copy of important files.",
        )}
      </p>
    </ToolFrame>
  );
}

type BmiResult = {
  bmi: number;
  category: string;
  tone: "healthy" | "overweight" | undefined;
};

function BmiCalculator({ locale }: LocaleProps) {
  const [system, setSystem] = useState<"metric" | "imperial">("metric");
  const [centimeters, setCentimeters] = useState("170");
  const [kilograms, setKilograms] = useState("65");
  const [feet, setFeet] = useState("5");
  const [inches, setInches] = useState("7");
  const [pounds, setPounds] = useState("143");

  const calculation = useMemo<{ result: BmiResult | null; error: string }>(() => {
    let meters: number;
    let weightKg: number;
    if (system === "metric") {
      const height = parsePositive(centimeters);
      const weight = parsePositive(kilograms);
      if (height === null || weight === null) {
        return { result: null, error: t(locale, "키와 몸무게를 입력해 주세요.", "Enter your height and weight.") };
      }
      if (height < 50 || height > 280 || weight < 10 || weight > 500) {
        return { result: null, error: t(locale, "입력 범위를 확인해 주세요.", "Check that the values are within a practical range.") };
      }
      meters = height / 100;
      weightKg = weight;
    } else {
      const heightFeet = Number(feet);
      const heightInches = Number(inches);
      const weightPounds = parsePositive(pounds);
      if (
        !Number.isFinite(heightFeet) ||
        !Number.isFinite(heightInches) ||
        weightPounds === null ||
        heightFeet < 1 ||
        heightFeet > 9 ||
        heightInches < 0 ||
        heightInches >= 12 ||
        weightPounds < 22 ||
        weightPounds > 1_100
      ) {
        return { result: null, error: t(locale, "피트, 인치, 파운드 값을 확인해 주세요.", "Check the feet, inches, and pounds values.") };
      }
      meters = (heightFeet * 12 + heightInches) * 0.0254;
      weightKg = weightPounds * 0.45359237;
    }

    const bmi = weightKg / (meters * meters);
    const category =
      bmi < 18.5
        ? t(locale, "저체중 범위", "Underweight range")
        : bmi < 25
          ? t(locale, "건강 체중 범위", "Healthy weight range")
          : bmi < 30
            ? t(locale, "과체중 범위", "Overweight range")
            : t(locale, "비만 범위", "Obesity range");
    return {
      result: {
        bmi,
        category,
        tone: bmi >= 18.5 && bmi < 25 ? "healthy" : bmi >= 25 ? "overweight" : undefined,
      },
      error: "",
    };
  }, [centimeters, feet, inches, kilograms, locale, pounds, system]);

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "BMI 계산기", "BMI calculator")}
      description={t(
        locale,
        "미터법과 영미 단위로 체질량지수를 빠르게 확인합니다.",
        "Estimate body mass index with metric or imperial measurements.",
      )}
    >
      <Field label={t(locale, "단위 체계", "Measurement system")}>
        <select className="tool-select" value={system} onChange={(event) => setSystem(event.target.value as "metric" | "imperial")}>
          <option value="metric">{t(locale, "미터법 (cm, kg)", "Metric (cm, kg)")}</option>
          <option value="imperial">{t(locale, "영미 단위 (ft, in, lb)", "Imperial (ft, in, lb)")}</option>
        </select>
      </Field>
      {system === "metric" ? (
        <div className="tool-grid tool-grid--2">
          <Field label={t(locale, "키 (cm)", "Height (cm)")}>
            <input className="tool-input" type="number" min="50" max="280" step="0.1" value={centimeters} onChange={(event) => setCentimeters(event.target.value)} />
          </Field>
          <Field label={t(locale, "몸무게 (kg)", "Weight (kg)")}>
            <input className="tool-input" type="number" min="10" max="500" step="0.1" value={kilograms} onChange={(event) => setKilograms(event.target.value)} />
          </Field>
        </div>
      ) : (
        <div className="tool-grid tool-grid--3">
          <Field label={t(locale, "키 (ft)", "Height (ft)")}>
            <input className="tool-input" type="number" min="1" max="9" step="1" value={feet} onChange={(event) => setFeet(event.target.value)} />
          </Field>
          <Field label={t(locale, "추가 키 (in)", "Additional height (in)")}>
            <input className="tool-input" type="number" min="0" max="11.9" step="0.1" value={inches} onChange={(event) => setInches(event.target.value)} />
          </Field>
          <Field label={t(locale, "몸무게 (lb)", "Weight (lb)")}>
            <input className="tool-input" type="number" min="22" max="1100" step="0.1" value={pounds} onChange={(event) => setPounds(event.target.value)} />
          </Field>
        </div>
      )}
      <ErrorMessage>{calculation.error}</ErrorMessage>
      {calculation.result ? (
        <ResultPanel
          label={t(locale, "예상 체질량지수", "Estimated body mass index")}
          primary={`BMI ${formatNumber(calculation.result.bmi, locale, 1)}`}
          tone={calculation.result.tone}
        >
          <div className="tool-result__details">
            <strong>{calculation.result.category}</strong>
            <span>{t(locale, "성인 기준 참고 범위", "Adult reference range")}</span>
          </div>
        </ResultPanel>
      ) : null}
      <p className="tool-disclaimer">
        {t(
          locale,
          "BMI는 선별용 참고값이며 진단이 아닙니다. 임신, 성장기, 근육량과 건강 상태는 의료 전문가와 상담해 주세요.",
          "BMI is a screening estimate, not a diagnosis. Pregnancy, growth, muscle mass, and health conditions require professional advice.",
        )}
      </p>
    </ToolFrame>
  );
}

const TIME_ZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Buenos_Aires",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Warsaw",
  "Europe/Athens",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Cairo",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Taipei",
  "Asia/Seoul",
  "Asia/Tokyo",
  "Australia/Perth",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

function TimeZoneConverter({ locale }: LocaleProps) {
  const [sourceValue, setSourceValue] = useState("");
  const [sourceZone, setSourceZone] = useState(isKo(locale) ? "Asia/Seoul" : "America/New_York");
  const [targetZone, setTargetZone] = useState(isKo(locale) ? "America/New_York" : "Europe/London");
  const [ambiguityChoice, setAmbiguityChoice] = useState<"earlier" | "later">("earlier");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const initialZone = isKo(locale) ? "Asia/Seoul" : "America/New_York";
      setSourceValue(DateTime.now().setZone(initialZone).toFormat("yyyy-MM-dd'T'HH:mm"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [locale]);

  const conversion = useMemo(() => {
    if (!sourceValue) return { source: null, target: null, error: "" };
    const source = DateTime.fromISO(sourceValue, { zone: sourceZone, setZone: true });
    if (
      !source.isValid ||
      source.toFormat("yyyy-MM-dd'T'HH:mm") !== sourceValue
    ) {
      return {
        source: null,
        target: null,
        error: t(
          locale,
          "해당 시간대에 존재하는 날짜와 시간을 입력해 주세요. 일광 절약 시간 전환 구간을 확인해 주세요.",
          "Enter a date and time that exists in the source zone. Check daylight saving time transitions.",
        ),
      };
    }
    const possibleOffsets = source
      .getPossibleOffsets()
      .sort((first, second) => first.toMillis() - second.toMillis());
    const resolvedSource = possibleOffsets.length > 1
      ? ambiguityChoice === "earlier"
        ? possibleOffsets[0]
        : possibleOffsets[possibleOffsets.length - 1]
      : source;
    return {
      source: resolvedSource,
      target: resolvedSource.setZone(targetZone),
      error: "",
      possibleOffsets,
    };
  }, [ambiguityChoice, locale, sourceValue, sourceZone, targetZone]);

  function swapZones() {
    if (conversion.target) {
      setSourceValue(conversion.target.toFormat("yyyy-MM-dd'T'HH:mm"));
      const targetOffsets = conversion.target
        .getPossibleOffsets()
        .sort((first, second) => first.toMillis() - second.toMillis());
      const targetIsLaterOccurrence = targetOffsets.length > 1
        && conversion.target.toMillis() === targetOffsets[targetOffsets.length - 1].toMillis();
      setAmbiguityChoice(targetIsLaterOccurrence ? "later" : "earlier");
    } else {
      setAmbiguityChoice("earlier");
    }
    setSourceZone(targetZone);
    setTargetZone(sourceZone);
  }

  const formattedTarget = conversion.target
    ? conversion.target
        .setLocale(localeTag(locale))
        .toLocaleString({
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        })
    : "";

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "시간대 변환기", "Time zone converter")}
      description={t(
        locale,
        "선택한 지역의 일광 절약 시간 규칙을 반영해 날짜와 시간을 변환합니다.",
        "Convert dates and times using daylight saving rules for each selected region.",
      )}
    >
      <Field
        label={t(locale, "출발 지역의 날짜와 시간", "Date and time in the source zone")}
        hint={t(locale, "입력값은 아래에서 선택한 출발 시간대로 해석합니다.", "The value is interpreted in the source zone selected below.")}
      >
        <input
          className="tool-input"
          type="datetime-local"
          value={sourceValue}
          onChange={(event) => {
            setSourceValue(event.target.value);
            setAmbiguityChoice("earlier");
          }}
        />
      </Field>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "출발 시간대", "Source time zone")}>
          <select className="tool-select" value={sourceZone} onChange={(event) => {
            setSourceZone(event.target.value);
            setAmbiguityChoice("earlier");
          }}>
            {TIME_ZONES.map((zone) => <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>)}
          </select>
        </Field>
        <Field label={t(locale, "도착 시간대", "Target time zone")}>
          <select className="tool-select" value={targetZone} onChange={(event) => setTargetZone(event.target.value)}>
            {TIME_ZONES.map((zone) => <option key={zone} value={zone}>{zone.replaceAll("_", " ")}</option>)}
          </select>
        </Field>
      </div>
      {conversion.possibleOffsets && conversion.possibleOffsets.length > 1 ? (
        <Field
          label={t(locale, "겹치는 현지 시각 선택", "Choose the repeated local time")}
          hint={t(
            locale,
            "일광 절약 시간이 끝나는 날에는 같은 시각이 두 번 발생합니다.",
            "When daylight saving time ends, the same local clock time occurs twice.",
          )}
        >
          <select
            className="tool-select"
            value={ambiguityChoice}
            onChange={(event) => setAmbiguityChoice(event.target.value as "earlier" | "later")}
          >
            <option value="earlier">
              {t(locale, "먼저 발생한 시각", "Earlier occurrence")} ({conversion.possibleOffsets[0].toFormat("ZZ")})
            </option>
            <option value="later">
              {t(locale, "나중에 발생한 시각", "Later occurrence")} ({conversion.possibleOffsets[conversion.possibleOffsets.length - 1].toFormat("ZZ")})
            </option>
          </select>
        </Field>
      ) : null}
      <Actions>
        <button className="tool-button tool-button--secondary" type="button" onClick={swapZones}>
          {t(locale, "시간대 서로 바꾸기", "Swap time zones")}
        </button>
      </Actions>
      <ErrorMessage>{conversion.error}</ErrorMessage>
      {conversion.source && conversion.target ? (
        <ResultPanel label={t(locale, "변환된 시간", "Converted time")} primary={formattedTarget}>
          <div className="tool-result__details">
            <span>{targetZone.replaceAll("_", " ")}</span>
            <strong>{conversion.target.offsetNameShort}</strong>
            <span>
              {conversion.target.isInDST
                ? t(locale, "일광 절약 시간 적용", "Daylight saving time active")
                : t(locale, "표준시 또는 비적용 지역", "Standard time or no DST")}
            </span>
          </div>
          <Actions><CopyButton value={formattedTarget} locale={locale} /></Actions>
        </ResultPanel>
      ) : null}
      <p className="tool-disclaimer">
        {t(
          locale,
          "시간대 규칙은 브라우저의 IANA 시간대 데이터에 따릅니다. 중요한 일정은 초대장에 시간대 이름도 함께 적어 확인해 주세요.",
          "Results use the browser's IANA time zone data. For critical events, include the time zone name in the invitation and verify it.",
        )}
      </p>
    </ToolFrame>
  );
}

type TimerPhase = "work" | "break";

function parseTimerMinutes(value: string) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > 180) return null;
  return number;
}

function PomodoroTimer({ locale }: LocaleProps) {
  const [workMinutes, setWorkMinutes] = useState("25");
  const [breakMinutes, setBreakMinutes] = useState("5");
  const [phase, setPhase] = useState<TimerPhase>("work");
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);

  const parsedWorkMinutes = parseTimerMinutes(workMinutes);
  const parsedBreakMinutes = parseTimerMinutes(breakMinutes);
  const timerError = parsedWorkMinutes === null || parsedBreakMinutes === null
    ? t(locale, "집중 시간과 휴식 시간은 1분에서 180분 사이의 정수여야 합니다.", "Focus and break lengths must be whole minutes from 1 to 180.")
    : "";
  const workSeconds = (parsedWorkMinutes ?? 25) * 60;
  const breakSeconds = (parsedBreakMinutes ?? 5) * 60;

  useEffect(() => {
    if (!running || deadline === null) return;

    const update = () => {
      const now = Date.now();
      if (now < deadline) {
        setRemaining(Math.max(0, Math.ceil((deadline - now) / 1_000)));
        return;
      }

      let nextPhase = phase;
      let nextDeadline = deadline;
      let completedWork = 0;
      const advanceOnePhase = () => {
        if (nextPhase === "work") completedWork += 1;
        nextPhase = nextPhase === "work" ? "break" : "work";
        nextDeadline += (nextPhase === "work" ? workSeconds : breakSeconds) * 1_000;
      };

      advanceOnePhase();
      const cycleMilliseconds = (workSeconds + breakSeconds) * 1_000;
      if (now >= nextDeadline + cycleMilliseconds) {
        const fullCycles = Math.floor((now - nextDeadline) / cycleMilliseconds);
        nextDeadline += fullCycles * cycleMilliseconds;
        completedWork += fullCycles;
      }
      while (now >= nextDeadline) advanceOnePhase();

      if (completedWork) setCompletedSessions((count) => count + completedWork);
      setPhase(nextPhase);
      setDeadline(nextDeadline);
      setRemaining(Math.max(0, Math.ceil((nextDeadline - now) / 1_000)));
    };

    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [breakSeconds, deadline, phase, running, workSeconds]);

  function start() {
    if (timerError) return;
    const nextRemaining = remaining > 0 ? remaining : phase === "work" ? workSeconds : breakSeconds;
    setRemaining(nextRemaining);
    setDeadline(Date.now() + nextRemaining * 1_000);
    setRunning(true);
  }

  function pause() {
    if (deadline !== null) {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1_000)));
    }
    setRunning(false);
    setDeadline(null);
  }

  function reset() {
    setRunning(false);
    setDeadline(null);
    setPhase("work");
    setRemaining(workSeconds);
    setCompletedSessions(0);
  }

  function updateWork(value: string) {
    setWorkMinutes(value);
    if (!running && phase === "work") {
      const parsed = parseTimerMinutes(value);
      if (parsed !== null) setRemaining(parsed * 60);
    }
  }

  function updateBreak(value: string) {
    setBreakMinutes(value);
    if (!running && phase === "break") {
      const parsed = parseTimerMinutes(value);
      if (parsed !== null) setRemaining(parsed * 60);
    }
  }

  const minutesDisplay = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secondsDisplay = String(remaining % 60).padStart(2, "0");

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "포모도로 집중 타이머", "Pomodoro focus timer")}
      description={t(
        locale,
        "집중과 휴식을 반복하고, 다른 탭에 다녀와도 실제 경과 시간을 기준으로 맞춥니다.",
        "Cycle between focus and rest while keeping accurate time after background tab activity.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "집중 시간 (분)", "Focus length (minutes)")} hint={t(locale, "1분에서 180분", "1 to 180 minutes")}>
          <input className="tool-input" type="number" min="1" max="180" step="1" value={workMinutes} disabled={running} onChange={(event) => updateWork(event.target.value)} />
        </Field>
        <Field label={t(locale, "휴식 시간 (분)", "Break length (minutes)")} hint={t(locale, "1분에서 180분", "1 to 180 minutes")}>
          <input className="tool-input" type="number" min="1" max="180" step="1" value={breakMinutes} disabled={running} onChange={(event) => updateBreak(event.target.value)} />
        </Field>
      </div>
      <ErrorMessage>{timerError}</ErrorMessage>
      <ResultPanel
        label={phase === "work" ? t(locale, "집중 시간", "Focus session") : t(locale, "휴식 시간", "Break session")}
        primary={`${minutesDisplay}:${secondsDisplay}`}
        live={false}
      >
        <div className="tool-result__details">
          <strong>{running ? t(locale, "진행 중", "Running") : t(locale, "일시 정지", "Paused")}</strong>
          <span>{t(locale, `완료한 집중 ${completedSessions}회`, `${completedSessions} focus sessions completed`)}</span>
        </div>
      </ResultPanel>
      <p className="sr-only" role="status" aria-live="polite">
        {phase === "work"
          ? t(locale, "집중 단계", "Focus phase")
          : t(locale, "휴식 단계", "Break phase")}
      </p>
      <Actions>
        {running ? (
          <button className="tool-button tool-button--primary" type="button" onClick={pause}>
            {t(locale, "일시 정지", "Pause")}
          </button>
        ) : (
          <button className="tool-button tool-button--primary" type="button" onClick={start} disabled={Boolean(timerError)}>
            {t(locale, "타이머 시작", "Start timer")}
          </button>
        )}
        <button className="tool-button tool-button--ghost" type="button" onClick={reset}>
          {t(locale, "초기화", "Reset")}
        </button>
      </Actions>
      <p className="tool-disclaimer">
        {t(
          locale,
          "브라우저나 기기가 절전 모드로 완전히 중단되면 화면 갱신이 늦을 수 있습니다. 돌아오면 실제 시각을 기준으로 자동 보정합니다.",
          "A suspended browser or device may delay the display update. The timer corrects itself from the actual clock when you return.",
        )}
      </p>
    </ToolFrame>
  );
}

function secureRandomIndex(maximum: number) {
  if (maximum <= 0 || maximum > 100_000) throw new Error("Invalid range");
  const cryptoObject = globalThis.crypto;
  if (!cryptoObject?.getRandomValues) throw new Error("Secure random unavailable");
  const range = 0x1_0000_0000;
  const limit = range - (range % maximum);
  const buffer = new Uint32Array(1);
  do {
    cryptoObject.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % maximum;
}

function RandomWheel({ locale }: LocaleProps) {
  const [input, setInput] = useState(
    isKo(locale)
      ? "점심 메뉴 A\n점심 메뉴 B\n점심 메뉴 C\n점심 메뉴 D"
      : "Option A\nOption B\nOption C\nOption D",
  );
  const [withoutReplacement, setWithoutReplacement] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");

  const options = useMemo(
    () =>
      Array.from(
        new Set(
          input
            .split(/\r?\n/)
            .map((option) => option.trim())
            .filter(Boolean),
        ),
      ).slice(0, 100),
    [input],
  );

  const available = useMemo(
    () =>
      withoutReplacement
        ? options.filter((option) => !history.includes(option))
        : options,
    [history, options, withoutReplacement],
  );

  function pick() {
    setError("");
    if (options.length < 2) {
      setError(t(locale, "서로 다른 선택지를 두 개 이상 입력해 주세요.", "Enter at least two different choices."));
      return;
    }
    if (!available.length) {
      setError(t(locale, "모든 선택지를 뽑았습니다. 기록을 지우고 다시 시작해 주세요.", "Every choice has been picked. Clear the history to begin again."));
      return;
    }
    try {
      const choice = available[secureRandomIndex(available.length)];
      setSelected(choice);
      setHistory((current) => [choice, ...current]);
    } catch {
      setError(t(locale, "이 브라우저에서 안전한 무작위 선택을 사용할 수 없습니다.", "Secure random selection is unavailable in this browser."));
    }
  }

  function resetHistory() {
    setSelected("");
    setHistory([]);
    setError("");
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "랜덤 선택 휠", "Random choice wheel")}
      description={t(
        locale,
        "한 줄에 하나씩 선택지를 적고 같은 확률로 빠르게 뽑습니다.",
        "Enter one choice per line and draw from them with equal probability.",
      )}
    >
      <Field
        label={t(locale, "선택지", "Choices")}
        hint={t(locale, `중복을 제외한 ${options.length}개 선택지, 최대 100개`, `${options.length} unique choices, up to 100`)}
      >
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            resetHistory();
          }}
          placeholder={t(locale, "선택지 하나\n선택지 둘", "First choice\nSecond choice")}
        />
      </Field>
      <label className="tool-check">
        <input type="checkbox" checked={withoutReplacement} onChange={(event) => {
          setWithoutReplacement(event.target.checked);
          resetHistory();
        }} />
        <span>{t(locale, "한 번 뽑은 항목은 다음 추첨에서 제외", "Remove each picked choice from later draws")}</span>
      </label>
      <ErrorMessage>{error}</ErrorMessage>
      <Actions>
        <button className="tool-button tool-button--primary" type="button" onClick={pick}>
          {history.length ? t(locale, "한 번 더 뽑기", "Pick again") : t(locale, "무작위로 뽑기", "Pick at random")}
        </button>
        <button className="tool-button tool-button--ghost" type="button" onClick={resetHistory}>
          {t(locale, "추첨 기록 지우기", "Clear draw history")}
        </button>
      </Actions>
      {selected ? (
        <ResultPanel label={t(locale, "무작위 선택 결과", "Random selection")} primary={selected}>
          {history.length > 1 ? (
            <div className="tool-result__details">
              <span>{t(locale, "최근 기록", "Recent picks")}</span>
              <strong>{history.slice(1, 6).join(", ")}</strong>
            </div>
          ) : null}
        </ResultPanel>
      ) : null}
      <p className="tool-disclaimer">
        {t(
          locale,
          "브라우저의 암호학적 난수를 사용해 각 항목을 같은 확률로 선택합니다. 법적 추첨이나 감사가 필요한 용도로 인증된 도구는 아닙니다.",
          "The tool uses browser cryptographic randomness and gives each item equal probability. It is not certified for legal drawings or audited contests.",
        )}
      </p>
    </ToolFrame>
  );
}

type JsonStatus = "idle" | "valid" | "error";

function JsonFormatter({ locale }: LocaleProps) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState<2 | 4>(2);
  const [status, setStatus] = useState<JsonStatus>("idle");
  const [message, setMessage] = useState("");

  function parseJson() {
    if (!input.trim()) {
      throw new Error(t(locale, "JSON을 입력해 주세요.", "Enter JSON to continue."));
    }
    if (new Blob([input]).size > 2 * 1024 * 1024) {
      throw new Error(t(locale, "JSON은 2MB 이하여야 합니다.", "JSON input must be 2MB or smaller."));
    }
    try {
      return parseLosslessJson(input);
    } catch {
      throw new Error(t(locale, "문법이 올바른 JSON이 아닙니다.", "The input is not valid JSON syntax."));
    }
  }

  function transform(mode: "format" | "minify" | "validate") {
    try {
      const parsed = parseJson();
      const nextOutput =
        mode === "minify"
          ? stringifyLosslessJson(parsed)
          : mode === "format"
            ? stringifyLosslessJson(parsed, null, indent)
            : input;
      if (nextOutput === undefined) {
        throw new Error(t(locale, "JSON 결과를 만들 수 없습니다.", "The JSON output could not be created."));
      }
      setOutput(nextOutput);
      setStatus("valid");
      setMessage(
        mode === "validate"
          ? t(locale, "유효한 JSON입니다.", "Valid JSON.")
          : mode === "minify"
            ? t(locale, "JSON을 한 줄로 압축했습니다.", "JSON was minified to one line.")
            : t(locale, "JSON을 읽기 쉽게 정리했습니다.", "JSON was formatted for readability."),
      );
    } catch (caught) {
      setOutput("");
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : t(locale, "JSON을 처리하지 못했습니다.", "JSON could not be processed."));
    }
  }

  function reset() {
    setInput("");
    setOutput("");
    setStatus("idle");
    setMessage("");
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "JSON 포맷터와 검사기", "JSON formatter and validator")}
      description={t(
        locale,
        "JSON 문법을 검사하고 읽기 좋은 형식이나 한 줄 형식으로 변환합니다.",
        "Validate JSON syntax and convert it to readable or compact output.",
      )}
    >
      <Field label={t(locale, "원본 JSON", "JSON input")} hint={t(locale, "최대 2MB, 내용은 브라우저 밖으로 전송되지 않습니다.", "Up to 2MB. Content never leaves your browser.")}>
        <textarea
          className="tool-textarea"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setOutput("");
            setStatus("idle");
            setMessage("");
          }}
          spellCheck={false}
          placeholder={'{"name":"MoaTools","ready":true}'}
        />
      </Field>
      <div className="tool-grid tool-grid--2">
        <Field label={t(locale, "들여쓰기", "Indentation")}>
          <select
            className="tool-select"
            value={indent}
            onChange={(event) => {
              setIndent(Number(event.target.value) as 2 | 4);
              setOutput("");
              setStatus("idle");
              setMessage("");
            }}
          >
            <option value={2}>{t(locale, "공백 2칸", "2 spaces")}</option>
            <option value={4}>{t(locale, "공백 4칸", "4 spaces")}</option>
          </select>
        </Field>
      </div>
      <Actions>
        <button className="tool-button tool-button--primary" type="button" onClick={() => transform("format")}>
          {t(locale, "읽기 좋게 정리", "Format JSON")}
        </button>
        <button className="tool-button tool-button--secondary" type="button" onClick={() => transform("minify")}>
          {t(locale, "한 줄로 압축", "Minify JSON")}
        </button>
        <button className="tool-button tool-button--secondary" type="button" onClick={() => transform("validate")}>
          {t(locale, "문법만 검사", "Validate only")}
        </button>
        <button className="tool-button tool-button--ghost" type="button" onClick={reset}>
          {t(locale, "초기화", "Reset")}
        </button>
      </Actions>
      {status === "error" ? <ErrorMessage>{message}</ErrorMessage> : null}
      {status === "valid" ? (
        <p className="tool-disclaimer" role="status">{message}</p>
      ) : null}
      {output ? (
        <Field label={t(locale, "처리 결과", "Output")} hint={t(locale, `${output.length.toLocaleString(localeTag(locale))}자`, `${output.length.toLocaleString(localeTag(locale))} characters`)}>
          <textarea className="tool-textarea" value={output} readOnly spellCheck={false} />
        </Field>
      ) : null}
      <Actions>
        <CopyButton value={output} locale={locale} />
        <button
          className="tool-button tool-button--secondary"
          type="button"
          disabled={!output}
          onClick={() => downloadBlob(new Blob([output], { type: "application/json;charset=utf-8" }), "moatools-formatted.json")}
        >
          {t(locale, "JSON 다운로드", "Download JSON")}
        </button>
      </Actions>
    </ToolFrame>
  );
}

function localDateTimeInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  const second = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

function UnixTimestampConverter({ locale }: LocaleProps) {
  const [timestamp, setTimestamp] = useState("");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [localInput, setLocalInput] = useState("");

  const setNow = useCallback(() => {
    const now = new Date();
    setTimestamp(String(Math.floor(now.getTime() / 1_000)));
    setUnit("seconds");
    setLocalInput(localDateTimeInput(now));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(setNow, 0);
    return () => window.clearTimeout(timer);
  }, [setNow]);

  const timestampConversion = useMemo(() => {
    if (!timestamp.trim()) return { date: null, error: "" };
    const number = Number(timestamp.trim());
    const milliseconds = unit === "seconds" ? number * 1_000 : number;
    if (!Number.isFinite(number) || !Number.isFinite(milliseconds) || Math.abs(milliseconds) > 8.64e15) {
      return { date: null, error: t(locale, "지원되는 범위의 숫자를 입력해 주세요.", "Enter a numeric timestamp within the supported date range.") };
    }
    const date = new Date(milliseconds);
    if (Number.isNaN(date.getTime())) {
      return { date: null, error: t(locale, "유효한 날짜로 변환할 수 없습니다.", "The value cannot be converted to a valid date.") };
    }
    return { date, error: "" };
  }, [locale, timestamp, unit]);

  const localConversion = useMemo(() => {
    if (!localInput) return { date: null, error: "" };
    const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const localDateTime = DateTime.fromISO(localInput, { zone: localZone, setZone: true });
    if (
      !localDateTime.isValid ||
      localDateTime.toFormat("yyyy-MM-dd'T'HH:mm:ss").slice(0, localInput.length) !== localInput
    ) {
      return { date: null, error: t(locale, "유효한 현지 날짜와 시간을 입력해 주세요.", "Enter a valid local date and time.") };
    }
    if (localDateTime.getPossibleOffsets().length > 1) {
      return {
        date: null,
        error: t(
          locale,
          "일광 절약 시간이 끝나는 구간의 겹치는 현지 시각입니다. 한 시간 앞뒤의 명확한 시각을 입력하거나 시간대 변환기를 사용해 주세요.",
          "This local clock time occurs twice when daylight saving time ends. Enter an unambiguous time an hour earlier or later, or use the time zone converter.",
        ),
      };
    }
    return { date: localDateTime.toJSDate(), error: "" };
  }, [localInput, locale]);

  const utcText = timestampConversion.date?.toISOString() ?? "";
  const localText = timestampConversion.date
    ? new Intl.DateTimeFormat(localeTag(locale), {
        dateStyle: "full",
        timeStyle: "long",
      }).format(timestampConversion.date)
    : "";
  const seconds = localConversion.date ? Math.floor(localConversion.date.getTime() / 1_000) : null;
  const milliseconds = localConversion.date?.getTime() ?? null;

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "유닉스 타임스탬프 변환기", "Unix timestamp converter")}
      description={t(
        locale,
        "초 또는 밀리초 타임스탬프를 날짜로 바꾸고 현지 시간을 다시 타임스탬프로 변환합니다.",
        "Convert second or millisecond timestamps to dates and local date-time values back to timestamps.",
      )}
    >
      <div className="tool-subcard">
        <h3>{t(locale, "타임스탬프를 날짜로", "Timestamp to date")}</h3>
        <div className="tool-grid tool-grid--2">
          <Field label={t(locale, "유닉스 타임스탬프", "Unix timestamp")}>
            <input className="tool-input" inputMode="decimal" value={timestamp} onChange={(event) => setTimestamp(event.target.value)} />
          </Field>
          <Field label={t(locale, "입력 단위", "Input unit")}>
            <select className="tool-select" value={unit} onChange={(event) => setUnit(event.target.value as "seconds" | "milliseconds")}>
              <option value="seconds">{t(locale, "초", "Seconds")}</option>
              <option value="milliseconds">{t(locale, "밀리초", "Milliseconds")}</option>
            </select>
          </Field>
        </div>
        <ErrorMessage>{timestampConversion.error}</ErrorMessage>
        {timestampConversion.date ? (
          <ResultPanel label={t(locale, "변환된 날짜", "Converted date")} primary={utcText}>
            <div className="tool-result__details">
              <span>{t(locale, "브라우저 현지 시간", "Browser local time")}</span>
              <strong>{localText}</strong>
            </div>
            <Actions><CopyButton value={utcText} locale={locale} /></Actions>
          </ResultPanel>
        ) : null}
      </div>
      <div className="tool-subcard">
        <h3>{t(locale, "현지 날짜를 타임스탬프로", "Local date to timestamp")}</h3>
        <Field
          label={t(locale, "브라우저 현지 날짜와 시간", "Browser local date and time")}
          hint={t(locale, "사용 중인 기기의 시간대 설정을 따릅니다.", "Uses the time zone configured on this device.")}
        >
          <input className="tool-input" type="datetime-local" step="1" value={localInput} onChange={(event) => setLocalInput(event.target.value)} />
        </Field>
        <ErrorMessage>{localConversion.error}</ErrorMessage>
        {seconds !== null && milliseconds !== null ? (
          <ResultPanel label={t(locale, "변환된 타임스탬프", "Converted timestamps")} primary={seconds.toLocaleString("en-US", { useGrouping: false })}>
            <div className="tool-result__details">
              <span>{t(locale, "초", "Seconds")}</span>
              <strong>{seconds.toLocaleString("en-US", { useGrouping: false })}</strong>
              <span>{t(locale, "밀리초", "Milliseconds")}</span>
              <strong>{milliseconds.toLocaleString("en-US", { useGrouping: false })}</strong>
            </div>
            <Actions><CopyButton value={String(milliseconds)} locale={locale} /></Actions>
          </ResultPanel>
        ) : null}
      </div>
      <Actions>
        <button className="tool-button tool-button--secondary" type="button" onClick={setNow}>
          {t(locale, "현재 시각 입력", "Use current time")}
        </button>
      </Actions>
      <p className="tool-disclaimer">
        {t(
          locale,
          "유닉스 타임스탬프는 UTC 기준 경과 시간입니다. 현지 표시는 기기의 현재 시간대 설정에 따라 달라집니다.",
          "Unix timestamps represent elapsed time from a UTC epoch. Local display depends on the device time zone setting.",
        )}
      </p>
    </ToolFrame>
  );
}

function createUuidV4() {
  const cryptoObject = globalThis.crypto;
  if (typeof cryptoObject?.randomUUID === "function") return cryptoObject.randomUUID();
  if (!cryptoObject?.getRandomValues) throw new Error("Secure random unavailable");
  const bytes = new Uint8Array(16);
  cryptoObject.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function UuidGenerator({ locale }: LocaleProps) {
  const [amount, setAmount] = useState("10");
  const [values, setValues] = useState<string[]>([]);
  const [error, setError] = useState("");
  const output = values.join("\n");

  function generate() {
    const count = Number(amount);
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      setError(t(locale, "생성 개수는 1부터 100 사이의 정수여야 합니다.", "Quantity must be a whole number from 1 to 100."));
      setValues([]);
      return;
    }
    try {
      setValues(Array.from({ length: count }, createUuidV4));
      setError("");
    } catch {
      setValues([]);
      setError(t(locale, "이 브라우저에서 안전한 UUID를 생성할 수 없습니다.", "Secure UUID generation is unavailable in this browser."));
    }
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "UUID v4 생성기", "UUID v4 generator")}
      description={t(
        locale,
        "브라우저의 암호학적 난수로 표준 형식의 UUID v4를 한 번에 생성합니다.",
        "Generate standard UUID v4 values in batches using browser cryptographic randomness.",
      )}
    >
      <Field label={t(locale, "생성 개수", "Quantity")} hint={t(locale, "1개부터 100개", "1 to 100 values")}>
        <input className="tool-input" type="number" min="1" max="100" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} />
      </Field>
      <ErrorMessage>{error}</ErrorMessage>
      <Actions>
        <button className="tool-button tool-button--primary" type="button" onClick={generate}>
          {t(locale, "UUID 생성", "Generate UUIDs")}
        </button>
        <button className="tool-button tool-button--ghost" type="button" onClick={() => {
          setValues([]);
          setError("");
        }}>
          {t(locale, "결과 지우기", "Clear output")}
        </button>
      </Actions>
      {output ? (
        <Field label={t(locale, "생성 결과", "Generated values")} hint={t(locale, `${values.length}개 UUID`, `${values.length} UUIDs`)}>
          <textarea className="tool-textarea" value={output} readOnly spellCheck={false} />
        </Field>
      ) : null}
      <Actions>
        <CopyButton value={output} locale={locale} />
        <button
          className="tool-button tool-button--secondary"
          type="button"
          disabled={!output}
          onClick={() => downloadBlob(new Blob([output], { type: "text/plain;charset=utf-8" }), "moatools-uuids.txt")}
        >
          {t(locale, "텍스트 파일 다운로드", "Download text file")}
        </button>
      </Actions>
      <p className="tool-disclaimer">
        {t(
          locale,
          "UUID는 식별자 충돌 가능성을 매우 낮추지만 보안 비밀번호나 접근 토큰을 대신하지 않습니다.",
          "UUIDs make identifier collisions extremely unlikely, but they do not replace passwords or access tokens.",
        )}
      </p>
    </ToolFrame>
  );
}

type FuelMode = "liters100km" | "mpgUs" | "mpgUk";
type DistanceUnit = "km" | "mi";
type FuelCurrency = "USD" | "EUR" | "GBP" | "KRW" | "JPY";

const US_GALLON_LITERS = 3.785411784;
const IMPERIAL_GALLON_LITERS = 4.54609;
const US_MPG_PER_L100KM = 235.214583;
const IMPERIAL_MPG_PER_L100KM = 282.480936;

function fuelVolumeLiters(mode: FuelMode) {
  if (mode === "mpgUs") return US_GALLON_LITERS;
  if (mode === "mpgUk") return IMPERIAL_GALLON_LITERS;
  return 1;
}

function economyToLiters100Km(value: number, mode: FuelMode) {
  if (mode === "mpgUs") return US_MPG_PER_L100KM / value;
  if (mode === "mpgUk") return IMPERIAL_MPG_PER_L100KM / value;
  return value;
}

function economyFromLiters100Km(value: number, mode: FuelMode) {
  if (mode === "mpgUs") return US_MPG_PER_L100KM / value;
  if (mode === "mpgUk") return IMPERIAL_MPG_PER_L100KM / value;
  return value;
}

function conciseDecimal(value: number) {
  return Number(value.toPrecision(10)).toString();
}

function FuelCostCalculator({ locale }: LocaleProps) {
  const [distance, setDistance] = useState("300");
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>("km");
  const [mode, setMode] = useState<FuelMode>("liters100km");
  const [efficiency, setEfficiency] = useState("8");
  const [price, setPrice] = useState(isKo(locale) ? "1700" : "1.70");
  const [currency, setCurrency] = useState<FuelCurrency>(isKo(locale) ? "KRW" : "USD");

  const calculation = useMemo(() => {
    const distanceValue = parsePositive(distance);
    const efficiencyValue = parsePositive(efficiency);
    const priceValue = parsePositive(price);
    if (distanceValue === null || efficiencyValue === null || priceValue === null) {
      return { cost: null, fuel: null, fuelUnit: "", distanceKm: null, distanceMiles: null, error: t(locale, "거리, 연비, 연료 가격을 모두 입력해 주세요.", "Enter distance, fuel economy, and fuel price.") };
    }
    if (distanceValue > 1_000_000 || efficiencyValue < 0.01 || efficiencyValue > 1_000 || priceValue > 1_000_000) {
      return { cost: null, fuel: null, fuelUnit: "", distanceKm: null, distanceMiles: null, error: t(locale, "입력값이 지원 범위를 벗어났습니다. 단위와 값을 확인해 주세요.", "A value is outside the supported range. Check the units and entries.") };
    }
    const distanceKm = distanceUnit === "km" ? distanceValue : distanceValue * 1.609344;
    const distanceMiles = distanceUnit === "mi" ? distanceValue : distanceValue / 1.609344;
    const fuel =
      mode === "liters100km"
        ? (distanceKm * efficiencyValue) / 100
        : distanceMiles / efficiencyValue;
    const cost = fuel * priceValue;
    if (!Number.isFinite(fuel) || !Number.isFinite(cost)) {
      return { cost: null, fuel: null, fuelUnit: "", distanceKm: null, distanceMiles: null, error: t(locale, "계산 범위를 벗어났습니다. 입력 단위와 값을 확인해 주세요.", "The result exceeds the supported range. Check the units and entries.") };
    }
    return {
      cost,
      fuel,
      fuelUnit:
        mode === "liters100km"
          ? t(locale, "리터", "liters")
          : mode === "mpgUs"
            ? t(locale, "미국 갤런", "US gallons")
            : t(locale, "영국 갤런", "Imperial gallons"),
      distanceKm,
      distanceMiles,
      error: "",
    };
  }, [distance, distanceUnit, efficiency, locale, mode, price]);

  function changeMode(nextMode: FuelMode) {
    const currentEfficiency = parsePositive(efficiency);
    const currentPrice = parsePositive(price);
    if (currentEfficiency !== null) {
      const liters100Km = economyToLiters100Km(currentEfficiency, mode);
      const convertedEfficiency = economyFromLiters100Km(liters100Km, nextMode);
      setEfficiency(Number.isFinite(convertedEfficiency) ? conciseDecimal(convertedEfficiency) : "");
    }
    if (currentPrice !== null) {
      const pricePerLiter = currentPrice / fuelVolumeLiters(mode);
      setPrice(conciseDecimal(pricePerLiter * fuelVolumeLiters(nextMode)));
    }
    setMode(nextMode);
  }

  const efficiencyLabel =
    mode === "liters100km"
      ? t(locale, "연비 (L/100km)", "Fuel economy (L/100km)")
      : mode === "mpgUs"
        ? t(locale, "연비 (미국 MPG)", "Fuel economy (US MPG)")
        : t(locale, "연비 (영국 MPG)", "Fuel economy (Imperial MPG)");
  const priceLabel =
    mode === "liters100km"
      ? t(locale, "리터당 가격", "Price per liter")
      : mode === "mpgUs"
        ? t(locale, "미국 갤런당 가격", "Price per US gallon")
        : t(locale, "영국 갤런당 가격", "Price per Imperial gallon");

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "여행 연료비 계산기", "Trip fuel cost calculator")}
      description={t(
        locale,
        "거리와 연비, 현지 연료 가격으로 예상 사용량과 비용을 계산합니다.",
        "Estimate fuel use and trip cost from distance, economy, and local fuel price.",
      )}
    >
      <div className="tool-grid tool-grid--2">
        <div className="tool-field">
          <label className="tool-field__label" htmlFor="global-fuel-distance">{t(locale, "이동 거리", "Trip distance")}</label>
          <div className="tool-input-group">
            <input id="global-fuel-distance" className="tool-input" type="number" min="0" step="0.1" value={distance} onChange={(event) => setDistance(event.target.value)} />
            <select className="tool-select tool-select--compact" value={distanceUnit} onChange={(event) => setDistanceUnit(event.target.value as DistanceUnit)} aria-label={t(locale, "거리 단위", "Distance unit")}>
              <option value="km">km</option>
              <option value="mi">mi</option>
            </select>
          </div>
        </div>
        <Field label={t(locale, "연비 표기 방식", "Fuel economy format")}>
          <select className="tool-select" value={mode} onChange={(event) => changeMode(event.target.value as FuelMode)}>
            <option value="liters100km">L/100km</option>
            <option value="mpgUs">US MPG</option>
            <option value="mpgUk">Imperial MPG</option>
          </select>
        </Field>
      </div>
      <div className="tool-grid tool-grid--3">
        <Field label={efficiencyLabel}>
          <input className="tool-input" type="number" min="0" step="0.1" value={efficiency} onChange={(event) => setEfficiency(event.target.value)} />
        </Field>
        <Field label={priceLabel}>
          <input className="tool-input" type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} />
        </Field>
        <Field label={t(locale, "통화", "Currency")}>
          <select className="tool-select" value={currency} onChange={(event) => setCurrency(event.target.value as FuelCurrency)}>
            {(["USD", "EUR", "GBP", "KRW", "JPY"] as FuelCurrency[]).map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
        </Field>
      </div>
      <ErrorMessage>{calculation.error}</ErrorMessage>
      {calculation.cost !== null && calculation.fuel !== null && calculation.distanceKm !== null && calculation.distanceMiles !== null ? (
        <ResultPanel
          label={t(locale, "예상 연료비", "Estimated fuel cost")}
          primary={new Intl.NumberFormat(localeTag(locale), {
            style: "currency",
            currency,
            maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
          }).format(calculation.cost)}
        >
          <div className="tool-result__details">
            <span>{t(locale, "예상 연료 사용량", "Estimated fuel use")}</span>
            <strong>{formatNumber(calculation.fuel, locale)} {calculation.fuelUnit}</strong>
            <span>{formatNumber(calculation.distanceKm, locale)} km</span>
            <span>{formatNumber(calculation.distanceMiles, locale)} mi</span>
          </div>
        </ResultPanel>
      ) : null}
      <p className="tool-disclaimer">
        {t(
          locale,
          "실제 비용은 교통, 노면, 적재량, 공회전, 차량 상태와 가격 변동에 따라 달라집니다. 미국 MPG와 영국 MPG는 서로 다른 갤런을 사용합니다.",
          "Actual cost varies with traffic, roads, load, idling, vehicle condition, and price changes. US MPG and Imperial MPG use different gallons.",
        )}
      </p>
    </ToolFrame>
  );
}

const TYPING_PROMPTS = {
  ko: [
    "좋은 도구는 복잡한 과정을 짧게 만들고 사용자가 결과를 직접 확인할 수 있게 돕습니다.",
    "작은 습관을 매일 반복하면 눈에 띄지 않던 변화가 어느 순간 분명한 성과로 이어집니다.",
    "정확한 정보와 차분한 판단은 빠른 결정보다 더 오래 쓸 수 있는 답을 만들어 줍니다.",
  ],
  en: [
    "Useful tools shorten complicated tasks and help people verify every result with confidence.",
    "Small habits repeated each day can turn quiet progress into results that last for years.",
    "Clear information and careful judgment often create better answers than a rushed decision.",
  ],
} as const;

function TypingSpeedTest({ locale }: LocaleProps) {
  const prompts = isKo(locale) ? TYPING_PROMPTS.ko : TYPING_PROMPTS.en;
  const [promptIndex, setPromptIndex] = useState(0);
  const [duration, setDuration] = useState(60);
  const [typed, setTyped] = useState("");
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const startedAtRef = useRef<number | null>(null);
  const runIdRef = useRef(0);
  const prompt = prompts[promptIndex % prompts.length];

  useEffect(() => {
    if (!running || startedAtRef.current === null) return;
    const runId = runIdRef.current;
    const update = () => {
      if (runIdRef.current !== runId || startedAtRef.current === null) return;
      const nextElapsed = Math.min(duration, (Date.now() - startedAtRef.current) / 1_000);
      setElapsed(nextElapsed);
      setSecondsLeft(Math.max(0, Math.ceil(duration - nextElapsed)));
      if (nextElapsed >= duration) {
        setRunning(false);
        setFinished(true);
      }
    };
    update();
    const interval = window.setInterval(update, 200);
    return () => window.clearInterval(interval);
  }, [duration, running]);

  const correctCharacters = useMemo(
    () => Array.from(typed).reduce((count, character, index) => count + (character === prompt[index] ? 1 : 0), 0),
    [prompt, typed],
  );
  const activeElapsed = elapsed > 0 ? elapsed : 0;
  const wordsPerMinute = activeElapsed > 0 ? (correctCharacters / 5) / (activeElapsed / 60) : 0;
  const charactersPerMinute = activeElapsed > 0 ? correctCharacters / (activeElapsed / 60) : 0;
  const accuracy = typed.length ? (correctCharacters / typed.length) * 100 : 100;

  function restart(nextPrompt = false, nextDuration = duration) {
    runIdRef.current += 1;
    startedAtRef.current = null;
    setRunning(false);
    setFinished(false);
    setTyped("");
    setElapsed(0);
    setSecondsLeft(nextDuration);
    if (nextPrompt) setPromptIndex((index) => (index + 1) % prompts.length);
  }

  function handleType(value: string) {
    if (finished) return;
    const next = value.slice(0, prompt.length);
    if (!running && next.length > 0) {
      runIdRef.current += 1;
      startedAtRef.current = Date.now();
      setRunning(true);
    }
    setTyped(next);
    if (next.length >= prompt.length && startedAtRef.current !== null) {
      const finalElapsed = Math.min(duration, (Date.now() - startedAtRef.current) / 1_000);
      setElapsed(Math.max(finalElapsed, 0.1));
      setSecondsLeft(Math.max(0, Math.ceil(duration - finalElapsed)));
      setRunning(false);
      setFinished(true);
    }
  }

  return (
    <ToolFrame
      locale={locale}
      title={t(locale, "타자 속도 테스트", "Typing speed test")}
      description={t(
        locale,
        "문장을 그대로 입력해 분당 단어 수, 분당 글자 수와 정확도를 확인합니다.",
        "Type a fixed prompt to measure words per minute, characters per minute, and accuracy.",
      )}
    >
      <Field label={t(locale, "테스트 시간", "Test duration")}>
        <select className="tool-select" value={duration} disabled={running} onChange={(event) => {
          const nextDuration = Number(event.target.value);
          setDuration(nextDuration);
          restart(false, nextDuration);
        }}>
          <option value={30}>{t(locale, "30초", "30 seconds")}</option>
          <option value={60}>{t(locale, "60초", "60 seconds")}</option>
          <option value={120}>{t(locale, "120초", "120 seconds")}</option>
        </select>
      </Field>
      <div className="tool-subcard">
        <h3>{t(locale, "아래 문장을 입력하세요", "Type the prompt below")}</h3>
        <p className="tool-output-box">{prompt}</p>
      </div>
      <Field
        label={t(locale, "입력 영역", "Typing area")}
        hint={t(locale, "첫 글자를 입력하면 타이머가 시작됩니다. 붙여넣기는 사용할 수 없습니다.", "The timer starts with your first character. Pasting is disabled.")}
      >
        <textarea
          className="tool-textarea"
          value={typed}
          onChange={(event) => handleType(event.target.value)}
          onPaste={(event) => event.preventDefault()}
          disabled={finished}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t(locale, "여기에 문장을 입력하세요.", "Start typing here.")}
          aria-describedby="typing-test-status"
        />
      </Field>
      <div className="tool-metric-grid" id="typing-test-status" aria-live="off">
        <div><span>{t(locale, "남은 시간", "Time left")}</span><strong>{secondsLeft}s</strong></div>
        <div><span>WPM</span><strong>{formatNumber(wordsPerMinute, locale, 0)}</strong></div>
        <div><span>{t(locale, "분당 글자", "CPM")}</span><strong>{formatNumber(charactersPerMinute, locale, 0)}</strong></div>
        <div><span>{t(locale, "정확도", "Accuracy")}</span><strong>{formatNumber(accuracy, locale, 1)}%</strong></div>
      </div>
      {finished ? (
        <ResultPanel
          label={t(locale, "테스트 완료", "Test complete")}
          primary={`${formatNumber(wordsPerMinute, locale, 0)} WPM`}
          tone={accuracy >= 95 ? "healthy" : undefined}
        >
          <div className="tool-result__details">
            <span>{t(locale, "정확도", "Accuracy")}</span>
            <strong>{formatNumber(accuracy, locale, 1)}%</strong>
            <span>{t(locale, "경과 시간", "Elapsed time")}</span>
            <strong>{formatNumber(activeElapsed, locale, 1)}s</strong>
          </div>
        </ResultPanel>
      ) : null}
      <Actions>
        <button className="tool-button tool-button--primary" type="button" onClick={() => restart(true)}>
          {t(locale, "새 문장으로 다시 시작", "Restart with a new prompt")}
        </button>
        <button className="tool-button tool-button--ghost" type="button" onClick={() => restart(false)}>
          {t(locale, "같은 문장 다시 입력", "Retry the same prompt")}
        </button>
      </Actions>
      <p className="tool-disclaimer">
        {t(
          locale,
          "WPM은 정확히 입력한 5글자를 한 단어로 환산한 표준 추정값입니다. 한국어는 분당 글자 수도 함께 확인하는 것이 유용합니다.",
          "WPM is the standard estimate of five correct characters per word. Results can vary with keyboard, language, and prompt difficulty.",
        )}
      </p>
    </ToolFrame>
  );
}

export function GlobalToolWidget({
  slug,
  locale,
}: {
  slug: string;
  locale: string;
}): React.ReactNode | null {
  switch (slug) {
    case "pdf-toolkit":
      return <PdfToolkit locale={locale} />;
    case "bmi-calculator":
      return <BmiCalculator locale={locale} />;
    case "time-zone-converter":
      return <TimeZoneConverter locale={locale} />;
    case "pomodoro-timer":
      return <PomodoroTimer locale={locale} />;
    case "random-wheel":
      return <RandomWheel locale={locale} />;
    case "json-formatter":
      return <JsonFormatter locale={locale} />;
    case "unix-timestamp":
      return <UnixTimestampConverter locale={locale} />;
    case "uuid-generator":
      return <UuidGenerator locale={locale} />;
    case "fuel-cost-calculator":
      return <FuelCostCalculator locale={locale} />;
    case "typing-speed-test":
      return <TypingSpeedTest locale={locale} />;
    default:
      return null;
  }
}
