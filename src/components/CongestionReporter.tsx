"use client";

import { useState } from "react";
import { getCongestionBgClass, getCongestionLabel } from "@/lib/utils/congestion";

type Props = {
  trainId: string;
  lineId: string;
  carCount: number;
};

type Step = "idle" | "select_car" | "select_level" | "submitting" | "done" | "error";

const CONGESTION_OPTIONS = [
  { rate: 30,  label: "ガラガラ",    emoji: "🟢" },
  { rate: 65,  label: "やや空き",    emoji: "🟡" },
  { rate: 90,  label: "混雑",        emoji: "🟠" },
  { rate: 130, label: "かなり混雑",  emoji: "🔴" },
  { rate: 170, label: "超満員",      emoji: "🟣" },
];

const COOLDOWN_KEY = (trainId: string) => `report_cooldown_${trainId}`;
const COOLDOWN_MINUTES = 30;

export default function CongestionReporter({ trainId, lineId, carCount }: Props) {
  const [step, setStep] = useState<Step>("idle");
  const [selectedCar, setSelectedCar] = useState<number | null>(null);
  const [selectedRate, setSelectedRate] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  function checkCooldown(): boolean {
    try {
      const ts = localStorage.getItem(COOLDOWN_KEY(trainId));
      if (!ts) return false;
      const elapsed = (Date.now() - Number(ts)) / 1000 / 60;
      return elapsed < COOLDOWN_MINUTES;
    } catch {
      return false;
    }
  }

  function setCooldown() {
    try {
      localStorage.setItem(COOLDOWN_KEY(trainId), String(Date.now()));
    } catch { /* ignore */ }
  }

  function handleOpen() {
    if (checkCooldown()) {
      setMessage(`この列車への報告は${COOLDOWN_MINUTES}分に1回までです`);
      setStep("error");
      return;
    }
    setStep("select_car");
    setSelectedCar(null);
    setSelectedRate(null);
  }

  function handleSelectCar(carNum: number) {
    setSelectedCar(carNum);
    setStep("select_level");
  }

  async function handleSubmit(rate: number) {
    setSelectedRate(rate);
    setStep("submitting");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainId,
          lineId,
          carNumber: selectedCar,
          congestionRate: rate,
        }),
      });
      const json = await res.json() as { success?: boolean; message?: string; error?: string };
      if (!res.ok) throw new Error(json.error ?? "投稿失敗");
      setCooldown();
      setMessage(json.message ?? "ありがとうございます！");
      setStep("done");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "投稿に失敗しました");
      setStep("error");
    }
  }

  function handleReset() {
    setStep("idle");
    setSelectedCar(null);
    setSelectedRate(null);
    setMessage("");
  }

  return (
    <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-5 py-4 border-b border-gray-700 flex items-center gap-2">
        <span className="text-xl">🚃</span>
        <h3 className="font-bold text-white">混雑状況を報告する</h3>
        <span className="ml-auto text-xs text-gray-500">今乗っている方向け</span>
      </div>

      <div className="px-5 py-4">

        {/* idle */}
        {step === "idle" && (
          <button
            onClick={handleOpen}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            今この列車に乗っています →
          </button>
        )}

        {/* 号車選択 */}
        {step === "select_car" && (
          <div>
            <p className="text-sm text-gray-300 mb-3">乗っている号車を選んでください</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: carCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleSelectCar(n)}
                  className="w-12 h-12 rounded-lg border-2 border-gray-600 hover:border-blue-400 hover:bg-blue-900/30 text-white font-bold transition-all"
                >
                  {n}
                </button>
              ))}
            </div>
            <button onClick={handleReset} className="mt-3 text-xs text-gray-500 hover:text-gray-300">キャンセル</button>
          </div>
        )}

        {/* 混雑レベル選択 */}
        {step === "select_level" && (
          <div>
            <p className="text-sm text-gray-300 mb-3">
              <span className="text-white font-bold">{selectedCar}号車</span> の混雑状況を選んでください
            </p>
            <div className="space-y-2">
              {CONGESTION_OPTIONS.map((opt) => (
                <button
                  key={opt.rate}
                  onClick={() => handleSubmit(opt.rate)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-600 hover:border-gray-400 hover:bg-gray-700 transition-all text-left`}
                >
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">{opt.label}</p>
                    <p className="text-xs text-gray-400">混雑率 {opt.rate}% 相当</p>
                  </div>
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-xs text-white ${getCongestionBgClass(opt.rate)}`}>
                    {getCongestionLabel(opt.rate)}
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("select_car")} className="mt-3 text-xs text-gray-500 hover:text-gray-300">← 号車を選びなおす</button>
          </div>
        )}

        {/* 送信中 */}
        {step === "submitting" && (
          <div className="flex items-center justify-center gap-3 py-4 text-gray-300">
            <div className="animate-spin w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full" />
            <span>送信中...</span>
          </div>
        )}

        {/* 完了 */}
        {step === "done" && (
          <div className="text-center py-3">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-green-400 font-semibold">{message}</p>
            <p className="text-xs text-gray-500 mt-1">{selectedCar}号車・混雑率{selectedRate}%を報告しました</p>
            <button onClick={handleReset} className="mt-3 text-xs text-gray-400 hover:text-white underline">閉じる</button>
          </div>
        )}

        {/* エラー */}
        {step === "error" && (
          <div className="text-center py-3">
            <p className="text-yellow-400">{message}</p>
            <button onClick={handleReset} className="mt-3 text-xs text-gray-400 hover:text-white underline">閉じる</button>
          </div>
        )}
      </div>
    </div>
  );
}
