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
  // --- データの基礎 ---
  { id: 'db-1', genre: 'データの基礎', question: 'データを大きく2つに分けると、身長や体重など四則演算に意味がある【　A　】データと、性別や血液型などカテゴリを表す【　B　】データに分類される。', answer: 'A. 量的　B. 質的', explanation: '量的データはさらに離散型（人数など）と連続型（身長など）に分けられます。質的データに対しては平均値を求めるなどの計算は意味を持ちません。' },
  { id: 'db-2', genre: 'データの基礎', question: '質的データのうち、大小関係に意味がなく単なる名前としての役割を果たす尺度を【　A　】尺度と呼び、成績の5段階評価のように大小関係に意味がある尺度を【　B　】尺度と呼ぶ。', answer: 'A. 名義　B. 順序', explanation: 'アンケートの「1:不満〜5:満足」などは順序尺度です。これらは間隔が等しいとは限らないため、厳密には平均値を計算することには適していません。' },
  { id: 'db-3', genre: 'データの基礎', question: '量的データのうち、温度のように「0」が絶対的な無を意味しない尺度を【　A　】尺度と呼び、身長や所得のように「0」が全く無いことを意味し、比率の計算ができる尺度を【　B　】尺度と呼ぶ。', answer: 'A. 間隔　B. 比例', explanation: '間隔尺度は「差」には意味がありますが「2倍」といった比率には意味がありません（気温20度は10度の2倍の熱量ではない）。比例尺度は差にも比率にも意味があります。' },
  { id: 'db-4', genre: 'データの基礎', question: 'データを区分ごとにまとめた度数分布表において、各区間を【　A　】と呼び、その区間の中央の値を【　B　】と呼ぶ。', answer: 'A. 階級　B. 階級値', explanation: '度数分布表から平均値を概算する際は、「階級値 × 度数」の合計を全体のデータ数で割って求めます。' },
  { id: 'db-5', genre: 'データの基礎', question: '度数分布表において、各階級の度数をデータ総数で割った値を【　A　】と呼び、それを小さい階級から順に足し合わせたものを【　B　】と呼ぶ。', answer: 'A. 相対度数　B. 累積相対度数', explanation: '相対度数は全体に対する割合を示し、全階級の相対度数を合計すると1になります。累積相対度数を見れば、ある値までに全体の何%が含まれるかがわかります。' },
  { id: 'db-6', genre: 'データの基礎', question: 'データの分布を可視化する際、階級を横軸に、度数を縦軸にとった棒状のグラフを【　A　】と呼び、数値を位ごとに分けて元の値も確認できるようにした図を【　B　】と呼ぶ。', answer: 'A. ヒストグラム　B. 幹葉図（みきはづ）', explanation: 'ヒストグラムは分布の形状を直感的に把握するのに適し、幹葉図はヒストグラムのような形を作りつつ、個別のデータ値が失われない利点があります。' },
  { id: 'db-7', genre: 'データの基礎', question: '所得分布のように「右に裾が長い（極端に大きい値が存在する）」分布の場合、代表値として【　A　】値を用いると外れ値に大きく引っ張られてしまうため、データを順に並べた真ん中の値である【　B　】値を用いる方が実態を正確に反映しやすい。', answer: 'A. 平均　B. 中央 (メディアン)', explanation: '平均値は全てのデータを使うため外れ値の影響を強く受けます。中央値や最頻値（モード）は極端な値の影響を受けにくい「ロバスト（頑健）」な代表値です。' },
  { id: 'db-8', genre: 'データの基礎', question: 'データの散らばりを示す基本的な指標として、各データと平均値との差である「【　A　】」を求め、その2乗の平均をとったものを【　B　】と呼ぶ。', answer: 'A. 偏差　B. 分散', explanation: '偏差をそのまま合計すると必ず0になってしまうため、2乗して平均をとります。分散の計算は「(値の2乗の平均) - (平均値の2乗)」という簡略公式でも求められます。' },
  { id: 'db-9', genre: 'データの基礎', question: '分散は計算の過程で元のデータの単位も2乗されてしまう。元のデータと単位を揃えるために、分散の正の平方根をとったものを【　A　】と呼ぶ。', answer: 'A. 標準偏差', explanation: '標準偏差は、平均値を中心にデータがどれくらい散らばっているかを、直感的にわかりやすい単位で示してくれます。' },
  { id: 'db-10', genre: 'データの基礎', question: '単位や平均が異なる2つのデータの散らばり具合を比較する場合、標準偏差を【　A　】で割った【　B　】を用いる。', answer: 'A. 平均値　B. 変動係数 (CV)', explanation: '例えば「アリの体長のばらつき」と「ゾウの体長のばらつき」を比較する場合、標準偏差そのままでは比較できませんが、変動係数を用いることで相対的なばらつきを比較できます。' },
  { id: 'db-11', genre: 'データの基礎', question: 'データを小さい順に並べて4等分したときの境界値を四分位数と呼ぶ。25%点を【　A　】、75%点を【　B　】と呼び、その差（中心50%の幅）を【　C　】と呼ぶ。', answer: 'A. 第1四分位数 (Q1)　B. 第3四分位数 (Q3)　C. 四分位範囲 (IQR)', explanation: '四分位範囲(IQR)は、極端な外れ値の影響を受けにくい散らばりの指標として、箱ひげ図の箱の長さに用いられます。' },
  { id: 'db-12', genre: 'データの基礎', question: '箱ひげ図において、箱の左端は第1四分位数、右端は第3四分位数を示す。一般的に、箱の端から四分位範囲(IQR)の【　A　】倍以上離れた値は「外れ値」として扱われる。', answer: 'A. 1.5', explanation: '箱ひげ図は「最小値、Q1、中央値、Q3、最大値」の5数要約を可視化したもので、データの偏りや外れ値をひと目で確認できます。' },
  { id: 'db-13', genre: 'データの基礎', question: '各データから平均値を引き、さらに【　A　】で割る変換処理を「標準化」と呼び、変換後のデータは平均が【　B　】、標準偏差が【　C　】の分布になる。', answer: 'A. 標準偏差　B. 0　C. 1', explanation: '標準化得点（zスコア）を求めることで、異なるデータ間での相対的な位置を比較できます。この標準化得点を10倍して50を加えると偏差値になります。' },
  { id: 'db-14', genre: 'データの基礎', question: '所得などの不平等度を測る指標として、横軸に累積相対度数、縦軸に累積配分比率をとった【　A　】曲線があり、この曲線と完全平等線の間の面積から計算される0から1までの数値を【　B　】と呼ぶ。', answer: 'A. ローレンツ　B. ジニ係数', explanation: 'ジニ係数が0に近いほど平等（曲線が対角線に近い）、1に近いほど不平等（曲線が右下に極端に膨らむ）であることを示します。' },
  { id: 'db-15', genre: 'データの基礎', question: '性別や血液型など、2つの質的データ（カテゴリデータ）をタテ・ヨコに組み合わせて度数を集計した表を【　A　】表と呼ぶ。', answer: 'A. クロス集計 (分割)', explanation: '2つのカテゴリ変数間に関係があるかどうか（独立性）を分析する際によく用いられ、カイ二乗検定の基礎となります。' },

  // --- 2変数データと時系列データ ---
  { id: 'ts-1', genre: '2変数データと時系列データ', question: '2変数の散布図において、全体的に右上がりの傾向が見られる場合を【　A　】の相関と呼び、右下がりの傾向が見られる場合を【　B　】の相関と呼ぶ。', answer: 'A. 正　B. 負', explanation: '相関関係はあくまで2つの変数が連動して動く傾向を示すものであり、「一方が原因でもう一方が結果である」という因果関係を必ずしも意味しません（擬似相関に注意）。' },
  { id: 'ts-2', genre: '2変数データと時系列データ', question: '2つの変数の関係性を表す指標として、各変数の「偏差」の積の平均を【　A　】と呼ぶ。', answer: 'A. 共分散', explanation: '共分散は、正の値なら正の相関、負の値なら負の相関を示します。ただしデータの単位に依存するため、異なるデータ同士の相関の強さを直接比較することには適していません。' },
  { id: 'ts-3', genre: '2変数データと時系列データ', question: '共分散はデータの単位に依存する。そのため、共分散を2つの変数の【　A　】の積で割ることで、単位に依存しない-1から1の範囲をとる【　B　】を求める。', answer: 'A. 標準偏差　B. 相関係数', explanation: '相関係数は「直線的な関係」の強さを示します。相関係数が0に近い場合（無相関）、直線的な関係はありませんが、U字型などの曲線的な関係が存在する可能性はあります。' },
  { id: 'ts-4', genre: '2変数データと時系列データ', question: '相関係数は【　A　】から【　B　】までの値をとる。また、散布図の中に極端に離れた【　C　】が存在すると、相関係数の値は大きく影響を受けてしまう。', answer: 'A. -1　B. 1　C. 外れ値', explanation: '相関係数は平均や分散（偏差の2乗）を用いて計算されるため、少数の外れ値によって相関係数が跳ね上がったり下がったりする性質があります。' },
  { id: 'ts-5', genre: '2変数データと時系列データ', question: '時系列データの変動要因は主に、長期的な増減傾向である【　A　】変動、1年周期で繰り返す【　B　】変動、および不規則変動に分解して分析される。', answer: 'A. 傾向 (トレンド)　B. 季節', explanation: 'これらに加えて、数年〜数十年単位の「循環変動」を考慮することもあります。季節変動の影響を取り除く「季節調整」を行うことで、本来のトレンドが把握しやすくなります。' },
  { id: 'ts-6', genre: '2変数データと時系列データ', question: '毎年の成長率が「1年目10%増(1.1倍)、2年目20%増(1.2倍)」のように変化するとき、複数年の「平均的な変化率」を正しく求めるには、算術平均ではなく【　A　】平均を用いる。', answer: 'A. 幾何', explanation: '各年の倍率を掛け合わせ、年数の累乗根をとって求めます。「(1.1 + 1.2) / 2 = 1.15倍」としてしまうと、実際の最終的な成長幅とズレが生じます。' },
  { id: 'ts-7', genre: '2変数データと時系列データ', question: '時系列データの細かなギザギザを取り除き、トレンドを把握するために、一定期間のデータの平均を少しずつずらしながら計算する手法を【　A　】と呼ぶ。', answer: 'A. 移動平均', explanation: '例えば月次データで12ヶ月移動平均をとると、1年間の季節による変動（夏に売れる等）を平滑化して相殺できるため、本来のトレンドが見やすくなります。' },
  { id: 'ts-8', genre: '2変数データと時系列データ', question: '12ヶ月移動平均など期間が偶数の場合、計算結果の時点が「月と月の間」にずれてしまう。これを合わせるために、さらに【　A　】期の移動平均を平均する処理を【　B　】移動平均と呼ぶ。', answer: 'A. 前後2　B. 中心化', explanation: '前後両端のデータにそれぞれ0.5のウェイトをかけて計算することで、時点のずれを補正します。' },
  { id: 'ts-9', genre: '2変数データと時系列データ', question: '時系列データにおいて、過去の値が現在の値にどの程度影響を与えているかを見るために、時点を【　A　】だけずらした同じデータとの間の相関を【　B　】と呼ぶ。', answer: 'A. ラグ　B. 自己相関', explanation: '時点をずらした大きさを「ラグ」と呼びます。ラグ1の自己相関とは、1期前の自分自身のデータとの相関のことです。' },
  { id: 'ts-10', genre: '2変数データと時系列データ', question: '横軸にラグ、縦軸に自己相関係数をとって棒グラフにしたものを【　A　】と呼ぶ。1年周期の季節性がある月次データの場合、ラグ【　B　】の自己相関係数が高くなる。', answer: 'A. コレログラム　B. 12', explanation: 'コレログラムにおいて山と谷が交互に現れる場合、そのデータには周期性が存在することを示しています。' },
  { id: 'ts-11', genre: '2変数データと時系列データ', question: '複数の商品の価格変動を1つの指数としてまとめる物価指数の計算方式において、基準年の購入数量（ウェイト）を用いて計算する方式を【　A　】指数と呼ぶ。', answer: 'A. ラスパイレス', explanation: '計算が容易なため、消費者物価指数などで一般的に用いられます。分母は「基準年の価格×基準年の数量」、分子は「比較年の価格×基準年の数量」の総和です。' },
  { id: 'ts-12', genre: '2変数データと時系列データ', question: '物価指数の計算方式において、比較年（現在）の購入数量を用いて計算する方式を【　A　】指数と呼ぶ。', answer: 'A. パーシェ', explanation: '現在の消費構造を反映できますが、毎年数量を調査する手間がかかります。分母は「基準年の価格×比較年の数量」、分子は「比較年の価格×比較年の数量」の総和です。' },
  { id: 'ts-13', genre: '2変数データと時系列データ', question: '物価が上昇している局面において、ラスパイレス指数は物価の変動を【　A　】に評価する傾向がある。', answer: 'A. 過大', explanation: '価格が上がった商品の購入を減らすという消費者の代替行動（代替効果）を反映できないためです。逆にパーシェ指数は過小に評価する傾向があります。' },
  { id: 'ts-14', genre: '2変数データと時系列データ', question: 'ラスパイレス指数の過大評価とパーシェ指数の過小評価という欠点を補うために、両指数の【　A　】平均をとったものを【　B　】指数と呼ぶ。', answer: 'A. 幾何　B. フィッシャー', explanation: 'フィッシャー指数は両者を掛け合わせて平方根（√）をとって計算される、理想的な指数とされています。' },
  { id: 'ts-15', genre: '2変数データと時系列データ', question: '時系列データの「前年同月比」のように、ある時点の値を過去の時点の値で割って比率で表すことは、長期的な成長の比較だけでなく、【　A　】変動の影響を排除する効果もある。', answer: 'A. 季節', explanation: '例えば「今年の8月の売上」を「去年の8月の売上」で割ることで、「8月は売上が上がりやすい」という季節ごとの偏りを取り除いて成長を評価できます。' },
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
