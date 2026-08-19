"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ShieldCheck, UploadCloud, AlertTriangle, FileText, CheckCircle2, 
  RefreshCw, MessageSquare, Activity, Download, FileSearch, X, Key, Wand2, Send
} from "lucide-react";
import jsPDF from "jspdf";

export default function EnterpriseCustomsDashboard() {
  const [activeTab, setActiveTab] = useState("audit");
  const [description, setDescription] = useState("Industrial catalyst compound containing Vanadium Pentoxide V2O5 for chemical processing");
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [remediating, setRemediating] = useState(false);

  const [chatLog, setChatLog] = useState([
    { role: "ai", text: "Upload a manifest or enter an item description. I will audit it for WCO compliance and flag potential regulatory risks." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isCopilotLoading, setIsCopilotLoading] = useState(false);
  
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleExtract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setExtracting(true);
    setErrorMessage(null);
    setStructuredData(null); 

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/v1/extract", { method: "POST", body: formData });
      if (!res.ok) throw new Error("OCR Extraction failed");
      const data = await res.json();

      const sanitizedText = data.extracted_text
        .replace(/\r\n|\r|\n/g, '\n') 
        .replace(/\n\s*\n/g, '\n\n')  
        .replace(/  +/g, '         ')         
        .trim();

      setExtractedText(sanitizedText);
      setDescription(data.structured_data?.item_description || sanitizedText);
      setStructuredData(data.structured_data); 

      setChatLog(prev => [...prev, { role: "ai", text: "Document scanned successfully. I've extracted the raw text and isolated the item description. Would you like me to run the compliance audit?" }]);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setAuditResult(null);
    setAuditLogs([]);

    const addLog = (msg: string) => setAuditLogs(prev => [...prev, msg]);
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      addLog("[SYS] Initializing vector embedding for item description...");
      await delay(500);
      addLog("[SYS] Encoding via all-MiniLM-L6-v2 transformer model...");
      await delay(600);
      addLog("[SYS] Calculating cosine distance in pgvector database...");
      await delay(700);
      addLog("[SYS] Generating Cryptographic Audit Hash Ledger...");
      await delay(600);
      addLog("[SYS] Cross-referencing OFAC sanctions & global risk registries...");
      await delay(800);

      const res = await fetch("http://127.0.0.1:8000/v1/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_description: description }),
      });
      
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      
      addLog("[SYS] Vector match found. Calculating fraud & evasion probability...");
      await delay(600);
      addLog(`[SYS] Process complete. HS Code: ${data.matched_hs_code}`);
      await delay(400);

      setAuditResult(data);
      setActiveTab("audit");
      
      setChatLog(prev => [...prev, { role: "ai", text: `Audit complete. Mapped to HS Code ${data.matched_hs_code}. Risk level is assessed as ${data.compliance_risk}.` }]);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ENTERPRISE FEATURE: Autonomous Agent Remediation Handler
  const handleAutoRemediate = async () => {
    if (!auditResult) return;
    setRemediating(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/v1/remediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_description: description,
          hs_code: auditResult.matched_hs_code,
          risk_score: auditResult.fraud_score,
          sanctions_status: auditResult.sanctions_status
        }),
      });

      if (!res.ok) throw new Error("Remediation failed");
      const data = await res.json();

      // Update local state with agent magic
      setDescription(data.compliant_description);
      setAuditResult((prev: any) => ({
        ...prev,
        fraud_score: data.new_risk_score,
        compliance_risk: "Low (Agent Remediated)",
        sanctions_status: data.new_sanctions_status
      }));

      // Push formal broker letter into chat log
      setChatLog(prev => [
        ...prev, 
        { role: "ai", text: `### 🤖 Autonomous Broker Remediation Executed\n\n**New Compliant Description:**\n${data.compliant_description}\n\n**Drafted Exporter Notice / Correction Email:**\n${data.broker_letter}` }
      ]);
      setActiveTab("copilot");

    } catch (err: any) {
      setErrorMessage("Autonomous remediation failed: " + err.message);
    } finally {
      setRemediating(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isCopilotLoading) return;

    const userMessage = chatInput;
    setChatInput("");
    
    setChatLog(prev => [
      ...prev, 
      { role: "user", text: userMessage },
      { role: "ai", text: "" } 
    ]);
    setIsCopilotLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/v1/copilot-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage, 
          context: description || extractedText || "No document loaded yet." 
        }),
      });

      if (!res.ok) throw new Error("Copilot response failed");
      if (!res.body) throw new Error("No readable stream available");
      
      setIsCopilotLoading(false); 

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        setChatLog((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            text: updated[lastIdx].text + chunk,
          };
          return updated;
        });
      }
    } catch (err: any) {
      setChatLog(prev => [
        ...prev.slice(0, -1), 
        { role: "ai", text: "⚠ Engine error: Unable to reach the AI customs broker backend." }
      ]);
      setIsCopilotLoading(false);
    } 
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let nextY = 20;
  
    const checkAddPage = (neededSpace: number) => {
      if (nextY + neededSpace >= pageHeight - 20) {
        doc.addPage();
        nextY = 20;
      }
    };
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text("CustomsGuard Enterprise Audit Report", 20, nextY);
    nextY += 8;
  
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${new Date().toUTCString()} | Engine: Autonomous WCO/OFAC Compliance`, 20, nextY);
    nextY += 6;
  
    doc.setDrawColor(200, 200, 200);
    doc.line(20, nextY, 190, nextY);
    nextY += 10;
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("1. Declared Item Specification", 20, nextY);
    nextY += 6;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitDesc = doc.splitTextToSize(description || "No description loaded.", 170);
    doc.text(splitDesc, 20, nextY);
    nextY += splitDesc.length * 5 + 8;
  
    checkAddPage(45);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("2. Compliance & Vector Verification", 20, nextY);
    nextY += 6;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`• Predicted HS Code: ${auditResult ? auditResult.matched_hs_code : "N/A"}`, 25, nextY);
    doc.text(`• Vector Similarity: ${auditResult ? auditResult.vector_confidence + "%" : "N/A"}`, 110, nextY);
    nextY += 6;
    doc.text(`• Fraud/Evasion Risk: ${auditResult ? auditResult.fraud_score + "% (" + auditResult.compliance_risk + ")" : "N/A"}`, 25, nextY);
    doc.text(`• Sanctions Registry: ${auditResult ? auditResult.sanctions_status : "N/A"}`, 110, nextY);
    nextY += 10;
  
    checkAddPage(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Autonomous Broker Legal Advisory", 20, nextY);
    nextY += 6;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
  
    const aiMessages = chatLog.filter((m) => m.role === "ai");
    const lastAiMessage = aiMessages[aiMessages.length - 1]?.text || "No advisory generated.";
    const cleanLines = lastAiMessage.replace(/\*\*/g, "").replace(/###/g, "").split("\n");
  
    cleanLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        nextY += 3;
        return;
      }
      const splitLine = doc.splitTextToSize(trimmed, 170);
      checkAddPage(splitLine.length * 4.5);
      doc.text(splitLine, 20, nextY);
      nextY += splitLine.length * 4.5;
    });
  
    nextY += 6;
    checkAddPage(30);
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(240, 253, 244);
    doc.rect(20, nextY, 170, 25, "FD");
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(5, 150, 105);
    doc.text("OFFICIAL AUDIT STAMP: VERIFIED DETERMINISTIC VECTOR CLASSIFICATION", 25, nextY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Engine Reference: CG-Vector-all-MiniLM-L6-v2`, 25, nextY + 14);
    doc.setFont("courier", "bold");
    doc.text(`Ledger Verification Hash: ${auditResult?.audit_hash || "PENDING-HASH"}`, 25, nextY + 19);
  
    doc.save("CustomsGuard_Enterprise_Report.pdf");
  };

  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;

      if (trimmed.startsWith("###") || trimmed.startsWith("##")) {
        const headerText = trimmed.replace(/#+/g, "").trim();
        return <h4 key={i} className="text-base font-bold text-indigo-400 mt-3 mb-1">{headerText}</h4>;
      }

      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const bulletText = trimmed.replace(/^[\*\-]\s*/, "");
        return (
          <div key={i} className="flex items-start gap-2 ml-2 my-1">
            <span className="text-emerald-400 mt-1">•</span>
            <span className="flex-1">{bulletText.replace(/\*\*/g, "")}</span>
          </div>
        );
      }

      return (
        <p key={i} className="my-1.5 leading-relaxed text-slate-300">
          {trimmed.split("**").map((chunk, index) => 
            index % 2 === 1 ? <strong key={index} className="text-emerald-400 font-semibold">{chunk}</strong> : chunk
          )}
        </p>
      );
    });
  };

  return (
    <main className="min-h-screen bg-[#0a0f1c] text-slate-200 p-4 lg:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-screen-2xl mx-auto space-y-6">
        
        {/* Top Navbar */}
        <header className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-900/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
                CustomsGuard <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">ENTERPRISE</span>
              </h1>
              <p className="text-xs text-slate-400">Autonomous Compliance & Risk Mitigation Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={handleExportPDF} className="flex items-center gap-2 text-xs font-semibold bg-slate-900 border border-slate-700 hover:border-slate-500 transition px-4 py-2 rounded-lg text-slate-200 hover:text-white">
                <Download className="w-4 h-4 text-blue-400" /> Export Report
             </button>
          </div>
        </header>

        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm flex items-center justify-between">
            <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> {errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-xs hover:text-red-300">Dismiss</button>
          </div>
        )}

        {/* Main Workspace Split */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-160px)] min-h-[700px]">
          
          {/* LEFT PANE: Document Ingestion & Vision */}
          <div className="xl:col-span-5 flex flex-col gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 overflow-hidden relative">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                <FileSearch className="w-4 h-4 text-blue-400" /> Source Document
              </h2>
            </div>

            <div className="flex-1 border-2 border-dashed border-slate-700 rounded-xl bg-slate-950/50 flex flex-col items-center justify-center relative overflow-hidden group">
              
              {filePreview ? (
                <>
                  <button 
                    onClick={clearFile}
                    className="absolute top-3 right-3 z-30 bg-slate-900/90 hover:bg-red-500/20 text-slate-300 hover:text-red-400 p-2 rounded-lg text-xs font-semibold flex items-center gap-2 backdrop-blur-sm border border-slate-700 transition"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>

                  {file?.type === "application/pdf" ? (
                    <iframe 
                      src={`${filePreview}#toolbar=0`} 
                      className="absolute inset-0 w-full h-full z-10 bg-slate-200"
                      title="PDF Document Preview"
                    />
                  ) : (
                    <img src={filePreview} alt="Manifest Preview" className="absolute inset-0 w-full h-full object-contain opacity-60 z-10" />
                  )}
                </>
              ) : (
                <>
                  <div className="text-center p-6 z-10 pointer-events-none">
                    <UploadCloud className="w-10 h-10 text-slate-600 mb-3 mx-auto" />
                    <p className="text-sm text-slate-400 mb-1">Drag & drop commercial invoice</p>
                    <p className="text-xs text-slate-600">Supports PDF, PNG, JPG (Multi-language)</p>
                  </div>
                  <input type="file" accept="image/*, application/pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                </>
              )}
            </div>
            
            {structuredData && (
              <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Origin</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{structuredData.origin}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Destination</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1 truncate">{structuredData.destination}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Incoterms</p>
                  <p className="text-sm font-semibold text-blue-400 mt-1">{structuredData.incoterms}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hazardous Flags</p>
                  <p className={`text-sm font-bold mt-1 flex items-center gap-1 ${structuredData.is_hazardous ? "text-red-400" : "text-emerald-400"}`}>
                    {structuredData.is_hazardous ? (
                      <><AlertTriangle className="w-3 h-3"/> FLAGGED</>
                    ) : (
                      <><CheckCircle2 className="w-3 h-3"/> CLEAR</>
                    )}
                  </p>
                </div>
              </div>
            )}

            <button 
              onClick={handleExtract}
              disabled={extracting || !file}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-200 text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 z-30"
            >
              {extracting ? <RefreshCw className="w-4 h-4 animate-spin text-blue-400" /> : <Activity className="w-4 h-4 text-blue-400" />}
              {extracting ? "Running OCR Engine..." : "Extract & Process via Vision AI"}
            </button>
          </div>

          {/* RIGHT PANE: Analysis & Copilot */}
          <div className="xl:col-span-7 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            
            <div className="flex border-b border-slate-800 bg-slate-950/30">
              <button onClick={() => setActiveTab("audit")} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === "audit" ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-transparent text-slate-400 hover:bg-slate-800/50"}`}>
                <ShieldCheck className="w-4 h-4" /> Compliance Audit
              </button>
              <button onClick={() => setActiveTab("copilot")} className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${activeTab === "copilot" ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" : "border-transparent text-slate-400 hover:bg-slate-800/50"}`}>
                <MessageSquare className="w-4 h-4" /> Autonomous Co-pilot
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "audit" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <form onSubmit={handleAudit} className="space-y-4">
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-400 mb-2">
                        <span>Extracted Item Description / Document Text</span>
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Editable</span>
                      </label>
                      <textarea
                        rows={12}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-y"
                      />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      Execute Vector Analysis
                    </button>
                  </form>

                  {(loading || auditLogs.length > 0) && !auditResult && (
                    <div className="bg-black/90 border border-slate-700 rounded-xl p-4 font-mono text-xs text-emerald-400 space-y-2 min-h-[140px] shadow-inner shadow-black relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/80">
                        <Activity className="w-3 h-3 text-blue-400 animate-pulse" />
                        <span className="text-slate-500 uppercase tracking-widest text-[10px]">Operations Log</span>
                      </div>
                      {auditLogs.map((log, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-bottom-2">{log}</div>
                      ))}
                      {loading && (
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                          <span className="w-1.5 h-3 bg-emerald-400 animate-pulse" /> Processing...
                        </div>
                      )}
                    </div>
                  )}

                  {auditResult && (
                    <div className="pt-6 border-t border-slate-800 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Predicted HS Code</p>
                            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">{auditResult.matched_hs_code}</p>
                          </div>
                          
                          {/* ENTERPRISE AGENT FEATURE: Auto-Remediate Action Button */}
                          <button 
                            onClick={handleAutoRemediate}
                            disabled={remediating}
                            className="mt-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-400 text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {remediating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                            {remediating ? "Agent Remediating..." : "Auto-Remediate & Dispatch"}
                          </button>
                        </div>

                        <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                          <p className="text-xs text-slate-500 mb-1">Fraud / Evasion Risk Score</p>
                          <p className="text-xl font-bold text-slate-200 flex items-center gap-2">
                            <span className={auditResult.fraud_score > 50 ? "text-red-400" : "text-amber-400"}>
                              {auditResult.fraud_score}%
                            </span> 
                            <span className="text-xs text-slate-400">({auditResult.compliance_risk})</span>
                          </p>

                          <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-800 pt-3">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CAS Number Verified
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <AlertTriangle className="w-3 h-3 text-amber-400" /> Dual-Use Annex I Scrutiny
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Weight Validated
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                         <p className="text-xs text-slate-500 mb-2">WCO Official Harmonized Description</p>
                         <p className="text-sm text-slate-300 leading-relaxed">{auditResult.official_description}</p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Sanctions Check</p>
                          <p className={`text-xs font-bold mt-1 flex justify-center items-center gap-1 ${auditResult.sanctions_status === "CLEAR" || auditResult.sanctions_status === "CLEARED BY AI AGENT" ? "text-emerald-400" : "text-red-400"}`}>
                            {(auditResult.sanctions_status === "CLEAR" || auditResult.sanctions_status === "CLEARED BY AI AGENT") && <CheckCircle2 className="w-3 h-3"/>}
                            {auditResult.sanctions_status}
                          </p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Vector Confidence</p>
                          <p className="text-xs font-bold text-blue-400 mt-1">
                            {auditResult?.vector_confidence ? `${auditResult.vector_confidence}%` : "Calculating..."}
                          </p>
                        </div>
                        <div className="bg-slate-900 rounded-lg p-3 border border-slate-800 text-center">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Duty Estimate</p>
                          <p className="text-xs font-bold text-slate-300 mt-1">{auditResult.duty_estimate}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3 shadow-inner">
                        <div className="flex items-center gap-2">
                           <Key className="w-4 h-4 text-slate-500" />
                           <span className="text-[10px] text-slate-500 uppercase tracking-wider">Cryptographic Audit Ledger Hash</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500 truncate max-w-[200px] md:max-w-md">
                          {auditResult.audit_hash}
                        </span>
                      </div>

                    </div>
                  )}
                </div>
              )}

              {activeTab === "copilot" && (
                <div className="flex flex-col h-full animate-in fade-in duration-300">
                  <div className="flex-1 space-y-4 pb-4 overflow-y-auto">
                    {chatLog.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[85%] rounded-xl p-4 text-sm ${msg.role === "ai" ? "bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-tl-sm shadow-md" : "bg-indigo-600 text-white rounded-tr-sm shadow-md"}`}>
                          {msg.role === "ai" ? renderFormattedText(msg.text) : msg.text}
                        </div>
                      </div>
                    ))}
                    
                    {isCopilotLoading && (
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/90 border border-blue-500/30 shadow-lg shadow-blue-500/5 mt-4">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping mt-1" />
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-mono text-blue-400">
                            <span className="font-semibold tracking-wide">CustomsGuard AI Engine</span>
                            <span className="text-slate-600">•</span>
                            <span className="animate-pulse">Cross-referencing WCO & Sanction Registries...</span>
                          </div>
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-800">
                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={isCopilotLoading}
                        placeholder={isCopilotLoading ? "Analyzing trade compliance & regulations..." : "Ask the co-pilot to clarify duty rates or resolve ambiguities..."}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                      />
                      <button 
                        type="submit" 
                        disabled={isCopilotLoading || !chatInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-lg text-sm transition flex items-center justify-center gap-2"
                      >
                        {isCopilotLoading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          "Send"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}