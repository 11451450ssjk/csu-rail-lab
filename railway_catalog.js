"use strict";

(function () {
  const SOURCE_URL = "https://civil.csu.edu.cn/bksjy/pyfa.htm";
  const SIM_DEFS = {
    survey: {
      primaryLabel: "测站数", primaryUnit: "站", primaryMin: 1, primaryMax: 20, primaryValue: 6, primaryStep: 1,
      secondaryLabel: "视线长度", secondaryUnit: "m", secondaryMin: 10, secondaryMax: 150, secondaryValue: 60, secondaryStep: 1,
      simInfo: {
        domain: "铁路工程测量", xLabel: "测段序号", yLabel: "测量偏差 / mm",
        principle: "测量结果由仪器精度、观测方法、控制网闭合条件和数据处理共同决定。",
        errors: "仪器未校准、照准误差、大气折光、尺垫下沉和记录错误会造成系统或偶然偏差。",
        improvements: "测量前检校仪器，采用闭合或附合路线检核，增加测回数并记录环境条件。"
      },
      sceneGuide: { action: "全站仪或水准仪对准测点，测量高差、角度或坐标", attention: "观察闭合差、残差分布和异常测站", effect: "测站与视线长度影响误差传播和作业效率" },
      sample: { x: "测段序号", y: "高差偏差(mm)", model: "survey" }
    },
    material: {
      primaryLabel: "加载等级", primaryUnit: "kN", primaryMin: 0, primaryMax: 300, primaryValue: 80, primaryStep: 1,
      secondaryLabel: "试样龄期", secondaryUnit: "d", secondaryMin: 1, secondaryMax: 56, secondaryValue: 28, secondaryStep: 1,
      simInfo: {
        domain: "土木工程材料", xLabel: "龄期 / d", yLabel: "强度 / MPa",
        principle: "材料宏观性能由组成比例、水化或胶结过程、孔隙结构和养护条件共同决定。",
        errors: "称量偏差、拌和均匀性、温湿度、加载速度和试样尺寸会造成离散。",
        improvements: "严格按照配合比和标准养护制样，校准试验机并保证加载速率一致。"
      },
      sceneGuide: { action: "试验机对材料试样施加荷载，传感器记录变形和峰值", attention: "观察弹性段、峰值、破坏形态和离散性", effect: "龄期、含水率和加载速率会改变强度结果" },
      sample: { x: "龄期(d)", y: "强度(MPa)", model: "material" }
    },
    mechanics: {
      primaryLabel: "施加载荷", primaryUnit: "kN", primaryMin: 0, primaryMax: 200, primaryValue: 50, primaryStep: 1,
      secondaryLabel: "标距长度", secondaryUnit: "mm", secondaryMin: 20, secondaryMax: 200, secondaryValue: 100, secondaryStep: 1,
      simInfo: {
        domain: "基础力学实验", xLabel: "应变 / με", yLabel: "应力 / MPa",
        principle: "材料与构件在弹性范围内满足应力应变关系，超过屈服后表现塑性。",
        errors: "试件偏心、夹持滑移、应变片粘贴质量和试验机刚度会造成误差。",
        improvements: "对中夹持试件，进行预载，校准力传感器并取多个测点平均。"
      },
      sceneGuide: { action: "试验机或加载架向试件施加可控荷载", attention: "观察力—变形曲线、屈服点、极限强度和破坏形态", effect: "载荷与截面尺寸共同决定应力和变形" },
      sample: { x: "应变(με)", y: "应力(MPa)", model: "mechanics" }
    },
    soil: {
      primaryLabel: "含水率", primaryUnit: "%", primaryMin: 4, primaryMax: 30, primaryValue: 13, primaryStep: 0.5,
      secondaryLabel: "干密度", secondaryUnit: "g/cm³", secondaryMin: 1.4, secondaryMax: 2.3, secondaryValue: 1.9, secondaryStep: 0.01,
      simInfo: {
        domain: "土工与岩土", xLabel: "含水率 / %", yLabel: "干密度 / g/cm³",
        principle: "土体性能取决于颗粒组成、含水率、密实度和有效应力。",
        errors: "取样扰动、含水率烘干温度、击实功和仪器标定会造成偏差。",
        improvements: "采用原状取样并平行试验，控制烘干与击实标准，记录土类。"
      },
      sceneGuide: { action: "土样在击实、剪切或固结装置中承受水力和力学作用", attention: "观察密度峰值、沉降、剪应力与破坏面", effect: "含水率和密实度会显著改变土的强度与变形" },
      sample: { x: "含水率(%)", y: "干密度(g/cm³)", model: "soil" }
    },
    structural: {
      primaryLabel: "试验荷载", primaryUnit: "kN", primaryMin: 0, primaryMax: 300, primaryValue: 80, primaryStep: 1,
      secondaryLabel: "构件跨度", secondaryUnit: "m", secondaryMin: 1, secondaryMax: 12, secondaryValue: 4, secondaryStep: 0.1,
      simInfo: {
        domain: "结构试验", xLabel: "荷载 / kN", yLabel: "挠度 / mm",
        principle: "结构内力和变形可由平衡、几何协调和材料本构关系计算并通过试验验证。",
        errors: "支座摩擦、加载偏心、应变片温漂和边界条件偏差会造成误差。",
        improvements: "设置对称测点，进行温度补偿，分级加载并记录残余变形。"
      },
      sceneGuide: { action: "液压加载系统对梁、桁架或支座施加分级荷载", attention: "观察挠度、应变、裂缝、支座反力和动力响应", effect: "荷载位置与构件刚度决定内力和变形分布" },
      sample: { x: "荷载(kN)", y: "挠度(mm)", model: "structural" }
    },
    alignment: {
      primaryLabel: "曲线半径", primaryUnit: "m", primaryMin: 300, primaryMax: 4000, primaryValue: 1200, primaryStep: 50,
      secondaryLabel: "设计速度", secondaryUnit: "km/h", secondaryMin: 80, secondaryMax: 350, secondaryValue: 200, secondaryStep: 5,
      simInfo: {
        domain: "铁路选线", xLabel: "里程 / m", yLabel: "横向偏移 / m",
        principle: "铁路平面线形由直线、圆曲线和缓和曲线组合，超高和曲率需满足速度与舒适度要求。",
        errors: "控制点误差、里程断链、曲线参数未闭合和地形数据精度会影响设计。",
        improvements: "统一坐标和里程系统，检查曲线要素闭合，与地形和构筑物限界共同校核。"
      },
      sceneGuide: { action: "铁路中心线在平面和纵断面上连续过渡，曲线段设置超高", attention: "观察曲率、超高、线路走向与地形约束", effect: "半径减小或速度提高时需增加超高并调整缓和曲线" },
      sample: { x: "里程(m)", y: "中心线偏移(m)", model: "alignment" }
    },
    track: {
      primaryLabel: "列车速度", primaryUnit: "km/h", primaryMin: 40, primaryMax: 350, primaryValue: 160, primaryStep: 5,
      secondaryLabel: "轴重", secondaryUnit: "t", secondaryMin: 10, secondaryMax: 35, secondaryValue: 23, secondaryStep: 0.5,
      simInfo: {
        domain: "轨道工程", xLabel: "轨道位置 / m", yLabel: "轨道响应指标",
        principle: "轨道结构把列车荷载通过钢轨、扣件、轨枕或轨道板、道床传递到路基。",
        errors: "轨道几何不平顺、扣件松动、支承不均匀和量测基准偏差会影响结果。",
        improvements: "固定测点、重复测量轨道几何，记录扣件和支承状态并保持相同加载条件。"
      },
      sceneGuide: { action: "列车轮载作用于钢轨和下部基础，轨道结构共同承载", attention: "观察轮轨接触、几何偏差、扣件和道床响应", effect: "速度与轴重提高会增强动态荷载和振动响应" },
      sample: { x: "轨道位置(m)", y: "轨道不平顺(mm)", model: "track" }
    },
    subgrade: {
      primaryLabel: "填方高度", primaryUnit: "m", primaryMin: 1, primaryMax: 20, primaryValue: 6, primaryStep: 0.5,
      secondaryLabel: "压实度", secondaryUnit: "%", secondaryMin: 80, secondaryMax: 100, secondaryValue: 94, secondaryStep: 1,
      simInfo: {
        domain: "铁路路基", xLabel: "深度 / m", yLabel: "沉降 / mm",
        principle: "路基需要具备足够强度、刚度、稳定性和排水能力，控制工后沉降。",
        errors: "填料含水率、压实不均、取样扰动和加载时间会影响试验结果。",
        improvements: "分层填筑分量测压实度，控制含水率并进行沉降长期观测。"
      },
      sceneGuide: { action: "列车和上部结构荷载通过路基向下扩散，土层发生压缩", attention: "观察分层沉降、边坡稳定、压实度和排水状态", effect: "填方高度与压实度共同影响沉降和稳定性" },
      sample: { x: "深度(m)", y: "沉降(mm)", model: "subgrade" }
    },
    bridge: {
      primaryLabel: "试验荷载", primaryUnit: "kN", primaryMin: 0, primaryMax: 1200, primaryValue: 400, primaryStep: 10,
      secondaryLabel: "桥梁跨度", secondaryUnit: "m", secondaryMin: 8, secondaryMax: 80, secondaryValue: 32, secondaryStep: 1,
      simInfo: {
        domain: "铁路桥梁", xLabel: "荷载 / kN", yLabel: "挠度 / mm",
        principle: "桥梁通过梁、拱、索或组合结构把列车荷载传向支座和墩台。",
        errors: "支座边界、温度、加载偏心和传感器位置会造成测试偏差。",
        improvements: "在跨中和关键截面布置测点，进行温度补偿并分级卸载。"
      },
      sceneGuide: { action: "移动或静力荷载作用于桥面并传至主梁、索和支座", attention: "观察主梁挠度、应变、支座转角和墩台响应", effect: "荷载与跨度增大时内力和变形通常增加" },
      sample: { x: "荷载(kN)", y: "跨中挠度(mm)", model: "bridge" }
    },
    tunnel: {
      primaryLabel: "埋深", primaryUnit: "m", primaryMin: 5, primaryMax: 300, primaryValue: 60, primaryStep: 5,
      secondaryLabel: "围岩级别", secondaryUnit: "级", secondaryMin: 1, secondaryMax: 6, secondaryValue: 4, secondaryStep: 1,
      simInfo: {
        domain: "铁路隧道", xLabel: "施工阶段", yLabel: "收敛 / mm",
        principle: "隧道开挖改变围岩应力状态，支护结构限制变形并形成新的平衡。",
        errors: "爆破扰动、量测断面不及时和围岩非均质性会造成偏差。",
        improvements: "及时埋设收敛点，固定量测时间和断面，记录施工工序与地层。"
      },
      sceneGuide: { action: "隧道开挖后围岩向洞内变形，衬砌和锚杆逐渐承担荷载", attention: "观察拱顶下沉、周边收敛、衬砌裂缝和渗漏", effect: "埋深与围岩质量决定变形速度和支护需求" },
      sample: { x: "施工阶段", y: "周边收敛(mm)", model: "tunnel" }
    },
    vibration: {
      primaryLabel: "列车速度", primaryUnit: "km/h", primaryMin: 40, primaryMax: 350, primaryValue: 160, primaryStep: 5,
      secondaryLabel: "轨道刚度", secondaryUnit: "MN/m", secondaryMin: 10, secondaryMax: 100, secondaryValue: 45, secondaryStep: 1,
      simInfo: {
        domain: "铁路动力学", xLabel: "频率 / Hz", yLabel: "加速度幅值",
        principle: "轮轨相互作用产生振动，通过轨道、桥梁、隧道或路基传播到环境和结构。",
        errors: "传感器耦合、背景振动、采样率和列车状态会影响频谱结果。",
        improvements: "使用刚性安装和参考传感器，记录列车速度并采用多次通过平均。"
      },
      sceneGuide: { action: "列车通过时轮轨动荷载激发轨道和结构振动", attention: "观察时域峰值、频谱峰和环境衰减", effect: "速度和轨道刚度改变振动主频与幅值" },
      sample: { x: "频率(Hz)", y: "加速度(m/s²)", model: "vibration" }
    },
    inspection: {
      primaryLabel: "检测间距", primaryUnit: "m", primaryMin: 0.2, primaryMax: 10, primaryValue: 1, primaryStep: 0.1,
      secondaryLabel: "报警阈值", secondaryUnit: "mm", secondaryMin: 0.2, secondaryMax: 10, secondaryValue: 2, secondaryStep: 0.1,
      simInfo: {
        domain: "铁路工程检测", xLabel: "里程 / m", yLabel: "检测指标",
        principle: "铁路检测通过几何测量、无损探伤、传感和图像识别识别病害与偏差。",
        errors: "检测基准、车辆姿态、传感器噪声和阈值选择会影响识别结果。",
        improvements: "定期标定检测系统，保持固定采样间距，并用人工复核异常区段。"
      },
      sceneGuide: { action: "检测设备沿线路采集轨道几何、结构响应或图像数据", attention: "观察超限点、病害位置和连续区段", effect: "采样间距和阈值会影响检出率与误报率" },
      sample: { x: "里程(m)", y: "检测指标(mm)", model: "inspection" }
    },
    digital: {
      primaryLabel: "采样频率", primaryUnit: "Hz", primaryMin: 1, primaryMax: 200, primaryValue: 50, primaryStep: 1,
      secondaryLabel: "阈值", secondaryUnit: "%", secondaryMin: 10, secondaryMax: 95, secondaryValue: 65, secondaryStep: 1,
      simInfo: {
        domain: "数字铁路", xLabel: "时间 / s", yLabel: "指标或置信度",
        principle: "数字铁路通过传感、GIS、BIM、图像和算法形成可计算的基础设施状态。",
        errors: "时空配准、通信延迟、模型误差和阈值设置会影响数字决策。",
        improvements: "统一时间基准与坐标系统，分模块校准并保留可追溯版本。"
      },
      sceneGuide: { action: "多源感知数据进入数字模型并触发状态分析与预警", attention: "观察数据同步、模型更新、识别置信度和报警结果", effect: "采样率与阈值决定响应灵敏度和误报率" },
      sample: { x: "时间(s)", y: "检测置信度", model: "digital" }
    },
    design: {
      primaryLabel: "设计速度", primaryUnit: "km/h", primaryMin: 80, primaryMax: 350, primaryValue: 200, primaryStep: 5,
      secondaryLabel: "方案指标", secondaryUnit: "%", secondaryMin: 10, secondaryMax: 100, secondaryValue: 60, secondaryStep: 1,
      simInfo: {
        domain: "铁路综合设计", xLabel: "方案比选指标", yLabel: "综合性能",
        principle: "铁路工程设计需要综合线路、轨道、路基、桥隧、施工、环境和经济约束。",
        errors: "方案边界、参数取值、费用估算和不确定性处理会影响设计优劣。",
        improvements: "建立明确指标权重，进行敏感性分析，并用现场数据校核关键参数。"
      },
      sceneGuide: { action: "设计参数在多目标约束下共同影响线路方案和工程性能", attention: "观察安全、造价、工期、环境与运营指标权衡", effect: "速度或性能目标提高通常会带来更大工程投入" },
      sample: { x: "方案指标", y: "综合性能", model: "design" }
    }
  };

  const e = (id, name, sim, formula, description, theory) => ({
    id: `rail-${id}`,
    name,
    sim,
    formula,
    description,
    theory
  });

  const course = (id, year, term, title, focus, experiments) => ({
    id: `rail-course-${id}`,
    year,
    term,
    title,
    focus,
    scope: "rail",
    officialCode: `CSU-R${year}-${String(term).padStart(2, "0")}`,
    officialCredits: "",
    officialHours: "",
    sourceUrl: SOURCE_URL,
    experiments
  });

  const CATALOG = [
    course("survey-basics", 1, 1, "工程测量与制图实验", "水准、角度、坐标、GNSS、地形图和线路制图", [
      e("leveling", "水准仪认识与高程测量", "survey", "h = a - b", "练习水准仪安置、整平、照准和红黑面读数。", "水准测量通过水平视线比较前后视尺读数，视线高差等于后视减前视。"),
      e("leveling-loop", "四等水准闭合路线测量", "survey", "fh = Σh", "完成闭合水准路线观测并计算闭合差。", "闭合路线各测段高差代数和应接近零，闭合差反映观测误差。"),
      e("angle", "经纬仪水平角与竖直角观测", "survey", "β = b - a", "使用测回法测量水平角和竖直角。", "水平角是两目标方向在水平面的夹角，盘左盘右观测可消除视准轴误差。"),
      e("total-station", "全站仪坐标测量与放样", "survey", "ΔX = S sinα", "设置测站和后视，测量目标坐标并完成点位放样。", "全站仪由距离和方向计算坐标，放样是测量过程的逆运算。"),
      e("traverse", "闭合导线测量与平差", "survey", "Σβ = (n-2)180°", "完成闭合导线角度、边长和坐标计算。", "闭合导线通过角度闭合差和坐标闭合差检验并分配测量误差。"),
      e("gnss", "GNSS静态与RTK定位实验", "survey", "P = f(PRN, t)", "比较静态与RTK定位精度和初始化时间。", "GNSS通过卫星测距交会定位，RTK利用实时载波相位差分提高精度。"),
      e("topography", "地形图测绘与等高线", "survey", "H = H0 + hi", "测量地形点高程并绘制等高线。", "地形图把地面三维形态投影到平面，等高线连接相同高程点。"),
      e("railway-cad", "铁路线路平面图绘制", "alignment", "线形 = 直线 + 缓和曲线 + 圆曲线", "根据控制点绘制铁路线路平面图和曲线要素表。", "铁路线形需连续、平顺地连接直线和圆曲线，缓和曲线用于曲率和超高过渡。")
    ]),
    course("materials", 1, 1, "土木工程材料实验", "水泥、骨料、混凝土、钢筋和沥青性能", [
      e("cement-fineness", "水泥细度与标准稠度", "material", "W/C = mwater/mcement", "测定水泥筛余、标准稠度和凝结时间。", "水泥细度影响水化速度、需水量和早期强度，标准稠度用于统一试验条件。"),
      e("mortar-strength", "水泥胶砂强度试验", "material", "f = F/A", "制作胶砂试件并测量抗折和抗压强度。", "水化产物形成胶结结构，强度随龄期增长并受水灰比和养护控制。"),
      e("aggregate-sieve", "骨料筛分与级配分析", "material", "Cu = D60/D10", "测量粗骨料和细骨料级配、细度模数和空隙率。", "骨料级配影响混凝土和易性、密实度和强度。"),
      e("concrete-workability", "混凝土拌和物和易性", "material", "Slump = h0 - h1", "测量坍落度、扩展度和黏聚性。", "新拌混凝土流动性与水胶比、砂率和外加剂有关。"),
      e("concrete-strength", "混凝土立方体抗压强度", "material", "fcu = F/A", "制作和养护混凝土立方体试件并测试抗压强度。", "混凝土强度受水胶比、龄期、养护和试件尺寸影响。"),
      e("rebar-tensile", "钢筋拉伸与屈服强度", "mechanics", "fy = Fy/A", "测量钢筋屈服强度、抗拉强度和延伸率。", "钢筋拉伸经历弹性、屈服、强化和颈缩阶段，屈服强度是设计重要指标。"),
      e("asphalt-penetration", "沥青针入度与软化点", "material", "PI = (20-500A)/(50A-10)", "测量沥青针入度、软化点和温度敏感性。", "沥青为黏弹性材料，温度升高时黏度降低、针入度增大。"),
      e("waterproof", "防水卷材拉伸与不透水性", "material", "σ = F/b", "测试防水卷材拉伸强度、断裂延伸率和抗渗性能。", "防水材料在拉伸和渗水压力下表现反映其工程耐久性和完整性。")
    ]),
    course("mechanics", 1, 2, "基础力学实验", "拉压弯扭、冲击、硬度、弹模与应变测量", [
      e("tension", "低碳钢与铸铁拉伸实验", "mechanics", "σ = F/A0", "测量两种材料拉伸曲线、屈服强度和延伸率。", "低碳钢具有明显屈服和塑性，铸铁呈脆性断裂。"),
      e("compression", "材料压缩与弹性模量", "mechanics", "E = σ/ε", "测量试件压缩变形和弹性模量。", "弹性阶段应力与应变成正比，斜率为弹性模量。"),
      e("bending", "简支梁弯曲正应力", "structural", "σ = My/I", "测量纯弯段应变和挠度并验证梁弯曲理论。", "梁弯曲正应力沿截面高度线性分布，最大应力位于离中性轴最远处。"),
      e("torsion", "圆轴扭转与切变模量", "mechanics", "τ = Tρ/Ip", "测量扭矩、扭转角和剪应变。", "圆轴扭转时剪应力沿半径线性增长，扭转角与扭矩和轴长成正比。"),
      e("impact", "金属材料冲击韧性", "mechanics", "aK = AK/S", "使用摆锤冲击试验机测量冲击吸收功和韧脆转变。", "冲击韧性表示材料抵抗快速断裂的能力，与温度和缺口敏感有关。"),
      e("hardness", "布氏、洛氏与维氏硬度", "material", "HB = 2F/(πD(D-√(D²-d²)))", "比较不同硬度测试方法和压痕结果。", "硬度表示材料抵抗局部塑性变形或压入的能力。"),
      e("young-modulus", "光杠杆测弹性模量", "mechanics", "E = 8FLD/(πd²bΔn)", "通过光杠杆放大微小伸长并计算弹性模量。", "光杠杆利用小角度反射放大位移，提高微小变形测量灵敏度。"),
      e("strain-bridge", "电阻应变片与惠斯通电桥", "structural", "Uo/Ui = ΔR/(4R)", "粘贴应变片并组成1/4、半桥和全桥测量电路。", "应变改变电阻，电桥把微小电阻变化转为电压并实现温度补偿。")
    ]),
    course("soil-geology", 2, 1, "土工与工程地质实验", "物理指标、击实、渗透、固结、剪切与地质判别", [
      e("water-content", "土样含水率测定", "soil", "w = (m1-m2)/(m2-m0)", "采用烘干法测定土的含水率。", "含水率是土中水的质量与干土质量之比，是土工试验基础指标。"),
      e("density", "环刀法与灌砂法密度", "soil", "ρ = m/V", "测量细粒土和填土现场密度。", "土体密度由质量和体积决定，现场密度用于压实度评价。"),
      e("grain-size", "颗粒分析与级配曲线", "soil", "Cu = D60/D10", "通过筛分和密度计法获得土颗粒级配。", "颗粒级配描述不同粒径土粒的比例，影响渗透、压实和强度。"),
      e("atterberg", "液限、塑限与塑性指数", "soil", "Ip = wL - wp", "测定细粒土界限含水率和塑性指数。", "含水率变化使细粒土呈固态、塑性、流动状态，界限指标用于分类。"),
      e("compaction", "击实试验与最佳含水率", "soil", "ρd = ρ/(1+w)", "绘制含水率—干密度曲线并确定最佳含水率。", "一定击实功下存在使干密度最大的含水率。"),
      e("permeability", "常水头与变水头渗透", "soil", "k = QL/(Aht)", "测量砂土和黏土渗透系数。", "达西定律表明渗流速度与水头梯度成正比。"),
      e("consolidation", "固结试验与压缩指数", "soil", "Cc = Δe/Δlogσ'", "测量土样在逐级荷载下的压缩和固结系数。", "饱和土体排水压缩过程由有效应力增加控制。"),
      e("direct-shear", "直接剪切与抗剪强度", "soil", "τf = c + σtanφ", "测量不同法向应力下土体破坏剪应力。", "莫尔—库仑准则描述土体抗剪强度与黏聚力和内摩擦角关系。")
    ]),
    course("structural", 2, 1, "结构试验与检测实验", "应变、梁、桁架、影响线、模态和混凝土检测", [
      e("strain-measurement", "应变片粘贴与静态应变", "structural", "ε = ΔL/L", "完成应变片粘贴、防护和静态应变测量。", "应变片电阻随构件表面变形变化，通过测量电路得到应变。"),
      e("bridge-circuit", "电桥桥路与温度补偿", "structural", "Uo = KεUi/4", "比较四分之一桥、半桥和全桥灵敏度。", "桥路配置改变输出灵敏度和对拉压、温度分量的响应。"),
      e("beam-test", "钢筋混凝土梁受弯试验", "structural", "M = FL/4", "对试验梁分级加载，测量挠度、应变和裂缝。", "受弯梁经历开裂、屈服和破坏阶段，承载力由钢筋和混凝土共同决定。"),
      e("truss-test", "平面桁架内力测试", "structural", "N = f(EA,ΔL)", "加载桁架并通过应变计算杆件轴力。", "理想桁架杆件主要承受轴力，节点平衡决定内力分布。"),
      e("influence-line", "移动荷载与影响线", "structural", "S = ΣPi yi", "沿梁移动荷载并测量指定截面响应。", "影响线把固定截面响应表示为移动荷载位置的函数。"),
      e("static-load", "结构静载试验与校核", "structural", "δexp/δth", "按规范分级加载并比较实测与理论响应。", "静载试验评价结构实际刚度、承载和变形是否满足预期。"),
      e("modal", "结构模态与固有频率", "vibration", "fn = n/(2L)√(EI/m)", "通过锤击或环境激励测结构频响和模态。", "模态参数包括固有频率、阻尼比和振型，是结构动力特性。"),
      e("rebar-detection", "混凝土保护层与钢筋检测", "inspection", "D = vΔt/2", "使用电磁或雷达方法检测钢筋间距和保护层厚度。", "电磁感应或雷达反射信号可识别钢筋位置和深度。")
    ]),
    course("alignment", 2, 2, "铁路选线与线路实验", "平面曲线、超高、坡度、视距、土方、站场与方案", [
      e("circular-curve", "圆曲线要素与里程计算", "alignment", "T = Rtan(A/2)", "计算圆曲线切线长、曲线长和外矢距。", "圆曲线通过半径和转角连接两直线，曲线要素用于线路放样。"),
      e("transition-curve", "缓和曲线与曲率过渡", "alignment", "ls = v³/(47R)", "设置缓和曲线并验算超高时变率。", "缓和曲线使曲率逐渐变化，实现线路和超高平顺过渡。"),
      e("superelevation", "曲线超高与旅客舒适度", "alignment", "h = 11.8v²/R", "计算并设置曲线超高，分析欠超高和过超高。", "超高平衡部分离心加速度，需兼顾速度、舒适和轨道稳定。"),
      e("grade", "线路纵断面坡度设计", "alignment", "i = ΔH/L", "设置坡度、坡段长度和竖曲线半径。", "坡度决定列车牵引和制动条件，竖曲线保证视距与舒适度。"),
      e("sight-distance", "铁路视距与限界检查", "alignment", "S = f(R, h)", "分析平曲线、建筑物和信号对视距的影响。", "司机视距和建筑限界必须满足列车制动与安全运行要求。"),
      e("earthwork", "断面法与土方量计算", "alignment", "V = ΣAiLi", "测量横断面并计算填挖方量。", "土方量由相邻断面面积和距离积分近似。"),
      e("station-throat", "车站咽喉区线路布置", "alignment", "L = ΣLi", "布置道岔、渡线和到发线并检查平行作业。", "站场咽喉区通过道岔和渡线实现列车进路转换。"),
      e("route-comparison", "线路方案多指标比选", "design", "Score = ΣwiSi", "比较不同线路方案的线路长度、造价、工期和环境。", "方案比选需将安全、经济、施工和环境指标量化并评价。")
    ]),
    course("track", 3, 1, "轨道结构实验", "钢轨、扣件、轨枕、道床、无砟轨道、几何、温度力与道岔", [
      e("rail-profile", "钢轨断面与磨耗测量", "track", "A = ∫w(h)dh", "测量钢轨断面、垂直磨耗和侧磨。", "钢轨断面决定承载和接触应力，磨耗会削弱强度和稳定性。"),
      e("fastening", "扣件组装与阻力测试", "track", "Ff = μN", "测量扣件纵向阻力和绝缘性能。", "扣件连接钢轨与轨枕，提供扣压力、绝缘和纵向阻力。"),
      e("sleeper", "轨枕抗弯与支承状态", "structural", "M = ql²/8", "测试轨枕弯曲承载和支承不均匀影响。", "轨枕把钢轨荷载分配到道床，并保持轨距和轨底坡。"),
      e("ballast", "道床密实度与道砟级配", "track", "ρd = m/V", "测试道砟级配、针片状和捣固密实度。", "道床纵横阻力、排水和弹性取决于道砟级配与密实度。"),
      e("slab-track", "无砟轨道结构静载", "track", "σ = F/A", "测量轨道板、CA砂浆或自密实混凝土层应变。", "无砟轨道通过连续支承和复合结构提供高稳定性。"),
      e("track-geometry", "轨距、水平与三角坑", "inspection", "GQI = Σaixi", "使用轨距尺或轨检仪测量轨道几何。", "轨道几何不平顺直接影响行车安全和舒适性。"),
      e("cwrc", "无缝线路温度力", "track", "Nt = EAαΔt", "测试锁定轨温和钢轨温度变化产生的纵向力。", "无缝线路受约束温度变形产生温度力，过高会导致胀轨或断轨。"),
      e("turnout", "道岔几何与尖轨检测", "inspection", "Check = f(gauge, throw, gap)", "测量道岔轨距、尖轨动程和密贴状态。", "道岔通过尖轨和心轨引导列车换线，几何状态决定运行安全。")
    ]),
    course("subgrade", 3, 1, "路基工程实验", "压实、CBR、回弹模量、沉降、边坡、挡墙、排水与地基", [
      e("sand-cone", "灌砂法压实度检测", "subgrade", "K = ρd/ρdmax", "现场测量填土密度并评价压实度。", "压实度是现场干密度与最大干密度之比，是路基质量控制核心指标。"),
      e("cbr", "加州承载比CBR试验", "subgrade", "CBR=F/Fs", "测量标准贯入条件下的路基承载能力。", "CBR以标准碎石承载量为参照评价材料抗局部剪切能力。"),
      e("resilient-modulus", "路基回弹模量检测", "subgrade", "Mr = σd/εr", "通过承载板或落锤式弯沉仪测量回弹模量。", "路基回弹模量描述重复荷载下弹性变形能力。"),
      e("settlement", "填方路基沉降监测", "subgrade", "s = ΣΔhi", "布设沉降板或分层沉降计进行加载期观测。", "路基沉降由填筑荷载引起压缩和固结，时间过程与排水条件相关。"),
      e("slope-stability", "路基边坡稳定性分析", "subgrade", "Fs = τf/τ", "测量土体强度和坡角并计算稳定系数。", "边坡稳定系数为抗滑力与滑动力之比，需大于规范安全系数。"),
      e("retaining-wall", "挡土墙土压力试验", "structural", "E = 0.5KaγH²", "测量模型墙背土压力和位移。", "土压力随墙体位移模式变化，主动、被动和静止土压力不同。"),
      e("drainage", "路基排水与渗透模型", "subgrade", "Q = kAi", "模拟降雨入渗、排水沟和边坡出渗。", "排水系统通过控制地下水位和渗流路径保持路基稳定。"),
      e("ground-treatment", "软土地基处理效果检测", "subgrade", "S = ΣmvΔσh", "比较换填、排水固结或桩基处理后的承载和沉降。", "地基处理提高承载力、加速排水或减小工后沉降。")
    ]),
    course("bridge-tunnel", 3, 2, "铁路桥隧实验", "桥梁静载、支座、索力、模态、隧道收敛、衬砌与防水", [
      e("bridge-static", "铁路桥梁静载试验", "bridge", "M = FL/4", "测量桥梁跨中挠度、应变和支座反力。", "分级静载试验验证桥梁实际承载和刚度。"),
      e("bearing", "桥梁支座压缩与位移", "bridge", "k = F/δ", "测量支座竖向刚度、转角和水平位移。", "支座传递荷载并释放温度变形，其刚度影响结构受力。"),
      e("cable-force", "斜拉桥索力测试", "bridge", "T = 4mL²fn²", "通过振动频率法测量拉索索力。", "拉索横向振动频率与张力和线密度相关。"),
      e("bridge-modal", "桥梁模态与冲击系数", "bridge", "μ = Yd/Ys", "测量桥梁固有频率和列车通过动力放大系数。", "动力冲击系数反映移动荷载引起的动态响应。"),
      e("tunnel-section", "隧道断面测量与限界", "tunnel", "A = ∮ydx", "测量开挖断面并检查建筑限界。", "隧道断面和限界必须满足设备、列车和运营安全空间。"),
      e("convergence", "隧道周边收敛与拱顶下沉", "tunnel", "Δ = l1 - l2", "布设测点并测量开挖后的收敛过程。", "隧道收敛速率反映围岩稳定和支护效果。"),
      e("lining", "衬砌厚度与背后缺陷检测", "tunnel", "D = vΔt/2", "使用地质雷达或超声检测衬砌厚度和空洞。", "弹性波反射可识别衬砌界面、厚度和背后空洞。"),
      e("tunnel-water", "隧道防排水系统试验", "tunnel", "Q = kAi", "检查防排水板、盲管和排水量。", "隧道防排水系统通过堵排结合控制地下水和渗漏。")
    ]),
    course("rail-dynamics", 4, 1, "铁路动力与工程检测", "轮轨力、振动、噪声、加速度、频谱、轨检、伤损与沉降", [
      e("wheel-rail", "轮轨力与脱轨系数", "vibration", "Q/P", "测量轮轨横向和垂向力并计算安全性指标。", "轮轨力决定轨道结构受力，脱轨系数反映轮缘爬轨风险。"),
      e("track-vibration", "轨道振动与传递特性", "vibration", "H(f)=Y(f)/X(f)", "测量钢轨、轨枕、道床和地面振动响应。", "轨道系统对不同频率振动具有不同衰减和传递特性。"),
      e("rail-noise", "铁路噪声与声压级", "vibration", "Lp=20log(p/p0)", "测量列车通过噪声的A声级和频谱。", "声压级用对数表示声压相对参考值的大小。"),
      e("acceleration", "车体与轨道加速度测试", "vibration", "a=d²x/dt²", "测量列车和轨道加速度并评价舒适性。", "加速度幅值和频率加权指标反映振动舒适度。"),
      e("psd", "随机振动功率谱密度分析", "vibration", "G(f)=|X(f)|²/T", "对轨道随机振动进行频谱和功率谱分析。", "功率谱密度描述随机信号能量在不同频率上的分布。"),
      e("track-car", "轨道检查车数据分析", "inspection", "TQI=ΣwiQi", "分析轨距、高低、方向和水平不平顺指数。", "轨道质量指数综合多个几何指标评价线路状态。"),
      e("rail-flaw", "钢轨伤损超声检测", "inspection", "t=2d/v", "利用超声波检测钢轨内部裂纹和核伤。", "超声波遇到缺陷界面发生反射，传播时间可用于定位。"),
      e("settlement-monitor", "铁路沉降自动监测", "digital", "ΔS=St-S0", "布设自动传感器监测路基、桥梁和隧道沉降。", "长期沉降监测通过时间序列识别趋势和异常。")
    ]),
    course("digital-rail", 4, 1, "数字铁路与智能检测", "GIS、BIM、数字孪生、无人机、机器视觉、传感网和大数据", [
      e("rail-gis", "铁路线路GIS空间分析", "digital", "L=Σ√(Δx²+Δy²)", "导入线路和地形数据并进行距离、坡度和缓冲区分析。", "GIS以空间坐标组织线路、地形和设施信息。"),
      e("rail-bim", "铁路BIM模型与碰撞检查", "digital", "Model=ΣObjects", "建立轨道、桥梁和隧道构件模型并检查空间冲突。", "BIM以参数化构件表达工程对象和属性。"),
      e("digital-twin", "铁路数字孪生状态映射", "digital", "State=f(Sensors,Model)", "把传感数据映射到三维模型并展示异常状态。", "数字孪生通过实时数据同步更新基础设施虚拟模型。"),
      e("uav", "无人机航测与三维重建", "survey", "P=f(K,R,T)", "采集重叠影像并重建铁路走廊地形点云。", "摄影测量通过多视角影像匹配恢复三维坐标。"),
      e("vision-inspection", "机器视觉轨道异物识别", "inspection", "Object=f(Image)", "采集轨道图像并检测异物、扣件缺失和裂纹。", "机器视觉通过特征或学习模型从图像中识别目标。"),
      e("sensor-net", "铁路结构传感网络", "digital", "x̂=f(z1…zn)", "布设应变、位移和温度传感器并完成数据汇聚。", "传感网络融合多测点信息实现结构状态估计。"),
      e("rail-bigdata", "铁路检测大数据分析", "digital", "Trend=f(Time,Location)", "汇总轨检、沉降和病害记录并进行趋势分析。", "大数据分析从多批次时空数据中识别劣化趋势和风险。"),
      e("early-warning", "铁路基础设施预警系统", "digital", "Risk=P×C", "设置阈值和趋势规则并生成分级预警。", "风险预警结合事件概率、后果和数据趋势确定响应级别。")
    ]),
    course("capstone", 4, 2, "铁道工程综合设计", "线路、轨道、路基、桥隧、施工、环境与毕业综合", [
      e("alignment-design", "铁路线路选线综合设计", "design", "Objective=ΣwiFi", "完成地形约束下的线路走向、曲线和坡度设计。", "选线是安全、经济、施工与环境多目标优化问题。"),
      e("track-design", "轨道结构综合选型", "track", "Load→Track→Subgrade", "比较有砟、无砟和不同扣件轨枕方案。", "轨道结构选型需综合速度、轴重、维护和全寿命成本。"),
      e("subgrade-design", "路基填筑与排水综合设计", "subgrade", "K≥Kdesign", "设计路基断面、填料、压实和排水系统。", "路基设计需满足强度、变形、稳定和排水要求。"),
      e("bridge-tunnel-interface", "桥隧过渡段协同设计", "bridge", "Stiffness transition", "设计桥台、隧道洞口和路基之间的刚度过渡。", "桥隧过渡段需控制差异沉降和刚度突变。"),
      e("maintenance-plan", "铁路线路维护计划", "inspection", "Plan=f(Risk,Cost,Time)", "根据检测数据制定维修优先级和天窗计划。", "维护计划在安全风险和可用施工时间之间优化。"),
      e("construction-org", "铁路施工组织与进度", "design", "T=Σti", "编制施工工序、资源配置和关键路径。", "施工组织通过网络计划协调工序、资源和工期。"),
      e("environment", "铁路工程环境影响评价", "design", "Impact=ΣwiIi", "分析噪声、振动、占地和生态影响并制定措施。", "环境评价需识别影响源、受体、范围和减缓措施。"),
      e("capstone", "铁道工程毕业综合实验", "design", "System=Design+Data+Verification", "整合线路、结构、检测和数据完成综合实验与汇报。", "综合实验把设计、施工、监测和评价连接成完整工程闭环。")
    ])
  ];

  const EXPERIMENTS = CATALOG.flatMap((semester) =>
    semester.experiments.map((experiment, index) => {
      const defaults = SIM_DEFS[experiment.sim] || SIM_DEFS.design;
      return {
        ...experiment,
        year: semester.year,
        term: semester.term,
        semesterTitle: semester.title,
        semesterId: semester.id,
        scope: "rail",
        index: index + 1,
        sceneGuide: defaults.sceneGuide,
        simInfo: defaults.simInfo,
        primaryLabel: defaults.primaryLabel,
        primaryUnit: defaults.primaryUnit,
        primaryMin: defaults.primaryMin,
        primaryMax: defaults.primaryMax,
        primaryValue: defaults.primaryValue,
        primaryStep: defaults.primaryStep,
        secondaryLabel: defaults.secondaryLabel,
        secondaryUnit: defaults.secondaryUnit,
        secondaryMin: defaults.secondaryMin,
        secondaryMax: defaults.secondaryMax,
        secondaryValue: defaults.secondaryValue,
        secondaryStep: defaults.secondaryStep
      };
    })
  );

  const PRINCIPLES = {};
  CATALOG.forEach((semester) => {
    semester.experiments.forEach((experiment) => {
      const defaults = SIM_DEFS[experiment.sim] || SIM_DEFS.design;
      PRINCIPLES[experiment.id] = {
        intro: experiment.description,
        theory: `${experiment.theory} 该实验依据 ${experiment.formula} 整理测量结果，并应结合仪器精度、试样或结构条件评价理论值与实测值的差异。`,
        apparatus: `${semester.title}对应的铁路工程仪器、加载设备、传感器、量测装置、试样或数字采集软件。`,
        steps: [
          "检查仪器、传感器和试样状态，记录设备编号、量程、标定信息与环境条件。",
          "按铁路工程试验规范布置测点、施加荷载或完成测量，获取稳定的初始读数。",
          "分级改变变量并重复采集，保存原始记录，按公式计算指标并检查异常值。"
        ],
        variables: `${experiment.formula}。报告应说明各符号单位、测点位置、采样频率和数据筛选规则。`,
        caution: "遵守中南大学实验室安全规定；加载、开挖、高处测量和电气设备操作必须在指导教师确认后进行。",
        observations: defaults.sceneGuide.attention + " 实验内容属于本科教学框架，具体项目与开设学期以中南大学土木工程学院当年教学安排为准。"
      };
    });
  });

  window.EXPECTED_EXPERIMENT_COUNT = EXPERIMENTS.length;
  window.RAILWAY_2023_SOURCE = {
    title: "中南大学土木工程学院本科培养方案列表",
    url: SOURCE_URL,
    note: "具体培养方案附件当前未公开；实验模块依据铁道工程本科课程框架整理。",
    courseCount: CATALOG.length,
    experimentCount: EXPERIMENTS.length
  };
  window.LAB_CATALOG = CATALOG;
  window.LAB_EXPERIMENTS = EXPERIMENTS;
  window.LAB_PRINCIPLES = PRINCIPLES;
})();
