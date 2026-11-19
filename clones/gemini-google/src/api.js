/* Thin client for the backend in /backend. Same origin by default; set
   window.API_BASE before this script loads to point at another host. */

window.Api = (function () {
  "use strict";

  var TOKEN_KEY = "gemini-clone-token";

  function base() {
    return (window.API_BASE || "").replace(/\/$/, "");
  }

  function token() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (e) {
      return null;
    }
  }

  function setToken(value) {
    try {
      localStorage.setItem(TOKEN_KEY, value);
    } catch (e) {
      /* storage disabled: the session lasts one page */
    }
  }

  function clearToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function headers(hasBody) {
    var out = { Accept: "application/json" };
    var value = token();
    if (value) out.Authorization = "Bearer " + value;
    if (hasBody) out["Content-Type"] = "application/json";
    return out;
  }

  function failure(status, payload) {
    var message = (payload && payload.error && payload.error.message) || "Request failed (" + status + ")";
    var error = new Error(message);
    error.status = status;
    error.code = payload && payload.error ? payload.error.code : null;
    return error;
  }

  async function request(path, options) {
    options = options || {};
    var hasBody = options.body !== undefined;
    var response = await fetch(base() + path, {
      method: options.method || "GET",
      headers: headers(hasBody),
      body: hasBody ? JSON.stringify(options.body) : undefined
    });
    var payload = null;
    if (response.status !== 204) {
      try {
        payload = await response.json();
      } catch (e) {
        payload = null;
      }
    }
    if (!response.ok) throw failure(response.status, payload);
    return payload;
  }

  /* Server-sent events: frames are "event: <name>" plus "data: <json>". */
  async function streamMessage(conversationId, text, onDelta) {
    var response = await fetch(base() + "/v1/conversations/" + encodeURIComponent(conversationId) + "/messages", {
      method: "POST",
      headers: headers(true),
      body: JSON.stringify({ text: text, stream: true })
    });
    if (!response.ok) {
      var payload = null;
      try {
        payload = await response.json();
      } catch (e) {
        payload = null;
      }
      throw failure(response.status, payload);
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = "";
    var final = null;

    for (;;) {
      var chunk = await reader.read();
      if (chunk.done) break;
      buffer += decoder.decode(chunk.value, { stream: true });
      var boundary = buffer.indexOf("\n\n");
      while (boundary !== -1) {
        var frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        var eventName = "message";
        var data = "";
        frame.split("\n").forEach(function (line) {
          if (line.indexOf("event:") === 0) eventName = line.slice(6).trim();
          else if (line.indexOf("data:") === 0) data += line.slice(5).trim();
        });
        if (data) {
          var parsed = null;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = null;
          }
          if (eventName === "delta" && parsed && typeof parsed.text === "string") onDelta(parsed.text);
          if (eventName === "done" && parsed) final = parsed;
        }
        boundary = buffer.indexOf("\n\n");
      }
    }
    return final;
  }

  return {
    token: token,
    setToken: setToken,
    clearToken: clearToken,

    register: function (email, password, name) {
      return request("/v1/auth/register", { method: "POST", body: { email: email, password: password, name: name } });
    },
    signIn: function (email, password) {
      return request("/v1/auth/token", { method: "POST", body: { email: email, password: password } });
    },
    me: function () {
      return request("/v1/me");
    },

    listConversations: function () {
      return request("/v1/conversations?limit=40");
    },
    createConversation: function (title) {
      return request("/v1/conversations", { method: "POST", body: { title: title || "" } });
    },
    getConversation: function (id) {
      return request("/v1/conversations/" + encodeURIComponent(id));
    },
    patchConversation: function (id, patch) {
      return request("/v1/conversations/" + encodeURIComponent(id), { method: "PATCH", body: patch });
    },
    deleteConversation: function (id) {
      return request("/v1/conversations/" + encodeURIComponent(id), { method: "DELETE" });
    },
    sendMessage: function (id, text) {
      return request("/v1/conversations/" + encodeURIComponent(id) + "/messages", {
        method: "POST",
        body: { text: text, stream: false }
      });
    },
    streamMessage: streamMessage,
    search: function (query) {
      return request("/v1/search?q=" + encodeURIComponent(query));
    },

    models: function () {
      return request("/v1/models");
    },
    suggestions: function () {
      return request("/v1/suggestions");
    },
    settings: function () {
      return request("/v1/settings");
    },
    patchSettings: function (patch) {
      return request("/v1/settings", { method: "PATCH", body: patch });
    }
  };
})();
