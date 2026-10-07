'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Send, 
  Cpu, 
  BookOpen, 
  Loader2,
  FileCode,
  FolderKanban
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProjectDocument } from '@/core/domain/entities/document.entity';
import { Header } from '../layout/header';

export function DocHubView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeBoardId = searchParams.get('boardId') || 'board-default';

  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [docs, setDocs] = useState<ProjectDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<ProjectDocument | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Chat com IA
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: 'user' | 'assistant'; text: string; sources?: string[] }>
  >([
    {
      role: 'assistant',
      text: 'Olá! Sou o assistente de inteligência artificial do seu projeto. Você pode subir arquivos `.md` (README, arquitetura, requisitos) e tirar dúvidas ou pedir para estruturar tarefas alinhadas às especificações.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Upload modal / state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [autoExtractStack, setAutoExtractStack] = useState(true);
  const [submittingDoc, setSubmittingDoc] = useState(false);

  const fetchDocs = async (bId: string = activeBoardId) => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/docs?boardId=${bId}`);
      if (res.ok) {
        const json: ProjectDocument[] = await res.json();
        setDocs(json);
        if (json.length > 0) {
          setSelectedDoc(json[0]);
        } else {
          setSelectedDoc(null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocs(activeBoardId);
  }, [activeBoardId]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const list = await res.json();
          setProjects(list.map((p: any) => ({ id: p.id, name: p.name })));
        }
      } catch (e) {}
    };
    loadProjects();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadTitle(file.name.replace(/\.md$/i, ''));

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setUploadContent(content || '');
    };
    reader.readAsText(file);
  };

  const handleSaveDoc = async () => {
    if (!uploadFileName || !uploadContent) return;
    setSubmittingDoc(true);
    try {
      const res = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: activeBoardId,
          title: uploadTitle || uploadFileName,
          fileName: uploadFileName,
          content: uploadContent,
          autoExtractStack,
        }),
      });

      if (res.ok) {
        setIsUploading(false);
        setUploadFileName('');
        setUploadTitle('');
        setUploadContent('');
        await fetchDocs(activeBoardId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/ask-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: activeBoardId,
          question: userMsg,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: data.answer,
            sources: data.citedSections,
          },
        ]);
      } else {
        throw new Error('Falha ao obter resposta');
      }
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Ocorreu um erro ao consultar o motor de IA. Verifique se o servidor está ativo.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f8faf9] dark:bg-[#071712] transition-colors duration-200">
      <Header
        title="Documentação do Projeto & RAG com IA"
        subtitle="Gerencie arquivos .md, extraia tecnologias e tire dúvidas técnicas contextuais"
      />

      <main className="flex-1 p-6 overflow-hidden flex flex-col lg:flex-row gap-6">
        {/* Left Column: Docs Explorer & Viewer */}
        <div className="flex-1 flex flex-col rounded-2xl bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] overflow-hidden shadow-sm dark:shadow-none transition-colors">
          {/* Top Bar */}
          <div className="p-4 border-b border-[#d2e4d8] dark:border-[#163a2d] flex items-center justify-between gap-4 bg-[#edf5f0] dark:bg-[#081a13] flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 tracking-tight">Arquivos .md</h2>
                <span className="text-xs bg-white dark:bg-[#0c221a] text-emerald-900 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-[#d2e4d8] dark:border-[#163a2d] font-semibold">
                  {docs.length}
                </span>
              </div>

              {projects.length > 1 && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg px-2.5 py-1">
                  <FolderKanban className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <select
                    value={activeBoardId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      router.push(`/docs?boardId=${newId}`);
                    }}
                    className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsUploading(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Adicionar .md</span>
            </button>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* List of Docs */}
            <div className="w-full md:w-60 border-r border-[#d2e4d8] dark:border-[#163a2d] p-3 space-y-1.5 overflow-y-auto">
              {docs.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#edf5f0] dark:bg-[#0e2a20] border-emerald-400 dark:border-emerald-600/60 text-emerald-950 dark:text-emerald-100 shadow-xs'
                        : 'bg-[#f8faf9] dark:bg-[#081a13]/60 border-[#d2e4d8] dark:border-[#163a2d]/80 text-emerald-950 dark:text-emerald-300 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-emerald-400/50'}`} />
                      <span className="text-xs font-medium truncate">{doc.fileName}</span>
                    </div>
                    {doc.extractedTechs?.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {doc.extractedTechs.slice(0, 2).map((t) => (
                          <span
                            key={t.id}
                            className="text-[9px] bg-white dark:bg-[#0c221a] text-emerald-800 dark:text-emerald-300 border border-[#d2e4d8] dark:border-[#184232] px-1 py-0.2 rounded"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}

              {docs.length === 0 && !loadingDocs && (
                <div className="p-4 text-center text-xs text-slate-400">
                  Nenhum arquivo .md adicionado.
                </div>
              )}
            </div>

            {/* Viewer Pane */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#f8faf9]/50 dark:bg-[#071712]/40">
              {selectedDoc ? (
                <div>
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d2e4d8] dark:border-[#163a2d]">
                    <div>
                      <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-50">{selectedDoc.title}</h3>
                      <p className="text-xs text-emerald-800/70 dark:text-emerald-300/60">Arquivo: {selectedDoc.fileName}</p>
                    </div>

                    {/* Tech Badges Extraídas */}
                    {selectedDoc.extractedTechs?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-emerald-800/70 dark:text-emerald-300/60 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Stack Detectada:
                        </span>
                        {selectedDoc.extractedTechs.map((t) => (
                          <span
                            key={t.id}
                            className="text-[11px] font-semibold bg-[#edf5f0] dark:bg-[#0e2a20] text-emerald-900 dark:text-emerald-300 border border-[#d2e4d8] dark:border-[#184232] px-2 py-0.5 rounded-md"
                          >
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedDoc.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-emerald-800/50 dark:text-emerald-400/50">
                  Selecione um arquivo para visualizar
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant Q&A Chat */}
        <div className="w-full lg:w-96 flex flex-col rounded-2xl bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] overflow-hidden shrink-0 shadow-sm dark:shadow-none transition-colors">
          {/* Chat Header */}
          <div className="p-4 border-b border-[#d2e4d8] dark:border-[#163a2d] flex items-center gap-2.5 bg-[#edf5f0] dark:bg-[#081a13]">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-600/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-50 uppercase tracking-wider">
                Consultor de IA do Projeto
              </h3>
              <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/60">RAG em tempo real com os arquivos .md</p>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 space-y-3.5 overflow-y-auto bg-[#f8faf9]/60 dark:bg-[#071712]/50 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-2xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] text-slate-800 dark:text-slate-200 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#d2e4d8] dark:border-[#163a2d] text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1 font-medium">
                      <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Fonte: {msg.sources.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 text-xs text-emerald-800/80 dark:text-emerald-300/80 p-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span>Consultando documentos e analisando contexto...</span>
              </div>
            )}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-[#d2e4d8] dark:border-[#163a2d] bg-white dark:bg-[#0c221a]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pergunte algo sobre a arquitetura ou regras..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSendMessage())}
                className="flex-1 bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-emerald-400/40 focus:outline-none focus:border-emerald-600"
              />
              <button
                onClick={handleSendMessage}
                disabled={chatLoading || !chatInput.trim()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Upload .md Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c221a] border border-[#d2e4d8] dark:border-[#163a2d] rounded-2xl w-full max-w-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#d2e4d8] dark:border-[#163a2d] pb-3">
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Adicionar Documento Markdown (.md)
              </h3>
              <button
                onClick={() => setIsUploading(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 mb-1 font-medium">Selecionar Arquivo do Computador</label>
                <input
                  type="file"
                  accept=".md,.markdown,.txt"
                  onChange={handleFileUpload}
                  className="w-full bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-800 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 mb-1 font-medium">Nome do Arquivo</label>
                <input
                  type="text"
                  placeholder="README.md"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2 text-slate-900 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-emerald-950 dark:text-emerald-200 mb-1 font-medium">Conteúdo Markdown</label>
                <textarea
                  rows={6}
                  placeholder="# Título do Projeto&#10;Stack: TypeScript, Next.js..."
                  value={uploadContent}
                  onChange={(e) => setUploadContent(e.target.value)}
                  className="w-full bg-[#f8faf9] dark:bg-[#081a13] border border-[#d2e4d8] dark:border-[#163a2d] rounded-lg p-2.5 text-slate-900 dark:text-slate-200 font-mono"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={autoExtractStack}
                  onChange={(e) => setAutoExtractStack(e.target.checked)}
                  className="rounded border-[#d2e4d8] dark:border-[#163a2d] text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-emerald-950 dark:text-emerald-200 font-medium">
                  Extrair e preencher automaticamente tecnologias do projeto (Tech Stack Auto-Detection)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d2e4d8] dark:border-[#163a2d]">
              <button
                onClick={() => setIsUploading(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDoc}
                disabled={submittingDoc || !uploadFileName || !uploadContent}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-2"
              >
                {submittingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Salvar e Indexar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
