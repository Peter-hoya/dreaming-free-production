"use client";

import { useMemo, useState } from "react";

function clampChannel(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(255, Math.max(0, Math.round(value)));
}

function channelToHex(value: number) {
  return clampChannel(value).toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${channelToHex(red)}${channelToHex(green)}${channelToHex(blue)}`;
}

function normalizeHex(value: string) {
  const cleaned = value.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(cleaned)) return cleaned.split("").map((character) => character.repeat(2)).join("").toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(cleaned)) return cleaned.toUpperCase();
  return null;
}

export function RgbColorTool() {
  const [red, setRed] = useState(45);
  const [green, setGreen] = useState(125);
  const [blue, setBlue] = useState(210);
  const [hexInput, setHexInput] = useState("#2D7DD2");
  const [copyStatus, setCopyStatus] = useState("");
  const hex = useMemo(() => rgbToHex(red, green, blue), [red, green, blue]);

  function updateChannel(channel: "red" | "green" | "blue", value: string) {
    const next = clampChannel(Number(value));
    if (channel === "red") setRed(next);
    if (channel === "green") setGreen(next);
    if (channel === "blue") setBlue(next);
    const values = {
      red: channel === "red" ? next : red,
      green: channel === "green" ? next : green,
      blue: channel === "blue" ? next : blue,
    };
    setHexInput(rgbToHex(values.red, values.green, values.blue));
    setCopyStatus("");
  }

  function applyHex(value: string) {
    setHexInput(value);
    const normalized = normalizeHex(value);
    if (!normalized) return;
    setRed(Number.parseInt(normalized.slice(0, 2), 16));
    setGreen(Number.parseInt(normalized.slice(2, 4), 16));
    setBlue(Number.parseInt(normalized.slice(4, 6), 16));
    setHexInput(`#${normalized}`);
    setCopyStatus("");
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${value} 복사 완료`);
    } catch {
      setCopyStatus("복사하지 못했습니다. 값을 직접 선택해 주세요.");
    }
  }

  const validHex = normalizeHex(hexInput) !== null;
  const rgbText = `rgb(${red}, ${green}, ${blue})`;

  return (
    <section className="rgb-color-tool" aria-labelledby="rgb-color-tool-title">
      <div className="rgb-color-tool__heading">
        <span>바로 사용</span>
        <h2 id="rgb-color-tool-title">RGB · HEX 색상 변환기</h2>
        <p>0~255의 RGB 값을 입력하거나 HEX 값을 붙여 넣으세요.</p>
      </div>
      <div className="rgb-color-tool__body">
        <div className="rgb-color-tool__preview" style={{ backgroundColor: hex }} aria-label={`현재 색상 ${hex}`} />
        <div className="rgb-color-tool__controls">
          <div className="rgb-color-tool__channels">
            {([
              ["R", "red", red],
              ["G", "green", green],
              ["B", "blue", blue],
            ] as const).map(([label, channel, value]) => (
              <label key={channel}>
                <span>{label}</span>
                <input type="number" min="0" max="255" value={value} onChange={(event) => updateChannel(channel, event.target.value)} />
              </label>
            ))}
          </div>
          <label className="rgb-color-tool__hex">
            <span>HEX</span>
            <input value={hexInput} onChange={(event) => applyHex(event.target.value)} aria-invalid={!validHex} />
            {!validHex ? <small>예: #2D7DD2 또는 #ABC</small> : null}
          </label>
          <div className="rgb-color-tool__results">
            <button type="button" onClick={() => copy(hex)}>{hex} 복사</button>
            <button type="button" onClick={() => copy(rgbText)}>{rgbText} 복사</button>
          </div>
          <p className="rgb-color-tool__status" aria-live="polite">{copyStatus}</p>
        </div>
      </div>
    </section>
  );
}
