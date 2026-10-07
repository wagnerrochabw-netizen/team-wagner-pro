'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Camera,
  Plus,
  Sparkles,
  Trophy,
  Flame,
  Utensils,
  Dumbbell,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  X,
  Tag,
  ShieldCheck,
  Bot
} from 'lucide-react';
import { UserStats } from '@/lib/types';
import { CommunityPhotoAnalysis } from '@/app/api/community/analyze-photo/route';

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  isCurrentUser?: boolean;
  timeAgo: string;
  category: 'Treino' | 'Alimentação';
  imageUrl: string;
  caption: string;
  likes: number;
  isLiked?: boolean;
  aiAnalysis: {
    moderacao_aprovada: boolean;
    descricao_visual: string;
    comentario_motivacional: string;
    tags: string[];
  };
  createdAt: number;
}

const STORAGE_KEY_POSTS = 'team_wagner_community_posts';

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorName: 'Wagner Rocha (Coach)',
    authorAvatar: '/logo.png',
    timeAgo: 'Há 12 min',
    category: 'Treino',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
    caption: 'Sessão matinal de dorsais e bíceps concluída com 100% de intensidade. A disciplina não negocia! 💥',
    likes: 24,
    isLiked: false,
    aiAnalysis: {
      moderacao_aprovada: true,
      descricao_visual: 'Treino de força na academia com foco em dorsais e puxada alta.',
      comentario_motivacional: 'Padrão de excelência Team Wagner! A consistência de hoje molda a força de amanhã. Bora buscar o topo! 🔥💪⚡',
      tags: ['#TreinoPesado', '#Dorsais', '#TeamWagner', '#FocoTotal', '#Disciplina'],
    },
    createdAt: Date.now() - 12 * 60 * 1000,
  },
  {
    id: 'post-2',
    authorName: 'Camila Duarte',
    timeAgo: 'Há 45 min',
    category: 'Alimentação',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    caption: 'Almoço do plano: Salmão grelhado, mix de folhas verdes, arroz integral e quinoa. Meta de água de 3L quase batida! 🥗🐟',
    likes: 18,
    isLiked: true,
    aiAnalysis: {
      moderacao_aprovada: true,
      descricao_visual: 'Prato saudável e balanceado com salmão grelhado e salada verde colorida.',
      comentario_motivacional: 'Nutrição impecável, Camila! Proteína de alto valor biológico e micronutrientes no ponto certo para recuperação muscular! 🥗👏✨',
      tags: ['#AlimentacaoLimpa', '#NutricaoEsportiva', '#SalmaoFit', '#MetaBatida'],
    },
    createdAt: Date.now() - 45 * 60 * 1000,
  },
  {
    id: 'post-3',
    authorName: 'Marcos Silva',
    timeAgo: 'Há 2 horas',
    category: 'Treino',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    caption: 'Leg day finalizado! Agachamento livre 120kg + leg press. Pernas tremendo mas a meta foi cumprida! 🦵🔥',
    likes: 31,
    isLiked: false,
    aiAnalysis: {
      moderacao_aprovada: true,
      descricao_visual: 'Atleta finalizando sessão intensa de agachamento e treino de pernas.',
      comentario_motivacional: 'Que volume monstro, Marcos! Dia de perna é onde os campeões se diferenciam. Hidrate bastante e descanse bem hoje! 🦵🚀🔥',
      tags: ['#LegDay', '#AgachamentoLivre', '#Superacao', '#TeamWagner'],
    },
    createdAt: Date.now() - 2 * 60 * 60 * 1000,
  },
];

interface CommunityFeedProps {
  stats: UserStats;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({ stats }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [filter, setFilter] = useState<'todos' | 'treino' | 'alimentacao'>('todos');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CommunityPhotoAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from localStorage
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_POSTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPosts(parsed);
          }
        }
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const savePosts = (newPosts: CommunityPost[]) => {
    setPosts(newPosts);
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(newPosts));
    } catch {
      // ignore
    }
  };

  const handleToggleLike = (postId: string) => {
    const updated = posts.map((p) => {
      if (p.id === postId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : p.likes - 1,
        };
      }
      return p;
    });
    savePosts(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        setErrorMsg(null);
        runAiAnalysis(base64, caption);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPresetPhoto = (url: string, defaultCaption: string) => {
    setImagePreview(url);
    if (!caption) setCaption(defaultCaption);
    setErrorMsg(null);
    runAiAnalysis(url, defaultCaption);
  };

  const runAiAnalysis = async (imgData: string, textCaption: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/community/analyze-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgData, text: textCaption }),
      });
      if (!res.ok) {
        throw new Error('Falha ao processar imagem');
      }
      const data: CommunityPhotoAnalysis = await res.json();
      setAnalysisResult(data);
    } catch {
      // Fallback gracioso
      setAnalysisResult({
        categoria: 'Treino',
        moderacao_aprovada: true,
        descricao_visual: 'Registro de consistência e dedicação na comunidade',
        comentario_motivacional: 'Excelente dedicação! Continue firme mantendo seu ritmo no Team Wagner! 🔥💪⚡',
        tags: ['#TeamWagner', '#Foco', '#Consistencia', '#VidaSaudavel'],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePublishPost = () => {
    if (!imagePreview) {
      setErrorMsg('Por favor, selecione ou envie uma foto para publicar.');
      return;
    }

    if (analysisResult && !analysisResult.moderacao_aprovada) {
      setErrorMsg('Esta imagem não atende às diretrizes da comunidade saudável.');
      return;
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: stats.name || 'Wagner Rocha',
      authorAvatar: stats.avatarUrl,
      isCurrentUser: true,
      timeAgo: 'Agora mesmo',
      category: (analysisResult?.categoria === 'Alimentação' ? 'Alimentação' : 'Treino'),
      imageUrl: imagePreview,
      caption: caption.trim() || 'Mais um registro focado no plano e na consistência! 💪',
      likes: 1,
      isLiked: true,
      aiAnalysis: analysisResult || {
        moderacao_aprovada: true,
        descricao_visual: 'Foto compartilhada pelo atleta',
        comentario_motivacional: 'Excelente dedicação! Continue firme na sua rotina! 🔥💪⚡',
        tags: ['#TeamWagner', '#Foco', '#Consistencia'],
      },
      createdAt: Date.now(),
    };

    const updated = [newPost, ...posts];
    savePosts(updated);

    // Reset
    setImagePreview(null);
    setCaption('');
    setAnalysisResult(null);
    setIsCreateModalOpen(false);
  };

  const filteredPosts = posts.filter((p) => {
    if (filter === 'treino') return p.category === 'Treino';
    if (filter === 'alimentacao') return p.category === 'Alimentação';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Banner de Apresentação da Rede Social Fitness */}
      <div className="p-4 rounded-2xl bg-[#12161F] border border-[#222938] space-y-3 relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00E5FF]/20 to-[#00E5FF]/5 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-space font-bold text-base text-white">
                  Feed da Comunidade
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono font-bold">
                  IA Ativa
                </span>
              </div>
              <p className="text-[11px] text-[#849396] font-sans">
                Poste fotos dos seus pratos e treinos com moderação e engajamento automático por IA
              </p>
            </div>
          </div>
        </div>

        {/* Botão Principal de Publicar Foto */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full py-3 px-4 rounded-xl bg-[#00E5FF] hover:bg-[#22e9ff] active:scale-[0.98] text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.35)] transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>Publicar Foto de Treino ou Refeição</span>
        </button>

        {/* Filtros de Categoria */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl">
          <button
            type="button"
            onClick={() => setFilter('todos')}
            className={`py-1.5 text-xs font-space font-bold rounded-lg transition-all cursor-pointer ${
              filter === 'todos'
                ? 'bg-[#00E5FF] text-[#0B0E14] shadow-sm'
                : 'text-[#849396] hover:text-white'
            }`}
          >
            Todos ({posts.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter('treino')}
            className={`py-1.5 text-xs font-space font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filter === 'treino'
                ? 'bg-[#00E5FF] text-[#0B0E14] shadow-sm'
                : 'text-[#849396] hover:text-white'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Treinos</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('alimentacao')}
            className={`py-1.5 text-xs font-space font-bold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              filter === 'alimentacao'
                ? 'bg-[#00E5FF] text-[#0B0E14] shadow-sm'
                : 'text-[#849396] hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Pratos</span>
          </button>
        </div>
      </div>

      {/* Lista de Posts da Comunidade */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-[#12161F] border border-[#222938] hover:border-[#00E5FF]/40 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl transition-all"
          >
            {/* Header do Post */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {post.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-10 h-10 rounded-full object-cover border border-[#00E5FF]/40 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#171B26] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center font-space font-bold text-xs">
                    {post.authorName.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-space font-bold text-sm text-white leading-tight">
                      {post.authorName}
                    </span>
                    {post.isCurrentUser && (
                      <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF] text-[9px] font-mono font-bold">
                        Você
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#849396] font-mono">
                    {post.timeAgo}
                  </span>
                </div>
              </div>

              {/* Badge de Categoria */}
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-space font-bold border flex items-center gap-1 ${
                  post.category === 'Alimentação'
                    ? 'bg-[#C5A059]/15 border-[#C5A059]/40 text-[#E5C378]'
                    : 'bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]'
                }`}
              >
                {post.category === 'Alimentação' ? (
                  <>
                    <Utensils className="w-3 h-3" />
                    <span>Alimentação</span>
                  </>
                ) : (
                  <>
                    <Dumbbell className="w-3 h-3" />
                    <span>Treino</span>
                  </>
                )}
              </span>
            </div>

            {/* Legenda do Usuário */}
            {post.caption && (
              <p className="text-xs sm:text-sm text-[#BAC9CC] leading-relaxed">
                {post.caption}
              </p>
            )}

            {/* Foto do Post */}
            <div className="rounded-xl overflow-hidden border border-[#222938] bg-[#0B0E14] relative max-h-[360px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt={post.caption || 'Foto da comunidade'}
                className="w-full h-auto max-h-[360px] object-cover"
              />
            </div>

            {/* Caixa de Análise e Comentário Automático da IA */}
            <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3.5 space-y-2.5">
              {/* Descrição Visual Identificada */}
              <div className="flex items-start gap-2 text-[11px] text-[#849396]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">IA Visual:</strong> {post.aiAnalysis.descricao_visual}
                </span>
              </div>

              {/* Comentário Automático do Bot / Coach */}
              <div className="p-2.5 rounded-lg bg-[#12161F] border border-[#00E5FF]/20 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#00E5FF] font-bold block">
                    Coach Wagner IA • Comentário Automático
                  </span>
                  <p className="text-xs text-white font-sans mt-0.5 leading-snug">
                    {post.aiAnalysis.comentario_motivacional}
                  </p>
                </div>
              </div>

              {/* Hashtags Geradas pela IA */}
              <div className="flex flex-wrap gap-1 pt-1">
                {post.aiAnalysis.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#171B26] border border-[#222938] text-[10px] font-mono text-[#BAC9CC]"
                  >
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            </div>

            {/* Ações Sociais (Curtir, Comentar, Compartilhar) */}
            <div className="flex items-center justify-between pt-1 border-t border-[#222938]/60 text-xs text-[#849396]">
              <button
                type="button"
                onClick={() => handleToggleLike(post.id)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
                  post.isLiked
                    ? 'text-rose-400 bg-rose-500/10 font-bold'
                    : 'hover:text-white hover:bg-[#171B26]'
                }`}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                <span>{post.likes} {post.likes === 1 ? 'Curtida' : 'Curtidas'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('O Bot do App já comentou automaticamente neste post!')}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:text-white hover:bg-[#171B26] transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>1 Comentário</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Post no Team Wagner',
                        text: post.caption,
                        url: window.location.href,
                      }).catch(() => {});
                    } else {
                      alert('Link do post copiado para compartilhar com a comunidade!');
                    }
                  }}
                  className="p-1.5 rounded-xl hover:text-[#00E5FF] hover:bg-[#171B26] transition-colors cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL DE CRIAÇÃO E ANÁLISE DE NOVO POST */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 text-white shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-space font-bold text-base text-white">
                    Novo Post na Comunidade
                  </h2>
                  <span className="text-[10px] text-[#849396] font-mono block">
                    Análise e Moderação com IA em Tempo Real
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-[#849396] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seleção de Foto */}
            <div className="space-y-2">
              <label className="text-xs font-space font-bold text-[#BAC9CC] block">
                Escolha a Foto (Treino ou Prato/Refeição):
              </label>

              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-[#00E5FF]/50 max-h-56 bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setAnalysisResult(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-[#222938] hover:border-[#00E5FF] rounded-2xl text-center space-y-2 cursor-pointer transition-all bg-[#0B0E14] hover:bg-[#12161F]"
                  >
                    <Camera className="w-8 h-8 text-[#00E5FF] mx-auto animate-bounce" />
                    <span className="text-xs font-space font-bold text-white block">
                      Toque para enviar foto da sua câmera ou galeria
                    </span>
                    <span className="text-[10px] text-[#849396] block">
                      PNG, JPG até 5MB
                    </span>
                  </div>

                  {/* Fotos Rápidas de Demonstração */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#849396] font-mono block">
                      Ou selecione um exemplo para testar a IA instantaneamente:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          selectPresetPhoto(
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
                            'Prato com salmão grelhado, brócolis e salada saudável.'
                          )
                        }
                        className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#E5C378] text-left text-xs space-y-1 cursor-pointer transition-all"
                      >
                        <span className="text-[#E5C378] font-bold text-[11px] block">
                          🥗 Foto de Prato / Refeição
                        </span>
                        <span className="text-[10px] text-[#849396] block truncate">
                          Salmão, salada e brócolis
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          selectPresetPhoto(
                            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
                            'Treino pesado de superiores e bíceps na academia hoje!'
                          )
                        }
                        className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#00E5FF] text-left text-xs space-y-1 cursor-pointer transition-all"
                      >
                        <span className="text-[#00E5FF] font-bold text-[11px] block">
                          🏋️ Foto de Treino
                        </span>
                        <span className="text-[10px] text-[#849396] block truncate">
                          Musculação e aparelhos
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Legenda */}
            <div className="space-y-1">
              <label className="text-xs font-space font-bold text-[#BAC9CC] block">
                Legenda do Post:
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Ex: Treino de peito concluído ou almoço pós-treino 100% no plano..."
                className="w-full bg-[#0B0E14] border border-[#222938] rounded-xl p-3 text-xs text-white placeholder-[#849396] focus:border-[#00E5FF] focus:outline-none min-h-[60px]"
              />
            </div>

            {/* Feedback da Análise de IA em tempo real */}
            {isAnalyzing && (
              <div className="p-3.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center gap-2.5 text-xs text-[#00E5FF]">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span>A IA está analisando a foto, verificando moderação e gerando comentário...</span>
              </div>
            )}

            {analysisResult && (
              <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#222938] space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-[#222938] pb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span className="font-space font-bold text-white">Análise da IA Gerada</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      analysisResult.moderacao_aprovada
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {analysisResult.moderacao_aprovada ? '✓ Aprovado' : '✕ Reprovado'}
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-[#BAC9CC]">
                  <p>
                    <strong className="text-white">Categoria:</strong> {analysisResult.categoria}
                  </p>
                  <p>
                    <strong className="text-white">Visão da Foto:</strong> {analysisResult.descricao_visual}
                  </p>
                  <p>
                    <strong className="text-[#00E5FF]">Comentário do Bot:</strong> &quot;{analysisResult.comentario_motivacional}&quot;
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {analysisResult.tags.map((t, i) => (
                      <span key={i} className="text-[#00E5FF] font-mono text-[10px]">
                        {t.startsWith('#') ? t : `#${t}`}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Ação de Publicar */}
            <button
              type="button"
              onClick={handlePublishPost}
              disabled={isAnalyzing || !imagePreview}
              className="w-full py-3.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EAFF] disabled:opacity-50 text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publicar no Feed da Comunidade</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
