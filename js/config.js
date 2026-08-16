/**
 * 燕郊非遗田野档案 - 全局配置（正式交付 v2.0 · 游客互动增强）
 * 团队改数字、链接、文案时，优先只改这个文件
 */
window.PROJECT_CONFIG = {
  version: "2.2.49",
  deliveryStatus: "正式交付 · 工序视频恢复音轨",

  meta: {
    title: "燕郊非遗田野档案",
    subtitle: "景泰蓝田野档案",
    tagline: "从工序到传承，看见非遗如何被理解与参与",
    year: "2026",
    season: "暑期社会实践",
    teamName: "「畿辅文薪·匠心永续」数字化调研实践团",
    advisor: "赵鹏凯",
    surveyTime: "2026年7月16日至19日",
    surveyPlace: "河北省廊坊市三河市"
  },

  cases: {
    cloisonne: {
      subtitle: "工序见匠心，一器载山河"
    }
  },

  stats: {
    observeCount: 2,
    interviewCount: 9,
    routeCount: 1,
    reportWords: 4300,
    documentaryDuration: "1 分 20 秒"
  },

  reportAbstract: {
    title: "报告摘要",
    text: "本文以三河市珑珐琅景泰蓝非遗传承基地、景泰蓝博物馆、天下第一城体验馆为调研对象，综合运用文献研究、实地观察、归纳总结、匠人访谈等方法，开展景泰蓝非遗田野调查。三河紧邻北京，拥有悠久的景泰蓝传承脉络，本地珑珐琅完整保留 108 道传统手工工序，创新平面景泰蓝工艺，多件作品作为外交国礼，是京津冀代表性非遗工坊。调研发现行业现存六大核心问题：匠人老龄化、人才传承断层；原料与制作成本高，中小工坊盈利困难；机器仿品扰乱市场，产品同质化严重；传统技艺依靠口传心授，技艺留存存在流失风险；大众文化普及不足；产业配套不完善、政策扶持不均衡。同时实地体验发现手工研学体验门槛高、流程简化、重实操轻文化，非遗传播浮于表面。针对以上现状，本文从技艺数字化保护、校企双轨人才培育、分层文创产品创新、深挖国礼 IP 打造区域品牌、线上线下融合科普、文旅产学研协同发展六个维度提出优化路径，通过数字化存艺、年轻化培育、市场化创新、品牌化传播推动景泰蓝活态传承。调研表明，三河景泰蓝文化底蕴深厚，但传承发展阻力突出，唯有多措并举完善保护与产业体系，才能让本土非遗持续焕发活力。"
  },

  links: {
    siteUrl: "https://rightc.github.io/yanjiao-ich-archive/",
    documentaryUrl: "documentary.html",
    reportAbstractPage: "abstract.html",
    feedbackForm: ""
  },

  media: {
    cloisonnePoster: "images/cloisonne-poster.jpg",
    cloisonneVideo: "videos/cloisonne-process.mp4",
    documentaryVideo: "videos/documentary.mp4",
    documentaryPoster: "images/documentary-poster.jpg",
    shareCover: "images/share-cover.jpg",
    bgm: "audio/bgm.mp3",
    bgmVolume: 1,
    videoVolume: 1,
    videoGain: 2.4
  },

  places: [
    {
      id: "experience",
      name: "天下第一城景泰蓝非遗体验馆",
      tip: "可动手体验掐丝、点蓝",
      desc: "面向公众的非遗体验空间，适合亲子与研学。短时体验能感受工序之美，但完整工艺仍需更长周期。",
      mapUrl: "https://uri.amap.com/search?keyword=%E5%A4%A9%E4%B8%8B%E7%AC%AC%E4%B8%80%E5%9F%8E%E6%99%AF%E6%B3%B0%E8%93%9D",
      lat: 39.7488,
      lng: 117.0156,
      shortName: "天下第一城体验馆"
    },
    {
      id: "museum",
      name: "三河珑珐琅景泰蓝博物馆",
      tip: "看国礼与工序陈列",
      desc: "系统展示景泰蓝器物与工艺脉络，是理解「国礼身份」与手工价值的重要窗口。",
      mapUrl: "https://uri.amap.com/search?keyword=%E4%B8%89%E6%B2%B3%E7%8F%91%E7%91%99%E7%90%90%E6%99%AF%E6%B3%B0%E8%93%9D%E5%8D%9A%E7%89%A9%E9%A6%86",
      lat: 39.9825,
      lng: 117.0788,
      shortName: "景泰蓝博物馆"
    }
  ],

  // ===== 互动增强内容 =====
  engage: {
    artisanQuotes: [
      { role: "掐丝匠人", text: "最难的不是弯，是弯得刚好贴住胎型。" },
      { role: "点蓝师傅", text: "釉料看着简单，干湿分层差一分就串色。" },
      { role: "青年参观者", text: "以前只知道很贵，今天才知这么复杂。" }
    ],
    nationalGifts: [
      {
        name: "和平尊",
        image: "images/heping-zun.png",
        visible: "对称纹样、朱红釉色、镀金轮廓",
        hidden: "需多轮点蓝烧蓝，火候与配比全凭经验",
        layers: [
          { id: "shell", name: "外观", text: "对称纹样 · 朱红釉面 · 镀金轮廓" },
          { id: "body", name: "胎体", text: "紫铜板锻造器型，弧度全靠捶打修正" },
          { id: "wire", name: "铜丝", text: "扁铜丝掐焊成格，线条即纹样骨架" },
          { id: "glaze", name: "釉层", text: "矿物釉分遍填入，烧蓝后与丝面齐平" }
        ]
      },
      {
        name: "喜凤瓶",
        image: "images/xifeng-ping.png",
        visible: "凤纹线条流畅、色彩层次分明",
        hidden: "掐丝密度高，细部最易脱丝，合格率更考验手艺",
        layers: [
          { id: "shell", name: "外观", text: "凤纹流畅 · 色层分明 · 华贵收光" },
          { id: "body", name: "胎体", text: "瓶身弧线细长，制胎最忌变形" },
          { id: "wire", name: "铜丝", text: "凤羽密度高，细部最易脱丝" },
          { id: "glaze", name: "釉层", text: "干湿分层填色，过火易裂、欠火发乌" }
        ]
      }
    ],
    fireGame: {
      tempMin: 550,
      tempMax: 1000,
      defaultTemp: 800,
      underMax: 680,
      slightLowMin: 700,
      slightLowMax: 750,
      idealMin: 750,
      idealMax: 850,
      slightHighMin: 850,
      slightHighMax: 920,
      underTip: "欠火（＜680℃）：釉色发乌、未熔固——再抬一点火候。",
      slightTip: "轻微瑕疵：火候擦边（700～750℃ 或 850～920℃），釉色略欠完美。",
      overTip: "过火（＞920℃）：釉面裂釉、色料塌陷——快收回来。",
      okTip: "正烧（750～850℃）：釉料熔固，丝面齐平。"
    },
    puzzleHints: {
      wrong: "田野提示：完整器物要先立胎，再勾丝填色，后入窑磨光镀金。"
    },
    quiz: [
      {
        q: "面对同款纹样：低价机器仿品 vs 高价纯手工，你会怎么选？",
        options: [
          { t: "先买仿品尝尝鲜", tip: "田野发现：仿品拉低认知，但也能成为入门话题——关键是讲清差异。" },
          { t: "愿为手工多付一点", tip: "田野发现：愿意付费的人在增加，但仍需更多「看见工序」的机会。" }
        ]
      },
      {
        q: "如果只有半天，你更想？",
        options: [
          { t: "短时体验动手玩", tip: "田野发现：短体验易「略懂」，却难体会全流程复杂度。" },
          { t: "跟完整工序讲解", tip: "田野发现：重文化讲解能补上「只动手不理解」的缺口。" }
        ]
      },
      {
        q: "你觉得青年参与非遗，最先该解决？",
        options: [
          { t: "降低入门门槛", tip: "建议对应：模块化教学、研学课程、可完成的小作品。" },
          { t: "提高从业待遇与认同", tip: "建议对应：学徒津贴、作品展销、品牌与国礼 IP 传播。" }
        ]
      }
    ],
    featuredWall: [
      "工序可以看见，深度参与仍然不易。",
      "国礼很亮，铜丝更亮。",
      "愿为手工多付一点敬意。",
      "从旁观到动手，才算真正遇见非遗。"
    ],
    stamps: [
      { id: "intro", label: "缘起", section: "intro" },
      { id: "map", label: "点位", section: "map" },
      { id: "process", label: "工序", section: "cloisonne" },
      { id: "filigree", label: "掐丝", section: "play" },
      { id: "enamel", label: "点蓝", section: "play" },
      { id: "fire", label: "烧蓝", section: "play" },
      { id: "puzzle", label: "拼图", section: "play" },
      { id: "quiz", label: "思辨", section: "engage" },
      { id: "gift", label: "国礼", section: "engage" },
      { id: "visit", label: "打卡", section: "visit" }
    ]
  },

  // 工序按段拆成短文件（弱网友好）。全片仍用 media.cloisonneVideo
  processSteps: [
    { id: "full", title: "全片", tip: "从片头连续播放", videoSrc: "videos/cloisonne-process.mp4", ariaLabel: "从片头播放完整工序片" },
    { id: "intro", title: "介绍", tip: "了解景泰蓝由来与概况", videoSrc: "videos/process/intro.mp4" },
    { id: "tai", title: "制胎", tip: "紫铜板锻造器型", videoSrc: "videos/process/tai.mp4" },
    { id: "qiasi", title: "掐丝", tip: "黄铜丝勾勒纹样", videoSrc: "videos/process/qiasi.mp4" },
    { id: "zhansi", title: "粘丝", tip: "白芨胶固丝贴胎", videoSrc: "videos/process/zhansi.mp4" },
    { id: "dianlan", title: "点蓝", tip: "矿物釉填入纹格", videoSrc: "videos/process/dianlan.mp4" },
    { id: "shaolan", title: "烧蓝", tip: "高温熔固循环多遍", videoSrc: "videos/process/shaolan.mp4" },
    { id: "mouguang", title: "磨光", tip: "砂石木炭抛出光泽", videoSrc: "videos/process/mouguang.mp4" },
    { id: "dujin", title: "镀金", tip: "铜丝镀金收尾", videoSrc: "videos/process/dujin.mp4" }
  ],

  gallery: [
    { title: "工坊现场", subtitle: "炉火与铜胎", tone: "warm", image: "images/gallery-workshop.jpg" },
    { title: "掐丝细节", subtitle: "线条即纹样", tone: "gold", image: "images/gallery-filigree.jpg" },
    { title: "点蓝填色", subtitle: "矿物釉的层次", tone: "blue", image: "images/gallery-enamel.jpg" },
    { title: "国礼器物", subtitle: "外交礼仪的光泽", tone: "royal", image: "images/gallery-national-gift.jpg" },
    { title: "公众体验", subtitle: "从旁观到动手", tone: "mint", image: "images/gallery-experience.jpg" }
  ],

  findings: {
    f1: {
      label: "发现 01",
      title: "工艺传承现状",
      text: "景泰蓝为国家级非遗，完整留存 108 道纯手工古法工序，制胎、掐丝、点蓝、烧蓝、镀金等核心环节高度依赖匠人经验，机械化无法完全替代。三河毗邻北京，清末便有大量本地工匠赴京学艺，技艺传承根基深厚。当下珑珐琅作为廊坊市级非遗传承单位，严守燕京八绝正统工艺，对标外交国礼制作标准，技艺传承体系完整规范。"
    },
    f2: {
      label: "发现 02",
      title: "手工体验存在短板",
      text: "亲身参与掐丝、点蓝实操后发现大众体验存在三大问题：一是工艺门槛高，新手极易出现铜丝变形、脱丝、釉料串色等失误，成品合格率低；二是完整工序耗时极长，短时体验只能完成局部步骤，无法体会全套工艺复杂度；三是体验偏重动手操作，缺少景泰蓝历史、国礼文化、本土渊源的配套讲解，普遍存在重实操、轻文化的问题。"
    },
    f3: {
      label: "发现 03",
      title: "非遗传承现实困境",
      text: "一是学艺周期长、劳作枯燥辛苦，年轻人入行意愿低，匠人老龄化、人才断层风险突出；二是古法手工制作成本高昂，市面低价机器仿品泛滥，严重冲击正统非遗产品，大众对其工艺价值认知不足；三是技艺传播面较窄，多数人仅知晓景泰蓝名称，对繁复工序与文化内涵了解甚少。"
    },
    f4: {
      label: "发现 04",
      title: "调研总结感悟",
      text: "景泰蓝既是传统手工技艺，也是承载中式美学与大国外交礼仪的文化瑰宝。三河珑珐琅在坚守古法的基础上开展工艺创新、承接国礼创作，实现了非遗活态传承。但传统手工艺传承阻力依旧较大，后续需通过规范研学课程、加大文化普及、推进年轻化创新等方式，让景泰蓝非遗技艺长久焕发生命力。"
    }
  },

  suggestions: {
    s1: {
      num: "01",
      title: "数字化建档，完善技艺保护机制",
      text: "针对技艺口传心授、经验易失传问题，拍摄掐丝、烧蓝、镀金等全流程影像，整理釉料、烧制标准形成标准化档案。明确手工景泰蓝与机器仿品区分标准，规范市场；开放工坊工艺观摩，可视化展示古法价值。"
    },
    s2: {
      num: "02",
      title: "校企双轨育人，化解人才断层难题",
      text: "采用「师徒传承 + 院校合作」模式，进校园开设非遗课程、组织工坊研学。推行阶梯式模块化教学，降低学艺入门难度；设立学徒津贴、作品展销渠道，改善从业待遇，留住青年从业者，搭建稳定传承队伍。"
    },
    s3: {
      num: "03",
      title: "分层创新产品，拓展多元消费市场",
      text: "坚守核心手工工艺，划分三级产品线：高端国礼收藏重器、中端日用茶器首饰、入门平面景泰蓝文创。依托本地平面珐琅专利，联动文旅、国潮品牌跨界开发，打破景泰蓝只有大型摆件的固有认知。"
    },
    s4: {
      num: "04",
      title: "挖掘国礼 IP，打造特色非遗品牌",
      text: "围绕《和平尊》《喜凤瓶》等经典国礼举办专题展览，讲好景泰蓝外交文化故事。联动影视、游戏、新媒体跨界宣传，用年轻化形式吸引青年，提升本土品牌格调，摆脱低端纪念品标签。"
    },
    s5: {
      num: "05",
      title: "线上线下联动，普及非遗认知",
      text: "线上用短视频、直播科普工序与真假工艺区别；线下开展研学、亲子体验、校园巡展，变单向参观为沉浸式学习。普及手工景泰蓝价值，改善低价仿品冲击行业的现状。"
    },
    s6: {
      num: "06",
      title: "文旅产业融合，保障长期传承",
      text: "打造「生产 + 展览 + 研学 + 文创」一体化文旅路线，联动周边文旅资源开发研学打卡点。推进产学研合作，完善原创纹样、器型知识产权保护；争取政策扶持，投入人才培育、数字化存档、设备升级，为非遗长效发展提供支撑。"
    }
  },

  interaction: {
    prompt: "你对燕郊非遗最深的印象是什么？",
    nicknamePlaceholder: "昵称（可选，如：田野观察组 · 小王）",
    messagePlaceholder: "写下你的看法、建议或发现……",
    maxMessages: 50,
    storageKey: "yanjiao-ich-messages-v1",
    reactionKey: "yanjiao-ich-reaction-v1",
    bgmKey: "yanjiao-ich-bgm-muted-v2",
    reactions: [
      { id: "craft", label: "工序打动我" },
      { id: "exhibit", label: "展陈打动我" },
      { id: "youth", label: "青年参与难" },
      { id: "archive", label: "数字档案有用" }
    ],
    seedMessages: [
      {
        name: "田野观察组",
        text: "景泰蓝体验让人“略懂”，但愿意长期从艺的人很少。",
        time: "示例留言"
      },
      {
        name: "访谈记录组",
        text: "参观者多记得“国礼”身份，对工序细节仍感陌生。",
        time: "示例留言"
      }
    ]
  },

  qrcodePage: {
    printTitle: "扫码进入田野档案",
    printHint: "建议使用微信扫一扫 / 浏览器扫码",
    tipLines: [
      "建议横向打印为 A4",
      "答辩现场可放在桌面或海报旁",
      "请确认链接已部署并可访问"
    ]
  }
};
