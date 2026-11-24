"use strict";

(function () {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const rgba = (color, alpha = 1) => `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  const COLORS = {
    gold: [213, 174, 103],
    teal: [108, 190, 177],
    blue: [106, 164, 208],
    rust: [192, 112, 77],
    concrete: [152, 163, 158],
    soil: [131, 99, 67]
  };

  function label(context, text, x, y, color = "rgba(215, 236, 224, 0.65)", align = "left", size = 10) {
    context.save();
    context.fillStyle = color;
    context.font = `${size}px "Microsoft YaHei UI", sans-serif`;
    context.textAlign = align;
    context.fillText(text, x, y);
    context.restore();
  }

  function arrow(context, x1, y1, x2, y2, color = COLORS.gold, lineWidth = 1.8) {
    context.save();
    context.strokeStyle = rgba(color, 0.8);
    context.fillStyle = rgba(color, 0.8);
    context.lineWidth = lineWidth;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = 7;
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - Math.cos(angle - 0.5) * size, y2 - Math.sin(angle - 0.5) * size);
    context.lineTo(x2 - Math.cos(angle + 0.5) * size, y2 - Math.sin(angle + 0.5) * size);
    context.closePath();
    context.fill();
    context.restore();
  }

  function glow(context, x, y, radius, color, alpha = 0.25) {
    const gradient = context.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(color, alpha));
    gradient.addColorStop(0.3, rgba(color, alpha * 0.52));
    gradient.addColorStop(1, rgba(color, 0));
    context.save();
    context.globalCompositeOperation = "lighter";
    context.fillStyle = gradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.restore();
  }

  function graphAxes(context, width, height, left = 0.54) {
    const x = width * left;
    const right = width * 0.92;
    const top = height * 0.16;
    const bottom = height * 0.82;
    context.save();
    context.fillStyle = "rgba(5, 17, 13, 0.48)";
    context.strokeStyle = "rgba(206, 230, 214, 0.18)";
    context.beginPath();
    context.roundRect(x - 8, top - 14, right - x + 16, bottom - top + 29, 8);
    context.fill();
    context.stroke();
    context.strokeStyle = "rgba(206, 230, 214, 0.22)";
    context.beginPath();
    context.moveTo(x, top);
    context.lineTo(x, bottom);
    context.lineTo(right, bottom);
    context.stroke();
    for (let index = 1; index <= 4; index += 1) {
      const gy = top + (bottom - top) * index / 4;
      const gx = x + (right - x) * index / 4;
      context.strokeStyle = "rgba(206, 230, 214, 0.07)";
      context.beginPath();
      context.moveTo(x, gy);
      context.lineTo(right, gy);
      context.moveTo(gx, top);
      context.lineTo(gx, bottom);
      context.stroke();
    }
    context.restore();
    return { x, right, top, bottom };
  }

  function plotSeries(context, axes, points, color = COLORS.gold) {
    if (!points.length) return;
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const mapX = (value) => axes.x + ((value - minX) / rangeX) * (axes.right - axes.x);
    const mapY = (value) => axes.bottom - ((value - minY) / rangeY) * (axes.bottom - axes.top) * 0.88 - 10;
    context.save();
    context.beginPath();
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(mapX(point.x), mapY(point.y));
      else context.lineTo(mapX(point.x), mapY(point.y));
    });
    context.strokeStyle = rgba(color, 0.92);
    context.lineWidth = 2.2;
    context.shadowColor = rgba(color, 0.45);
    context.shadowBlur = 8;
    context.stroke();
    context.restore();
  }

  function drawSurvey(context, width, height, time, primary, secondary) {
    const baseY = height * 0.7;
    const instrumentX = width * 0.23;
    const rodX = width * 0.43;
    context.save();
    context.strokeStyle = "rgba(214, 233, 222, 0.7)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(instrumentX, baseY);
    context.lineTo(instrumentX - 24, baseY + 72);
    context.moveTo(instrumentX, baseY);
    context.lineTo(instrumentX + 14, baseY + 76);
    context.moveTo(instrumentX, baseY);
    context.lineTo(instrumentX + 38, baseY + 65);
    context.stroke();
    context.fillStyle = "#25322d";
    context.strokeStyle = "rgba(226, 238, 229, 0.5)";
    context.beginPath();
    context.roundRect(instrumentX - 28, baseY - 42, 58, 34, 6);
    context.fill();
    context.stroke();
    context.fillStyle = "#101a16";
    context.beginPath();
    context.arc(instrumentX + 34, baseY - 30, 13, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.strokeStyle = "#b6c8bd";
    context.beginPath();
    context.moveTo(rodX, baseY + 72);
    context.lineTo(rodX, baseY - 190);
    context.stroke();
    for (let index = 0; index < 7; index += 1) {
      context.strokeStyle = "rgba(208, 224, 214, 0.38)";
      context.beginPath();
      context.moveTo(rodX - 8, baseY - 180 + index * 30);
      context.lineTo(rodX + 8, baseY - 180 + index * 30);
      context.stroke();
    }
    context.strokeStyle = rgba(COLORS.gold, 0.65);
    context.setLineDash([7, 5]);
    context.beginPath();
    context.moveTo(instrumentX + 34, baseY - 30);
    context.lineTo(rodX, baseY - 150);
    context.stroke();
    context.restore();
    glow(context, instrumentX + 34, baseY - 30, 28, COLORS.gold, 0.18);
    const axes = graphAxes(context, width, height);
    const points = [];
    const stations = Math.max(2, Math.round(primary));
    for (let index = 0; index < stations; index += 1) {
      points.push({ x: index, y: Math.sin(index * 1.7) * 2.8 + (index === stations - 2 ? 7 : 0) });
    }
    plotSeries(context, axes, points, COLORS.gold);
    label(context, "全站仪 / 水准仪", instrumentX - 34, baseY + 112);
    label(context, "测尺 / 棱镜", rodX - 20, baseY + 112);
    label(context, "测段残差", axes.x, axes.top - 22, "rgba(211, 231, 220, 0.6)");
  }

  function drawMaterial(context, width, height, time, primary, secondary) {
    const pressX = width * 0.26;
    const pressY = height * 0.2;
    context.save();
    context.strokeStyle = "rgba(211, 230, 219, 0.58)";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(pressX - 75, pressY + 32);
    context.lineTo(pressX - 75, height * 0.77);
    context.moveTo(pressX + 75, pressY + 32);
    context.lineTo(pressX + 75, height * 0.77);
    context.moveTo(pressX - 75, pressY + 32);
    context.lineTo(pressX + 75, pressY + 32);
    context.moveTo(pressX - 88, height * 0.77);
    context.lineTo(pressX + 88, height * 0.77);
    context.stroke();
    context.fillStyle = "#88978f";
    context.fillRect(pressX - 48, pressY + 50, 96, 18);
    context.fillStyle = "#9da9a2";
    context.fillRect(pressX - 21, pressY + 95, 42, 92);
    context.fillStyle = rgba(COLORS.gold, 0.35);
    context.fillRect(pressX - 20, pressY + 128, 40, 26);
    arrow(context, pressX, pressY + 84, pressX, pressY + 52, COLORS.gold, 2);
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 60; index += 1) {
      const strain = index * 0.035;
      const stress = (35 + primary * 0.08) * (1 - Math.exp(-strain / 0.45)) + strain * 3;
      points.push({ x: strain, y: stress });
    }
    plotSeries(context, axes, points, COLORS.gold);
    label(context, "压力试验机", pressX - 36, pressY + 7);
    label(context, "应力—应变曲线", axes.x, axes.top - 22);
  }

  function drawMechanics(context, width, height, time, primary, secondary) {
    drawMaterial(context, width, height, time, primary, secondary);
    label(context, "试件", width * 0.23, height * 0.72, "rgba(220, 240, 228, 0.52)", "center");
  }

  function drawSoil(context, width, height, time, primary, secondary) {
    const moldX = width * 0.19;
    const moldY = height * 0.26;
    context.save();
    const moldGradient = context.createLinearGradient(moldX, 0, moldX + 120, 0);
    moldGradient.addColorStop(0, "rgba(115, 87, 59, 0.45)");
    moldGradient.addColorStop(0.5, "rgba(159, 124, 82, 0.7)");
    moldGradient.addColorStop(1, "rgba(105, 78, 54, 0.45)");
    context.fillStyle = moldGradient;
    context.fillRect(moldX, moldY, 120, height * 0.38);
    context.strokeStyle = "rgba(219, 226, 214, 0.35)";
    context.strokeRect(moldX, moldY, 120, height * 0.38);
    for (let layer = 1; layer < 5; layer += 1) {
      context.strokeStyle = "rgba(239, 219, 179, 0.13)";
      context.beginPath();
      context.moveTo(moldX, moldY + layer * height * 0.075);
      context.lineTo(moldX + 120, moldY + layer * height * 0.075);
      context.stroke();
    }
    context.fillStyle = "#8c9b91";
    context.fillRect(moldX + 18, moldY - 36, 84, 22);
    arrow(context, moldX + 60, moldY - 50, moldX + 60, moldY - 23, COLORS.gold, 2.2);
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 55; index += 1) {
      const moisture = 4 + index * 0.5;
      const density = 2.05 - 0.0014 * Math.pow(moisture - primary, 2);
      points.push({ x: moisture, y: density });
    }
    plotSeries(context, axes, points, COLORS.teal);
    label(context, "击实筒 / 土样", moldX + 16, moldY + height * 0.38 + 24);
    label(context, "含水率—干密度", axes.x, axes.top - 22, rgba(COLORS.teal, 0.8));
  }

  function drawStructural(context, width, height, time, primary, secondary) {
    const left = width * 0.09;
    const right = width * 0.47;
    const beamY = height * 0.41;
    context.save();
    context.fillStyle = "rgba(5, 17, 13, 0.5)";
    context.strokeStyle = "rgba(210, 231, 219, 0.2)";
    context.beginPath();
    context.roundRect(left - 20, height * 0.18, right - left + 40, height * 0.5, 10);
    context.fill();
    context.stroke();
    context.fillStyle = "#889990";
    context.fillRect(left, beamY - 9, right - left, 18);
    context.fillStyle = "#5f7068";
    context.beginPath();
    context.moveTo(left, beamY + 10);
    context.lineTo(left + 22, beamY + 10);
    context.lineTo(left + 11, beamY + 34);
    context.closePath();
    context.fill();
    context.beginPath();
    context.moveTo(right, beamY + 10);
    context.lineTo(right - 22, beamY + 10);
    context.lineTo(right - 11, beamY + 34);
    context.closePath();
    context.fill();
    const loadX = (left + right) / 2;
    arrow(context, loadX, beamY - 105, loadX, beamY - 12, COLORS.gold, 2.5);
    context.strokeStyle = rgba(COLORS.gold, 0.5);
    context.beginPath();
    context.moveTo(left, beamY + 55);
    for (let x = left; x <= right; x += 2) {
      const p = (x - left) / (right - left);
      const y = beamY + 55 + Math.sin(p * Math.PI) * (10 + primary * 0.09);
      context.lineTo(x, y);
    }
    context.stroke();
    context.restore();
    for (let index = 0; index < 6; index += 1) {
      glow(context, left + 35 + index * (right - left - 70) / 5, beamY + 55, 6, COLORS.gold, 0.15);
    }
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 50; index += 1) {
      const load = index * primary / 50;
      points.push({ x: load, y: load * Math.pow(secondary, 2) / 650 + Math.pow(load / primary, 4) * 2 });
    }
    plotSeries(context, axes, points, COLORS.gold);
    label(context, "加载架与应变测点", left, height * 0.77);
    label(context, "荷载—挠度", axes.x, axes.top - 22);
  }

  function drawAlignment(context, width, height, time, primary, secondary) {
    const pathTop = height * 0.14;
    const pathBottom = height * 0.63;
    context.save();
    context.fillStyle = "rgba(8, 24, 18, 0.4)";
    context.strokeStyle = "rgba(198, 230, 211, 0.16)";
    context.beginPath();
    context.roundRect(width * 0.05, pathTop, width * 0.87, pathBottom - pathTop, 10);
    context.fill();
    context.stroke();
    context.strokeStyle = "rgba(150, 177, 161, 0.09)";
    for (let y = pathTop + 20; y < pathBottom; y += 24) {
      context.beginPath();
      context.moveTo(width * 0.05, y);
      context.lineTo(width * 0.92, y);
      context.stroke();
    }
    context.beginPath();
    for (let x = width * 0.07; x < width * 0.9; x += 2) {
      const p = (x - width * 0.07) / (width * 0.83);
      const y = height * 0.37 + Math.sin((p - 0.5) * Math.PI * 1.2) * 42;
      if (x === width * 0.07) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = rgba(COLORS.gold, 0.92);
    context.lineWidth = 5;
    context.stroke();
    context.strokeStyle = "rgba(232, 243, 235, 0.75)";
    context.lineWidth = 1;
    context.setLineDash([8, 8]);
    context.stroke();
    context.restore();
    const railY = height * 0.79;
    context.save();
    context.strokeStyle = "rgba(212, 232, 221, 0.7)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(width * 0.16, railY);
    context.lineTo(width * 0.48, railY - primary / 55);
    context.moveTo(width * 0.16, railY + 14);
    context.lineTo(width * 0.48, railY + 14 - primary / 55);
    context.stroke();
    context.restore();
    label(context, "铁路线路平面线形", width * 0.06, height * 0.1);
    label(context, `超高 h = ${(11.8 * secondary * secondary / Math.max(1, primary)).toFixed(1)} mm`, width * 0.18, height * 0.93);
    label(context, `R=${Math.round(primary)} m · V=${Math.round(secondary)} km/h`, width * 0.09, pathTop + 25);
  }

  function drawTrack(context, width, height, time, primary, secondary) {
    const centerX = width * 0.25;
    const railY = height * 0.37;
    context.save();
    context.fillStyle = "rgba(105, 113, 108, 0.28)";
    context.beginPath();
    context.moveTo(width * 0.05, height * 0.7);
    context.lineTo(width * 0.46, height * 0.7);
    context.lineTo(width * 0.4, height * 0.87);
    context.lineTo(width * 0.1, height * 0.87);
    context.closePath();
    context.fill();
    for (let index = 0; index < 8; index += 1) {
      const y = railY + 68 + index * 10;
      const half = 52 + index * 8;
      context.fillStyle = index % 2 ? "rgba(151, 140, 114, 0.16)" : "rgba(106, 101, 86, 0.16)";
      context.fillRect(centerX - half, y, half * 2, 4);
    }
    context.fillStyle = "#7f8e86";
    for (const offset of [-72, 72]) {
      context.fillRect(centerX + offset - 7, railY - 8, 14, 15);
      context.fillRect(centerX + offset - 3, railY + 7, 6, 60);
    }
    for (let index = 0; index < 4; index += 1) {
      context.fillStyle = "#4a514e";
      context.fillRect(centerX - 96, railY + 68 + index * 22, 192, 9);
    }
    context.restore();
    const wheelY = railY - 25;
    context.save();
    context.strokeStyle = rgba(COLORS.gold, 0.88);
    context.lineWidth = 5;
    context.beginPath();
    context.arc(centerX - 44, wheelY, 18, 0, Math.PI * 2);
    context.arc(centerX, wheelY + 8, 22, 0, Math.PI * 2);
    context.stroke();
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 70; index += 1) {
      const position = index * 1.2;
      const amplitude = 0.5 + primary / 90 + Math.abs(Math.sin(index * 0.31)) * 1.4;
      points.push({ x: position, y: Math.sin(index * 0.55) * amplitude + Math.sin(index * 1.9) * 0.25 });
    }
    plotSeries(context, axes, points, COLORS.teal);
    label(context, "钢轨—扣件—轨枕—道床", centerX - 90, height * 0.91);
    label(context, "轨道几何不平顺", axes.x, axes.top - 22, rgba(COLORS.teal, 0.8));
  }

  function drawSubgrade(context, width, height, time, primary, secondary) {
    const left = width * 0.08;
    const right = width * 0.47;
    const top = height * 0.36;
    const bottom = height * 0.78;
    context.save();
    context.beginPath();
    context.moveTo(left + 65, top);
    context.lineTo(right - 65, top);
    context.lineTo(right, bottom);
    context.lineTo(left, bottom);
    context.closePath();
    const embankment = context.createLinearGradient(0, top, 0, bottom);
    embankment.addColorStop(0, "rgba(166, 143, 103, 0.64)");
    embankment.addColorStop(0.45, "rgba(120, 100, 75, 0.74)");
    embankment.addColorStop(1, "rgba(76, 72, 61, 0.8)");
    context.fillStyle = embankment;
    context.fill();
    context.strokeStyle = "rgba(220, 229, 216, 0.3)";
    context.stroke();
    for (let layer = 1; layer < 5; layer += 1) {
      const y = top + (bottom - top) * layer / 5;
      context.strokeStyle = "rgba(230, 217, 185, 0.12)";
      context.beginPath();
      context.moveTo(left + (right - left) * 0.12, y);
      context.lineTo(right - (right - left) * 0.12, y);
      context.stroke();
    }
    context.restore();
    const sensorX = (left + right) / 2;
    for (let index = 0; index < 4; index += 1) {
      const y = top + 55 + index * 35;
      context.save();
      context.fillStyle = rgba(COLORS.gold, 0.8);
      context.beginPath();
      context.arc(sensorX, y, 4, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(221, 191, 133, 0.25)";
      context.beginPath();
      context.moveTo(sensorX, y);
      context.lineTo(sensorX + 100, y - 15);
      context.stroke();
      context.restore();
    }
    arrow(context, sensorX, bottom + 5, sensorX, bottom + 28, COLORS.gold, 2);
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 55; index += 1) {
      const depth = index * primary / 55;
      points.push({ x: depth, y: primary * (1 - Math.exp(-depth / Math.max(1, primary * 0.28))) * (1.06 - secondary * 0.003) });
    }
    plotSeries(context, axes, points, COLORS.soil);
    label(context, "分层填筑与沉降传感器", left + 22, height * 0.9);
    label(context, "深度—沉降", axes.x, axes.top - 22, "rgba(207, 183, 143, 0.75)");
  }

  function drawBridge(context, width, height, time, primary, secondary) {
    const left = width * 0.07;
    const right = width * 0.48;
    const deckY = height * 0.43;
    context.save();
    context.fillStyle = "rgba(112, 126, 120, 0.62)";
    context.fillRect(left, deckY, right - left, 13);
    context.fillStyle = "rgba(85, 99, 93, 0.7)";
    context.fillRect(left + 15, deckY + 24, right - left - 30, 17);
    for (let index = 0; index < 7; index += 1) {
      const x = left + 30 + index * (right - left - 60) / 6;
      context.fillRect(x - 2, deckY + 13, 4, 54);
    }
    context.strokeStyle = "rgba(210, 229, 217, 0.42)";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(left, deckY + 72);
    context.lineTo(left, height * 0.8);
    context.moveTo(right, deckY + 72);
    context.lineTo(right, height * 0.8);
    context.stroke();
    const truckX = (left + right) / 2;
    context.fillStyle = rgba(COLORS.gold, 0.82);
    context.beginPath();
    context.roundRect(truckX - 44, deckY - 38, 88, 28, 5);
    context.fill();
    for (const x of [truckX - 28, truckX + 28]) {
      context.beginPath();
      context.arc(x, deckY - 10, 7, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 55; index += 1) {
      const load = index * primary / 55;
      const deflection = load * Math.pow(secondary, 3) / 8200;
      points.push({ x: load, y: deflection });
    }
    plotSeries(context, axes, points, COLORS.gold);
    label(context, "铁路桥梁静载 / 移动荷载", left, height * 0.86);
    label(context, "荷载—跨中挠度", axes.x, axes.top - 22);
  }

  function drawTunnel(context, width, height, time, primary, secondary) {
    const cx = width * 0.25;
    const cy = height * 0.48;
    const radius = Math.min(width * 0.16, height * 0.3);
    context.save();
    for (let layer = 4; layer >= 1; layer -= 1) {
      context.fillStyle = layer % 2 ? "rgba(80, 73, 59, 0.24)" : "rgba(62, 65, 58, 0.28)";
      context.beginPath();
      context.ellipse(cx, cy, radius + layer * 24, radius * 0.82 + layer * 18, 0, Math.PI, Math.PI * 2);
      context.lineTo(cx + radius + layer * 24, height * 0.82);
      context.lineTo(cx - radius - layer * 24, height * 0.82);
      context.closePath();
      context.fill();
    }
    context.fillStyle = "rgba(156, 169, 161, 0.65)";
    context.strokeStyle = "rgba(227, 235, 228, 0.35)";
    context.lineWidth = 8;
    context.beginPath();
    context.arc(cx, cy, radius, Math.PI, Math.PI * 2);
    context.lineTo(cx + radius, height * 0.82);
    context.moveTo(cx - radius, cy);
    context.lineTo(cx - radius, height * 0.82);
    context.stroke();
    context.restore();
    for (const y of [cy + 12, cy + 50, cy + 88]) {
      arrow(context, cx - radius + 8, y, cx - radius + 28, y, COLORS.gold, 1.5);
      arrow(context, cx + radius - 8, y, cx + radius - 28, y, COLORS.gold, 1.5);
    }
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 50; index += 1) {
      const stage = index * 6 / 50;
      const convergence = (6 + secondary * 0.35) * (1 - Math.exp(-stage / 0.34)) * (1 + primary / 220);
      points.push({ x: stage, y: convergence });
    }
    plotSeries(context, axes, points, COLORS.teal);
    label(context, "隧道断面与收敛测线", cx, height * 0.88, "rgba(214, 232, 221, 0.58)", "center");
    label(context, "施工阶段—收敛", axes.x, axes.top - 22, rgba(COLORS.teal, 0.78));
  }

  function drawVibration(context, width, height, time, primary, secondary) {
    const left = width * 0.09;
    const right = width * 0.46;
    const railY = height * 0.43;
    context.save();
    const beam = context.createLinearGradient(0, railY - 8, 0, railY + 8);
    beam.addColorStop(0, "#c0cec6");
    beam.addColorStop(0.5, "#73827a");
    beam.addColorStop(1, "#3e4b45");
    context.fillStyle = beam;
    context.fillRect(left, railY - 8, right - left, 16);
    for (const x of [width * 0.17, width * 0.25, width * 0.33, width * 0.41]) {
      context.fillStyle = rgba(COLORS.gold, 0.75);
      context.beginPath();
      context.roundRect(x - 8, railY - 23, 16, 9, 3);
      context.fill();
      context.strokeStyle = "rgba(228, 195, 137, 0.25)";
      context.beginPath();
      context.moveTo(x, railY - 23);
      context.lineTo(x, railY - 50);
      context.stroke();
    }
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    const speedRatio = primary / 200;
    for (let index = 0; index <= 90; index += 1) {
      const frequency = 2 + index * 0.75;
      const peak1 = 35 + speedRatio * 12;
      const peak2 = 78 - secondary * 0.12;
      const amplitude = Math.exp(-Math.pow((frequency - peak1) / 8, 2)) * 1.6 + Math.exp(-Math.pow((frequency - peak2) / 14, 2)) * 0.8 + 0.05;
      points.push({ x: frequency, y: amplitude });
    }
    plotSeries(context, axes, points, COLORS.teal);
    label(context, "钢轨 / 轨枕振动测点", left, height * 0.72);
    label(context, "频率 / Hz", (axes.x + axes.right) / 2, height - 16, undefined, "center");
    label(context, "振动频谱", axes.x, axes.top - 22);
  }

  function drawInspection(context, width, height, time, primary, secondary) {
    const railY = height * 0.55;
    context.save();
    context.strokeStyle = "#6f7f78";
    context.lineWidth = 7;
    context.beginPath();
    context.moveTo(width * 0.05, railY);
    context.lineTo(width * 0.95, railY);
    context.stroke();
    for (let index = 0; index < 8; index += 1) {
      context.fillStyle = index % 2 ? "#525e59" : "#414c47";
      context.fillRect(width * 0.11 + index * width * 0.1, railY + 9, 22, 8);
    }
    const cartX = width * 0.24 + (Math.sin(time * 0.00045) + 1) * width * 0.22;
    context.fillStyle = rgba(COLORS.gold, 0.88);
    context.beginPath();
    context.roundRect(cartX - 28, railY - 36, 56, 24, 5);
    context.fill();
    for (const dx of [-20, 20]) {
      context.beginPath();
      context.arc(cartX + dx, railY - 9, 6, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index < 85; index += 1) {
      const mileage = index * primary;
      let value = Math.abs(Math.sin(index * 0.37) * 0.65 + Math.sin(index * 1.31) * 0.22);
      if (index === 28 || index === 59) value += 2.7;
      points.push({ x: mileage, y: value });
    }
    plotSeries(context, axes, points, COLORS.gold);
    const thresholdY = axes.bottom - clamp(secondary / 10, 0, 1) * (axes.bottom - axes.top) * 0.88 - 10;
    context.save();
    context.strokeStyle = "rgba(218, 105, 82, 0.72)";
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(axes.x, thresholdY);
    context.lineTo(axes.right, thresholdY);
    context.stroke();
    context.restore();
    label(context, "轨检小车 / 检测设备", cartX, railY - 55, "rgba(225, 196, 146, 0.8)", "center");
    label(context, "超限阈值", axes.right - 4, thresholdY - 6, "rgba(224, 123, 97, 0.8)", "right");
  }

  function drawDigital(context, width, height, time, primary, secondary) {
    const left = width * 0.08;
    const right = width * 0.45;
    const top = height * 0.2;
    const bottom = height * 0.77;
    context.save();
    context.fillStyle = "rgba(7, 23, 19, 0.56)";
    context.strokeStyle = "rgba(190, 224, 208, 0.2)";
    context.beginPath();
    context.roundRect(left - 10, top - 10, right - left + 20, bottom - top + 20, 10);
    context.fill();
    context.stroke();
    const nodes = [
      [0.22, 0.32], [0.38, 0.25], [0.18, 0.56], [0.35, 0.62], [0.29, 0.83]
    ];
    nodes.forEach(([nx, ny], index) => {
      const x = left + (right - left) * nx;
      const y = top + (bottom - top) * (ny - 0.2);
      glow(context, x, y, 18 + Math.sin(time * 0.002 + index) * 2, COLORS.teal, 0.18);
      context.fillStyle = rgba(COLORS.teal, 0.82);
      context.beginPath();
      context.arc(x, y, 4, 0, Math.PI * 2);
      context.fill();
      if (index > 0) {
        const prior = nodes[index - 1];
        context.strokeStyle = "rgba(145, 203, 190, 0.24)";
        context.beginPath();
        context.moveTo(left + (right - left) * prior[0], top + (bottom - top) * (prior[1] - 0.2));
        context.lineTo(x, y);
        context.stroke();
      }
    });
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 80; index += 1) {
      const confidence = clamp(0.25 + index / 80 * 0.62 + Math.sin(index * 0.3) * 0.05, 0, 1);
      points.push({ x: index / primary, y: confidence });
    }
    plotSeries(context, axes, points, COLORS.teal);
    label(context, "多源感知 / 数字模型", left, height * 0.86);
    label(context, "置信度与预警状态", axes.x, axes.top - 22, rgba(COLORS.teal, 0.78));
  }

  function drawDesign(context, width, height, time, primary, secondary) {
    const cx = width * 0.25;
    const cy = height * 0.49;
    const radius = Math.min(width * 0.15, height * 0.27);
    const metrics = ["安全", "造价", "工期", "环境", "运营", "施工"];
    context.save();
    for (let ring = 1; ring <= 4; ring += 1) {
      context.strokeStyle = "rgba(208, 230, 218, 0.1)";
      context.beginPath();
      metrics.forEach((_, index) => {
        const angle = -Math.PI / 2 + index * Math.PI * 2 / metrics.length;
        const x = cx + Math.cos(angle) * radius * ring / 4;
        const y = cy + Math.sin(angle) * radius * ring / 4;
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.closePath();
      context.stroke();
    }
    const scores = [0.82, 1 - secondary / 140, 0.72, 0.66, primary / 400 + 0.18, 0.75];
    context.beginPath();
    metrics.forEach((_, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / metrics.length;
      const x = cx + Math.cos(angle) * radius * scores[index];
      const y = cy + Math.sin(angle) * radius * scores[index];
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.closePath();
    context.fillStyle = rgba(COLORS.gold, 0.14);
    context.strokeStyle = rgba(COLORS.gold, 0.82);
    context.fill();
    context.stroke();
    metrics.forEach((metric, index) => {
      const angle = -Math.PI / 2 + index * Math.PI * 2 / metrics.length;
      label(context, metric, cx + Math.cos(angle) * radius * 1.13, cy + Math.sin(angle) * radius * 1.13 + 3, "rgba(217, 231, 222, 0.58)", "center", 8.5);
    });
    context.restore();
    const axes = graphAxes(context, width, height);
    const points = [];
    for (let index = 0; index <= 50; index += 1) {
      const option = index / 5;
      const score = 0.55 + 0.24 * Math.sin(option * 0.7 + secondary * 0.008) + primary / 1800;
      points.push({ x: option, y: score });
    }
    plotSeries(context, axes, points, COLORS.gold);
    label(context, "多目标方案评价", cx, height * 0.84, "rgba(218, 231, 222, 0.58)", "center");
    label(context, "方案指标—综合性能", axes.x, axes.top - 22);
  }

  function draw(sim, context, width, height, time, state, experiment) {
    const primary = state.primary;
    const secondary = state.secondary;
    switch (sim) {
      case "survey": drawSurvey(context, width, height, time, primary, secondary); break;
      case "material": drawMaterial(context, width, height, time, primary, secondary); break;
      case "mechanics": drawMechanics(context, width, height, time, primary, secondary); break;
      case "soil": drawSoil(context, width, height, time, primary, secondary); break;
      case "structural": drawStructural(context, width, height, time, primary, secondary); break;
      case "alignment": drawAlignment(context, width, height, time, primary, secondary); break;
      case "track": drawTrack(context, width, height, time, primary, secondary); break;
      case "subgrade": drawSubgrade(context, width, height, time, primary, secondary); break;
      case "bridge": drawBridge(context, width, height, time, primary, secondary); break;
      case "tunnel": drawTunnel(context, width, height, time, primary, secondary); break;
      case "vibration": drawVibration(context, width, height, time, primary, secondary); break;
      case "inspection": drawInspection(context, width, height, time, primary, secondary); break;
      case "digital": drawDigital(context, width, height, time, primary, secondary); break;
      case "design": drawDesign(context, width, height, time, primary, secondary); break;
      default: drawDesign(context, width, height, time, primary, secondary);
    }
  }

  function sample(sim, primary, secondary, experiment, state, options = {}) {
    const config = {
      survey: ["测段序号", "高差偏差(mm)"],
      material: ["龄期(d)", "强度(MPa)"],
      mechanics: ["应变(με)", "应力(MPa)"],
      soil: ["含水率(%)", "干密度(g/cm³)"],
      structural: ["荷载(kN)", "挠度(mm)"],
      alignment: ["里程(m)", "横向偏移(m)"],
      track: ["轨道位置(m)", "轨道不平顺(mm)"],
      subgrade: ["深度(m)", "沉降(mm)"],
      bridge: ["荷载(kN)", "跨中挠度(mm)"],
      tunnel: ["施工阶段", "周边收敛(mm)"],
      vibration: ["频率(Hz)", "加速度(m/s²)"],
      inspection: ["里程(m)", "检测指标(mm)"],
      digital: ["时间(s)", "置信度"],
      design: ["方案指标", "综合性能"]
    }[sim];
    if (!config) return null;
    const rows = [config];
    const n = clamp(Math.round(Number(options.points || 42)), 10, 300);
    for (let index = 0; index < n; index += 1) {
      const p = index / (n - 1);
      let x;
      let y;
      switch (sim) {
        case "survey": x = index + 1; y = Math.sin(index * 1.7) * 2.4 + (index === 30 ? 7 : 0); break;
        case "material": x = 1 + p * Math.max(3, secondary); y = (35 + primary * 0.07) * (1 - Math.exp(-x / 8)) + Math.sin(index) * 0.2; break;
        case "mechanics": x = p * 1800; y = Math.min(430, 360 * (1 - Math.exp(-p * 3.4)) + p * 45); break;
        case "soil": x = 5 + p * 20; y = 2.03 - 0.0015 * Math.pow(x - primary, 2) + Math.sin(index) * 0.004; break;
        case "structural": x = p * primary; y = p * primary * Math.pow(secondary, 2) / 620 + Math.pow(p, 4) * 2; break;
        case "alignment": x = p * 1000; y = Math.sin((p - 0.5) * Math.PI * 1.2) * 4; break;
        case "track": x = p * 80; y = Math.sin(index * 0.48) * (0.6 + primary / 100) + Math.sin(index * 1.9) * 0.22; break;
        case "subgrade": x = p * primary; y = primary * (1 - Math.exp(-x / Math.max(1, primary * 0.28))) * (1.06 - secondary * 0.003); break;
        case "bridge": x = p * primary; y = x * Math.pow(secondary, 3) / 8000; break;
        case "tunnel": x = p * 6; y = (6 + secondary * 0.35) * (1 - Math.exp(-x / 0.34)) * (1 + primary / 220); break;
        case "vibration": x = 2 + p * 80; y = Math.exp(-Math.pow((x - (48 - secondary * 0.08)) / 13, 2)) + 0.05 * Math.sin(index); break;
        case "inspection": x = index * primary; y = Math.abs(Math.sin(index * 0.35) * 0.7) + (index === 28 ? 2.8 : 0); break;
        case "digital": x = p * 20; y = clamp(0.25 + p * 0.62 + Math.sin(index * 0.3) * 0.05, 0, 1); break;
        case "design": x = p * 10; y = 0.55 + 0.24 * Math.sin(x * 0.7 + secondary * 0.008) + primary / 1800; break;
      }
      rows.push([Number(x).toFixed(4), Number(y).toFixed(4)]);
    }
    return {
      csv: rows.map((row) => row.join(",")).join("\n"),
      xHeader: config[0],
      yHeader: config[1],
      units: `主参数 ${primary}；次参数 ${secondary}`
    };
  }

  function derive(sim, primary, secondary, experiment, state) {
    switch (sim) {
      case "survey":
        return { value: `闭合差示意 ${formatNumber(primary * secondary * 0.0008, 2)} mm`, note: "按测站数、视线长度和等效测角误差估算。" };
      case "material":
        return { value: `28 d 强度示意 ${formatNumber(28 + primary * 0.08 + secondary * 0.35, 1)} MPa`, note: "水胶比、龄期和养护条件共同决定强度。" };
      case "mechanics":
        return { value: `名义应力 ${formatNumber(primary * 1000 / 5000, 2)} MPa`, note: "按当前载荷和示意截面积估算。" };
      case "soil":
        return { value: `干密度示意 ${formatNumber(2.03 - 0.0015 * Math.pow(primary - secondary * 13, 2), 3)} g/cm³`, note: "最佳含水率附近通常获得最大干密度。" };
      case "structural":
        return { value: `跨中挠度示意 ${formatNumber(primary * Math.pow(secondary, 3) / 8000, 2)} mm`, note: "挠度随跨度和荷载增加，与刚度成反比。" };
      case "alignment":
        return { value: `超高 h ≈ ${formatNumber(11.8 * secondary * secondary / Math.max(1, primary), 1)} mm`, note: "采用简化平衡超高公式，实际设计还需检算舒适度与欠超高。" };
      case "track":
        return { value: `动态轮载系数示意 ${formatNumber(1 + primary / 220 + secondary / 120, 3)}`, note: "速度和轴重提高会增加轨道动态响应。" };
      case "subgrade":
        return { value: `工后沉降示意 ${formatNumber(primary * (1.02 - secondary / 100) * 8, 1)} mm`, note: "填方高度越大、压实度越低，沉降越大。" };
      case "bridge":
        return { value: `跨中挠度示意 ${formatNumber(primary * Math.pow(secondary, 3) / 8200, 2)} mm`, note: "演示模型采用等截面梁简化估算。" };
      case "tunnel":
        return { value: `收敛示意 ${formatNumber((6 + secondary * 0.35) * (1 + primary / 220), 1)} mm`, note: "围岩级别、埋深和支护共同影响收敛。" };
      case "vibration":
        return { value: `主频示意 ${formatNumber(48 - secondary * 0.08 + primary * 0.06, 1)} Hz`, note: "速度与轨道刚度会改变轮轨系统主频。" };
      case "inspection": {
        const values = sample("inspection", primary, secondary)?.csv.split("\n").slice(1).map((row) => Number(row.split(",")[1]));
        const count = values ? values.filter((value) => value > secondary).length : 0;
        return { value: `超限点示意 ${count} 个`, note: "超限数量随采样间距和报警阈值变化。" };
      }
      case "digital":
        return { value: `采样周期 ${formatNumber(1000 / Math.max(1, primary), 1)} ms`, note: "采样频率决定状态更新速度与数据量。" };
      case "design":
        return { value: `速度目标 ${formatNumber(primary, 0)} km/h · 指标 ${formatNumber(secondary, 0)}%`, note: "需要在安全、造价、工期和环境之间进行权衡。" };
      default:
        return null;
    }
  }

  window.RailwaySim = { draw, sample, derive };
})();
