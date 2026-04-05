"use client";

import { useState } from "react";
import { Loader2, Terminal, AlertTriangle, CheckCircle, FileText, Send } from "lucide-react";

import { useState, useEffect } from "react";
import { Loader2, Terminal, AlertTriangle, CheckCircle, FileText, Send, Clock, History, ChevronRight } from "lucide-react";

export default function Home() {
  const [logInput, setLogInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.warn("History fetch failed", err);
    }
  };

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
        fetchHistory(); // Refresh history
      }
    } catch (err) {
      console.error(err);
      alert("バックエンドAPIに接続できませんでした。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectHistoryItem = (item: any) => {
    setLogInput(item.raw_log);
    setAnalysis({
      cause: item.cause,
      solution: item.solution,
      tags: item.tags
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-gray-200 font-sans flex">
      {/* Sidebar: History */}
      <aside className="w-80 border-r border-white/5 bg-[#0D0D0F] flex flex-col shrink-0 hidden md:flex">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <History className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">解析履歴</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {history.length === 0 ? (
            <p className="text-xs text-gray-600 text-center mt-10 font-light italic">履歴はまだありません</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => selectHistoryItem(item)}
                className="group p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-rose-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-300 font-medium line-clamp-2 leading-snug group-hover:text-white">
                  {item.cause || "解析エラー"}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="py-6 px-8 border-b border-white/5 flex items-center justify-between bg-[#0A0A0B]/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">LogxLLM Analyzer</h1>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest leading-none mt-1">Personal Debugging Vault</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left: Input */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                  <FileText className="w-3.5 h-3.5 text-gray-600" />
                  エラーログ
                </h2>
                <button 
                  onClick={() => {setLogInput(""); setAnalysis(null);}}
                  className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
                >
                  [ クリア ]
                </button>
              </div>
              <div className="relative flex-1 min-h-[500px]">
                <textarea
                  className="w-full h-full bg-[#111113] border border-white/10 rounded-2xl p-6 text-sm font-mono text-gray-300 focus:outline-none focus:border-rose-500/30 transition-all resize-none shadow-2xl placeholder-gray-700"
                  placeholder="ここにエラーログをペーストしてください..."
                  value={logInput}
                  onChange={e => setLogInput(e.target.value)}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !logInput.trim()}
                  className="absolute bottom-6 right-6 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all shadow-xl shadow-rose-900/30 flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed group overflow-hidden"
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />解析中...</>
                  ) : (
                    <><Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />解析実行</>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Results */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xs font-semibold text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                解析レポート
              </h2>
              
              {isAnalyzing ? (
                <div className="flex-1 bg-[#111113]/50 border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center text-gray-500 p-10">
                  <div className="relative mb-6">
                    <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
                    <div className="absolute inset-0 blur-xl bg-rose-500/20 animate-pulse"></div>
                  </div>
                  <p className="text-xs font-medium tracking-wide animate-pulse">Gemini 2.5 Flash が原因を特定中...</p>
                </div>
              ) : analysis ? (
                <div className="flex-1 space-y-6">
                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    {analysis.tags?.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-gray-400 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-wider">{tag}</span>
                    ))}
                  </div>
                  
                  {/* Cause */}
                  <div className="bg-[#18181A] rounded-2xl p-8 border border-rose-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <AlertTriangle className="w-20 h-20 text-rose-500" />
                    </div>
                    <h3 className="text-xs font-bold text-rose-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <AlertTriangle className="w-3.5 h-3.5" /> 根本原因
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-medium">{analysis.cause}</p>
                  </div>

                  {/* Solution */}
                  <div className="bg-[#18181A] rounded-2xl p-8 border border-emerald-500/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CheckCircle className="w-20 h-20 text-emerald-500" />
                    </div>
                    <h3 className="text-xs font-bold text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle className="w-3.5 h-3.5" /> 解決策のステップ
                    </h3>
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{analysis.solution}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-[#111113] border border-white/5 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Clock className="w-6 h-6 text-gray-700" />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                    ログを貼り付けて解析を実行すると、AIがトラブルの原因と解決策をここに要約します。<br/>
                    <span className="text-xs text-gray-600 mt-4 block">解析した内容は左側の履歴に自動保存されます。</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
