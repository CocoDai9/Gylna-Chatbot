const chatContainer = document.getElementById('container');
const sendBtn = document.getElementById('sentBtn');
const textbox = document.getElementById('textbox');

// 初始 intro message
setTimeout(() => {
  chatbotSendMessage("Hi! What is your goal today? Please select one option:");
  showGoalButtons();
}, 1000);

// 显示初始按钮
function showGoalButtons() {
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('w-75', 'float-start', 'shadow-sm', 'p-2', 'mb-2', 'bg-light', 'rounded');
  buttonContainer.style.margin = "10px";
  buttonContainer.style.display = "flex";
  buttonContainer.style.flexDirection = "column";
  buttonContainer.style.gap = "10px";

  const goals = [
    "Improve Meal Timing to Prevent Dips",
    "Reduce Low Blood Sugar Episodes",
    "Keep Blood Sugar in Safe Range",
    "Build Consistent Eating Habits"
  ];

  goals.forEach(goal => {
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-success');
    btn.innerText = goal;
    btn.onclick = () => chooseGoal(goal);
    buttonContainer.appendChild(btn);
  });

  chatContainer.appendChild(buttonContainer);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Chatbot发消息
function chatbotSendMessage(messageText) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('w-50', 'float-start', 'shadow-sm', 'p-2', 'mb-2', 'bg-light', 'rounded');
  messageElement.style.margin = "10px";
  messageElement.innerHTML = `
    <span>Chatbot:</span>
    <div style="margin-top:10px;">${messageText}</div>
  `;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 用户发消息
function sendMessage(messageText) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('w-50', 'float-end', 'shadow-sm', 'p-2', 'mb-2', 'bg-primary', 'text-white', 'rounded');
  messageElement.style.margin = "10px";
  messageElement.innerHTML = `
    <span>Me:</span>
    <div style="margin-top:10px;">${messageText}</div>
  `;
  chatContainer.appendChild(messageElement);
  textbox.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 用户点击选项
function chooseGoal(goalText) {
  sendMessage(goalText);

  // 禁用所有按钮
  const buttons = chatContainer.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);

  processMessage(goalText);
}

// 点击Send按钮或按回车
sendBtn.addEventListener('click', () => {
  const messageText = textbox.value.trim();
  if (messageText !== '') {
    sendMessage(messageText);
    processMessage(messageText);
  }
});

textbox.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const messageText = textbox.value.trim();
    if (messageText !== '') {
      sendMessage(messageText);
      processMessage(messageText);
    }
  }
});

// --- Loading动效 ---
function showLoading() {
  const loadingElement = document.createElement('div');
  loadingElement.id = "loading";
  loadingElement.classList.add('w-50', 'float-start', 'shadow-sm', 'p-2', 'mb-2', 'bg-light', 'rounded');
  loadingElement.style.margin = "10px";
  loadingElement.innerHTML = `
    <span>Chatbot:</span>
    <div class="mt-2">
      <div class="spinner-border text-primary" role="status" style="width: 1.5rem; height: 1.5rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <span class="ms-2">Thinking...</span>
    </div>
  `;
  chatContainer.appendChild(loadingElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideLoading() {
  const loadingElement = document.getElementById('loading');
  if (loadingElement) {
    loadingElement.remove();
  }
}

// --- 处理发送与回复 ---
async function processMessage(messageText) {
  try {
    showLoading();

    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText })
    });

    const data = await res.json();
    const responseText = data.reply?.trim() || "Hmm, not sure how to respond to that.";

    hideLoading();

    if (isStructuredResponse(responseText)) {
      renderStructuredResponse(responseText);
    } else {
      chatbotSendMessage(responseText);
    }
  } catch (err) {
    console.error("Error:", err);
    hideLoading();
    chatbotSendMessage("Sorry, there was a problem talking to the AI 😓");
  }
}

// 判断是不是structured格式
function isStructuredResponse(text) {
  return text.includes("Suggested Food Items:") && text.includes("Exercise Recommendation:") && text.includes("Potential Risks:");
}

// 渲染分类好的回复
function renderStructuredResponse(responseText) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('w-75', 'float-start', 'shadow-sm', 'p-3', 'mb-2', 'bg-light', 'rounded');
  messageElement.style.margin = "10px";

  const sections = responseText.split(/\n\s*\n/);
  let htmlContent = `<span>Chatbot:</span><div class="mt-2">`;

  sections.forEach(section => {
    const [title, ...contentLines] = section.split('\n');
    if (title && contentLines.length > 0) {
      let icon = '';
      if (title.includes('Suggested Food Items')) icon = '🍎 ';
      if (title.includes('Exercise Recommendation')) icon = '🏃 ';
      if (title.includes('Potential Risks')) icon = '⚠️ ';
      htmlContent += `<h6 class="mt-3">${icon}${title.trim()}</h6>`;
      htmlContent += `<ul>`;
      contentLines.forEach(line => {
        if (line.trim() !== "") {
          htmlContent += `<li>${line.replace(/^[-•\s]+/, '')}</li>`;
        }
      });
      htmlContent += `</ul>`;
    }
  });

  htmlContent += `</div>`;

  messageElement.innerHTML = htmlContent;
  chatContainer.appendChild(messageElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
