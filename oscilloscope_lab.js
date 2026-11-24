"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const studio = document.getElementById("oscilloscope-studio");
  const voltageTable = document.getElementById("osc-voltage-table");
  const lissajousTable = document.getElementById("lissajous-table");
  const lissajousCanvas = document.getElementById("lissajous-canvas");
  const lissajousContext = lissajousCanvas.getContext("2d");

  const exampleVoltageRows = [
    { channel: "CH1", sourceFrequency: 200, sourceVoltage: 3, voltsDiv: 1, divY: 3.2, timeDiv: 1, divX: 5 },
    { channel: "CH2", sourceFrequency: 1000, sourceVoltage: 5, voltsDiv: 1, divY: 5.2, timeDiv: 0.5, divX: 2 }
  ];
  const voltageRows = exampleVoltageRows.map((row) => ({ ...row }));
  const lissajousPresets = [
    { ratio: "1/1", fx: 200, fy: 200, phase: 45 },
    { ratio: "1/2", fx: 400, fy: 200, phase: 45 },
    { ratio: "1/3", fx: 600, fy: 200, phase: 90 },
    { ratio: "3/1", fx: 200, fy: 600, phase: 135 },
    { ratio: "2/3", fx: 600, fy: 400, phase: 45 }
  ];
  let activePreset = 0;
  let animationFrame = null;
  let phase = 0;
  let lastTime = 0;
  let visible = false;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function format(value, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    return value.toLocaleString("zh-CN", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function voltageResults(row) {
    const vpp = row.voltsDiv * row.divY;
    const vrms = vpp / (2 * Math.sqrt(2));
    const period = row.timeDiv * row.divX;
    const measuredFrequency = period > 0 ? 1000 / period : NaN;
    return { vpp, vrms, period, measuredFrequency };
  }

  function renderVoltageTable() {
    voltageTable.innerHTML = `
      <table class="osc-voltage-table">
        <thead>
          <tr>
            <th rowspan="2">信号源参数</th>
            <th rowspan="2">f<sub>源</sub><br>Hz</th>
            <th rowspan="2">V<sub>源</sub><br>V</th>
            <th colspan="4">电压测量</th>
            <th colspan="4">频率测量</th>
          </tr>
          <tr>
            <th>VOLTS<br>/DIV</th>
            <th>DIV(y)<br>格数</th>
            <th>V<sub>pp</sub><br>V</th>
            <th>V<sub>rms</sub><br>V</th>
            <th>TIME<br>/DIV ms</th>
            <th>DIV(x)<br>格数</th>
            <th>T<br>ms</th>
            <th>f<br>Hz</th>
          </tr>
        </thead>
        <tbody>
          ${voltageRows.map((row, index) => {
            const result = voltageResults(row);
            return `<tr data-voltage-row="${index}">
              <td><strong>${row.channel}</strong></td>
              <td><input data-field="sourceFrequency" aria-label="${row.channel}信号源频率" type="number" min="1" max="100000" value="${row.sourceFrequency}"></td>
              <td><input data-field="sourceVoltage" aria-label="${row.channel}信号源电压" type="number" min="0.01" max="100" step="0.1" value="${row.sourceVoltage}"></td>
              <td><input data-field="voltsDiv" aria-label="${row.channel}电压档位" type="number" min="0.01" max="50" step="0.1" value="${row.voltsDiv}"></td>
              <td><input data-field="divY" aria-label="${row.channel}垂直格数" type="number" min="0.1" max="20" step="0.1" value="${row.divY}"></td>
              <td class="computed">${format(result.vpp, 2)}</td>
              <td class="computed">${format(result.vrms, 3)}</td>
              <td><input data-field="timeDiv" aria-label="${row.channel}时基档位" type="number" min="0.001" max="1000" step="0.01" value="${row.timeDiv}"></td>
              <td><input data-field="divX" aria-label="${row.channel}水平格数" type="number" min="0.1" max="20" step="0.1" value="${row.divX}"></td>
              <td class="computed">${format(result.period, 3)}</td>
              <td class="computed">${format(result.measuredFrequency, 1)}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>`;
    voltageTable.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        const rowElement = input.closest("[data-voltage-row]");
        const index = Number(rowElement.dataset.voltageRow);
        voltageRows[index][input.dataset.field] = Number(input.value);
        const result = voltageResults(voltageRows[index]);
        rowElement.querySelectorAll(".computed")[0].textContent = format(result.vpp, 2);
        rowElement.querySelectorAll(".computed")[1].textContent = format(result.vrms, 3);
        rowElement.querySelectorAll(".computed")[2].textContent = format(result.period, 3);
        rowElement.querySelectorAll(".computed")[3].textContent = format(result.measuredFrequency, 1);
        document.getElementById("osc-voltage-status").textContent =
          `${voltageRows[index].channel}：Vpp=${format(result.vpp, 2)} V，有效值=${format(result.vrms, 3)} V，频率=${format(result.measuredFrequency, 1)} Hz`;
      });
    });
  }

  function phaseLabel(degrees) {
    if (degrees === 0) return "0";
    if (degrees === 45) return "π/4";
    if (degrees === 90) return "π/2";
    if (degrees === 135) return "3π/4";
    if (degrees === 180) return "π";
    if (degrees === 270) return "3π/2";
    return `${degrees}°`;
  }

  function drawLissajous(canvas, ratio, phaseDegrees, progress = 1) {
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const ratioDpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    if (canvas.width !== Math.round(width * ratioDpr) || canvas.height !== Math.round(height * ratioDpr)) {
      canvas.width = Math.round(width * ratioDpr);
      canvas.height = Math.round(height * ratioDpr);
    }
    context.setTransform(ratioDpr, 0, 0, ratioDpr, 0, 0);
    context.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
    const radiusX = width * 0.36;
    const radiusY = height * 0.36;
    context.save();
    context.strokeStyle = "rgba(155, 213, 176, 0.16)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(centerX, height * 0.08);
    context.lineTo(centerX, height * 0.92);
    context.moveTo(width * 0.08, centerY);
    context.lineTo(width * 0.92, centerY);
    context.stroke();
    context.beginPath();
    for (let index = 0; index <= 360; index += 1) {
      const t = index / 360 * Math.PI * 2;
      const x = centerX + Math.sin(t) * radiusX;
      const y = centerY + Math.sin(ratio * t + phaseDegrees * Math.PI / 180) * radiusY;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = "#d7b16e";
    context.lineWidth = 2;
    context.shadowColor = "rgba(225, 179, 101, 0.4)";
    context.shadowBlur = 8;
    context.stroke();
    if (progress < 1) {
      context.fillStyle = "#f0c77c";
      context.beginPath();
      context.arc(
        centerX + Math.sin(progress * Math.PI * 2) * radiusX,
        centerY + Math.sin(ratio * progress * Math.PI * 2 + phaseDegrees * Math.PI / 180) * radiusY,
        3,
        0,
        Math.PI * 2
      );
      context.fill();
    }
    context.restore();
  }

  function presetAtRatio(ratio) {
    return lissajousPresets.find((preset) => preset.ratio === ratio) || lissajousPresets[0];
  }

  function ratioValue(ratio) {
    const [nx, ny] = ratio.split("/").map(Number);
    return nx / ny;
  }

  function updateLissajousControls() {
    const ratio = document.getElementById("lissajous-ratio").value;
    const phaseDegrees = Number(document.getElementById("lissajous-phase").value);
    const fx = Number(document.getElementById("lissajous-frequency").value);
    const fy = fx * ratioValue(ratio);
    activePreset = lissajousPresets.findIndex((preset) => preset.ratio === ratio);
    document.getElementById("lissajous-phase-value").textContent = `${phaseDegrees}°`;
    document.getElementById("lissajous-frequency-pair").textContent = `${format(fx, 0)} : ${format(fy, 0)} Hz`;
    document.getElementById("lissajous-ratio-label").textContent = `Nx/Ny = ${ratio}`;
    document.getElementById("lissajous-phase-label").textContent = `Δφ = ${phaseLabel(phaseDegrees)}`;
    lissajousTable.querySelectorAll(".lissajous-preset").forEach((button) => {
      button.classList.toggle("active", button.dataset.ratio === ratio);
    });
    drawLissajous(lissajousCanvas, ratioValue(ratio), phaseDegrees);
  }

  function renderLissajousPresets() {
    lissajousTable.innerHTML = lissajousPresets.map((preset, index) => `
      <button class="lissajous-preset ${index === activePreset ? "active" : ""}" data-ratio="${preset.ratio}" data-index="${index}">
        <canvas aria-label="李萨如图形 ${preset.ratio}"></canvas>
        <strong>${preset.ratio}</strong>
        <small>fx ${preset.fx} Hz · fy ${preset.fy} Hz</small>
        <small>Δφ = ${phaseLabel(preset.phase)}</small>
      </button>
    `).join("");
    lissajousTable.querySelectorAll(".lissajous-preset").forEach((button) => {
      const preset = lissajousPresets[Number(button.dataset.index)];
      drawLissajous(button.querySelector("canvas"), ratioValue(preset.ratio), preset.phase);
      button.addEventListener("click", () => {
        activePreset = Number(button.dataset.index);
        document.getElementById("lissajous-ratio").value = preset.ratio;
        document.getElementById("lissajous-phase").value = preset.phase;
        document.getElementById("lissajous-frequency").value = preset.fx;
        updateLissajousControls();
      });
    });
  }

  function animate(time) {
    if (!visible) return;
    if (!lastTime) lastTime = time;
    const delta = Math.min(50, time - lastTime);
    lastTime = time;
    phase += delta * 0.0005;
    const ratio = document.getElementById("lissajous-ratio").value;
    const phaseDegrees = Number(document.getElementById("lissajous-phase").value);
    drawLissajous(lissajousCanvas, ratioValue(ratio), phaseDegrees, (Math.sin(phase) + 1) / 2);
    animationFrame = requestAnimationFrame(animate);
  }

  function loadExample() {
    exampleVoltageRows.forEach((row, index) => Object.assign(voltageRows[index], row));
    renderVoltageTable();
    document.getElementById("osc-voltage-status").textContent = "已载入图片中的 CH1 与 CH2 示例数据。";
  }

  function voltageCsv() {
    const headers = ["SignalFrequency_Hz", "Vpp_V", "MeasuredFrequency_Hz", "Vrms_V", "Period_ms"];
    return [
      headers.join(","),
      ...voltageRows.map((row) => {
        const result = voltageResults(row);
        return [row.sourceFrequency, result.vpp.toFixed(4), result.measuredFrequency.toFixed(3), result.vrms.toFixed(4), result.period.toFixed(4)].join(",");
      })
    ].join("\n");
  }

  function lissajousCsv() {
    return [
      "fx_Hz,fy_Hz,phase_deg,ratio",
      ...lissajousPresets.map((preset) => [preset.fx, preset.fy, preset.phase, ratioValue(preset.ratio)].join(","))
    ].join("\n");
  }

  function generateVoltageReport() {
    bridge.ingestExternalData(voltageCsv(), "示波器_电压频率_表1.csv");
    bridge.showToast("表1数据已生成新报告");
    document.getElementById("data-section").scrollIntoView({ behavior: "smooth" });
  }

  function generateLissajousReport() {
    bridge.ingestExternalData(lissajousCsv(), "示波器_李萨如_表2.csv");
    bridge.showToast("表2数据已生成新报告");
    document.getElementById("data-section").scrollIntoView({ behavior: "smooth" });
  }

  function setVisible(value) {
    visible = value;
    studio.hidden = !value;
    if (!value) return;
    renderVoltageTable();
    renderLissajousPresets();
    updateLissajousControls();
    if (!animationFrame) animationFrame = requestAnimationFrame(animate);
  }

  function initialize() {
    renderVoltageTable();
    renderLissajousPresets();
    updateLissajousControls();
    document.getElementById("lissajous-ratio").addEventListener("change", updateLissajousControls);
    document.getElementById("lissajous-phase").addEventListener("input", updateLissajousControls);
    document.getElementById("lissajous-frequency").addEventListener("input", updateLissajousControls);
    document.getElementById("load-oscilloscope-example").addEventListener("click", loadExample);
    document.getElementById("osc-voltage-report").addEventListener("click", generateVoltageReport);
    document.getElementById("osc-lissajous-report").addEventListener("click", generateLissajousReport);
  }

  window.OscilloscopeStudio = { setVisible };
  initialize();
})();
