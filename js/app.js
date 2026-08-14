/**
 * 燕郊非遗田野档案 H5 · v2.1 游客互动增强
 * 配置注入、进度、动画、留言、配乐、工序章节、地图弹层、
 * 图集、掐丝游戏、对比滑块、打卡海报；印章事件挂钩
 */
(function () {
  "use strict";

  const NAV_SECTIONS = ["home", "cloisonne", "play", "engage", "team"];
  const progressBar = document.getElementById("progress");
  const navLinks = document.querySelectorAll(".nav a");
  const revealEls = document.querySelectorAll(".reveal");
  const submitBtn = document.getElementById("submitMessage");
  const messageInput = document.getElementById("messageInput");
  const nicknameInput = document.getElementById("nicknameInput");
  const messageList = document.getElementById("messageList");
  const clearBtn = document.getElementById("clearMessages");
  const shareBtn = document.getElementById("sharePage");
  const reactionRow = document.getElementById("reactionRow");
  const reactionResult = document.getElementById("reactionResult");
  const toastEl = document.getElementById("toast");
  let toastTimer = null;

  function cfg() {
    return window.PROJECT_CONFIG || {};
  }

  function getByPath(obj, path) {
    return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2200);
  }
  window.showToast = showToast;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyConfig() {
    const conf = cfg();
    document.querySelectorAll("[data-config]").forEach((el) => {
      const value = getByPath(conf, el.getAttribute("data-config"));
      if (value !== undefined && value !== null && value !== "") {
        el.textContent = String(value);
      }
    });

    document.querySelectorAll("[data-config-href]").forEach((el) => {
      const value = getByPath(conf, el.getAttribute("data-config-href"));
      if (value) el.setAttribute("href", value);
    });

    document.querySelectorAll("[data-config-src]").forEach((el) => {
      const value = getByPath(conf, el.getAttribute("data-config-src"));
      if (value) el.setAttribute("src", value);
    });

    document.querySelectorAll("[data-config-poster]").forEach((el) => {
      const value = getByPath(conf, el.getAttribute("data-config-poster"));
      if (value) el.setAttribute("poster", value);
    });

    if (conf.meta && conf.meta.title) {
      document.title = conf.meta.title + " · 游客互动版";
    }

    if (conf.stats) {
      ["observeCount", "interviewCount", "routeCount"].forEach((key) => {
        document.querySelectorAll(`[data-config="stats.${key}"]`).forEach((el) => {
          el.setAttribute("data-count", String(conf.stats[key]));
        });
      });
    }

    const prompt = document.getElementById("messagePrompt");
    if (prompt && conf.interaction && conf.interaction.prompt) {
      prompt.textContent = conf.interaction.prompt;
    }
    if (nicknameInput && conf.interaction) {
      nicknameInput.placeholder = conf.interaction.nicknamePlaceholder || "昵称（可选）";
    }
    if (messageInput && conf.interaction) {
      messageInput.placeholder = conf.interaction.messagePlaceholder || "写下你的看法……";
    }

    const versionTag = document.getElementById("versionTag");
    if (versionTag) {
      const ver = conf.version || "2.0.0";
      const status = conf.deliveryStatus || "";
      versionTag.textContent = status ? `${status} · v${ver}` : `v${ver}`;
    }

    const boardHint = document.getElementById("boardHint");
    if (boardHint && conf.links && conf.links.feedbackForm) {
      boardHint.textContent = "已配置问卷星：提交将打开正式反馈表单。";
    }
  }

  function updateProgress() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    const percent = scrollHeight <= clientHeight ? 0 : (scrollTop / (scrollHeight - clientHeight)) * 100;
    if (progressBar) progressBar.style.width = `${percent}%`;
  }

  function pageTop(el) {
    if (!el) return 0;
    return el.getBoundingClientRect().top + window.pageYOffset;
  }

  function scrollToId(id, offset) {
    const target = document.getElementById(id);
    if (!target) return false;
    const gap = typeof offset === "number" ? offset : 20;
    window.scrollTo({ top: Math.max(0, pageTop(target) - gap), behavior: "smooth" });
    return true;
  }

  function updateActiveNav() {
    let current = "home";
    const y = window.scrollY;
    NAV_SECTIONS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && y >= pageTop(el) - 120) current = id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const active =
        href === `#${current}` || (current === "engage" && href === "#passportCard");
      link.classList.toggle("active", active);
    });
  }

  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("show"));
      document.querySelectorAll(".stagger").forEach((el) => el.classList.add("show"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => observer.observe(el));

    const staggerObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const cards = entry.target.querySelectorAll(".stagger");
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add("show"), i * 120);
          });
          staggerObs.unobserve(entry.target);
        });
      },
      { threshold: 0.12 }
    );

    const stack = document.querySelector(".findings-stack");
    if (stack) staggerObs.observe(stack);
  }

  function initParallax() {
    const orbs = document.querySelectorAll("[data-parallax]");
    if (!orbs.length) return;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        orbs.forEach((orb) => {
          const factor = Number(orb.getAttribute("data-parallax")) || 0;
          orb.style.transform = `translate3d(0, ${y * factor}px, 0)`;
        });
      },
      { passive: true }
    );
  }

  function initAccordion() {
    const root = document.getElementById("problemAccordion");
    if (!root) return;
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-trigger");
      if (!btn) return;
      const item = btn.closest(".acc-item");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ===== 配乐：优先 mp3《沧涟》，失败再退回 Web Audio 氛围音 ===== */
  function initBgm() {
    const toggle = document.getElementById("bgmToggle");
    if (!toggle) return;

    // 保证开关始终可见（不被脚本误藏）
    toggle.hidden = false;
    toggle.removeAttribute("hidden");
    toggle.style.display = "inline-flex";
    toggle.style.visibility = "visible";
    toggle.style.opacity = "1";

    const mediaConf = () => (cfg().media || {});
    const bgmFileVolume = () => {
      const v = Number(mediaConf().bgmVolume);
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
    };
    const bgmAmbientLevel = () => 0.22;

    const key = (cfg().interaction && cfg().interaction.bgmKey) || "yanjiao-ich-bgm-muted-v2";
    const ver = (cfg().version || "2.2.18").toString();
    let muted = false;
    try {
      muted = localStorage.getItem(key) === "1";
    } catch (e) {
      muted = false;
    }
    let audioEl = null;
    let audioCtx = null;
    let masterGain = null;
    let usingFile = false;
    let fileFailed = false;
    let playPending = false;
    let playPromise = null;
    let hintShown = false;
    let unlockBound = false;
    /** 视频播放时临时停配乐，不改动用户静音偏好 */
    let pausedForMedia = false;

    function setUi() {
      toggle.classList.toggle("is-muted", muted);
      toggle.setAttribute("aria-pressed", muted ? "false" : "true");
      toggle.setAttribute("aria-label", muted ? "配乐已关，点击开启" : "配乐已开，点击关闭");
      const label = toggle.querySelector(".bgm-label");
      if (label) label.textContent = muted ? "已关" : "配乐";
    }

    function isFilePlaying() {
      return !!(usingFile && audioEl && !audioEl.paused && !audioEl.muted && !muted);
    }

    function pauseBgmForMedia() {
      pausedForMedia = true;
      if (audioEl && !audioEl.paused) {
        try {
          audioEl.pause();
        } catch (e) {
          /* ignore */
        }
      }
      if (audioCtx && audioCtx.state === "running") {
        audioCtx.suspend().catch(() => {});
      }
    }

    function resumeBgmAfterMedia() {
      if (!pausedForMedia) return;
      pausedForMedia = false;
      if (muted) return;
      if (usingFile && audioEl) {
        audioEl.muted = false;
        audioEl.play().catch(() => {});
        return;
      }
      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
        if (masterGain) {
          masterGain.gain.setTargetAtTime(bgmAmbientLevel(), audioCtx.currentTime, 0.05);
        }
        return;
      }
      tryStart();
    }

    function ensureAudioEl() {
      if (audioEl || fileFailed) return audioEl;
      const base = (cfg().media && cfg().media.bgm) || "audio/bgm.mp3";
      const src = base + (base.indexOf("?") >= 0 ? "&" : "?") + "v=" + encodeURIComponent(ver);
      audioEl = new Audio(src);
      audioEl.loop = true;
      audioEl.preload = "auto";
      audioEl.volume = bgmFileVolume();
      audioEl.setAttribute("playsinline", "");
      audioEl.setAttribute("webkit-playsinline", "");
      audioEl.addEventListener("error", () => {
        fileFailed = true;
        usingFile = false;
        const code = audioEl && audioEl.error ? audioEl.error.code : 0;
        if (location.protocol === "file:") {
          showToast("本地 file:// 可能无法加载配乐，请用本地服务器打开");
        } else {
          showToast(code === 4 ? "配乐文件无法解码" : "配乐加载失败（请确认 audio/bgm.mp3）");
        }
      });
      return audioEl;
    }

    function startAmbient() {
      if (audioCtx || usingFile) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = muted ? 0 : bgmAmbientLevel();
      masterGain.connect(audioCtx.destination);

      [110, 164.81, 220].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = i === 0 ? "sine" : "triangle";
        osc.frequency.value = freq;
        g.gain.value = 0.36 - i * 0.08;
        osc.connect(g);
        g.connect(masterGain);
        osc.start();
      });
    }

    function applyMute() {
      if (audioEl) {
        audioEl.muted = muted;
        audioEl.volume = bgmFileVolume();
        if (!muted && usingFile && audioEl.paused && !pausedForMedia) {
          audioEl.play().catch(() => {});
        }
      }
      if (masterGain && audioCtx) {
        masterGain.gain.setTargetAtTime(
          muted || pausedForMedia ? 0 : bgmAmbientLevel(),
          audioCtx.currentTime,
          0.05
        );
        if (!muted && !pausedForMedia && audioCtx.state === "suspended") audioCtx.resume();
      }
      try {
        localStorage.setItem(key, muted ? "1" : "0");
      } catch (e) {
        /* private mode / quota */
      }
      setUi();
      document.dispatchEvent(new CustomEvent("bgm:change", { detail: { muted } }));
      window.__bgmMuted = muted;
    }

    function playFile() {
      const el = ensureAudioEl();
      if (!el || fileFailed) return Promise.resolve(false);
      if (pausedForMedia) return Promise.resolve(false);
      if (playPending && playPromise) return playPromise;
      el.muted = muted;
      playPending = true;
      playPromise = el
        .play()
        .then(() => {
          playPending = false;
          usingFile = true;
          removeUnlock();
          if (pausedForMedia) {
            try {
              el.pause();
            } catch (e) {
              /* ignore */
            }
            return true;
          }
          if (audioCtx) {
            try {
              audioCtx.close();
            } catch (e) {
              /* ignore */
            }
            audioCtx = null;
            masterGain = null;
          }
          return true;
        })
        .catch((err) => {
          playPending = false;
          const name = err && err.name;
          if (name === "NotAllowedError" || name === "NotSupportedError") {
            if (!hintShown && !muted) {
              hintShown = true;
              showToast("点一下页面开启配乐《沧涟》");
            }
            return false;
          }
          if (fileFailed) {
            startAmbient();
            applyMute();
          }
          return false;
        });
      return playPromise;
    }

    function tryStart() {
      if (muted || pausedForMedia) return;
      if (usingFile && audioEl && !audioEl.paused) return;
      if (fileFailed) {
        startAmbient();
        applyMute();
        return;
      }
      playFile();
    }

    const unlockEvents = ["pointerdown", "touchstart", "keydown", "click"];
    function removeUnlock() {
      unlockEvents.forEach((ev) => document.removeEventListener(ev, onUnlock, true));
    }
    function onUnlock() {
      tryStart();
      applyMute();
      if (muted) removeUnlock();
    }

    function unlockListeners() {
      if (unlockBound) return;
      unlockBound = true;
      unlockEvents.forEach((ev) =>
        document.addEventListener(ev, onUnlock, { capture: true, passive: true })
      );
    }

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      // 尚未真正出声且 UI 为「开」：首次点开关只负责启动，不立刻翻成静音
      if (!muted && !isFilePlaying() && !fileFailed) {
        ensureAudioEl();
        playFile().then((ok) => {
          applyMute();
          showToast(ok || usingFile ? "已开启配乐《沧涟》" : "点一下页面开启配乐《沧涟》");
        });
        return;
      }
      muted = !muted;
      if (!muted) tryStart();
      applyMute();
      showToast(muted ? "已关闭配乐" : "已开启配乐《沧涟》");
    });

    unlockListeners();
    ensureAudioEl();
    window.__bgmMuted = muted;
    window.isBgmMuted = () => muted;
    window.pauseBgmForMedia = pauseBgmForMedia;
    window.resumeBgmAfterMedia = resumeBgmAfterMedia;
    setUi();

    if (!muted) {
      setTimeout(() => {
        if (!hintShown && !isFilePlaying() && !muted) {
          hintShown = true;
          showToast("点一下开启配乐《沧涟》");
        }
      }, 900);
    }
  }

  /* ===== 播视频时临时暂停配乐（不改静音偏好）===== */
  function initVideoBgmPause() {
    let resumeTimer = null;

    function videoVolume() {
      const v = Number((cfg().media || {}).videoVolume);
      return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1;
    }

    function videoGain() {
      const g = Number((cfg().media || {}).videoGain);
      return Number.isFinite(g) ? Math.min(4, Math.max(1, g)) : 2.4;
    }

    function boostVideo(video) {
      if (!video || video.dataset.gainBoosted === "1") return;
      video.volume = videoVolume();
      video.muted = false;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      try {
        const ctx = new AC();
        const src = ctx.createMediaElementSource(video);
        const gain = ctx.createGain();
        gain.gain.value = videoGain();
        src.connect(gain);
        gain.connect(ctx.destination);
        video.dataset.gainBoosted = "1";
        const resumeCtx = () => {
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
        };
        video.addEventListener("play", resumeCtx);
        video.addEventListener("playing", resumeCtx);
      } catch (e) {
        /* 部分环境不支持 MediaElementSource，仍保留 volume=1 */
        console.warn("[video-gain]", e);
      }
    }

    function anyVideoPlaying() {
      return Array.prototype.some.call(document.querySelectorAll("video"), (v) => !v.paused && !v.ended);
    }

    function onVideoPlay() {
      if (resumeTimer) {
        window.clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      if (typeof window.pauseBgmForMedia === "function") window.pauseBgmForMedia();
    }

    function onVideoStop() {
      if (resumeTimer) window.clearTimeout(resumeTimer);
      // 章节 seek 会先 pause 再 play，短延迟避免配乐闪断闪开
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        if (anyVideoPlaying()) return;
        if (typeof window.resumeBgmAfterMedia === "function") window.resumeBgmAfterMedia();
      }, 160);
    }

    document.querySelectorAll("video").forEach((video) => {
      boostVideo(video);
      video.addEventListener("play", onVideoPlay);
      video.addEventListener("playing", onVideoPlay);
      video.addEventListener("pause", onVideoStop);
      video.addEventListener("ended", onVideoStop);
    });
  }

  /* ===== 地图点位 ===== */
  function getPlaces() {
    return cfg().places || [];
  }

  function openPlaceModal(placeId) {
    const place = getPlaces().find((p) => p.id === placeId);
    if (!place) return;
    const modal = document.getElementById("placeModal");
    if (!modal) return;
    document.getElementById("placeModalTip").textContent = place.tip || "调研点位";
    document.getElementById("placeModalTitle").textContent = place.name;
    document.getElementById("placeModalDesc").textContent = place.desc || "";
    const nav = document.getElementById("placeModalNav");
    if (nav) nav.href = place.mapUrl || "#";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    document.dispatchEvent(new CustomEvent("place:opened", { detail: { place, placeId } }));
    if (typeof window.earnStamp === "function") window.earnStamp("map");
  }

  function closeModals() {
    document.querySelectorAll(".modal").forEach((m) => {
      m.hidden = true;
    });
    document.body.style.overflow = "";
  }

  function initDocumentaryLink() {
    const STORAGE_Y = "yanjiao:docReturnScroll";
    const STORAGE_PATH = "yanjiao:docReturnPath";
    const openBtn = document.getElementById("openDocumentary");

    function restoreScroll() {
      const raw = sessionStorage.getItem(STORAGE_Y);
      if (raw == null || raw === "") return;
      const y = Number(raw);
      sessionStorage.removeItem(STORAGE_Y);
      sessionStorage.removeItem(STORAGE_PATH);
      if (!Number.isFinite(y)) return;
      const apply = () => window.scrollTo(0, y);
      apply();
      window.requestAnimationFrame(apply);
      window.setTimeout(apply, 50);
      window.setTimeout(apply, 280);
    }

    // 从纪录片页返回时还原滚动位置
    restoreScroll();
    window.addEventListener("pageshow", restoreScroll);

    if (!openBtn) return;

    const href =
      (cfg().links && cfg().links.documentaryUrl) ||
      openBtn.getAttribute("href") ||
      "documentary.html";
    openBtn.setAttribute("href", href);

    openBtn.addEventListener("click", (e) => {
      // 记录当前位置，供纪录片页「返回」后还原
      const y = window.scrollY || window.pageYOffset || 0;
      try {
        sessionStorage.setItem(STORAGE_Y, String(y));
        sessionStorage.setItem(
          STORAGE_PATH,
          location.pathname.split("/").pop() || "index.html"
        );
      } catch (err) {
        /* private mode 等忽略 */
      }
      // 使用默认跳转到独立播放页
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || openBtn.target === "_blank") {
        return;
      }
      e.preventDefault();
      location.href = href;
    });
  }

  function initPlaces() {
    const list = document.getElementById("placeList");
    const places = getPlaces();
    if (list) {
      const items = places
        .map(
          (p) =>
            `<button type="button" class="place-item" data-place="${escapeHtml(p.id)}"><strong>${escapeHtml(p.name)}</strong><span>${escapeHtml(p.tip || "")}</span></button>`
        )
        .join("");
      list.innerHTML = `<h3>调研点位</h3><p class="muted-text place-hint">点击地图标记或下方条目，查看详情与导航</p>${items}`;
    }

    document.querySelectorAll("[data-place]").forEach((el) => {
      el.addEventListener("click", () => openPlaceModal(el.getAttribute("data-place")));
    });

    document.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", closeModals);
    });

    initRealMap(places);
  }

  function initRealMap(places) {
    const el = document.getElementById("realMap");
    const fallback = document.getElementById("mapFallback");
    if (!el) return;

    if (typeof window.L === "undefined") {
      if (fallback) fallback.hidden = false;
      return;
    }

    const points = (places || []).filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
    if (!points.length) {
      if (fallback) fallback.hidden = false;
      return;
    }

    const map = L.map(el, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false
    });

    // 中文底图（高德）；可切换影像图
    const road = L.tileLayer(
      "https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}",
      {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18,
        attribution: '&copy; <a href="https://www.amap.com/" target="_blank" rel="noopener">高德地图</a>'
      }
    );
    const satellite = L.layerGroup([
      L.tileLayer("https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}", {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18
      }),
      L.tileLayer("https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}", {
        subdomains: ["1", "2", "3", "4"],
        maxZoom: 18,
        opacity: 0.95
      })
    ]);

    road.addTo(map);
    L.control
      .layers(
        {
          中文地图: road,
          卫星影像: satellite
        },
        null,
        { position: "topright", collapsed: true }
      )
      .addTo(map);

    const goldIcon = L.divIcon({
      className: "map-pin-icon",
      html: '<span class="map-pin-dot"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
      popupAnchor: [0, -18]
    });

    const markers = points.map((p) => {
      const marker = L.marker([p.lat, p.lng], { icon: goldIcon }).addTo(map);
      marker.bindTooltip(p.shortName || p.name, {
        direction: "top",
        offset: [0, -16],
        className: "map-tooltip"
      });
      marker.on("click", () => openPlaceModal(p.id));
      return marker;
    });

    if (markers.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
    } else {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.35));
      // 路线连线
      L.polyline(
        points.map((p) => [p.lat, p.lng]),
        { color: "#f59e0b", weight: 3, opacity: 0.75, dashArray: "6 8" }
      ).addTo(map);
    }

    // 容器尺寸变化后刷新
    window.setTimeout(() => map.invalidateSize(), 200);
    window.addEventListener("resize", () => map.invalidateSize(), { passive: true });

    // 进入地图区时再刷新一次，避免首屏高度计算不准
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            map.invalidateSize();
            io.disconnect();
          }
        });
      });
      io.observe(el);
    }
  }

  /* ===== 工序章节：同一支视频内按 startSeconds 跳转 ===== */
  let processSeekToken = 0;

  function formatTimecode(sec) {
    const s = Math.max(0, Math.floor(Number(sec) || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  function resolveProcessVideoSrc(step) {
    const media = cfg().media || {};
    if (step && step.videoSrc) return step.videoSrc;
    if (step && step.videoKey && media[step.videoKey]) return media[step.videoKey];
    return media.cloisonneVideo || "videos/cloisonne-process.mp4";
  }

  function stripMediaFragment(url) {
    return String(url || "").split("#")[0];
  }

  function withTimeFragment(url, seconds) {
    const base = stripMediaFragment(url);
    const t = Math.max(0, Math.floor(Number(seconds) || 0));
    return t > 0 ? `${base}#t=${t}` : base;
  }

  function isTimeSeekable(video, t) {
    if (!video || !isFinite(video.duration) || video.duration <= 0) return false;
    if (!video.seekable || video.seekable.length === 0) {
      // 元数据已到但 seekable 尚未建立时，仍允许尝试（依赖 Range + faststart）
      return video.readyState >= 1;
    }
    for (let i = 0; i < video.seekable.length; i += 1) {
      if (t >= video.seekable.start(i) - 0.25 && t <= video.seekable.end(i) + 0.25) return true;
    }
    // 部分浏览器把整段标成可 seek
    return video.seekable.end(video.seekable.length - 1) + 0.5 >= t;
  }

  function fileKey(url) {
    const clean = stripMediaFragment(url || "");
    try {
      return decodeURIComponent(clean).split("?")[0].split("/").pop() || clean;
    } catch (e) {
      return clean;
    }
  }

  function ensureProcessVideoSrc(video, src) {
    if (!video || !src) return Promise.resolve(false);
    const base = stripMediaFragment(src);
    const activeKey = fileKey(video.getAttribute("data-active-src") || "");
    const nextKey = fileKey(base);
    const source = video.querySelector("source");
    const bound = activeKey && activeKey === nextKey;

    if (bound && isFinite(video.duration) && video.duration > 0 && video.readyState >= 1) {
      return Promise.resolve(false);
    }

    if (!bound) {
      video.setAttribute("data-active-src", base);
      if (source) {
        source.setAttribute("src", base);
        source.removeAttribute("data-src");
      }
      // 手机端（尤其 iOS）更认 video.src
      video.src = base;
      try {
        video.load();
      } catch (e) {
        /* ignore */
      }
    }

    if (isFinite(video.duration) && video.duration > 0 && video.readyState >= 1) {
      return Promise.resolve(!bound);
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (v) => {
        if (settled) return;
        settled = true;
        video.removeEventListener("loadedmetadata", onReady);
        video.removeEventListener("durationchange", onReady);
        resolve(v);
      };
      const onReady = () => {
        if (isFinite(video.duration) && video.duration > 0) done(!bound);
      };
      video.addEventListener("loadedmetadata", onReady);
      video.addEventListener("durationchange", onReady);
      window.setTimeout(() => done(!bound), 15000);
    });
  }

  function resolveStepTime(step, video) {
    if (typeof step.startSeconds === "number") return step.startSeconds;
    const duration = video && video.duration;
    if (duration && isFinite(duration) && typeof step.startRatio === "number") {
      return duration * step.startRatio;
    }
    return 0;
  }

  function clampProcessTime(video, target) {
    let t = Number(target) || 0;
    const duration = video && video.duration;
    if (duration && isFinite(duration) && duration > 0) {
      t = Math.min(Math.max(t, 0), Math.max(duration - 0.25, 0));
    }
    return t;
  }

  function jumpProcessTo(video, target, token) {
    if (!video || token !== processSeekToken) return;
    const t = clampProcessTime(video, target);

    const resume = () => {
      if (token !== processSeekToken) return;
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    const apply = () => {
      if (token !== processSeekToken) return;
      try {
        if (typeof video.fastSeek === "function") video.fastSeek(t);
        else video.currentTime = t;
      } catch (e) {
        try {
          video.currentTime = t;
        } catch (err) {
          /* ignore */
        }
      }
    };

    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resume();
      // 校验：部分手机 seek 后停住
      window.setTimeout(() => {
        if (token !== processSeekToken) return;
        if (Math.abs((video.currentTime || 0) - t) > 1.5) {
          apply();
        }
        resume();
      }, 220);
    };

    video.addEventListener("seeked", onSeeked);
    apply();
    resume();

    // 兜底：不派发 seeked 时仍继续播
    window.setTimeout(() => {
      if (token !== processSeekToken) return;
      video.removeEventListener("seeked", onSeeked);
      resume();
    }, 1200);
  }

  function seekProcess(stepId) {
    const steps = cfg().processSteps || [];
    const step = steps.find((s) => s.id === stepId) || steps[0];
    if (!step) return;
    const video = document.getElementById("processVideo");
    const tip = document.getElementById("chapterTip");
    const token = ++processSeekToken;
    const targetSec = typeof step.startSeconds === "number" ? step.startSeconds : 0;

    document.querySelectorAll(".chapter-chip").forEach((chip) => {
      chip.classList.toggle("active", chip.getAttribute("data-step") === step.id);
    });
    document.querySelectorAll("#processTimeline .step").forEach((el) => {
      el.classList.toggle("active", el.getAttribute("data-step") === step.id);
    });
    if (tip) {
      tip.textContent = `${step.title} · ${step.tip || "点击播放该段"} · ${formatTimecode(targetSec)}`;
    }

    if (step.id && step.id !== "intro" && step.id !== "full") {
      document.dispatchEvent(new CustomEvent("process:viewed", { detail: { stepId: step.id } }));
      if (typeof window.earnStamp === "function") window.earnStamp("process");
    }

    if (!video) {
      showToast("未找到视频播放器");
      return;
    }

    const src = resolveProcessVideoSrc(step);
    const base = stripMediaFragment(src);
    const source = video.querySelector("source");

    // —— 手机端关键路径：全部尽量落在点击同步调用栈 ——
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("x5-playsinline", "true");
    video.setAttribute("x5-video-player-type", "h5");
    video.playsInline = true;

    const needBind = fileKey(video.getAttribute("data-active-src") || "") !== fileKey(base);
    if (needBind) {
      video.setAttribute("data-active-src", base);
      if (source) source.setAttribute("src", base);
      video.src = base;
      try {
        video.load();
      } catch (e) {
        /* ignore */
      }
    }

    // 同步 play：保住手势，驱动 iOS 真正开始拉流
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }

    const runJump = () => {
      if (token !== processSeekToken) return;
      jumpProcessTo(video, targetSec, token);
    };

    if (isFinite(video.duration) && video.duration > 0 && video.readyState >= 1) {
      // 已有元数据：稍延迟一帧再 seek，避免与 play() 抢状态
      window.requestAnimationFrame(runJump);
      return;
    }

    const onMeta = () => {
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("durationchange", onMeta);
      // metadata 后必须再 play 一次（手机常见）
      video.play().then(runJump).catch(runJump);
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("durationchange", onMeta);
    window.setTimeout(() => {
      if (token !== processSeekToken) return;
      if (isFinite(video.duration) && video.duration > 0) onMeta();
    }, 800);
  }

  function initChapters() {
    const bar = document.getElementById("chapterBar");
    const steps = cfg().processSteps || [];
    const video = document.getElementById("processVideo");
    const media = cfg().media || {};
    const master = media.cloisonneVideo || "videos/cloisonne-process.mp4";

    if (video) {
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.setAttribute("x5-playsinline", "true");
      video.setAttribute("x5-video-player-type", "h5");
      video.playsInline = true;
      // 预绑定源，但不在无手势时强制 play
      ensureProcessVideoSrc(video, master);
    }

    if (bar) {
      bar.innerHTML = steps
        .map(
          (s, i) =>
            `<button type="button" class="chapter-chip${i === 0 ? " active" : ""}" data-step="${escapeHtml(s.id)}"${
              typeof s.startSeconds === "number" ? ` data-start="${s.startSeconds}"` : ""
            }${s.ariaLabel ? ` aria-label="${escapeHtml(s.ariaLabel)}"` : ""}>${escapeHtml(s.title)}</button>`
        )
        .join("");
      bar.addEventListener("click", (e) => {
        const chip = e.target.closest(".chapter-chip");
        if (!chip) return;
        e.preventDefault();
        const stepId = chip.getAttribute("data-step");
        const step = steps.find((s) => s.id === stepId);
        seekProcess(stepId);
        const at =
          step && typeof step.startSeconds === "number" ? `（${formatTimecode(step.startSeconds)}）` : "";
        showToast(stepId === "full" ? `从片头播放${at}` : `跳到「${chip.textContent}」${at}`);
      });
    }

    document.querySelectorAll("#processTimeline .step").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.getAttribute("data-step");
        if (!id) return;
        seekProcess(id);
      });
    });
  }

  /* ===== 图集 ===== */
  function initGallery() {
    const root = document.getElementById("gallery");
    if (!root) return;
    const items = cfg().gallery || [];
    root.innerHTML = items
      .map((item) => {
        const img = item.image
          ? `<img class="gallery-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />`
          : "";
        return `<article class="gallery-card tone-${escapeHtml(item.tone || "blue")}">${img}<div class="gallery-caption"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.subtitle || "")}</span></div></article>`;
      })
      .join("");
  }

  /* ===== 掐丝小游戏（多花纹可选）===== */
  function initFiligreeGame() {
    const svg = document.getElementById("filigreeGame");
    const drawPath = document.getElementById("drawPath");
    const guide = document.getElementById("guidePath");
    const decor = document.getElementById("patternDecor");
    const progressEl = document.getElementById("gameProgress");
    const tip = document.getElementById("gameTip");
    const unlock = document.getElementById("gameUnlock");
    const resetBtn = document.getElementById("gameReset");
    const patternBar = document.getElementById("patternBar");
    if (!svg || !drawPath || !guide || !patternBar) return;

    const PATTERNS = [
      {
        id: "peony",
        name: "宝相牡丹",
        tip: "按住拖动，描出牡丹掐丝轮廓",
        decor: '<circle cx="160" cy="148" r="96"/><circle cx="160" cy="148" r="78"/>',
        path: "M160 42 C188 42 212 58 224 82 C238 72 258 76 268 94 C280 116 272 142 254 154 C268 172 268 198 252 216 C234 238 204 246 178 238 C170 252 160 258 160 258 C160 258 150 252 142 238 C116 246 86 238 68 216 C52 198 52 172 66 154 C48 142 40 116 52 94 C62 76 82 72 96 82 C108 58 132 42 160 42 Z M160 88 C178 78 198 86 204 104 C218 100 232 112 228 128 C240 138 240 158 228 168 C232 184 218 196 204 192 C198 210 178 218 160 208 C142 218 122 210 116 192 C102 196 88 184 92 168 C80 158 80 138 92 128 C88 112 102 100 116 104 C122 86 142 78 160 88 Z M160 128 C172 128 180 138 180 148 C180 158 172 168 160 168 C148 168 140 158 140 148 C140 138 148 128 160 128 Z M72 148 C88 136 108 128 128 124 M248 148 C232 136 212 128 192 124 M160 72 C160 92 160 108 160 124 M112 100 C128 112 144 120 160 124 M208 100 C192 112 176 120 160 124"
      },
      {
        id: "lotus",
        name: "清莲出水",
        tip: "按住拖动，描出莲花与荷叶轮廓",
        decor: '<circle cx="160" cy="140" r="88"/><ellipse cx="160" cy="210" rx="40" ry="12"/>',
        path: "M160 58 C175 78 188 100 192 120 C210 108 230 112 236 132 C248 156 232 180 208 186 C214 206 198 224 176 228 C168 246 160 252 160 252 C160 252 152 246 144 228 C122 224 106 206 112 186 C88 180 72 156 84 132 C90 112 110 108 128 120 C132 100 145 78 160 58 Z M160 118 C172 118 182 130 180 144 C190 148 194 162 186 172 C178 184 164 186 160 176 C156 186 142 184 134 172 C126 162 130 148 140 144 C138 130 148 118 160 118 Z M118 198 C132 188 148 184 160 184 C172 184 188 188 202 198 M160 176 C160 190 160 204 160 220 M96 160 C70 168 58 188 62 208 C78 200 98 192 118 190 M224 160 C250 168 262 188 258 208 C242 200 222 192 202 190"
      },
      {
        id: "cloud",
        name: "祥云如意",
        tip: "按住拖动，描出祥云如意纹",
        decor: '<circle cx="160" cy="148" r="92"/><path d="M80 220 Q160 240 240 220" />',
        path: "M70 150 C70 118 96 96 128 102 C136 78 168 68 192 86 C214 70 248 82 252 112 C278 120 286 154 266 174 C278 198 258 224 228 220 C214 244 176 250 152 230 C128 248 90 236 84 206 C58 198 52 168 70 150 Z M118 148 C118 132 132 122 148 128 C152 114 170 110 182 122 C196 114 214 124 212 140 C226 146 228 166 214 174 C218 190 202 202 186 196 C176 208 156 206 150 192 C134 196 120 182 126 168 C112 162 110 150 118 148 Z M96 118 C108 108 124 112 128 126 M224 118 C212 108 196 112 192 126 M160 96 C160 112 160 124 160 136"
      },
      {
        id: "vine",
        name: "缠枝卷草",
        tip: "按住拖动，描出缠枝卷草纹",
        decor: '<rect x="48" y="48" width="224" height="184" rx="28"/><circle cx="160" cy="140" r="24"/>',
        path: "M56 140 C72 100 112 78 152 86 C168 70 200 74 214 98 C236 92 258 110 254 136 C268 156 260 186 236 196 C244 220 218 240 190 232 C174 248 144 246 130 226 C104 236 76 218 78 190 C56 178 48 156 56 140 Z M100 140 C108 118 132 110 150 122 C158 108 180 112 184 130 C200 128 212 144 204 160 C210 178 192 192 174 186 C164 200 142 196 138 178 C120 180 108 164 116 148 C108 144 102 148 100 140 Z M78 108 C98 96 120 104 128 122 M242 108 C222 96 200 104 192 122 M128 188 C146 200 174 200 192 188 M160 86 C160 104 160 118 160 132"
      },
      {
        id: "medallion",
        name: "八角团花",
        tip: "按住拖动，描出八角团花纹",
        decor: '<circle cx="160" cy="148" r="100"/><circle cx="160" cy="148" r="52"/>',
        path: "M160 48 L188 78 L228 70 L220 110 L250 138 L220 166 L228 206 L188 198 L160 228 L132 198 L92 206 L100 166 L70 138 L100 110 L92 70 L132 78 Z M160 88 L176 108 L200 102 L194 126 L216 144 L194 162 L200 186 L176 180 L160 200 L144 180 L120 186 L126 162 L104 144 L126 126 L120 102 L144 108 Z M160 124 C172 124 182 134 182 148 C182 162 172 172 160 172 C148 172 138 162 138 148 C138 134 148 124 160 124 Z M160 100 C160 112 160 120 160 124 M160 172 C160 184 160 192 160 200 M104 144 C116 144 126 144 138 144 M182 144 C194 144 204 144 216 144"
      }
    ];

    let drawing = false;
    let points = [];
    let hit = 0;
    let targets = [];
    let current = PATTERNS[0];
    let stamped = false;
    const totalSamples = 110;

    function rebuildTargets() {
      targets = [];
      hit = 0;
      const len = guide.getTotalLength();
      if (!len) return;
      for (let i = 0; i <= totalSamples; i++) {
        targets.push(guide.getPointAtLength((len * i) / totalSamples));
      }
    }

    function applyPattern(pattern) {
      current = pattern;
      guide.setAttribute("d", pattern.path);
      if (decor) decor.innerHTML = pattern.decor || "";
      drawPath.setAttribute("d", "");
      points = [];
      stamped = false;
      if (unlock) unlock.hidden = true;
      if (tip) tip.textContent = pattern.tip;
      patternBar.querySelectorAll(".pattern-chip").forEach((chip) => {
        chip.classList.toggle("active", chip.getAttribute("data-id") === pattern.id);
      });
      // 等 path 写入后再采样
      requestAnimationFrame(() => {
        rebuildTargets();
        updateProgress();
      });
    }

    function svgPoint(evt) {
      const pt = svg.createSVGPoint();
      const source = evt.touches ? evt.touches[0] : evt;
      pt.x = source.clientX;
      pt.y = source.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    function updateProgress() {
      const denom = targets.length || 1;
      const pct = Math.min(100, Math.round((hit / denom) * 100));
      if (progressEl) progressEl.textContent = `${pct}%`;
      if (pct >= 70) {
        if (unlock) unlock.hidden = false;
        if (tip) tip.textContent = "完成！你已经摸到掐丝的手感了";
        if (!stamped) {
          stamped = true;
          document.dispatchEvent(new CustomEvent("filigree:complete", { detail: { pattern: current.id } }));
          if (typeof window.earnStamp === "function") window.earnStamp("filigree");
        }
      }
    }

    function checkHits(p) {
      targets.forEach((t) => {
        if (t._done) return;
        const dx = t.x - p.x;
        const dy = t.y - p.y;
        if (dx * dx + dy * dy < 150) {
          t._done = true;
          hit += 1;
        }
      });
      updateProgress();
    }

    function onStart(evt) {
      drawing = true;
      const p = svgPoint(evt);
      // 新起一笔：追加 M，不清空已画路径
      const cmd = `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
      if (points.length) points.push(cmd);
      else points = [cmd];
      drawPath.setAttribute("d", points.join(" "));
      checkHits(p);
      evt.preventDefault();
    }

    function onMove(evt) {
      if (!drawing) return;
      const p = svgPoint(evt);
      points.push(`L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      drawPath.setAttribute("d", points.join(" "));
      checkHits(p);
      evt.preventDefault();
    }

    function onEnd() {
      drawing = false;
    }

    patternBar.innerHTML = PATTERNS.map(
      (p, i) =>
        `<button type="button" class="pattern-chip${i === 0 ? " active" : ""}" data-id="${p.id}" role="tab">${p.name}</button>`
    ).join("");

    patternBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".pattern-chip");
      if (!chip) return;
      const next = PATTERNS.find((p) => p.id === chip.getAttribute("data-id"));
      if (!next) return;
      applyPattern(next);
      showToast(`已切换：${next.name}`);
    });

    svg.addEventListener("pointerdown", onStart);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onEnd);
    svg.addEventListener("pointerleave", onEnd);
    svg.addEventListener("pointercancel", onEnd);

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        applyPattern(current);
        showToast("已重置当前花纹");
      });
    }

    applyPattern(PATTERNS[0]);
  }

  /* ===== 手工 vs 仿品滑块（标准 before/after：底层仿品 + 顶层手工 clip）===== */
  function initVsSlider() {
    const range = document.getElementById("vsRange");
    const hand = document.getElementById("vsHand");
    const handle = document.getElementById("vsHandle");
    if (!range || !hand) return;

    function apply() {
      const v = Number(range.value);
      /* 右侧裁掉 (100-v)%，左侧 v% 露出纯手工，与底层仿品对齐 */
      hand.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      hand.style.webkitClipPath = `inset(0 ${100 - v}% 0 0)`;
      if (handle) handle.style.left = `${v}%`;
    }

    range.addEventListener("input", apply);
    range.addEventListener("change", apply);
    apply();
  }

  /* ===== 打卡海报（精美版）===== */
  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function drawPoster() {
    const canvas = document.getElementById("posterCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const conf = cfg();

    // 更高清晰度
    canvas.width = 1080;
    canvas.height = 1440;
    const w = canvas.width;
    const h = canvas.height;
    const place = (conf.meta && conf.meta.surveyPlace) || "河北省廊坊市三河市";
    const time = (conf.meta && conf.meta.surveyTime) || "2026年7月";
    const team = (conf.meta && conf.meta.teamName) || "数字化调研实践团";
    const subtitle = (conf.cases && conf.cases.cloisonne && conf.cases.cloisonne.subtitle) || "工序见匠心，一器载山河";

    const heroImg = await loadImage("images/handmade-cloisonne.jpg");

    // 背景
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#07111f");
    bg.addColorStop(0.35, "#122447");
    bg.addColorStop(0.7, "#1e3a5f");
    bg.addColorStop(1, "#3b1d0f");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // 光晕
    drawGlow(ctx, 220, 260, 280, "rgba(212,175,55,0.18)");
    drawGlow(ctx, 860, 420, 260, "rgba(59,130,246,0.16)");
    drawGlow(ctx, 540, 1180, 320, "rgba(217,119,6,0.14)");

    // 细网格
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 40; y < h; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // 外金框
    drawOrnateFrame(ctx, 36, 36, w - 72, h - 72);

    // 顶栏印章区
    ctx.fillStyle = "rgba(253,230,138,0.12)";
    roundRect(ctx, 86, 78, 220, 46, 23);
    ctx.fill();
    ctx.fillStyle = "#fde68a";
    ctx.font = "600 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("景泰蓝田野打卡", 108, 108);

    // 主标题
    ctx.fillStyle = "#fff8e7";
    ctx.font = "700 72px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("工序见匠心", 86, 210);
    ctx.fillText("一器载山河", 86, 292);

    // 金线分隔
    drawGoldLine(ctx, 86, 320, 420);

    ctx.fillStyle = "rgba(226,232,240,0.88)";
    ctx.font = "28px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(subtitle, 86, 368);

    // 主图圆形框
    const cx = w / 2;
    const cy = 620;
    const r = 236;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r + 18, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 旋转装饰环
    drawFiligreeRing(ctx, cx, cy, r + 8);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    if (heroImg) {
      const scale = Math.max((r * 2) / heroImg.width, (r * 2) / heroImg.height) * 1.08;
      const iw = heroImg.width * scale;
      const ih = heroImg.height * scale;
      ctx.drawImage(heroImg, cx - iw / 2, cy - ih / 2, iw, ih);
      // 轻微暗角，让字更清楚
      const vignette = ctx.createRadialGradient(cx, cy, r * 0.45, cx, cy, r);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(7,17,31,0.35)");
      ctx.fillStyle = vignette;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    } else {
      const fallback = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
      fallback.addColorStop(0, "#1d4ed8");
      fallback.addColorStop(1, "#92400e");
      ctx.fillStyle = fallback;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.restore();

    // 圆框金边
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r - 10, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253,230,138,0.35)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 工序胶囊
    const steps = ["制胎", "掐丝", "点蓝", "烧蓝", "磨光", "镀金"];
    const chipW = 118;
    const gap = 14;
    const totalW = steps.length * chipW + (steps.length - 1) * gap;
    let chipX = (w - totalW) / 2;
    const chipY = 900;
    steps.forEach((name, i) => {
      const g = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + 44);
      g.addColorStop(0, i % 2 === 0 ? "rgba(253,230,138,0.22)" : "rgba(147,197,253,0.18)");
      g.addColorStop(1, "rgba(15,23,42,0.35)");
      ctx.fillStyle = g;
      roundRect(ctx, chipX, chipY, chipW, 44, 22);
      ctx.fill();
      ctx.strokeStyle = "rgba(253,230,138,0.45)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, chipX, chipY, chipW, 44, 22);
      ctx.stroke();
      ctx.fillStyle = "#f8fafc";
      ctx.font = "600 22px 'Microsoft YaHei', 'PingFang SC', sans-serif";
      const tw = ctx.measureText(name).width;
      ctx.fillText(name, chipX + (chipW - tw) / 2, chipY + 29);
      chipX += chipW + gap;
    });

    // 文案卡片
    ctx.fillStyle = "rgba(15,23,42,0.55)";
    roundRect(ctx, 86, 980, w - 172, 250, 28);
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.4)";
    ctx.lineWidth = 2;
    roundRect(ctx, 86, 980, w - 172, 250, 28);
    ctx.stroke();

    // 角落小饰
    drawCornerOrnament(ctx, 106, 1000, 1, 1);
    drawCornerOrnament(ctx, w - 106, 1000, -1, 1);
    drawCornerOrnament(ctx, 106, 1200, 1, -1);
    drawCornerOrnament(ctx, w - 106, 1200, -1, -1);

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "26px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapText(
      ctx,
      "我在三河遇见景泰蓝。铜丝勾勒纹样，釉色层层晕染——每一道工序，都是手工的耐心与温度。",
      120,
      1050,
      w - 240,
      40
    );

    ctx.fillStyle = "#fde68a";
    ctx.font = "600 24px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    wrapText(ctx, team, 120, 1160, w - 240, 34);

    // 底部信息
    ctx.fillStyle = "rgba(148,163,184,0.95)";
    ctx.font = "22px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText(`${place}  ·  ${time}`, 86, 1300);

    drawGoldLine(ctx, 86, 1324, w - 172);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "20px 'Microsoft YaHei', 'PingFang SC', sans-serif";
    ctx.fillText("燕郊非遗田野档案  ·  「畿辅文薪·匠心永续」", 86, 1368);
  }

  function drawGlow(ctx, x, y, r, color) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGoldLine(ctx, x, y, width) {
    const g = ctx.createLinearGradient(x, y, x + width, y);
    g.addColorStop(0, "rgba(212,175,55,0)");
    g.addColorStop(0.2, "rgba(253,230,138,0.85)");
    g.addColorStop(0.8, "rgba(212,175,55,0.85)");
    g.addColorStop(1, "rgba(212,175,55,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
  }

  function drawOrnateFrame(ctx, x, y, w, h) {
    ctx.strokeStyle = "rgba(212,175,55,0.55)";
    ctx.lineWidth = 3;
    roundRect(ctx, x, y, w, h, 36);
    ctx.stroke();
    ctx.strokeStyle = "rgba(253,230,138,0.22)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x + 14, y + 14, w - 28, h - 28, 28);
    ctx.stroke();

    // 四角如意云纹
    const orn = 34;
    drawCornerOrnament(ctx, x + 28, y + 28, 1, 1, orn);
    drawCornerOrnament(ctx, x + w - 28, y + 28, -1, 1, orn);
    drawCornerOrnament(ctx, x + 28, y + h - 28, 1, -1, orn);
    drawCornerOrnament(ctx, x + w - 28, y + h - 28, -1, -1, orn);
  }

  function drawCornerOrnament(ctx, x, y, sx, sy, size = 22) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sx, sy);
    ctx.strokeStyle = "rgba(253,230,138,0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, size);
    ctx.quadraticCurveTo(0, 0, size, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(6, size - 4);
    ctx.quadraticCurveTo(6, 6, size - 4, 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(14, 14, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFiligreeRing(ctx, cx, cy, radius) {
    ctx.save();
    ctx.strokeStyle = "rgba(253,230,138,0.28)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) {
      const a0 = (Math.PI * 2 * i) / 12;
      const a1 = a0 + Math.PI / 12;
      const x0 = cx + Math.cos(a0) * radius;
      const y0 = cy + Math.sin(a0) * radius;
      const x1 = cx + Math.cos(a1) * radius;
      const y1 = cy + Math.sin(a1) * radius;
      const mx = cx + Math.cos((a0 + a1) / 2) * (radius + 16);
      const my = cy + Math.sin((a0 + a1) / 2) * (radius + 16);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.quadraticCurveTo(mx, my, x1, y1);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    let line = "";
    let cursorY = y;
    for (let i = 0; i < text.length; i++) {
      const test = line + text[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cursorY);
        line = text[i];
        cursorY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, cursorY);
  }

  function initPoster() {
    const openBtn = document.getElementById("makePoster");
    const modal = document.getElementById("posterModal");
    const downloadBtn = document.getElementById("downloadPoster");
    if (!openBtn || !modal) return;

    openBtn.addEventListener("click", async () => {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      showToast("正在生成精美海报…");
      await drawPoster();
      document.dispatchEvent(new CustomEvent("visit:poster"));
      if (typeof window.earnStamp === "function") window.earnStamp("visit");
    });

    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const canvas = document.getElementById("posterCanvas");
        if (!canvas) return;
        const link = document.createElement("a");
        link.download = "jingtailan-checkin.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("海报已开始下载");
      });
    }
  }

  function getInteraction() {
    return cfg().interaction || {};
  }

  function readMessages() {
    const key = getInteraction().storageKey || "yanjiao-ich-messages-v1";
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function writeMessages(list) {
    const key = getInteraction().storageKey || "yanjiao-ich-messages-v1";
    localStorage.setItem(key, JSON.stringify(list));
  }

  function formatTime(ts) {
    if (typeof ts === "string") return ts;
    try {
      const d = new Date(ts);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      return `${mm}-${dd} ${hh}:${mi}`;
    } catch (e) {
      return "";
    }
  }

  function renderMessages(list) {
    if (!messageList) return;
    if (!list || !list.length) {
      messageList.innerHTML = '<p class="empty-tip">还没有留言，来做第一条吧。</p>';
      return;
    }
    messageList.innerHTML = list
      .map(
        (item) => `
      <article class="message-item">
        <header>
          <strong>${escapeHtml(item.name || "匿名队友")}</strong>
          <time>${escapeHtml(formatTime(item.time))}</time>
        </header>
        <p>${escapeHtml(item.text)}</p>
      </article>`
      )
      .join("");
  }

  function ensureSeedMessages() {
    const existing = readMessages();
    if (existing) {
      renderMessages(existing);
      return;
    }
    const seeds = (getInteraction().seedMessages || []).map((m) => ({
      name: m.name,
      text: m.text,
      time: m.time || "示例留言"
    }));
    writeMessages(seeds);
    renderMessages(seeds);
  }

  function initMessageBoard() {
    if (!submitBtn || !messageInput) return;
    ensureSeedMessages();

    submitBtn.addEventListener("click", () => {
      const conf = cfg();
      if (conf.links && conf.links.feedbackForm) {
        window.open(conf.links.feedbackForm, "_blank", "noopener");
        return;
      }
      const text = messageInput.value.trim();
      if (!text) {
        showToast("请先输入留言内容");
        return;
      }
      const max = getInteraction().maxMessages || 50;
      const list = readMessages() || [];
      list.unshift({
        name: (nicknameInput && nicknameInput.value.trim()) || "匿名队友",
        text: text.slice(0, 300),
        time: Date.now()
      });
      writeMessages(list.slice(0, max));
      renderMessages(list.slice(0, max));
      messageInput.value = "";
      showToast("留言已保存到本机");
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (!window.confirm("确定清空本机全部留言？示例留言也会清除。")) return;
        const key = getInteraction().storageKey || "yanjiao-ich-messages-v1";
        localStorage.removeItem(key);
        writeMessages([]);
        renderMessages([]);
        showToast("已清空本机留言");
      });
    }
  }

  function initReactions() {
    if (!reactionRow) return;
    const reactions = getInteraction().reactions || [];
    const key = getInteraction().reactionKey || "yanjiao-ich-reaction-v1";
    let selected = localStorage.getItem(key) || "";

    reactionRow.innerHTML = reactions
      .map(
        (r) =>
          `<button type="button" class="reaction-chip${selected === r.id ? " active" : ""}" data-id="${escapeHtml(r.id)}">${escapeHtml(r.label)}</button>`
      )
      .join("");

    function updateResult() {
      if (!reactionResult) return;
      const hit = reactions.find((r) => r.id === selected);
      reactionResult.textContent = hit ? `你选择了：${hit.label}` : "尚未表态，点一下即可。";
    }

    updateResult();
    reactionRow.addEventListener("click", (e) => {
      const btn = e.target.closest(".reaction-chip");
      if (!btn) return;
      selected = btn.getAttribute("data-id");
      localStorage.setItem(key, selected);
      reactionRow.querySelectorAll(".reaction-chip").forEach((el) => {
        el.classList.toggle("active", el.getAttribute("data-id") === selected);
      });
      updateResult();
      showToast("表态已记录");
    });
  }

  function initShare() {
    if (!shareBtn) return;
    shareBtn.addEventListener("click", async () => {
      const conf = cfg();
      const url =
        conf.links && conf.links.siteUrl && !conf.links.siteUrl.includes("your-username")
          ? conf.links.siteUrl
          : window.location.href;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          showToast("链接已复制，发给队友即可");
          return;
        }
      } catch (e) {
        /* fall through */
      }
      window.prompt("复制下面的链接发给队友：", url);
    });
  }

  function initSmoothAnchor() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = (anchor.getAttribute("href") || "").slice(1);
        if (!targetId || !document.getElementById(targetId)) return;
        e.preventDefault();
        scrollToId(targetId, 20);
      });
    });
  }

  /* 仅在从「去现场」行动卡跳到其它 section 后显示；首次浏览不出现 */
  function initVisitBackFab() {
    const fab = document.getElementById("visitBackFab");
    const visit = document.getElementById("visit");
    if (!fab || !visit) return;

    const showFab = () => {
      fab.hidden = false;
    };
    const hideFab = () => {
      fab.hidden = true;
    };

    visit.querySelectorAll('a.action-card[href^="#"]').forEach((card) => {
      card.addEventListener("click", () => {
        const href = card.getAttribute("href") || "";
        const id = href.slice(1);
        if (!id || id === "visit") return;
        if (!document.getElementById(id)) return;
        showFab();
      });
    });

    fab.addEventListener("click", () => {
      scrollToId("visit", 20);
      hideFab();
    });
  }

  function init() {
    applyConfig();
    // 配乐开关优先初始化，避免后续模块报错导致按钮未绑定
    try {
      initBgm();
    } catch (e) {
      console.warn("[bgm]", e);
    }
    try {
      initVideoBgmPause();
    } catch (e) {
      console.warn("[video-bgm]", e);
    }
    const steps = [
      initReveal,
      initParallax,
      initAccordion,
      initPlaces,
      initDocumentaryLink,
      initChapters,
      initGallery,
      initFiligreeGame,
      initVsSlider,
      initPoster,
      initMessageBoard,
      initReactions,
      initShare,
      initSmoothAnchor,
      initVisitBackFab
    ];
    steps.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        console.warn("[init]", fn.name || "step", e);
      }
    });
    updateProgress();
    updateActiveNav();
  }

  window.addEventListener(
    "scroll",
    () => {
      updateProgress();
      updateActiveNav();
    },
    { passive: true }
  );
  window.addEventListener("resize", updateProgress);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
