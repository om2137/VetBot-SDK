/* =========================================================
   Vet Chatbot SDK Loader
   Version: 1.2.1
   ========================================================= */

(function () {
  // Prevent double initialization
  if (window.__VET_CHATBOT_LOADED__) return;
  window.__VET_CHATBOT_LOADED__ = true;

  /* ------------------------------
     SDK CONSTANTS
  ------------------------------ */
  var CHAT_UI_URL = "https://vet-bot-frontend.vercel.app/";
  var IFRAME_ID = "vet-chatbot-iframe";
  var STORAGE_KEY = "vet_chat_session_id";

  var isOpen = false;
  var launcherButton = null;

  /* ------------------------------
     UTILITIES
  ------------------------------ */
  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function getSessionId() {
    try {
      var existing = localStorage.getItem(STORAGE_KEY);
      if (existing) return existing;

      var id = generateUUID();
      localStorage.setItem(STORAGE_KEY, id);
      return id;
    } catch (e) {
      // Incognito / storage blocked
      return generateUUID();
    }
  }

  function getContext() {
    if (typeof window.VetChatbotConfig !== "object") return {};

    var cfg = window.VetChatbotConfig;
    return {
      userId: cfg.userId || null,
      userName: cfg.userName || null,
      petName: cfg.petName || null,
      source: cfg.source || "unknown"
    };
  }

  /* ------------------------------
     CREATE IFRAME
  ------------------------------ */
  function createIframe() {
    var existing = document.getElementById(IFRAME_ID);
    if (existing) return existing;

    var iframe = document.createElement("iframe");
    iframe.id = IFRAME_ID;
    iframe.src = CHAT_UI_URL;
    iframe.title = "Veterinary Chatbot";

    iframe.style.position = "fixed";
    iframe.style.bottom = "90px";
    iframe.style.right = "20px";
    iframe.style.width = "360px";
    iframe.style.height = "520px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "14px";
    iframe.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
    iframe.style.zIndex = "999999";
    iframe.style.background = "transparent";

    iframe.style.display = "none";
    iframe.style.opacity = "0";
    iframe.style.transform = "translateY(20px)";
    iframe.style.transition = "opacity 0.25s ease, transform 0.25s ease";

    document.body.appendChild(iframe);
    return iframe;
  }

  /* ------------------------------
     CREATE LAUNCHER BUTTON
  ------------------------------ */
  function createLauncher() {
    if (launcherButton) return launcherButton;

    var btn = document.createElement("button");
    btn.innerHTML = "💬";
    btn.title = "Chat with Vet Assistant";

    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.width = "56px";
    btn.style.height = "56px";
    btn.style.borderRadius = "50%";
    btn.style.border = "none";
    btn.style.cursor = "pointer";
    btn.style.background = "#10b981";
    btn.style.color = "#fff";
    btn.style.fontSize = "24px";
    btn.style.boxShadow = "0 6px 20px rgba(0,0,0,0.25)";
    btn.style.zIndex = "1000000";

    btn.addEventListener("click", toggleChat);

    document.body.appendChild(btn);
    launcherButton = btn;
    return btn;
  }

  /* ------------------------------
     TOGGLE CHAT
  ------------------------------ */
  function toggleChat() {
    var iframe = document.getElementById(IFRAME_ID);
    if (!iframe) return;

    isOpen = !isOpen;

    if (isOpen) {
      iframe.style.display = "block";
      requestAnimationFrame(function () {
        iframe.style.opacity = "1";
        iframe.style.transform = "translateY(0)";
      });
      launcherButton.innerHTML = "✕";
    } else {
      iframe.style.opacity = "0";
      iframe.style.transform = "translateY(20px)";
      launcherButton.innerHTML = "💬";

      setTimeout(function () {
        iframe.style.display = "none";
      }, 250);
    }
  }

  /* ------------------------------
     POST INIT MESSAGE
  ------------------------------ */
  function postInitMessage(iframe, payload) {
    if (!iframe || !iframe.contentWindow) return;

    iframe.contentWindow.postMessage(
      {
        type: "VET_CHATBOT_INIT",
        payload: payload
      },
      "*"
    );
  }

  /* ------------------------------
     HANDSHAKE (READY → INIT)
  ------------------------------ */
  function waitForReadyAndInit(iframe, payload) {
    function onMessage(event) {
      if (event.data && event.data.type === "VET_CHATBOT_READY") {
        postInitMessage(iframe, payload);
        window.removeEventListener("message", onMessage);
      }
    }

    window.addEventListener("message", onMessage);

    // Safety fallback in case READY is missed
    setTimeout(function () {
      postInitMessage(iframe, payload);
    }, 500);
  }

  /* ------------------------------
     BOOTSTRAP
  ------------------------------ */
  function bootstrap() {
    var sessionId = getSessionId();
    var context = getContext();

    var iframe = createIframe();
    createLauncher();

    var initPayload = {
      sessionId: sessionId,
      context: context,
      meta: {
        url: window.location.href,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      }
    };

    waitForReadyAndInit(iframe, initPayload);
  }

  /* ------------------------------
     DOM READY SAFETY
  ------------------------------ */
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    bootstrap();
  } else {
    document.addEventListener("DOMContentLoaded", bootstrap);
  }

  /* ------------------------------
     OPTIONAL PUBLIC API
  ------------------------------ */
  window.VetChatbot = {
    open: function () {
      if (!isOpen) toggleChat();
    },
    close: function () {
      if (isOpen) toggleChat();
    }
  };
})();
