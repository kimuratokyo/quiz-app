import { useState, useEffect, useMemo } from 'react';

// --- 型定義 ---
type Genre = '応用情報' | '統計検定2級';
type Question = {
  id: string;
  genre: Genre;
  question: string;
  answer: string;
  explanation: string;
};
type ScreenType = 'title' | 'quiz' | 'result';
type PlayMode = 'all' | 'bookmark';

// --- モックデータ ---
const quizData: Question[] = [
  // 応用情報
  {
    id: 'ap-1',
    genre: '応用情報',
    question: 'MTBFとMTTRからシステムの稼働率を求める計算式は？',
    answer: 'MTBF / (MTBF + MTTR)',
    explanation: 'MTBF(平均故障間隔)は正常に稼働している平均時間、MTTR(平均修復時間)は修理にかかる平均時間です。稼働率は 全時間(MTBF+MTTR) に占める 稼働時間(MTBF) の割合で求められます。'
  },
  {
    id: 'ap-2',
    genre: '応用情報',
    question: '関係データベースにおいて、レコードを一意に識別するための属性または属性の組を何というか？',
    answer: '主キー (Primary Key)',
    explanation: '主キーには「一意性(重複しない)」と「非NULL制約(空であってはいけない)」という2つの条件を満たす必要があります。'
  },
  {
    id: 'ap-3',
    genre: '応用情報',
    question: '仮想記憶方式において、主記憶と磁気ディスクの間で固定長のブロック単位で領域を管理する方式は？',
    answer: 'ページング方式',
    explanation: '固定長のブロックを「ページ」と呼びます。一方、可変長の論理的な単位で管理する方式は「セグメント方式」と呼びます。'
  },
  {
    id: 'ap-4',
    genre: '応用情報',
    question: 'TCP/IPモデルにおいて、HTTPやFTPが属する階層はどれか？',
    answer: 'アプリケーション層',
    explanation: 'TCP/IPモデルは4階層(アプリケーション層、トランスポート層、インターネット層、ネットワークインターフェース層)からなり、HTTP/FTP/SMTPなどはアプリケーション層に分類されます。'
  },
  {
    id: 'ap-5',
    genre: '応用情報',
    question: '公開鍵暗号方式において、送信者のデジタル署名を検証するために使用する鍵はどれか？',
    answer: '送信者の公開鍵',
    explanation: 'デジタル署名では、送信者が「自身の秘密鍵」で暗号化（署名）し、受信者が「送信者の公開鍵」で復号（検証）することで、改ざんやなりすましを検知します。'
  },
  // 統計検定2級
  {
    id: 'st-1',
    genre: '統計検定2級',
    question: '標準正規分布の平均と分散はそれぞれいくつか？',
    answer: '平均 0、分散 1',
    explanation: '任意の正規分布 N(μ, σ²) に従う変数Xは、Z = (X - μ) / σ と変換（標準化）することで、平均0・分散1の標準正規分布 N(0, 1) に従います。'
  },
  {
    id: 'st-2',
    genre: '統計検定2級',
    question: '帰無仮説が正しいにもかかわらず、誤って棄却してしまうエラーを何というか？',
    answer: '第一種の過誤 (アルファエラー)',
    explanation: '「本当は差がないのに、差があると結論づけてしまう」慌て者のエラーです。有意水準(α)はこの第一種の過誤を犯す確率の許容上限を意味します。'
  },
  {
    id: 'st-3',
    genre: '統計検定2級',
    question: '2つの変数の間に線形関係があるかどうかを示す指標で、-1から1の値をとるものは？',
    answer: 'ピアソンの積率相関係数',
    explanation: '相関係数(r)は、1に近いほど強い正の相関、-1に近いほど強い負の相関、0に近いほど線形関係がないことを示します。因果関係を示すものではない点に注意が必要です。'
  },
  {
    id: 'st-4',
    genre: '統計検定2級',
    question: '母集団から抽出されたサンプルの平均値（標本平均）の分散は、サンプルサイズ(n)が大きくなるにつれてどうなるか？',
    answer: '小さくなる',
    explanation: '母分散を σ² とすると、標本平均の分散は σ² / n となります。つまりサンプルサイズが大きいほど、標本平均は母平均の周辺に集中しやすくなります。'
  },
  {
    id: 'st-5',
    genre: '統計検定2級',
    question: '質的データ（カテゴリデータ）の独立性の検定によく用いられる確率分布は？',
    answer: 'カイ二乗分布',
    explanation: 'クロス集計表において、観測度数と期待度数のズレ（カイ二乗値）を計算し、カイ二乗分布を用いて2つの変数に連関（依存関係）があるかどうかを検定します。'
  },
];

export default function App() {
  // --- 状態管理 ---
  const [screen, setScreen] = useState<ScreenType>('title');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>('all');
  
  // 学習中の状態
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  
  // ブックマークの状態（LocalStorageと同期）
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // マウント時にlocalStorageからブックマークを読み込む
  useEffect(() => {
    const saved = localStorage.getItem('quiz_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    setIsMounted(true);
  }, []);

  // ブックマークが変更されたらlocalStorageに保存
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('quiz_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, isMounted]);

  // --- 派生状態（Memo） ---
  const genres = useMemo(() => Array.from(new Set(quizData.map(q => q.genre))), []);

  // 選択されたジャンルとモードに応じた問題リスト
  const targetQuestions = useMemo(() => {
    if (!selectedGenre) return [];
    const byGenre = quizData.filter(q => q.genre === selectedGenre);
    if (playMode === 'bookmark') {
      return byGenre.filter(q => bookmarks.includes(q.id));
    }
    return byGenre;
  }, [selectedGenre, playMode, bookmarks]);

  // --- アクション ---
  const handleToggleBookmark = (id: string) => {
    setBookmarks(prev => {
      if (prev.includes(id)) {
        return prev.filter(bId => bId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleStartQuiz = (genre: Genre, mode: PlayMode) => {
    setSelectedGenre(genre);
    setPlayMode(mode);
    setCurrentQuestionIndex(0);
    setIsAnswerRevealed(false);
    setScreen('quiz');
  };

  const handleNext = () => {
    if (currentQuestionIndex + 1 < targetQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswerRevealed(false);
    } else {
      setScreen('result');
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setIsAnswerRevealed(false);
    }
  };

  const handleRestart = () => {
    setScreen('title');
    setSelectedGenre(null);
  };

  // 描画が完了するまで（LocalStorage読み込み前）は何も表示しない
  if (!isMounted) return <div className="min-h-screen bg-slate-900" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 flex items-center justify-center p-4 sm:p-6 font-sans antialiased">
      <div className="max-w-3xl w-full bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-slate-700 p-6 sm:p-10 transition-all duration-300">
        
        {/* ==============================
            トップ画面 
            ============================== */}
        {screen === 'title' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold tracking-widest mb-6 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                FLASHCARD APP
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300">
                学習フラッシュカード
              </h1>
              <p className="text-slate-400">暗記カード形式で、知識を定着させましょう。</p>
            </div>

            <div className="space-y-8">
              {genres.map(genre => {
                const totalCount = quizData.filter(q => q.genre === genre).length;
                const bookmarkCount = quizData.filter(q => q.genre === genre && bookmarks.includes(q.id)).length;

                return (
                  <div key={genre} className="bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 transition-all hover:bg-slate-700/40">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-2">
                      <h2 className="text-2xl font-bold text-white">{genre}</h2>
                      <div className="text-sm text-slate-400 font-medium bg-slate-800/80 px-3 py-1 rounded-full">
                        全 {totalCount} 問 <span className="mx-2 text-slate-600">|</span> <span className="text-amber-400">★</span> {bookmarkCount} 問
                      </div>
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleStartQuiz(genre, 'all')}
                        className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-900/50 group border border-indigo-400/30 transform hover:-translate-y-1"
                      >
                        <span className="font-bold text-white text-lg mb-1">全問演習</span>
                        <span className="text-indigo-200 text-sm font-medium">すべての問題を学習する</span>
                      </button>

                      <button
                        onClick={() => handleStartQuiz(genre, 'bookmark')}
                        disabled={bookmarkCount === 0}
                        className={`flex flex-col items-center justify-center p-5 rounded-xl transition-all border transform ${
                          bookmarkCount > 0 
                            ? "bg-slate-700/80 hover:bg-slate-600 text-white border-slate-500 hover:border-slate-400 shadow-lg hover:-translate-y-1" 
                            : "bg-slate-800/30 text-slate-500 cursor-not-allowed border-slate-700/50"
                        }`}
                      >
                        <span className="font-bold text-lg mb-1 flex items-center">
                          <span className={`${bookmarkCount > 0 ? 'text-amber-400' : 'text-slate-600'} mr-2 text-xl`}>★</span>ブックマーク演習
                        </span>
                        <span className={bookmarkCount > 0 ? "text-slate-300 text-sm font-medium" : "text-slate-600 text-sm font-medium"}>
                          {bookmarkCount > 0 ? "チェックした問題だけ" : "ブックマークがありません"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==============================
            学習（問題）画面 
            ============================== */}
        {screen === 'quiz' && (
          <div className="animate-fade-in flex flex-col min-h-[500px]">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-700/50">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-xs font-bold tracking-wider text-slate-300 bg-slate-700/80 px-3 py-1.5 rounded-lg border border-slate-600">
                  {selectedGenre}
                </span>
                <span className="text-sm font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                  {playMode === 'bookmark' ? '★ ブックマーク演習' : '全問演習'}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-400 bg-slate-900/50 px-4 py-1.5 rounded-full border border-slate-700">
                <span className="text-indigo-400 text-base mr-1">{currentQuestionIndex + 1}</span> / {targetQuestions.length}
              </div>
            </div>
            
            {/* 問題カードエリア */}
            <div className="flex-grow flex flex-col items-center justify-center mb-8 relative">
              <div className="w-full text-center mb-10">
                <h3 className="text-2xl sm:text-3xl leading-relaxed font-semibold text-white tracking-wide">
                  {targetQuestions[currentQuestionIndex]?.question}
                </h3>
              </div>

              {/* 解答エリア（トグル） */}
              <div className="w-full">
                {!isAnswerRevealed ? (
                  <button
                    onClick={() => setIsAnswerRevealed(true)}
                    className="w-full py-8 rounded-2xl border-2 border-dashed border-slate-600 text-slate-400 hover:text-indigo-300 hover:border-indigo-400 hover:bg-indigo-500/10 transition-all font-bold text-xl tracking-wider shadow-sm group"
                  >
                    <span className="group-hover:scale-105 inline-block transition-transform duration-300">
                      タップして解答を見る
                    </span>
                  </button>
                ) : (
                  <div className="w-full animate-fade-in">
                    <div className="bg-slate-700/40 border border-slate-500/50 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-indigo-400 to-cyan-400"></div>
                      <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4 rounded-md border border-indigo-500/30">
                        Answer
                      </span>
                      <p className="text-2xl sm:text-3xl font-bold text-white mb-8 border-b border-slate-600/50 pb-6">
                        {targetQuestions[currentQuestionIndex]?.answer}
                      </p>
                      
                      <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700">
                        <span className="block text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">解説</span>
                        <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                          {targetQuestions[currentQuestionIndex]?.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* フッター（アクション） */}
            <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-700/50 gap-2">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-4 sm:px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 border border-transparent hover:border-slate-600"
              >
                ← <span className="hidden sm:inline">戻る</span>
              </button>

              <button
                onClick={() => handleToggleBookmark(targetQuestions[currentQuestionIndex].id)}
                className={`flex-1 max-w-[200px] flex items-center justify-center px-4 py-3.5 rounded-xl font-bold transition-all border ${
                  bookmarks.includes(targetQuestions[currentQuestionIndex]?.id)
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                <span className="mr-2 text-xl">{bookmarks.includes(targetQuestions[currentQuestionIndex]?.id) ? '★' : '☆'}</span>
                <span className="text-sm sm:text-base">{bookmarks.includes(targetQuestions[currentQuestionIndex]?.id) ? 'ブックマーク中' : 'ブックマーク'}</span>
              </button>

              <button
                onClick={handleNext}
                className="px-4 sm:px-8 py-3.5 rounded-xl font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/50 border border-indigo-500 hover:-translate-y-0.5"
              >
                {currentQuestionIndex + 1 < targetQuestions.length ? (
                  <><span className="hidden sm:inline">次へ</span> →</>
                ) : (
                  '完了 ✓'
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==============================
            結果画面 
            ============================== */}
        {screen === 'result' && (
          <div className="text-center animate-fade-in py-12">
            <div className="mb-8">
              <span className="inline-block px-5 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold tracking-widest border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                COMPLETED
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-400">
              学習お疲れ様でした！
            </h2>
            
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 sm:p-8 max-w-lg mx-auto mb-12">
              <p className="text-lg text-slate-300 leading-relaxed">
                {playMode === 'all' 
                  ? 'すべての問題に目を通しました。わからなかった問題はブックマークして、復習モードで重点的に対策しましょう。' 
                  : 'ブックマークした問題の復習が完了しました。覚えた問題はブックマークを解除してリストを整理しましょう。'}
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center px-10 py-4 font-bold text-white transition-all bg-slate-700 border border-slate-600 rounded-xl hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-lg transform hover:-translate-y-1 hover:border-slate-500"
            >
              トップへ戻る
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
