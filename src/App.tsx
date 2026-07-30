import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'ap-1', genre: '応用情報', question: 'MTBFとMTTRからシステムの稼働率を求める計算式は？', answer: 'MTBF / (MTBF + MTTR)', explanation: 'MTBF(平均故障間隔)は正常に稼働している平均時間、MTTR(平均修復時間)は修理にかかる平均時間です。' },
  { id: 'ap-2', genre: '応用情報', question: '関係データベースにおいて、レコードを一意に識別するための属性または属性の組を何というか？', answer: '主キー (Primary Key)', explanation: '主キーには「一意性(重複しない)」と「非NULL制約(空であってはいけない)」という2つの条件を満たす必要があります。' },
  { id: 'ap-3', genre: '応用情報', question: '仮想記憶方式において、主記憶と磁気ディスクの間で固定長のブロック単位で領域を管理する方式は？', answer: 'ページング方式', explanation: '固定長のブロックを「ページ」と呼びます。可変長の論理的な単位で管理する方式は「セグメント方式」です。' },
  { id: 'ap-4', genre: '応用情報', question: 'TCP/IPモデルにおいて、HTTPやFTPが属する階層はどれか？', answer: 'アプリケーション層', explanation: 'TCP/IPモデルは4階層からなり、HTTP/FTP/SMTPなどはアプリケーション層に分類されます。' },
  { id: 'ap-5', genre: '応用情報', question: '公開鍵暗号方式において、送信者のデジタル署名を検証するために使用する鍵はどれか？', answer: '送信者の公開鍵', explanation: '送信者が「自身の秘密鍵」で暗号化し、受信者が「送信者の公開鍵」で復号することで、なりすましを検知します。' },
  { id: 'st-1', genre: '統計検定2級', question: '標準正規分布の平均と分散はそれぞれいくつか？', answer: '平均 0、分散 1', explanation: '任意の正規分布に従う変数は、標準化することで平均0・分散1の標準正規分布に従います。' },
  { id: 'st-2', genre: '統計検定2級', question: '帰無仮説が正しいにもかかわらず、誤って棄却してしまうエラーを何というか？', answer: '第一種の過誤 (アルファエラー)', explanation: '「本当は差がないのに、差があると結論づけてしまう」慌て者のエラーです。' },
  { id: 'st-3', genre: '統計検定2級', question: '2つの変数の間に線形関係があるかどうかを示す指標で、-1から1の値をとるものは？', answer: 'ピアソンの積率相関係数', explanation: '1に近いほど強い正の相関、-1に近いほど強い負の相関を示します。' },
  { id: 'st-4', genre: '統計検定2級', question: '母集団から抽出されたサンプルの平均値の分散は、サンプルサイズ(n)が大きくなるにつれてどうなるか？', answer: '小さくなる', explanation: '標本平均の分散は σ² / n となるため、サンプルサイズが大きいほど分散は小さくなります。' },
  { id: 'st-5', genre: '統計検定2級', question: '質的データ（カテゴリデータ）の独立性の検定によく用いられる確率分布は？', answer: 'カイ二乗分布', explanation: 'クロス集計表において、観測度数と期待度数のズレを計算し、カイ二乗分布を用いて検定します。' },
];

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('title');
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [playMode, setPlayMode] = useState<PlayMode>('all');
  
  // 設定
  const [isShuffle, setIsShuffle] = useState(false);
  const [isAnimEnabled, setIsAnimEnabled] = useState(true);
  
  const [targetQuestions, setTargetQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flipCount, setFlipCount] = useState(0);
  
  const [slideDirection, setSlideDirection] = useState<'next'|'prev'|'swipeLeft'|'swipeRight'>('next');
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Touch Handling State
  const [swipeX, setSwipeX] = useState(0);
  const [swipeY, setSwipeY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartRef = useRef<{ x: number, y: number, time: number } | null>(null);

  // LocalStorage Loading
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('quiz_bookmarks_v3');
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.error(e); }
    }
    
    const savedAnim = localStorage.getItem('quiz_anim_enabled');
    if (savedAnim !== null) {
      setIsAnimEnabled(savedAnim === 'true');
    }
    setIsMounted(true);
  }, []);

  // LocalStorage Saving
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('quiz_bookmarks_v3', JSON.stringify(bookmarks));
      localStorage.setItem('quiz_anim_enabled', String(isAnimEnabled));
    }
  }, [bookmarks, isAnimEnabled, isMounted]);

  const genres = useMemo(() => Array.from(new Set(quizData.map(q => q.genre))), []);

  // Actions
  const handleToggleBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }, []);

  const handleStartQuiz = (genre: Genre, mode: PlayMode) => {
    let questions = quizData.filter(q => q.genre === genre);
    if (mode === 'bookmark') {
      questions = questions.filter(q => bookmarks.includes(q.id));
    }
    if (isShuffle) {
      questions = shuffleArray(questions);
    }
    setTargetQuestions(questions);
    setSelectedGenre(genre);
    setPlayMode(mode);
    setCurrentQuestionIndex(0);
    setFlipCount(0);
    setScreen('quiz');
  };

  const handleNext = useCallback((direction: 'next' | 'swipeLeft' | 'swipeRight' = 'next') => {
    if (currentQuestionIndex + 1 < targetQuestions.length) {
      setSlideDirection(direction);
      // 次のカードは必ず新しいDOMとしてマウントされるので、flipCountを0にリセットするだけでよい
      setFlipCount(0);
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setScreen('result');
    }
  }, [currentQuestionIndex, targetQuestions.length]);

  const handlePrev = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('prev');
      // 戻る時も回転を見せないため、表面(0)でマウントさせる
      setFlipCount(0);
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleRestart = () => {
    setScreen('title');
    setSelectedGenre(null);
    setTargetQuestions([]);
  };

  const handleLearned = useCallback(() => {
    const currentId = targetQuestions[currentQuestionIndex].id;
    if (bookmarks.includes(currentId)) {
      handleToggleBookmark(currentId);
    }
    handleNext('swipeRight'); // 覚えた場合は右へ飛んで次へ
  }, [bookmarks, currentQuestionIndex, targetQuestions, handleToggleBookmark, handleNext]);

  const triggerNext = (direction: 'left' | 'right', doBookmark: boolean = false) => {
    if (doBookmark) {
      const currentId = targetQuestions[currentQuestionIndex]?.id;
      if (currentId && !bookmarks.includes(currentId)) {
        handleToggleBookmark(currentId);
      }
    }
    handleNext(direction === 'left' ? 'swipeLeft' : 'swipeRight');
  };

  // Pointer Event Handlers (Unifies Touch and Mouse, fixes mobile double-fire bug)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // Only left click for mouse
    touchStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now()
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !touchStartRef.current) return;
    const deltaX = e.clientX - touchStartRef.current.x;
    const deltaY = e.clientY - touchStartRef.current.y;
    setSwipeX(deltaX);
    setSwipeY(deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!touchStartRef.current) {
      setIsDragging(false);
      return;
    }
    
    const timeDelta = Date.now() - touchStartRef.current.time;
    // 小さい動きかつ短時間は「タップ」と判定
    const isTap = Math.abs(swipeX) < 15 && Math.abs(swipeY) < 15 && timeDelta < 500;
    
    if (isTap) {
      setFlipCount(prev => prev + 1);
    } else {
      const SWIPE_THRESHOLD = 80;
      if (swipeX > SWIPE_THRESHOLD) {
        // 右スワイプ: 次へ
        triggerNext('right');
      } else if (swipeX < -SWIPE_THRESHOLD) {
        // 左スワイプ: ブックマークして次へ
        triggerNext('left', true);
      }
    }
    
    setIsDragging(false);
    setSwipeX(0);
    setSwipeY(0);
    touchStartRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore if pointer capture was already lost
    }
  };


  // Keyboard Shortcuts
  useEffect(() => {
    if (screen !== 'quiz') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setFlipCount(prev => prev + 1);
      } else if (e.code === 'ArrowRight') {
        triggerNext('right');
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      } else if (e.code === 'Escape') {
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, handleNext, handlePrev]);

  if (!isMounted) return <div className="min-h-screen bg-slate-950" />;

  // Dynamic Styles
  // スワイプ・移動用（親要素）
  const swipeTransformStyle = {
    transform: isDragging 
        ? `translateX(${swipeX}px) translateY(${swipeY}px) rotate(${swipeX * 0.05}deg)`
        : `translateX(0px) translateY(0px) rotate(0deg)`,
    transition: isDragging ? 'none' : (!isAnimEnabled ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)')
  };

  const cardVariants = {
    enter: (direction: 'next'|'prev'|'swipeLeft'|'swipeRight') => ({
      // prev（戻る）の時のみ、左側外からスライドインしてくる
      x: direction === 'prev' ? '-100vw' : '0%',
      opacity: direction === 'prev' ? 1 : 0,
      zIndex: direction === 'prev' ? 20 : 0,
    }),
    center: {
      x: '0%',
      opacity: 1,
      rotate: 0,
      zIndex: 10,
    },
    exit: (direction: 'next'|'prev'|'swipeLeft'|'swipeRight') => ({
      // 次へ進む場合（next, swipeLeft, swipeRight）は、現在のカードが画面外へ飛んでいく
      x: direction === 'swipeLeft' ? '-100vw' : direction === 'swipeRight' ? '100vw' : direction === 'next' ? '100vw' : '0%',
      rotate: direction === 'swipeLeft' ? -30 : direction === 'swipeRight' || direction === 'next' ? 30 : 0,
      opacity: direction === 'prev' ? 0 : 1, // prevの時はその場で透明になる（または下に隠れる）
      zIndex: direction === 'prev' ? 0 : 20,
    })
  };

  // Watermarks Opacity
  const nextOpacity = Math.max(0, Math.min(1, swipeX / 100));
  const bookmarkOpacity = Math.max(0, Math.min(1, -swipeX / 100));

  return (
    <div className="min-h-screen bg-mesh text-slate-200 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-indigo-500/30 overflow-hidden">
      
      <div className="max-w-4xl w-full">
        {/* ==============================
            トップ画面 
            ============================== */}
        {screen === 'title' && (
          <div className="animate-fade-in space-y-12 py-8">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center p-3 mb-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-200 to-slate-500 drop-shadow-sm">
                Flashcard Studio
              </h1>
              <p className="text-slate-400 text-lg font-medium tracking-wide">スタイリッシュに、効率的に学ぶ。</p>
            </div>

            {/* 設定エリア */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <label className="flex items-center space-x-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isShuffle} onChange={() => setIsShuffle(!isShuffle)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isShuffle ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isShuffle ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                  出題順をシャッフル
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group bg-white/5 px-5 py-3 rounded-full border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={isAnimEnabled} onChange={() => setIsAnimEnabled(!isAnimEnabled)} />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${isAnimEnabled ? 'bg-pink-500' : 'bg-slate-700'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isAnimEnabled ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                  アニメーション
                </span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {genres.map(genre => {
                const totalCount = quizData.filter(q => q.genre === genre).length;
                const bookmarkCount = quizData.filter(q => q.genre === genre && bookmarks.includes(q.id)).length;

                return (
                  <div key={genre} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-8">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">{genre}</h2>
                      <div className="flex items-center space-x-3 text-sm font-bold bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
                        <span className="text-slate-300">全 {totalCount}</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-amber-400 flex items-center gap-1">★ {bookmarkCount}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <button
                        onClick={() => handleStartQuiz(genre, 'all')}
                        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-2xl transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
                      >
                        <div className="text-left">
                          <span className="block font-bold text-white text-xl mb-1">全問演習</span>
                          <span className="block text-indigo-100 text-sm font-medium">基礎からすべて学習する</span>
                        </div>
                        <svg className="w-6 h-6 text-white opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>

                      <button
                        onClick={() => handleStartQuiz(genre, 'bookmark')}
                        disabled={bookmarkCount === 0}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all border active:scale-[0.98] ${
                          bookmarkCount > 0 
                            ? "bg-white/5 hover:bg-white/10 text-white border-white/20 shadow-xl" 
                            : "bg-black/10 text-slate-600 cursor-not-allowed border-transparent"
                        }`}
                      >
                        <div className="text-left">
                          <span className="block font-bold text-lg mb-1 flex items-center">
                            <span className={`${bookmarkCount > 0 ? 'text-amber-400' : 'text-slate-600'} mr-2 text-xl`}>★</span>
                            ブックマーク演習
                          </span>
                          <span className={bookmarkCount > 0 ? "block text-slate-400 text-sm font-medium" : "block text-slate-600 text-sm font-medium"}>
                            {bookmarkCount > 0 ? "要チェックの問題を復習" : "ブックマークがありません"}
                          </span>
                        </div>
                        <svg className={`w-6 h-6 opacity-50 ${bookmarkCount > 0 ? 'text-white' : 'hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
          <div className="animate-fade-in flex flex-col h-[85vh] max-h-[800px] touch-none">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button 
                  onClick={handleRestart}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-slate-400 transition-all group"
                  title="トップへ戻る (Esc)"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-widest text-slate-300 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                    {selectedGenre}
                  </span>
                  {playMode === 'bookmark' && (
                    <span className="text-xs font-bold text-amber-900 bg-amber-400 px-3 py-1.5 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                      ★ 復習
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex text-xs font-mono text-slate-500 gap-3 mr-4">
                  <span>[Space] めくる</span>
                  <span>[←/→] 移動</span>
                </div>
                <div className="text-base font-black text-slate-300 bg-black/30 px-5 py-2 rounded-full border border-white/10 font-mono tracking-wider shadow-inner">
                  <span className="text-indigo-400 text-xl">{currentQuestionIndex + 1}</span> / {targetQuestions.length}
                </div>
              </div>
            </div>
            
            {/* 3Dカードエリア */}
            <div className="flex-grow flex items-center justify-center relative perspective-1000 mb-8 z-10 cursor-pointer">
              
              {/* 次の問題のカード（背景用 - nextの時だけ表示） */}
              {currentQuestionIndex + 1 < targetQuestions.length && slideDirection !== 'prev' && (
                <div className="absolute w-full h-full max-h-[500px] bg-slate-800 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-sm scale-95 translate-y-4 pointer-events-none z-0 flex flex-col items-center justify-center text-center">
                  <span className="absolute top-6 left-6 text-sm font-black tracking-widest text-indigo-400/30 uppercase">Next</span>
                  <h3 className="text-3xl sm:text-4xl leading-snug sm:leading-tight font-extrabold text-white/50 tracking-tight">
                    {targetQuestions[currentQuestionIndex + 1]?.question}
                  </h3>
                </div>
              )}

              <AnimatePresence custom={slideDirection} mode="popLayout">
                <motion.div
                  key={currentQuestionIndex}
                  custom={slideDirection}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: isAnimEnabled ? 0.4 : 0, ease: "easeInOut" }}
                  className="w-full h-full absolute inset-0 z-10 flex items-center justify-center"
                >
                  {/* スワイプ可能なコンテナ（手前・親） */}
                  <div 
                    className="w-full h-full max-h-[500px] relative z-10"
                    style={swipeTransformStyle}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                  >
                    
                    {/* フリップ回転用コンテナ（子） */}
                    <motion.div 
                      className="w-full h-full absolute inset-0 transform-style-3d"
                      initial={false}
                      animate={{ rotateY: isAnimEnabled ? flipCount * -180 : (flipCount % 2 !== 0 ? -180 : 0) }}
                      transition={{ duration: isAnimEnabled ? 0.6 : 0, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                      
                      {/* 表面 (Question) */}
                      <div className="absolute inset-0 backface-hidden bg-slate-800 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col group overflow-hidden">
                        
                        {/* ラベルを絶対配置にして表裏で完全に位置を固定 */}
                        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20">
                          <span className="text-sm font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-sm">Question</span>
                        </div>
                        
                        <div className="flex-grow flex items-center justify-center overflow-y-auto w-full z-10 relative pt-12 pb-12">
                          <h3 className="text-3xl sm:text-4xl leading-snug sm:leading-tight font-extrabold text-white tracking-tight text-center">
                            {targetQuestions[currentQuestionIndex]?.question}
                          </h3>
                        </div>
                        
                        {/* フッターヒントも絶対配置で統一 */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
                          <span className="text-indigo-300/70 text-sm font-bold bg-black/20 px-4 py-2 rounded-full">
                            タップして解答を見る
                          </span>
                        </div>
                      </div>

                      {/* 裏面 (Answer) - 背景色をindigo-950/90に変更して明確に区別 */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-950/90 border border-indigo-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col group overflow-hidden">
                        
                        {/* 表面と全く同じ絶対配置のラベル */}
                        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 z-20">
                          <span className="text-sm font-black tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-sm">Answer</span>
                        </div>
                        
                        <div className="flex-grow flex flex-col justify-center overflow-y-auto w-full z-10 relative pt-12 pb-12">
                          <p className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-indigo-200 mb-8 pb-8 border-b border-white/10 leading-snug text-center">
                            {targetQuestions[currentQuestionIndex]?.answer}
                          </p>
                          
                          <div className="bg-black/30 rounded-2xl p-6 border border-white/5 relative">
                            <span className="absolute -top-3 left-6 text-xs font-black tracking-widest text-slate-400 uppercase bg-[#0f172a] px-2">解説</span>
                            <p className="text-slate-300 leading-relaxed sm:text-lg">
                              {targetQuestions[currentQuestionIndex]?.explanation}
                            </p>
                          </div>
                        </div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none z-20">
                          <span className="text-slate-400/70 text-sm font-bold bg-black/20 px-4 py-2 rounded-full">
                            スワイプで次へ進む
                          </span>
                        </div>
                      </div>

                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* 透かし (Watermarks - 位置を中央から上部 top-10 に変更) */}
              <div className="absolute top-10 inset-x-0 h-40 z-50 pointer-events-none flex justify-center items-start overflow-hidden">
                <div 
                  className="absolute border-[8px] sm:border-[10px] border-emerald-500 text-emerald-500 font-black text-4xl sm:text-5xl rounded-2xl px-8 py-4 transform -rotate-12 bg-slate-900/60 backdrop-blur-md"
                  style={{ opacity: nextOpacity, transition: isDragging ? 'none' : 'opacity 0.2s', textShadow: '0 4px 20px rgba(16,185,129,0.5)', boxShadow: '0 10px 40px rgba(16,185,129,0.3)' }}
                >
                  NEXT
                </div>
                <div 
                  className="absolute border-[8px] sm:border-[10px] border-rose-500 text-rose-500 font-black text-3xl sm:text-4xl rounded-2xl px-8 py-4 transform rotate-12 bg-slate-900/60 backdrop-blur-md"
                  style={{ opacity: bookmarkOpacity, transition: isDragging ? 'none' : 'opacity 0.2s', textShadow: '0 4px 20px rgba(244,63,94,0.5)', boxShadow: '0 10px 40px rgba(244,63,94,0.3)' }}
                >
                  BOOKMARK
                </div>
              </div>
            </div>

            {/* フッター（アクション） */}
            <div className="flex items-center justify-between gap-3 sm:gap-4 shrink-0">
              <button
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="w-14 h-14 sm:w-auto sm:px-6 sm:py-4 flex items-center justify-center rounded-2xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed bg-white/5 hover:bg-white/10 text-white border border-white/10 shadow-lg active:scale-95"
                title="前の問題 (←)"
              >
                <svg className="w-6 h-6 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline text-lg">戻る</span>
              </button>

              <div className="flex-1 flex justify-center gap-3">
                <button
                  onClick={() => handleToggleBookmark(targetQuestions[currentQuestionIndex].id)}
                  className={`flex-1 max-w-[220px] flex items-center justify-center px-4 py-4 rounded-2xl font-bold transition-all border active:scale-95 ${
                    bookmarks.includes(targetQuestions[currentQuestionIndex]?.id)
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <svg className={`w-6 h-6 mr-2 ${bookmarks.includes(targetQuestions[currentQuestionIndex]?.id) ? 'text-amber-400 fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                  <span className="text-sm sm:text-base tracking-wide">{bookmarks.includes(targetQuestions[currentQuestionIndex]?.id) ? 'ブックマーク中' : 'ブックマーク'}</span>
                </button>

                {/* ブックマーク演習のときだけ「覚えた」ボタンを表示 */}
                {playMode === 'bookmark' && (
                  <button
                    onClick={handleLearned}
                    className="flex-1 max-w-[160px] flex items-center justify-center px-4 py-4 rounded-2xl font-bold transition-all border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    覚えた！
                  </button>
                )}
              </div>

              <button
                onClick={() => triggerNext('right')}
                className="w-14 h-14 sm:w-auto sm:px-8 sm:py-4 flex items-center justify-center rounded-2xl font-bold transition-all bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_10px_20px_rgba(99,102,241,0.4)] border border-indigo-400/50 active:scale-95"
                title="次の問題 (→)"
              >
                {currentQuestionIndex + 1 < targetQuestions.length ? (
                  <>
                    <span className="hidden sm:inline text-lg mr-2 tracking-wide">次へ</span>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </>
                ) : (
                  <span className="text-lg tracking-widest px-2">完了</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ==============================
            結果画面 
            ============================== */}
        {screen === 'result' && (
          <div className="text-center animate-fade-in py-16 px-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
            <div className="mb-10 relative inline-block">
              <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full"></div>
              <span className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-300 drop-shadow-sm tracking-tight">
              Awesome!
            </h2>
            
            <p className="text-xl text-slate-300 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
              {playMode === 'all' 
                ? 'セッションが完了しました。わからなかった問題はブックマークから重点的に復習しましょう。' 
                : 'ブックマークの復習が完了しました！確実に知識が定着してきています。'}
            </p>

            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center px-12 py-5 font-bold text-white text-lg transition-all bg-white/10 border border-white/20 rounded-2xl hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/10 shadow-2xl active:scale-95 backdrop-blur-md"
            >
              トップへ戻る
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
