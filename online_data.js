"use strict";

(function () {
  const bridge = window.OptilabBridge;
  const state = {
    worldBank: null,
    excerpt: "",
    lastCsv: ""
  };

  function setStatus(id, text, type = "") {
    const element = document.getElementById(id);
    element.textContent = text;
    element.className = `web-status ${type}`.trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function publicHttpUrl(value) {
    let url;
    try {
      url = new URL(value);
    } catch {
      throw new Error("请输入完整的 http 或 https 网址");
    }
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("只支持 http 或 https 公开网址");
    }
    const host = url.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    ) {
      throw new Error("不允许访问本机或私有网络地址");
    }
    return url;
  }

  async function fetchWithTimeout(url, options = {}, timeout = 20000) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeout);
    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
        mode: "cors",
        cache: "no-store"
      });
    } finally {
      window.clearTimeout(timer);
    }
  }

  async function loadWorldBank() {
    const country = document.getElementById("worldbank-country").value;
    const indicator = document.getElementById("worldbank-indicator").value;
    const rows = document.getElementById("worldbank-rows").value;
    const button = document.getElementById("worldbank-fetch");
    const importButton = document.getElementById("worldbank-import");
    button.disabled = true;
    importButton.disabled = true;
    setStatus("worldbank-status", "正在读取 World Bank 公开指标…", "loading");
    try {
      const endpoint = `https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${encodeURIComponent(indicator)}?format=json&per_page=${encodeURIComponent(rows)}&date=1990:2026`;
      const response = await fetchWithTimeout(endpoint, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`World Bank 返回 HTTP ${response.status}`);
      const payload = await response.json();
      const items = Array.isArray(payload?.[1]) ? payload[1].filter((item) => item.value !== null) : [];
      if (!items.length) throw new Error("该国家与指标暂无可用数据");
      state.worldBank = {
        country: items[0].country?.value || country,
        indicator: items[0].indicator?.value || indicator,
        unit: items[0].unit || "",
        items: items.sort((a, b) => Number(a.date) - Number(b.date))
      };
      const tbody = document.querySelector("#worldbank-table tbody");
      tbody.innerHTML = items
        .slice()
        .sort((a, b) => Number(b.date) - Number(a.date))
        .map((item) => `<tr><td>${escapeHtml(item.date)}</td><td>${Number(item.value).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}</td></tr>`)
        .join("");
      document.getElementById("worldbank-meta").textContent =
        `${state.worldBank.country} · ${state.worldBank.indicator}${state.worldBank.unit ? ` · ${state.worldBank.unit}` : ""}`;
      importButton.disabled = false;
      setStatus("worldbank-status", `已获取 ${items.length} 条公开数据，可导入为实验数据。`, "success");
    } catch (error) {
      state.worldBank = null;
      document.querySelector("#worldbank-table tbody").innerHTML = '<tr><td colspan="2">获取失败</td></tr>';
      setStatus("worldbank-status", error.name === "AbortError" ? "请求超时，请稍后重试。" : error.message, "error");
    } finally {
      button.disabled = false;
    }
  }

  function importWorldBank() {
    if (!state.worldBank) return;
    const headerX = "Year";
    const headerY = state.worldBank.indicator.replaceAll(",", " ");
    const csv = [
      [headerX, headerY],
      ...state.worldBank.items.map((item) => [item.date, item.value])
    ].map((row) => row.join(",")).join("\n");
    bridge.ingestExternalData(csv, `WorldBank_${state.worldBank.country}_${document.getElementById("worldbank-indicator").value}.csv`);
    document.getElementById("data-section").scrollIntoView({ behavior: "smooth", block: "start" });
    bridge.showToast("网络数据已导入，并已生成新的实验报告版本");
  }

  function htmlToExcerpt(html) {
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    documentNode.querySelectorAll("script,style,noscript,svg,canvas,iframe,nav,footer").forEach((node) => node.remove());
    const title = documentNode.title?.trim() || "网页摘录";
    const main = documentNode.querySelector("article,main") || documentNode.body;
    const text = (main?.textContent || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim()
      .slice(0, 12000);
    return `# ${title}\n\n来源：${document.getElementById("web-source-url").value}\n访问时间：${new Date().toLocaleString("zh-CN", { hour12: false })}\n\n${text}`;
  }

  async function fetchWebText() {
    const button = document.getElementById("web-text-fetch");
    button.disabled = true;
    setStatus("web-source-status", "正在读取公开网页…", "loading");
    try {
      const url = publicHttpUrl(document.getElementById("web-source-url").value.trim());
      const response = await fetchWithTimeout(url, {
        headers: { Accept: "text/html,text/plain,application/json,text/csv;q=0.9,*/*;q=0.5" }
      });
      if (!response.ok) throw new Error(`目标网站返回 HTTP ${response.status}`);
      const contentType = response.headers.get("content-type") || "";
      const raw = await response.text();
      state.excerpt = contentType.includes("html")
        ? htmlToExcerpt(raw)
        : `# 网页数据摘录\n\n来源：${url.href}\n访问时间：${new Date().toLocaleString("zh-CN", { hour12: false })}\n\n${raw.slice(0, 12000)}`;
      const excerpt = document.getElementById("web-excerpt");
      excerpt.textContent = state.excerpt;
      document.getElementById("copy-web-excerpt").disabled = false;
      setStatus("web-source-status", `已摘录 ${state.excerpt.length.toLocaleString("zh-CN")} 个字符。请核对来源和数据版本。`, "success");
    } catch (error) {
      state.excerpt = "";
      document.getElementById("web-excerpt").textContent = error.message;
      document.getElementById("copy-web-excerpt").disabled = true;
      setStatus(
        "web-source-status",
        error.name === "AbortError"
          ? "请求超时。"
          : `${error.message}。若目标网站不允许跨域，请下载官方 CSV/JSON 后上传。`,
        "error"
      );
    } finally {
      button.disabled = false;
    }
  }

  function jsonToCsv(data) {
    const rows = Array.isArray(data)
      ? data
      : Array.isArray(data?.message?.items)
        ? data.message.items
        : ["results", "items", "data", "records"]
          .map((key) => data?.[key])
          .find(Array.isArray);
    if (!Array.isArray(rows) || !rows.length) throw new Error("JSON 中未找到可转换的对象数组");
    if (Array.isArray(rows[0])) {
      return rows.map((row) => row.map((value) => JSON.stringify(value ?? "")).join(",")).join("\n");
    }
    if (typeof rows[0] !== "object") throw new Error("JSON 数组需要包含对象或二维数组");
    const allHeaders = [...new Set(rows.flatMap((item) => Object.keys(item)))];
    const scalarHeaders = allHeaders.filter((header) =>
      rows.some((item) => {
        const value = item[header];
        return value === null || ["string", "number", "boolean"].includes(typeof value);
      })
    );
    const numericHeaders = scalarHeaders.filter((header) => {
      const valid = rows.filter((item) => item[header] !== "" && item[header] !== null && Number.isFinite(Number(item[header]))).length;
      return valid >= Math.max(2, rows.length * 0.6);
    });
    const preferredTextHeaders = ["title", "display_name", "doi", "id", "publication_date", "type"];
    const textHeaders = [
      ...preferredTextHeaders.filter((header) => scalarHeaders.includes(header)),
      ...scalarHeaders.filter((header) => !numericHeaders.includes(header) && !preferredTextHeaders.includes(header))
    ].slice(0, 5);
    const headers = numericHeaders.length >= 2
      ? [...numericHeaders, ...textHeaders]
      : ["__row_index", ...numericHeaders, ...textHeaders];
    const escape = (value) => {
      if (typeof value === "number" || typeof value === "boolean") return String(value);
      const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
      return `"${text.replaceAll('"', '""')}"`;
    };
    return [
      headers.map(escape).join(","),
      ...rows.map((item, index) => headers.map((header) => escape(header === "__row_index" ? index + 1 : item[header])).join(","))
    ].join("\n");
  }

  async function importWebData() {
    const button = document.getElementById("web-csv-import");
    button.disabled = true;
    setStatus("web-source-status", "正在读取公开数据文件…", "loading");
    try {
      const url = publicHttpUrl(document.getElementById("web-source-url").value.trim());
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error(`目标网站返回 HTTP ${response.status}`);
      const contentType = (response.headers.get("content-type") || "").toLowerCase();
      const raw = await response.text();
      let csv = raw;
      if (contentType.includes("json") || raw.trim().startsWith("[") || raw.trim().startsWith("{")) {
        const parsed = JSON.parse(raw);
        csv = jsonToCsv(parsed);
      }
      if (!csv.includes(",") && !csv.includes("\t") && !csv.includes(";")) {
        throw new Error("响应内容不是可识别的 CSV/JSON 表格");
      }
      state.lastCsv = csv;
      bridge.ingestExternalData(csv, `网页数据_${url.hostname}.csv`);
      document.getElementById("data-section").scrollIntoView({ behavior: "smooth", block: "start" });
      bridge.showToast("公开数据已导入，并生成新的实验报告版本");
      setStatus("web-source-status", "数据导入成功。", "success");
    } catch (error) {
      setStatus(
        "web-source-status",
        error.name === "AbortError"
          ? "请求超时。"
          : `${error.message}。浏览器只能读取允许 CORS 的公开地址。`,
        "error"
      );
    } finally {
      button.disabled = false;
    }
  }

  async function copyExcerpt() {
    if (!state.excerpt) return;
    try {
      await navigator.clipboard.writeText(state.excerpt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = state.excerpt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    bridge.showToast("网页摘录已复制");
  }

  function initialize() {
    document.getElementById("worldbank-fetch").addEventListener("click", loadWorldBank);
    document.getElementById("worldbank-import").addEventListener("click", importWorldBank);
    document.getElementById("web-text-fetch").addEventListener("click", fetchWebText);
    document.getElementById("web-csv-import").addEventListener("click", importWebData);
    document.getElementById("copy-web-excerpt").addEventListener("click", copyExcerpt);
    document.getElementById("web-sample-url").addEventListener("click", () => {
      document.getElementById("web-source-url").value =
        "https://api.openalex.org/works?search=railway%20track&per-page=8";
      setStatus("web-source-status", "已填入 OpenAlex 公开 JSON 示例，可点击“导入 CSV / JSON”测试。");
    });
  }

  window.OnlineDataStudio = {
    getLastCsv: () => state.lastCsv,
    getWorldBank: () => state.worldBank,
    jsonToCsv
  };

  initialize();
})();
