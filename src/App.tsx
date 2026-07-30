import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- 型定義 ---
type Genre = '応用情報' | '統計検定2級' | 'データの基礎' | '2変数データと時系列データ';
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
  { id: 'db-1', genre: 'データの基礎', question: '量的データの定義は？', answer: '数値によって表されるデータ。', explanation: '身長、体重、年齢など、四則演算に意味があるデータです。' },
  { id: 'db-2', genre: 'データの基礎', question: '質的データの定義は？', answer: '性別や血液型など、カテゴリで表されるデータ。', explanation: '平均値を求めるなど、数値としての演算に意味を持たないデータです。' },
  { id: 'db-3', genre: 'データの基礎', question: '名義尺度の定義は？', answer: '値を区別するための名前として使われる尺度。', explanation: '血液型や色など、大小関係に意味がありません。' },
  { id: 'db-4', genre: 'データの基礎', question: '順序尺度の定義は？', answer: '値の大小関係に意味があるが、間隔には意味がない尺度。', explanation: '成績の5段階評価や、アンケートの満足度などが該当します。' },
  { id: 'db-5', genre: 'データの基礎', question: '間隔尺度の定義は？', answer: '値と値の距離（間隔）に意味があるが、0は相対的な意味しか持たない尺度。', explanation: '気温（摂氏）など。0度が「温度がない」わけではありません。' },
  { id: 'db-6', genre: 'データの基礎', question: '比例尺度の定義は？', answer: '値と値の比率に意味があり、0が「値がない」ことを意味する尺度。', explanation: '身長、体重、所得などが該当します。' },
  { id: 'db-7', genre: 'データの基礎', question: '階級値の求め方は？', answer: '階級の中央の値を求める。', explanation: '例えば「150cm以上160cm未満」の階級値は155cmになります。' },
  { id: 'db-8', genre: 'データの基礎', question: '相対度数の求め方は？', answer: '個々の階級の度数をデータ総数で割る。', explanation: 'データ全体に占める各階級の割合を示し、全階級の相対度数の合計は1になります。' },
  { id: 'db-9', genre: 'データの基礎', question: '平均値の求め方は？', answer: '全てのデータの値を足し合わせ、データの個数で割る。', explanation: '最も一般的な代表値ですが、極端な外れ値の影響を受けやすい特徴があります。' },
  { id: 'db-10', genre: 'データの基礎', question: '中央値（メディアン）の定義は？', answer: 'データを小さい順に並べたとき、真ん中に位置する値。', explanation: 'データ数が偶数の場合は、真ん中の2つの値の平均となります。' },
  { id: 'db-11', genre: 'データの基礎', question: '最頻値（モード）の定義は？', answer: 'データの中で出現回数が最も多い値。', explanation: '質的データに対しても求めることができます。' },
  { id: 'db-12', genre: 'データの基礎', question: '【穴埋め】偏差の定義は、個々のデータと【　　】との差である。', answer: '平均値', explanation: '偏差の合計は必ず0になります。' },
  { id: 'db-13', genre: 'データの基礎', question: '【穴埋め】分散の求め方は、【　　】の2乗の平均を求める。', answer: '偏差', explanation: 'データの散らばり具合を表す基本的な指標です。' },
  { id: 'db-14', genre: 'データの基礎', question: '【穴埋め】分散の簡略な求め方は、「（値の2乗の平均）－（【　　】の2乗）」である。', answer: '平均値', explanation: '計算を簡単にするためによく用いられる公式です。' },
  { id: 'db-15', genre: 'データの基礎', question: '【穴埋め】標準偏差の求め方は、【　　】の正の平方根をとる。', answer: '分散', explanation: '平方根をとることで、単位を元のデータとそろえることができます。' },
  { id: 'db-16', genre: 'データの基礎', question: '【穴埋め】変動係数(CV)の求め方は、【　　】を平均値で割る。', answer: '標準偏差', explanation: '単位やスケールの異なるデータの散らばり方を比較するのに用います。' },
  { id: 'db-17', genre: 'データの基礎', question: '【穴埋め】範囲の求め方は、データの【　　】から最小値を引く。', answer: '最大値', explanation: 'データがどのくらいの幅に散らばっているかを示す最もシンプルな指標です。' },
  { id: 'db-18', genre: 'データの基礎', question: '【穴埋め】第1四分位数（Q1）の定義は、データを小さい順に並べて4等分したときの、【　　】%点にあたる値である。', answer: '25', explanation: '50%点は中央値（Q2）、75%点は第3四分位数（Q3）となります。' },
  { id: 'db-19', genre: 'データの基礎', question: '【穴埋め】四分位範囲（IQR）の求め方は、【　　】から第1四分位数(Q1)を引く。', answer: '第3四分位数(Q3)', explanation: 'データの中心50%が含まれる範囲の広さを表します。' },
  { id: 'db-20', genre: 'データの基礎', question: '箱ひげ図の「箱」の長さが表しているものは何か？', answer: '四分位範囲（IQR）', explanation: '箱の左端が第1四分位数、右端が第3四分位数を示します。' },
  { id: 'db-21', genre: 'データの基礎', question: '【穴埋め】標準化得点の求め方は、各データから【　　】を引き、標準偏差で割る。', answer: '平均値', explanation: '標準化によって、データは平均0、標準偏差1の分布に変換されます。' },
  { id: 'db-22', genre: 'データの基礎', question: '【穴埋め】偏差値の求め方は、【　　】を10倍して50を加える。', answer: '標準化得点', explanation: '平均が50、標準偏差が10の分布になるように変換した値です。' },
  { id: 'db-23', genre: 'データの基礎', question: '【穴埋め】ローレンツ曲線の定義は、横軸に【　　】、縦軸に累積配分比率をとった、配分の偏りを表す曲線である。', answer: '累積相対度数', explanation: '所得の不平等度などを示すためによく用いられます。' },
  { id: 'db-24', genre: 'データの基礎', question: '【穴埋め】ジニ係数の定義は、ローレンツ曲線と【　　】に囲まれた面積の割合から計算される、不平等度を示す指標である。', answer: '完全平等線', explanation: '0に近いほど平等、1に近いほど不平等を意味します。' },
  { id: 'ts-25', genre: '2変数データと時系列データ', question: '【穴埋め】正の相関の定義は、一方の値が大きくなると、もう一方の値も【　　】なる傾向があること。', answer: '大きく', explanation: '散布図では全体的に右上がりに点が散らばります。' },
  { id: 'ts-26', genre: '2変数データと時系列データ', question: '【穴埋め】負の相関の定義は、一方の値が大きくなると、もう一方の値は【　　】なる傾向があること。', answer: '小さく', explanation: '散布図では全体的に右下がりに点が散らばります。' },
  { id: 'ts-27', genre: '2変数データと時系列データ', question: '【穴埋め】共分散の求め方は、2つの変数の【　　】の積の平均を求める。', answer: '偏差', explanation: '正の値なら正の相関、負の値なら負の相関があることを示します。' },
  { id: 'ts-28', genre: '2変数データと時系列データ', question: '【穴埋め】共分散の簡略な求め方は、「（xとyの積の平均）－（【　　】）」である。', answer: 'xの平均とyの平均の積', explanation: '分散の簡略公式と同様に計算を楽にするために使われます。' },
  { id: 'ts-29', genre: '2変数データと時系列データ', question: '【穴埋め】相関係数の求め方は、【　　】を、2つの変数の標準偏差の積で割る。', answer: '共分散', explanation: '単位の影響をなくし、相関の強さを-1から1の範囲で表します。' },
  { id: 'ts-30', genre: '2変数データと時系列データ', question: '【穴埋め】相関係数の範囲は、【　　】から1までの値をとる。', answer: '-1', explanation: '1に近いほど強い正の相関、-1に近いほど強い負の相関を示します。' },
  { id: 'ts-31', genre: '2変数データと時系列データ', question: '時系列データにおいて、ある時点の値を1つ前の時点の値で割ったものを何というか？', answer: '前期比（前月比、前年比など）', explanation: '何倍になったかという割合を把握する際に使います。' },
  { id: 'ts-32', genre: '2変数データと時系列データ', question: '【穴埋め】幾何平均の求め方は、毎年の変化率（倍率）を掛け合わせ、年数の【　　】をとる。', answer: '累乗根', explanation: '複数年での平均的な変化率（倍率）を求める際に使います。' },
  { id: 'ts-33', genre: '2変数データと時系列データ', question: '【穴埋め】移動平均の定義は、一定期間のデータの【　　】を少しずつずらしながら計算してつないだもの。', answer: '平均', explanation: '時系列データの細かな変動を取り除き、全体的な傾向（トレンド）を把握するために用います。' },
  { id: 'ts-34', genre: '2変数データと時系列データ', question: '【穴埋め】中心化移動平均の求め方は、偶数期間の移動平均において、計算結果の時点のずれを補正するため、さらに【　　】期の移動平均を平均する。', answer: '前後2', explanation: '両端のデータに0.5のウェイトをかけて計算します。' },
  { id: 'ts-35', genre: '2変数データと時系列データ', question: '【穴埋め】季節変動の定義は、気候や社会の制度によって生じる、【　　】周期の変動である。', answer: '1年', explanation: '夏にアイスが売れるなどの決まったパターンの変動です。' },
  { id: 'ts-36', genre: '2変数データと時系列データ', question: '【穴埋め】自己相関の定義は、1つの時系列データにおいて、時点を【　　】同じデータとの間の相関である。', answer: 'ずらした', explanation: '過去の値が現在の値にどれくらい影響を与えているかを見ます。' },
  { id: 'ts-37', genre: '2変数データと時系列データ', question: '自己相関係数において、「ラグ」の定義は？', answer: 'ずらした時点の数', explanation: 'ラグ1は1期前のデータとの相関を意味します。' },
  { id: 'ts-38', genre: '2変数データと時系列データ', question: '【穴埋め】コレログラムの定義は、横軸に【　　】、縦軸に自己相関係数をとって棒グラフにしたものである。', answer: 'ラグ', explanation: '時系列データにどのような周期性があるかを視覚的に調べるのに用います。' },
  { id: 'ts-39', genre: '2変数データと時系列データ', question: '【穴埋め】ラスパイレス指数の求め方は、分母を「基準年の価格×基準年の数量」、分子を「比較年の価格×【　　】」の総和として計算する。', answer: '基準年の数量', explanation: '消費者物価指数などに用いられ、計算が比較的容易です。' },
  { id: 'ts-40', genre: '2変数データと時系列データ', question: '【穴埋め】パーシェ指数の求め方は、分母を「【　　】×比較年の数量」、分子を「比較年の価格×比較年の数量」の総和として計算する。', answer: '基準年の価格', explanation: '現在の消費構造を反映できますが、毎年数量を調査する必要があります。' },
  { id: 'ts-41', genre: '2変数データと時系列データ', question: '【穴埋め】フィッシャー指数の求め方は、【　　】指数とパーシェ指数の幾何平均をとる。', answer: 'ラスパイレス', explanation: 'ラスパイレス指数の過大評価とパーシェ指数の過小評価の欠点を補います。' },
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
      opacity: 1, // 常に1（透明にしない）
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
      opacity: direction === 'prev' ? 0 : 1,
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

            {/* バージョン表記 */}
            <div className="flex justify-center pt-8 opacity-50 pointer-events-none">
              <span className="text-xs font-mono tracking-widest text-slate-400">v1.0.1</span>
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
                <div className="absolute w-full h-full max-h-[500px] bg-slate-800 border border-slate-700 rounded-3xl p-8 sm:p-12 shadow-sm pointer-events-none z-0 flex flex-col items-center justify-center text-center">
                  <span className="absolute top-8 left-8 sm:top-12 sm:left-12 text-sm font-black tracking-widest text-emerald-400/30 uppercase">Question</span>
                  <div className="flex-grow flex items-center justify-center overflow-y-auto w-full z-10 relative pt-12 pb-12">
                    <h3 className="text-3xl sm:text-4xl leading-snug sm:leading-tight font-extrabold text-white/50 tracking-tight text-center">
                      {targetQuestions[currentQuestionIndex + 1]?.question}
                    </h3>
                  </div>
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

                      {/* 裏面 (Answer) - 透過をなくすため bg-indigo-950 に変更 */}
                      <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-950 border border-indigo-500/50 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col group overflow-hidden">
                        
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
