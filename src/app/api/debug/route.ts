import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // 1. 環境変数チェック
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ ok: false, error: "環境変数が未設定です", url: !!url, key: !!key });
  }

  // 2. SELECTテスト（テーブル存在 & RLSチェック）
  const { data, error: selectErr } = await supabase
    .from("congestion_reports")
    .select("id")
    .limit(1);

  if (selectErr) {
    return NextResponse.json({
      ok: false,
      phase: "SELECT",
      error: selectErr.message,
      code: selectErr.code,
      hint: selectErr.code === "42P01"
        ? "テーブルが存在しません。Supabase SQL Editorでテーブルを作成してください。"
        : selectErr.code === "PGRST301" || selectErr.message.includes("RLS")
        ? "RLSポリシーが設定されていません。下記のSQLをSupabase SQL Editorで実行してください。"
        : "不明なエラーです。",
    });
  }

  // 3. INSERTテスト
  const { error: insertErr } = await supabase.from("congestion_reports").insert({
    train_id: "__debug_test__",
    line_id: "__debug__",
    car_number: 1,
    congestion_rate: 50,
  });

  if (insertErr) {
    return NextResponse.json({
      ok: false,
      phase: "INSERT",
      error: insertErr.message,
      code: insertErr.code,
      hint: "RLSのINSERTポリシーが設定されていない可能性があります。",
    });
  }

  // テストデータ削除
  await supabase.from("congestion_reports").delete().eq("train_id", "__debug_test__");

  return NextResponse.json({ ok: true, message: "Supabase接続・INSERT・SELECT 全て正常です！" });
}
