export function initializePwaSupport() {
  const status = document.createElement("div");
  status.className = "connection-status";
  status.id = "connection-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");

  const message = document.createElement("span");
  const installButton = document.createElement("button");
  installButton.type = "button";
  installButton.className = "text-link";
  installButton.textContent = "Install app";
  installButton.hidden = true;
  const updateButton = document.createElement("button");
  updateButton.type = "button";
  updateButton.className = "text-link";
  updateButton.textContent = "Reload to update";
  updateButton.hidden = true;
  status.append(message, installButton, updateButton);
  document.body.append(status);

  const connectionMessage = (notice = "") => {
    status.dataset.offline = String(!navigator.onLine);
    const connection = navigator.onLine
      ? "Online · shared workspace records require a connection"
      : "Offline · production records are not available offline";
    message.textContent = notice ? `${connection} · ${notice}` : connection;
  };
  const updateConnection = () => connectionMessage();
  window.addEventListener("online", updateConnection);
  window.addEventListener("offline", updateConnection);
  updateConnection();

  let installPrompt = null;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    installButton.hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    installButton.hidden = true;
    connectionMessage("App installed");
  });
  installButton.addEventListener("click", async () => {
    if (!installPrompt) {
      return;
    }
    const prompt = installPrompt;
    installPrompt = null;
    installButton.disabled = true;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      connectionMessage(choice.outcome === "accepted" ? "Installation started" : "Installation dismissed");
    } catch (error) {
      console.error("PWA installation prompt failed.", error);
      connectionMessage("Installation could not be started");
    } finally {
      installButton.disabled = false;
      installButton.hidden = true;
    }
  });

  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    return;
  }

  navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((registration) => {
    const showUpdate = () => {
      updateButton.hidden = false;
    };
    if (registration.waiting) {
      showUpdate();
    }
    registration.addEventListener("updatefound", () => {
      const installing = registration.installing;
      if (!installing) {
        return;
      }
      installing.addEventListener("statechange", () => {
        if (installing.state === "installed" && navigator.serviceWorker.controller) {
          showUpdate();
        }
      });
    });

    updateButton.addEventListener("click", () => {
      if (!registration.waiting) {
        return;
      }
      updateButton.disabled = true;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        window.location.reload();
      }, { once: true });
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    });
  }).catch((error) => {
    console.error("Service worker registration failed.", error);
    message.textContent = "Online · offline app-shell support could not be enabled";
  });
}
