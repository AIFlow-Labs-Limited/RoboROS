const elements = {
  metricTransport: document.querySelector("#metric-transport"),
  metricTopics: document.querySelector("#metric-topics"),
  metricServices: document.querySelector("#metric-services"),
  metricRobot: document.querySelector("#metric-robot"),
  runtimeStatus: document.querySelector("#runtime-status"),
  overviewJson: document.querySelector("#overview-json"),
  dockerPs: document.querySelector("#docker-ps"),
  dockerLogs: document.querySelector("#docker-logs"),
  topicsList: document.querySelector("#topics-list"),
  servicesList: document.querySelector("#services-list"),
  cameraImage: document.querySelector("#camera-image"),
  cameraTopic: document.querySelector("#camera-topic"),
  cameraMeta: document.querySelector("#camera-meta"),
  serviceResult: document.querySelector("#service-result"),
  controlStatus: document.querySelector("#control-status"),
  heartbeatPreview: document.querySelector("#heartbeat-preview"),
  lerobotResult: document.querySelector("#lerobot-result"),
  heroStatus: document.querySelector("#hero-status"),
  heroTransport: document.querySelector("#hero-transport"),
  heroRobot: document.querySelector("#hero-robot"),
  heroMode: document.querySelector("#hero-mode"),
  heroCameraImage: document.querySelector("#hero-camera-image"),
  heroCameraTopic: document.querySelector("#hero-camera-topic"),
  heroCameraMeta: document.querySelector("#hero-camera-meta"),
  heroBuild: document.querySelector("#hero-build"),
  heroUnit: document.querySelector("#hero-unit"),
  heroNetwork: document.querySelector("#hero-network"),
};

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed for ${url}`);
  }

  return payload;
}

function renderList(element, items, formatter) {
  element.innerHTML = "";

  for (const item of items) {
    const li = document.createElement("li");
    li.innerHTML = formatter(item);
    element.appendChild(li);
  }
}

function shortRobotName(name) {
  if (!name) return "ROBOT";
  return String(name).replaceAll("_", " ").toUpperCase();
}

function setHeroConnectionState(overview) {
  const connected = overview.health.connected;
  elements.heroStatus.textContent = connected ? "SYSTEM: ONLINE" : "SYSTEM: OFFLINE";
  elements.heroMode.textContent = connected ? "CONTROL" : "OFFLINE";
  elements.heroTransport.textContent = overview.health.transportMode.toUpperCase();
  elements.heroRobot.textContent = shortRobotName(overview.health.robot.name);
  elements.heroBuild.textContent = `ENDPOINT: ${overview.health.endpoint}`;
  elements.heroUnit.textContent = `UNIT ${shortRobotName(overview.health.robot.name)}`;
  elements.heroNetwork.textContent = connected ? "LOCAL_NET" : "LINK_DOWN";
}

async function refreshOverview() {
  const overview = await request("/api/overview");
  const topics = overview.capabilities.topics ?? [];
  const services = overview.services ?? [];

  elements.metricTransport.textContent = overview.health.transportMode.toUpperCase();
  elements.metricTopics.textContent = String(topics.length);
  elements.metricServices.textContent = String(services.length);
  elements.metricRobot.textContent = shortRobotName(overview.health.robot.name);
  elements.runtimeStatus.textContent = overview.health.connected ? "connected" : "offline";
  elements.runtimeStatus.className = `status-pill ${overview.health.connected ? "ok" : "warn"}`;
  elements.overviewJson.textContent = JSON.stringify(overview, null, 2);

  setHeroConnectionState(overview);

  renderList(
    elements.topicsList,
    topics,
    (topic) => `<strong>${topic.name}</strong><span>${topic.type || "unknown type"}</span>`,
  );

  renderList(
    elements.servicesList,
    services,
    (service) => `<strong>${service.name}</strong><span>${service.type || "type not exposed by rosapi"}</span>`,
  );
}

async function refreshCamera() {
  const snapshot = await request("/api/camera");
  const dataUri = `data:${snapshot.mimeType};base64,${snapshot.data}`;
  const meta = `${snapshot.mimeType.toUpperCase()} // ${snapshot.data.length} BASE64 CHARS`;

  elements.cameraImage.src = dataUri;
  elements.heroCameraImage.src = dataUri;
  elements.cameraTopic.textContent = snapshot.topic;
  elements.heroCameraTopic.textContent = snapshot.topic;
  elements.cameraMeta.textContent = meta;
  elements.heroCameraMeta.textContent = meta;
}

async function refreshDocker() {
  const ps = await request("/api/demo/ps");
  elements.dockerPs.textContent = ps.text || "No docker output.";
}

async function refreshLogs() {
  const logs = await request("/api/demo/logs?tail=24&since=5m");
  elements.dockerLogs.textContent = logs.text || "No logs.";
}

async function refreshHeartbeat() {
  const heartbeat = await request("/api/subscribe-once", {
    method: "POST",
    body: JSON.stringify({
      topic: "/robotflow/demo/heartbeat",
      type: "std_msgs/msg/String",
      timeoutMs: 4000,
    }),
  });

  const preview =
    typeof heartbeat.message?.data === "string"
      ? heartbeat.message.data
      : JSON.stringify(heartbeat.message);

  elements.heartbeatPreview.textContent = preview.slice(0, 72).toUpperCase();
}

async function publishMotion(kind) {
  const map = {
    forward: { linear: { x: 0.3, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } },
    backward: { linear: { x: -0.2, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } },
    left: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0.4 } },
    right: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: -0.4 } },
    stop: { linear: { x: 0, y: 0, z: 0 }, angular: { x: 0, y: 0, z: 0 } },
  };

  const payload = await request("/api/publish", {
    method: "POST",
    body: JSON.stringify({
      topic: "/cmd_vel",
      type: "geometry_msgs/msg/Twist",
      message: map[kind],
    }),
  });

  elements.controlStatus.textContent = `${kind.toUpperCase()} -> ${payload.topic}`;
}

async function exportLeRobot() {
  const payload = await request("/api/lerobot/export-demo", {
    method: "POST",
  });

  elements.lerobotResult.textContent = JSON.stringify(payload, null, 2);
  elements.heroMode.textContent = "LEARNING";
}

async function callServiceFromForm(event) {
  event.preventDefault();

  const a = Number(document.querySelector("#service-a").value);
  const b = Number(document.querySelector("#service-b").value);
  const payload = await request("/api/service", {
    method: "POST",
    body: JSON.stringify({
      service: "/robotflow/demo/add_two_ints",
      type: "example_interfaces/srv/AddTwoInts",
      args: { a, b },
    }),
  });

  elements.serviceResult.textContent = `sum = ${payload.values.sum}`;
}

async function refreshAll() {
  await Promise.all([
    refreshOverview(),
    refreshCamera(),
    refreshDocker(),
    refreshLogs(),
    refreshHeartbeat(),
  ]);
}

function handleError(error) {
  console.error(error);
  elements.controlStatus.textContent = error.message;
  elements.heroStatus.textContent = "SYSTEM: FAULT";
}

document.querySelector("#refresh-all").addEventListener("click", () => {
  refreshAll().catch(handleError);
});

document.querySelector("#capture-camera").addEventListener("click", () => {
  refreshCamera().catch(handleError);
});

document.querySelector("#refresh-docker").addEventListener("click", () => {
  refreshDocker().catch(handleError);
});

document.querySelector("#refresh-logs").addEventListener("click", () => {
  refreshLogs().catch(handleError);
});

document.querySelector("#export-lerobot").addEventListener("click", () => {
  exportLeRobot().catch(handleError);
});

document.querySelector("#service-form").addEventListener("submit", (event) => {
  callServiceFromForm(event).catch(handleError);
});

document.querySelectorAll("[data-motion]").forEach((button) => {
  button.addEventListener("click", () => {
    publishMotion(button.dataset.motion).catch(handleError);
  });
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTarget);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

refreshAll().catch(handleError);

setInterval(() => {
  refreshLogs().catch(handleError);
}, 4000);
