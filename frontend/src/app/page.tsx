"use client";

import { useState } from "react";
import { Loader2, Terminal, AlertTriangle, CheckCircle, FileText, Send } from "lucide-react";

export default function Home() {
  const [logInput, setLogInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!logInput.trim()) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_log: logInput, project_name: "Personal" })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      if (data.analysis?.error) {
        alert(data.analysis.error);
      } else {
        setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error(err);
      alert("バックエンドAPIに接続できませんでした。FastAPIが起動しているか確認してください。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 font-sans p-8">
      <header className="max-w-5xl mx-auto mb-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">LogxLLM Analyzer</h1>
            <p className="text-xs text-gray-500">個人の失敗ナレッジベース</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              エラーログ / 実行ログを入力
            </h2>
          </div>
          <div className="relative flex-1 min-h-[500px]">
            <textarea
              className="w-full h-full bg-[#121214] border border-white/10 rounded-2xl p-5 text-sm font-mono text-gray-300 focus:outline-none focus:border-rose-500/50 transition-colors resize-none placeholder-gray-600"
              placeholder="ターミナルのログやエラー文をここにペースト..."
              value={logInput}
              onChange={e => setLogInput(e.target.value)}
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !logInput.trim()}
              className="absolute bottom-5 right-5 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-rose-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />解析中...</> : <><Send className="w-4 h-4" />AIで解析する</>}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-4 h-[500px]">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            トラブル原因と対応案
          </h2>
          
          {isAnalyzing ? (
            <div className="flex-1 bg-[#121214] border border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mb-4" />
              <p className="text-sm">ログの文脈を読み解き、過去のベストプラクティスを探索中...</p>
            </div>
          ) : analysis ? (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Tags */}
              <div className="flex gap-2 flex-wrap">
                {analysis.tags?.map((tag: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-300 rounded-full text-xs font-semibold uppercase">{tag}</span>
                ))}
              </div>
              
              {/* Cause */}
              <div className="bg-[#18181A] rounded-2xl p-6 border border-rose-500/20 shadow-inner">
                <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> 根本原因
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.cause}</p>
              </div>

              {/* Solution */}
              <div className="bg-[#18181A] rounded-2xl p-6 border border-emerald-500/20 shadow-inner">
                <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> 解決策のステップ
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.solution}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-[#121214] border border-white/5 rounded-2xl flex items-center justify-center text-gray-600 text-sm p-8 text-center">
              左側にログを貼り付けて「解析」ボタンを押すと、<br/>LLMがエラーの原因と一発で解決できる対応手順を生成します。
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
