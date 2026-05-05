import type { FrameworkInfo, Difficulty, StepId } from "../types";

export const FRAMEWORKS: FrameworkInfo[] = [
  {
    key: "FAB",
    name: "FAB",
    fullName: "Feature - Advantage - Benefit",
    level: "beginner",
    summary: "広告で語られている「特徴」「優位性」「便益」を分けて捉えるフレーム。",
    points: [
      "Feature: 製品の客観的な特徴（例: 容量1L）",
      "Advantage: 他より優れている点（例: 競合の2倍）",
      "Benefit: ユーザーにとっての嬉しさ（例: 詰め替え頻度が半分）",
    ],
    example: "Featureだけ言って終わる広告は弱い。Benefitまで翻訳できているかを見ると訴求の強さが分かる。",
  },
  {
    key: "AIDA",
    name: "AIDA",
    fullName: "Attention - Interest - Desire - Action",
    level: "intermediate",
    summary: "広告が消費者を行動まで運ぶ4段階。どの段階で止まっているかを判定する。",
    points: [
      "Attention: 目を引いたか（色・サイズ・ビジュアル）",
      "Interest: 興味を持たせたか（コピー・ベネフィット）",
      "Desire: 欲しさを生んだか（権威性・社会的証明）",
      "Action: 行動を促せたか（QR・URL・店頭誘導）",
    ],
    example: "屋外広告は『Action』が弱くなりがち。記憶に残ってもCTAが無いと購買に結びつかない。",
  },
  {
    key: "STP",
    name: "STP",
    fullName: "Segmentation - Targeting - Positioning",
    level: "intermediate",
    summary: "誰に・どの位置取りで届けるかの戦略フレーム。広告のターゲット精度を測る。",
    points: [
      "Segmentation: 市場をどう切ったか",
      "Targeting: そのうちどこを狙ったか",
      "Positioning: 競合に対してどんな立ち位置を取ったか",
    ],
    example: "『万人向け』の広告は大抵Positioningが曖昧。誰の何を奪いに行くのかを問うと弱点が見える。",
  },
  {
    key: "JTBD",
    name: "JTBD",
    fullName: "Jobs To Be Done",
    level: "advanced",
    summary: "ユーザーが製品を『雇う』理由＝片付けたい用事を起点に考える上級フレーム。",
    points: [
      "機能的Job: 何を達成したいか",
      "感情的Job: どう感じたいか（安心・誇り）",
      "社会的Job: 周囲からどう見られたいか",
    ],
    example: "ミルクシェイクは朝の通勤客にとって『退屈な運転を紛らわす相棒』として雇われていた、という有名事例。",
  },
  {
    key: "BE",
    name: "行動経済学",
    fullName: "Behavioral Economics",
    level: "advanced",
    summary: "人間の非合理性を利用する設計。広告に潜む心理トリガーを見抜く。",
    points: [
      "アンカリング: 最初に見た価格に引っ張られる",
      "社会的証明: 多くの人が選んでいると安心する",
      "損失回避: 得より損を2倍重く感じる",
      "デフォルト効果: 初期設定のまま選ぶ",
    ],
    example: "『今だけ』『限定◯個』はFOMO（取り逃し回避）を突く典型。なぜ効くのか言語化できると応用が利く。",
  },
];

export function getFrameworksFor(difficulty: Difficulty): FrameworkInfo[] {
  if (difficulty === "beginner") return FRAMEWORKS.filter(f => f.level === "beginner");
  if (difficulty === "intermediate") return FRAMEWORKS.filter(f => f.level === "beginner" || f.level === "intermediate");
  return FRAMEWORKS;
}

export const STEPS: { id: StepId; title: string; question: string; shortLabel: string }[] = [
  { id: 1, title: "ターゲットの特定", question: "この広告のターゲットユーザーは誰だと思いますか？年齢・性別・状況・抱えている悩みまで具体化してみてください。", shortLabel: "ターゲット" },
  { id: 2, title: "訴求ポイントの把握", question: "一番の訴求ポイントは何ですか？コピー・ビジュアル・配置のどこから読み取れますか？", shortLabel: "訴求" },
  { id: 3, title: "成否の判断", question: "その訴求はターゲットに刺さっていそうですか？根拠とともに評価してください。", shortLabel: "成否" },
  { id: 4, title: "不足要素の抽出", question: "もし成否が微妙なら、何が足りないと感じますか？情報・感情・動線、どこの欠落でしょう？", shortLabel: "不足" },
  { id: 5, title: "代替案の考案", question: "あなたが担当者なら、どう改善しますか？コピー・ビジュアル・媒体のいずれか1つ以上を具体的に提案してください。", shortLabel: "代替案" },
];

export function hintsForStep(stepId: StepId, difficulty: Difficulty): { framework: string; tips: string[] } {
  const frameworks = getFrameworksFor(difficulty);
  const map: Record<StepId, { primary: string; tips: Record<Difficulty, string[]> }> = {
    1: {
      primary: "STP",
      tips: {
        beginner: [
          "まず性別・年代・職業で絞ってみよう",
          "広告が掲示されている場所も大きなヒント",
          "コピーの一人称・語尾で対象が見える",
        ],
        intermediate: [
          "STPのT（Targeting）として、競合とどう切り分けているか考える",
          "ペルソナを1人作るつもりで状況・タイミングまで描写",
        ],
        advanced: [
          "JTBDの観点で『この人はどんな用事を片付けたくてこの瞬間に広告を見るのか』を想像",
          "属性ではなく『状況』でセグメントすると本質が見える",
        ],
      },
    },
    2: {
      primary: "FAB",
      tips: {
        beginner: [
          "コピーで一番大きい文字＝主張の核",
          "ビジュアルで一番面積が大きい要素を観察",
        ],
        intermediate: [
          "FABのどれを語っているか分解（Feature/Advantage/Benefit）",
          "言語要素と非言語要素のどちらが主役か判別",
        ],
        advanced: [
          "ベネフィットが『機能的・感情的・社会的』のどれを刺すかまで言語化",
          "暗黙の前提（誰にとって嬉しいか）を疑う",
        ],
      },
    },
    3: {
      primary: "AIDA",
      tips: {
        beginner: [
          "目を引いたか／興味が湧いたかを段階で見る",
          "自分が一瞬でも『気になった』ならAttentionは成功",
        ],
        intermediate: [
          "AIDAのどこで止まっているか特定する",
          "媒体特性（屋外・電車内・SNS）と訴求が噛み合っているか",
        ],
        advanced: [
          "ターゲット視点でA→I→D→Aの遷移確率を見積もる",
          "行動経済学的に『摩擦』はどこに残っているか",
        ],
      },
    },
    4: {
      primary: "AIDA / 行動経済学",
      tips: {
        beginner: [
          "情報が足りない？ 感情が足りない？ 動線が足りない？",
          "『見たあとに何をすればいいか』が分かるかチェック",
        ],
        intermediate: [
          "AIDAの欠落段階を埋めるなら何を足すか",
          "CTAの具体性・到達手段（QR・URL・店舗）の有無",
        ],
        advanced: [
          "認知バイアス（社会的証明・損失回避）で補強できる箇所を探す",
          "ターゲットの『反対理由』を先回りで潰せているか",
        ],
      },
    },
    5: {
      primary: "全フレーム統合",
      tips: {
        beginner: [
          "コピーを1行書き換えるだけでもOK",
          "媒体を変えるだけで効果が変わることもある",
        ],
        intermediate: [
          "STPで再ターゲット → FABで便益を翻訳 → AIDAで動線設計",
          "改善の優先順位（コスト×インパクト）を意識",
        ],
        advanced: [
          "JTBDでJobを再定義 → 行動経済学のトリガーを1つ仕込む",
          "代替案を2つ作り、どちらをABテストすべきか論じると深い",
        ],
      },
    },
  };

  const entry = map[stepId];
  return {
    framework: `${entry.primary}（${frameworks.map(f => f.name).join(" / ")}）`,
    tips: entry.tips[difficulty],
  };
}
