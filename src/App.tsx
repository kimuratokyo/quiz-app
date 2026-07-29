import { useState } from 'react';

// 問題データの定義
const quizData = [
  {
    question: "ディープラーニングの推論や学習において、RTX 3090などのGPUが一般的なCPUよりも高いパフォーマンスを発揮する構造的な理由はどれか？",
    choices: [
      "並列処理に特化した多数のストリーミングマルチプロセッサを搭載しているため",
      "単一スレッドのクロック周波数が極めて高いため",
      "分岐予測アルゴリズムがCPUよりも複雑に設計されているため",
      "L1キャッシュの容量がメインメモリより大きいため"
    ],
    correctAnswer: "並列処理に特化した多数のストリーミングマルチプロセッサを搭載しているため"
  },
  {
    question: "Googleが開発した、行列の積和演算（テンソル演算）にハードウェアレベルで特化したAI用アクセラレータの名称は？",
    choices: [
      "TPU",
      "NPU",
      "FPGA",
      "ASIC"
    ],
    correctAnswer: "TPU"
  },
  {
    question: "古いWindows環境などで使われるFAT32ファイルシステムにおいて、仕様上の1ファイルあたりの最大ファイルサイズはどれか？",
    choices: [
      "4GB",
      "2GB",
      "32GB",
      "2TB"
    ],
    correctAnswer: "4GB"
  }
];

type ScreenType = 'title' | 'quiz' | 'result';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('title');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // 選択肢をランダムに並び替える場合はここでシャッフルする処理を入れますが、
  // 今回はそのまま表示します。

  const handleStartQuiz = () => {
    setCurrentQuestionIndex(0);
    setCorrectCount(0);
    setScreen('quiz');
  };

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === quizData[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    if (currentQuestionIndex + 1 < quizData.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setScreen('result');
    }
  };

  const handleRestart = () => {
    setScreen('title');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700 p-8 transition-all duration-300">
        
        {/* タイトル画面 */}
        {screen === 'title' && (
          <div className="text-center animate-fade-in">
            <div className="mb-8">
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium tracking-wider mb-4 border border-blue-500/20">
                QUIZ APP
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                IT / Tech クイズ
              </h1>
              <p className="text-slate-400 text-lg">
                あなたの技術知識をテストしてみましょう。
              </p>
            </div>
            <button
              onClick={handleStartQuiz}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-slate-900 shadow-lg shadow-blue-500/30 overflow-hidden transform hover:scale-[1.02]"
            >
              <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
              <span className="relative">クイズを開始する</span>
            </button>
          </div>
        )}

        {/* 問題画面 */}
        {screen === 'quiz' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-200">
                Question {currentQuestionIndex + 1}
              </h2>
              <div className="text-sm font-medium text-slate-400 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-700">
                {currentQuestionIndex + 1} / {quizData.length}
              </div>
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-slate-700/50 rounded-full h-2 mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentQuestionIndex + 1) / quizData.length) * 100}%` }}
              ></div>
            </div>

            <div className="mb-10">
              <h3 className="text-2xl leading-relaxed font-medium text-slate-100">
                {quizData[currentQuestionIndex].question}
              </h3>
            </div>

            <div className="grid gap-4">
              {quizData[currentQuestionIndex].choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(choice)}
                  className="w-full text-left p-4 rounded-xl border border-slate-600/50 bg-slate-700/30 hover:bg-slate-600/50 hover:border-blue-500/50 transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="flex items-center relative z-10">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/50 text-slate-400 font-bold mr-4 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-slate-200 group-hover:text-white font-medium text-lg">
                      {choice}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/0 to-blue-600/5 group-hover:from-blue-600/10 group-hover:to-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 結果画面 */}
        {screen === 'result' && (
          <div className="text-center animate-fade-in">
            <div className="mb-2">
              <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold tracking-widest mb-4 border border-cyan-500/20">
                RESULT
              </span>
            </div>
            <h2 className="text-4xl font-extrabold mb-8 text-white">
              クイズ完了！
            </h2>
            
            <div className="relative inline-flex items-center justify-center w-48 h-48 mb-8">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-slate-700 stroke-current"
                  strokeWidth="8"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <circle
                  className="text-cyan-400 stroke-current drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeLinecap="round"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  strokeDasharray={`${(correctCount / quizData.length) * 251.2} 251.2`}
                  strokeDashoffset="0"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-blue-500">
                  {Math.round((correctCount / quizData.length) * 100)}%
                </span>
                <span className="text-sm font-medium text-slate-400 mt-1">正答率</span>
              </div>
            </div>

            <p className="text-2xl text-slate-300 mb-10 font-medium">
              {quizData.length} 問中 <span className="text-cyan-400 font-bold text-3xl mx-2">{correctCount}</span> 問正解
            </p>

            <button
              onClick={handleRestart}
              className="inline-flex items-center justify-center px-8 py-3.5 font-bold text-slate-200 transition-all duration-200 bg-slate-700/50 border border-slate-600 rounded-xl hover:bg-slate-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-900 shadow-lg transform hover:scale-[1.02]"
            >
              最初からやり直す
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
