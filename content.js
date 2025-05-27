const aiIcon = chrome.runtime.getURL("assets/ai-icon.png");
const copyIcon = chrome.runtime.getURL("assets/copy.png");
const tickmarkIcon = chrome.runtime.getURL("assets/tickmark.png");
const API_KEY = "api_key_ai_extension";
let chatBoxVisible = false;
let theme = "lightblue";
let keyWithoutId = "maang_aiHelper_chatHistory_";
let problemName = window.location.pathname.split("/")[2];

const COLORS = {
    "addAiHelperButton-backgroundColor-light": " white",
    "addAiHelperButton-backgroundColor-dark": " #161d29",
    "addAiHelperButton-color-light": " #172b4d",
    "addAiHelperButton-color-dark": " white",
    "addAiHelperButton-borderColor-light": " lightblue",
    "addAiHelperButton-borderColor-dark": " #374762",
    "addAiHelperButton-mouseover-borderColor-light": " #87b0d3",
    "addAiHelperButton-mouseover-borderColor-dark": " #425971",
    "addAiHelperButton-mouseout-borderColor-light": " lightblue",
    "addAiHelperButton-mouseout-borderColor-dark": " #374762",
    "container-backgroundColor-light": " white",
    "container-backgroundColor-dark": " #1f2836",
    "container-borderColor-light": " #a7e5fb",
    "container-borderColor-dark": " #9ec5f6",
    "header-backgroundColor-light": " #ddf6ff",
    "header-backgroundColor-dark": " #2b384e",
    "header-color-light": " #172b4d",
    "header-color-dark": " white",
    "menuButton-mouseover-backgroundColor-light": " white",
    "menuButton-mouseover-backgroundColor-dark": " #6681b3",
    "dropdown-backgroundColor-light": "white",
    "dropdown-backgroundColor-dark": " #2b384e",
    "deleteText-color-light": " #172b4d",
    "deleteText-color-dark": " white",
    "closeBtn-color-light": " #172b4d",
    "closeBtn-color-dark": " white",
    "messageArea-backgroundColor-light": " white",
    "messageArea-backgroundColor-dark": " #1f2836",
    "inputArea-backgroundColor-light": " white",
    "inputArea-backgroundColor-dark": " #1f2836",
    "inputText-backgroundColor-light": " white",
    "inputText-backgroundColor-dark": " #1f2836",
    "inputText-color-light": " black",
    "inputText-color-dark": " white",
    "sendBtn-backgroundColor-light": " #ddf6ff",
    "sendBtn-backgroundColor-dark": " #2b384e",
    "sendBtn-color-light": " #172b4d",
    "sendBtn-color-dark": " white",
    "sendBtn-borderColor-light": " #ddf6ff",
    "sendBtn-borderColor-dark": " #2b384e",
    "sendBtn-mouseover-backgroundColor-light": " white",
    "sendBtn-mouseover-backgroundColor-dark": " #2b384e",
    "sendBtn-mouseover-borderColor-light": " #a7e5fb",
    "sendBtn-mouseover-borderColor-dark": " #a7e5fb",
    "sendBtn-mouseout-backgroundColor-light": " #ddf6ff",
    "sendBtn-mouseout-backgroundColor-dark": " #2b384e",
    "sendBtn-mouseout-borderColor-light": " #ddf6ff",
    "sendBtn-mouseout-borderColor-dark": " #2b384e",
    "userMessage-backgroundColor-light": " #ddf6ff",
    "userMessage-backgroundColor-dark":  " #2b384e",
    "aiResponse-backgroundColor-light": " #eeeded",
    "aiResponse-backgroundColor-dark":  " #374353",
    "chatMessage-color-light": " black",
    "chatMessage-color-dark": "rgba(255,255,255,0.9)",
    "inlineCodeStyle-backgroundColor-light": "rgba(254, 254, 254,0.5)",
    "inlineCodeStyle-backgroundColor-dark": "rgba(3, 3, 3, 0.5)",
    "inlineCodeStyle-color-light": " #000",
    "inlineCodeStyle-color-dark": " #fff",
    "preCodeBlockStyle-backgroundColor-light": "rgba(254, 254, 254,0.5)",
    "preCodeBlockStyle-backgroundColor-dark": "rgba(3, 3, 3, 0.5)",
    "preCodeBlockStyle-color-light": " #000000",
    "preCodeBlockStyle-color-dark": " #ffffff",
    "preBlockStyle-backgroundColor-light": " #ffffff",
    "preBlockStyle-backgroundColor-dark": " #000000",
    "copiedMsg-color-light": " black",
    "copiedMsg-color-dark": " black",
}

const CHAT_BOX_MIN_DIMENSIONS = { width: 300, height: 300 };

// Listen to Custom event triggered using inject.js
listenInjectScript();

function listenInjectScript(){
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    script.onload = () => script.remove();
    document.documentElement.appendChild(script);
}

const problemsDataMap = new Map();
let prevPageVisited = "";

window.addEventListener("xhrDataFetched", (event) => {
    const data = event.detail;
    // console.log("Data fetched from inject.js", data);
    if (data.id) {
        try {
            const parsed = JSON.parse(data.response);
            console.log("type of id:",typeof data.id);
            problemsDataMap.set(data.id, parsed);
            console.log(`Stored parsed response for id: ${data.id}`, parsed);
        } catch (e) {
            console.error("Failed to parse response:", e);
        }
    }
})

// Mutation Observer for theme change
document.addEventListener("DOMContentLoaded", () => {
    const htmlTag = document.querySelector('html');
    const observerTheme = new MutationObserver(() => {
        const htmlElement = document.querySelector('html');
        let currtheme = htmlElement?.getAttribute('data-theme') || 'lightblue';
        if(currtheme === "" || currtheme === undefined || currtheme === null) return;
        if(currtheme === theme) return;
        theme = currtheme;
        const aiHelperButton = document.getElementById("ai-helper-button");
        if(aiHelperButton) addAiHelperButtonStyles(aiHelperButton);
        if(chatBoxVisible) applyThemeToChatBox();
    });
    observerTheme.observe(htmlTag, { attributes: true, attributeFilter: ['data-theme'] });
});

function applyThemeToChatBox(){
    const container = document.getElementById("ai-chat-box");
    addContainerStyles_OnlyColorChanges(container);
    const header = document.getElementById("chat-box-header-div");
    addHeaderStyles_OnlyColorChanges(header);
    const deleteText = document.getElementById("dropdown-option1-text");
    addDeleteTextStyles_OnlyColorChanges(deleteText);
    const closeBtn = document.getElementById("chat-box-close-btn");
    addClosebuttonStyles_OnlyColorChanges(closeBtn);
    const messages = document.getElementById("chat-box-chat-messages");
    addMessageAreaStyles_OnlyColorChanges(messages);
    const inputArea = document.getElementById("chat-box-input-area");
    addInputAndSendAreaStyles_OnlyColorChanges(inputArea);
    const input = document.getElementById("chat-box-input");
    addInputStyles_OnlyColorChanges(input);
    const sendBtn = document.getElementById("chat-box-send-btn");
    addSendButtonStyles_OnlyColorChanges(sendBtn);
    const dropdown = document.getElementById("dropdown-element");
    addDropdownStyles_OnlyColorChanges(dropdown);
    applyThemeBasedStylesForChat();
}

// Mutation Observer for page change
document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver(() => {
        if(problemName !== window.location.pathname.split("/")[2]){
            const existing = document.getElementById("ai-chat-box");
            if (existing) {
                existing.remove();
                chatBoxVisible = false;
                problemName = window.location.pathname.split("/")[2];
            }
        }
        addButton();
    });

    observer.observe(document.body, {childList: true, subtree: true });
});

function onProblemsPage(){
    const curpath = window.location.pathname;
    return (curpath.startsWith("/problems/") && curpath.length > "/problems/".length);
}

function addButton(){
    console.log("Triggered");
    if(!onProblemsPage() || document.getElementById("ai-helper-button")) return;

    console.log("Button added on Page");
    const navBarItem = document.getElementsByClassName('d-flex gap-2 flex-grow-1 ms-3 justify-content-end')[0];

    const htmlElement = document.querySelector('html');
    theme = htmlElement?.getAttribute('data-theme') || 'lightblue';
    console.log("Theme of the page",theme);

    //Styling of the button
    const child = document.createElement('button');
    child.innerHTML = `AI Helper`;
    child.id = "ai-helper-button";
    addAiHelperButtonStyles(child);
    aiHelperButtonEventListeners(child);
    navBarItem.insertAdjacentElement("beforebegin",child);
}

function addAiHelperButtonStyles(child){
    child.style.color = theme === "dark" ? COLORS["addAiHelperButton-color-dark"] : COLORS["addAiHelperButton-color-light"];
    child.style.backgroundColor = theme === "dark" ? COLORS["addAiHelperButton-backgroundColor-dark"] : COLORS["addAiHelperButton-backgroundColor-light"];
    child.style.fontFamily = "Arial";
    child.style.fontWeight = "600";
    child.style.padding = "0.3rem  1rem";
    child.style.borderWidth = "1px";
    child.style.borderStyle = "solid";
    child.style.borderColor = theme === "dark" ? COLORS["addAiHelperButton-borderColor-dark"] : COLORS["addAiHelperButton-borderColor-light"];
    child.style.borderRadius = "6px";
    child.style.cursor = "pointer";
    child.style.flexShrink = "1";
    child.style.whiteSpace = "nowrap";    
}

function aiHelperButtonEventListeners(child){
    child.addEventListener("mouseover", () => {
        child.style.borderColor = theme === "dark" ? COLORS["addAiHelperButton-mouseover-borderColor-dark"] : COLORS["addAiHelperButton-mouseover-borderColor-light"];    // hover color
    });

    child.addEventListener("mouseout", () => {
        child.style.borderColor = theme === "dark" ? COLORS["addAiHelperButton-mouseout-borderColor-dark"] : COLORS["addAiHelperButton-mouseout-borderColor-light"];     // original color
    });
    child.addEventListener("click",handleOpen);
}

async function handleOpen() {
    try {
        const hasKey = await isApiKeyPresent();
        if (hasKey) {
            openChatBox();
            loadChatHistory();
        } else {
            alert("Please set your Gemini API key via the AI Helper extension popup.");
        }
    } catch (error) {
        console.error("Failed to check API key:", error);
        alert("Something went wrong while checking your API key. Please try again.");
    }
}

async function isApiKeyPresent() {
    try {
        const result = await chrome.storage.local.get([API_KEY]);
        const getKey = result[API_KEY];

        console.log("result", result);
        console.log("getKey", getKey);

        return !!getKey; // returns true if non-empty string, false otherwise
    } catch (error) {
        console.error("Error accessing Chrome storage:", error);
        throw error; // rethrow so `handleOpen` can deal with it
    }
}

function addMenuButtonStyles(menuButton){
    menuButton.style.backgroundColor = "transparent";
    menuButton.style.borderRadius = "50%";
    menuButton.style.border = "none";
    menuButton.style.fontSize = "1.5rem";
    menuButton.style.height = "35px";
    menuButton.style.width = "35px";
    menuButton.style.display = "flex";
    menuButton.style.justifyContent = "center";
    menuButton.style.alignItems = "center";
    menuButton.style.fontWeight = "bold";
    menuButton.style.cursor = "pointer";
    menuButton.style.position = "relative";
    menuButton.style.marginRight = "3px";
}

function addMenuButtonEventListeners(option,dropdown,menuButton){
    menuButton.addEventListener("mouseover",() => {
        menuButton.style.backgroundColor = theme === "dark" ? COLORS["menuButton-mouseover-backgroundColor-dark"] : COLORS["menuButton-mouseover-backgroundColor-light"];
    });

    menuButton.addEventListener("mouseout",() => {
        menuButton.style.backgroundColor = "transparent";
    });

    // Toggle dropdown on click
    menuButton.addEventListener("click",(e)=>{
        e.stopPropagation();
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });

    // Hide dropdown if clicked outside
    document.addEventListener("click", () => {
        dropdown.style.display = "none";
        menuButton.style.backgroundColor =  "transparent";
    });
}

function addDropdownStyles(dropdown){
    addDropdownStyles_OnlyColorChanges(dropdown);
    dropdown.style.display = "none";
    dropdown.style.position = "absolute";
    dropdown.style.top = "45px";
    dropdown.style.left = "0px";
    dropdown.style.borderWidth = "1px";
    dropdown.style.borderStyle = "solid";
    dropdown.style.padding = "8px";
    dropdown.style.borderRadius = "4px";
    dropdown.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.2)";
    dropdown.style.zIndex = "94";
    dropdown.style.fontSize = "1rem";
}

function addDropdownStyles_OnlyColorChanges(dropdown){
    dropdown.style.backgroundColor = theme === "dark" ? COLORS["dropdown-backgroundColor-dark"] : COLORS["dropdown-backgroundColor-light"];
}

function addDeleteBinImgStyles(deleteBinImg){
    deleteBinImg.style.height = "18px";
    deleteBinImg.style.width = "18px";
}

function addDeleteTextStyles(deleteText){
    addDeleteTextStyles_OnlyColorChanges(deleteText);
    deleteText.style.fontSize = "0.9rem";
    deleteText.style.fontWeight = "400";
    deleteText.style.whiteSpace = "nowrap";
}

function addDeleteTextStyles_OnlyColorChanges(deleteText){
    deleteText.style.color = theme === "dark" ? COLORS["deleteText-color-dark"] : COLORS["deleteText-color-light"];
}

function addOptionStyles(option){
    option.style.cursor = "pointer";
    option.style.display = "flex";
    option.style.gap = "0.4rem";
    option.style.flexDirection = "row";
    option.style.justifyContent = "center";
    option.style.alignItems = "center";
}

function addOptionsEventListeners(option,dropdown){
    option.addEventListener("click", async () => {
        try {
            await deleteChatHistoryFunction(dropdown);
        } catch (error) {
            console.error("Failed to remove chat history:", error);
            alert("Something went wrong while removing chat history.");
        }
    });
}

async function deleteChatHistoryFunction(dropdown){
    const problemId = window.location.pathname.split("/")[2];
    const key = `${keyWithoutId}${problemId}`;
    await chrome.storage.local.remove([key]);
    document.getElementById("chat-box-chat-messages").innerHTML = "";
    dropdown.style.display = "none";
    alert("Chat history removed.");
}

function openChatBox() {
    const existing = document.getElementById("ai-chat-box");
    if (existing) {
        existing.remove();
        chatBoxVisible = false;
        return;
    }

    // CHAT BOX
    const container = document.createElement("div");
    container.id = "ai-chat-box";
    addContainerStyles(container);

    // CHAT BOX Header
    const header = document.createElement("div");
    const combineMenuAndTitle = document.createElement('div');
    combineMenuAndTitle.style.display = "flex";
    header.id = "chat-box-header-div";
    addHeaderStyles(header);

    // CHAT BOX Options Menu
    // Create the three dots button
    const menuButton = document.createElement("button");
    menuButton.innerHTML = "⋮";
    menuButton.title = "More options";
    addMenuButtonStyles(menuButton);

    // Create the dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "dropdown-element";
    addDropdownStyles(dropdown);
    
    // Add Remove History option
    const option = document.createElement("div"); 
    addOptionStyles(option);
    const deleteBinImg = document.createElement('img');
    deleteBinImg.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F05454' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6'/%3E%3C/svg%3E`;
    addDeleteBinImgStyles(deleteBinImg);
    const deleteText = document.createElement('span');
    deleteText.textContent = "Delete Chat History";
    deleteText.id = "dropdown-option1-text";
    addDeleteTextStyles(deleteText);
    addOptionsEventListeners(option,dropdown);
    
    option.append(deleteBinImg,deleteText);
    dropdown.appendChild(option);
    menuButton.appendChild(dropdown);

    addMenuButtonEventListeners(option,dropdown,menuButton);
    
    // CHAT BOX Title
    const titleElem = document.createElement('span');
    // chatboxTitle
    titleElem.textContent = "AI Helper";
    titleElem.style.fontSize = "1rem";
    titleElem.style.fontWeight = "bold";
    titleElem.style.alignSelf = "center";
    combineMenuAndTitle.append(menuButton,titleElem);
    header.appendChild(combineMenuAndTitle);

    // CHAT BOX Drag -------------------------------------------------------------------------------
    header.addEventListener("mousedown",(event) => handleDragging(event,container));

    // CHAT BOX Header Close Button
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.id = "chat-box-close-btn"
    addClosebuttonStyles(closeBtn);
    closeBtn.onclick = () => {
        container.remove();
        chatBoxVisible = false;
    };
    header.appendChild(closeBtn);
    container.appendChild(header);

    // CHAT BOX Messages area
    const messages = document.createElement("div");
    messages.id = "chat-box-chat-messages";
    addMessageAreaStyles(messages);
    container.appendChild(messages);

    // CHAT BOX Input and send area
    const inputArea = document.createElement("div");
    inputArea.id = "chat-box-input-area";
    addInputAndSendAreaStyles(inputArea);

    // CHAT BOX Take input
    const input = document.createElement("textarea");
    input.type = "text";
    input.placeholder = "Ask something...";
    input.id = "chat-box-input";
    addInputStyles(input);
    addInputEventListeners(input);

    // CHAT BOX Send button
    const sendBtn = document.createElement("button");
    sendBtn.textContent = "Send";
    sendBtn.id = "chat-box-send-btn";
    addSendButtonStyles(sendBtn);
    addSendButtonEventListeners(sendBtn);
    // Attach User and AI response messages
    sendBtn.onclick = () => { sendUserMessageForAiResponse(input); };

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);

    // CHAT BOX Add Stripes
    const stripes = document.createElement('div');
    stripes.id = "chat-box-stripes";
    addResizeStripesStyles(stripes);
    container.appendChild(stripes);

    // CHAT BOX Resize handle (bottom-right corner) ------------------------------------------------
    stripes.addEventListener("mousedown", (event) => mousedownBottomRight(event,container));

    // CHAT BOX Resize all Directions --------------------------------------------------------------
    addAllResizers(container);

    document.body.appendChild(container);
    chatBoxVisible = true;
    console.log("document,",document);
console.log("Chat box added", container);
window._aiHelperContainer = container;

}

async function loadChatHistory() {
    try {
        const problemId = window.location.pathname.split("/")[2];
        if (!problemId) throw new Error("Invalid problemId from URL.");

        const key = `${keyWithoutId}${problemId}`;
        const localStorageData = await chrome.storage.local.get([key]);

        if (key in localStorageData) {
            const history = localStorageData[key];
            history.forEach(({ role, msg }) => {
                addMessage(msg, role);
            });
        } else {
            console.log("No chat history found for this problem:",problemId);
        }
    } catch (error) {
        console.error("Error while loading chat history:",error);
    }
}

function addContainerStyles(container) {
    addContainerStyles_OnlyColorChanges(container);
    container.style.position = "fixed";
    container.style.left = "unset";
    container.style.top = "unset";
    container.style.bottom = "80px";
    container.style.right = "20px";
    container.style.width = "350px";
    container.style.height = "500px";
    container.style.borderWidth = "0.01rem";
    container.style.borderStyle = "solid";
    container.style.borderRadius = "8px";
    container.style.zIndex = "92";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)";
    container.style.overflow = "hidden";
}

function addContainerStyles_OnlyColorChanges(container){
    container.style.backgroundColor = theme === "dark" ? COLORS["container-backgroundColor-dark"] : COLORS["container-backgroundColor-light"];
    container.style.borderColor = theme === "dark" ? COLORS["container-borderColor-dark"] : COLORS["container-borderColor-light"] ;
}

function addHeaderStyles(header) {
    addHeaderStyles_OnlyColorChanges(header);
    header.style.padding = "10px 10px 10px 5px";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.flexDirection = "row";
    header.style.alignItems = "center";
    header.style.cursor = "move";
}

function addHeaderStyles_OnlyColorChanges(header){
    header.style.backgroundColor = theme === "dark"? COLORS["header-backgroundColor-dark"] :COLORS["header-backgroundColor-light"];
    header.style.color = theme === "dark"? COLORS["header-color-dark"] : COLORS["header-color-light"];
}

function handleDragging(event,container){
    let isDragging = true;

    const rect = container.getBoundingClientRect();
    let offsetX = event.clientX - rect.left;
    let offsetY = event.clientY - rect.top;
    document.body.style.userSelect = "none";

    function onMouseMove(e){
        if(!isDragging) return;

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const boxWidth = container.offsetWidth;
        const boxHeight = container.offsetHeight;

        let newLeft = e.clientX - offsetX;
        let newTop = e.clientY - offsetY;

        // Minimum top = 10px
        newTop = Math.max(10, newTop);

        // Allow the box to go out of left/right/bottom but keep at least 30px visible
        const minVisibleX = -boxWidth + 150;
        const maxVisibleX = viewportWidth - 150;
        const minVisibleY = -boxHeight + 30;
        const maxVisibleY = viewportHeight - 30;

        // Clamp left and top to keep 30px visible
        newLeft = Math.min(Math.max(newLeft, minVisibleX), maxVisibleX);
        newTop = Math.min(newTop, maxVisibleY); // Already applied minTop = 10 above

        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`;
        container.style.right = "auto";
        container.style.bottom = "auto";
    }

    function onMouseUp(){
        document.body.style.userSelect = '';
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener("mousemove",onMouseMove);
    document.addEventListener("mouseup",onMouseUp);
}

function addClosebuttonStyles(closeBtn){
    addClosebuttonStyles_OnlyColorChanges(closeBtn);
    closeBtn.style.fontSize = "1rem";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.alignSelf = "center";
}

function addClosebuttonStyles_OnlyColorChanges(closeBtn){
    closeBtn.style.color = theme === "dark"? COLORS["closeBtn-color-dark"] : COLORS["closeBtn-color-light"];
}

function addMessageAreaStyles(messages){
    addMessageAreaStyles_OnlyColorChanges(messages);
    messages.style.flex = "1";
    messages.style.padding = "10px";
    messages.style.overflowY = "auto";
    messages.style.display = "flex";
    messages.style.flexDirection = "column";
}

function addMessageAreaStyles_OnlyColorChanges(messages){
    messages.style.backgroundColor = theme === "dark" ? COLORS["messageArea-backgroundColor-dark"] : COLORS["messageArea-backgroundColor-light"];
}

function addInputAndSendAreaStyles(inputArea){
    addInputAndSendAreaStyles_OnlyColorChanges(inputArea);
    inputArea.style.display = "flex";
    inputArea.style.padding = "10px";
    inputArea.style.borderTop = "1px solid #ccc";
}

function addInputAndSendAreaStyles_OnlyColorChanges(inputArea){
    inputArea.style.backgroundColor = theme === "dark" ? COLORS["inputArea-backgroundColor-dark"] : COLORS["inputArea-backgroundColor-light"];
}

function addInputStyles(input){
    addInputStyles_OnlyColorChanges(input);
    Object.assign(input.style, {
        width: "100%",
        minHeight: "2.6rem",  // Set  minHeight
        height: "2.6rem",
        maxHeight: "10rem", // ~7 lines (7 * 1.75rem per line with padding)
        overflowY: "auto",
        resize: "vertical",
        fontSize: "0.9rem",
        fontWeight: "400",
        padding: "0.5rem",
        lineHeight: "1.4rem",
        borderRadius: "0.3rem",
        border: "1px solid #ccc",
        boxSizing: "border-box",
    });
}

function addInputStyles_OnlyColorChanges(input){
    input.style.backgroundColor = theme === "dark" ? COLORS["inputText-backgroundColor-dark"] : COLORS["inputText-backgroundColor-light"];
    input.style.color = theme === "dark" ? COLORS["inputText-color-dark"] : COLORS["inputText-color-light"];
}

function addInputEventListeners(input){
    input.addEventListener("input", () => {
        input.style.height = "auto"; // Reset height
        input.style.height = input.scrollHeight + "px"; // Grow to fit content
    });

    // CHAT BOX Display Message if 'enter' is pressed
    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();  // Override: do not insert newline
            sendUserMessageForAiResponse(input);  // Instead: sending message
        }
    });
}

function getCurrentProblemId(){
    const path = window.location.pathname.split("/")[2];
    const parts = path.split("-");
    const num = Number(parts[parts.length - 1]);
    console.log(num);
    return num;
}

function getProblemDataById(id){
    console.log("id:",id);
    console.log(typeof id);
    console.log(problemsDataMap.has(id));
    if(id && problemsDataMap.has(id)){
        return problemsDataMap.get(id);
    }
    console.log("No data found for problem id:",id);
    return null;
}

function getContext(){
    const text = `
You are a helpful AI coding assistant designed to support users solving algorithmic and data structure problems on a coding platform.

The user is currently working on a specific coding problem. Below is the complete context of the problem, including its title, description, and related details. Use this context to guide your answers and stay strictly within the problem's boundaries.

---

🔒 Guidelines:
- Always stay focused on the current problem and concepts required to solve the current problem.
- Do **not** answer general knowledge or unrelated questions (e.g., "What is the capital of France?"). And focus the user on the problem 'politely'.
- Donot Directly give the solution on the very first go, even when asked. Instead guide the user towards solving the problem.
- Donot give all the steps required to solve the problem. Push the user step by step and let the user think in the right direction.
- Use proper formatting (e.g., code blocks, bullet points) to make responses easy to read.
- Use only the information provided. Do **not** hallucinate inputs, constraints, or sample cases.
- Your first message should be very short, "donot repeat the whole question". Mention the problem name. At the end of your response, try to give a relevant question.
- Information regarding the Problem context is given below. Some fields may be empty But there is good amount of information, so if some field are empty use remaining and your understanding to guide the user.

---

🧠 Problem Context:

`;
    return text;
}

function getProblemName(){
    const headingElem = document.getElementsByClassName("Header_resource_heading__cpRp1")[0];
    if(!headingElem) return null;
    console.log(headingElem.innerText);
    return headingElem.innerText;
}

function getDescription(){
    const query = document.querySelectorAll(".undefined.d-flex.flex-column.markdown-renderer")[0];
    if(!query) return null;
    console.log(query.innerText);
    return query.innerText;
}

function getInputFormat(){
    const query = document.querySelectorAll(".undefined.d-flex.flex-column.markdown-renderer")[1];
    if(!query) return null;
    console.log(query.innerText);
    return query.innerText;
}

function getOutputFormat(){
    const query = document.querySelectorAll(".undefined.d-flex.flex-column.markdown-renderer")[2];
    if(!query) return null;
    console.log(query.innerText);
    return query.innerText;
}

function getConstraints(){
    const query = document.querySelectorAll(".undefined.d-flex.flex-column.markdown-renderer")[3];
    if(!query) return null;
    console.log(query.innerText);
    return query.innerText;
}

function getSampleTestCases(){
    let text = ``;
    const queries = document.querySelectorAll(".d-flex.overflow-hidden.border_blue.border_radius_8");
    if(!queries) return null;
    queries.forEach((query) => {
        text += query.innerText;
        text += "\n\n";
    })
    console.log(text);
    return text;
}

function getNote(){
    const query = document.querySelectorAll(".undefined.d-flex.flex-column.markdown-renderer")[4];
    if(!query) return null;
    console.log(query.innerText);
    return query.innerText;
}

function getTags(id) {
    console.log("Entered Tags",typeof id);
    try {
        const value = getProblemDataById(id);
        console.log("This is the value,",value);
        if (!value) return null;
        console.log(value);
        const tags = value?.data?.tags;
        console.log(tags);
        return tags || null;
    } catch (error) {
        console.log(`Error retrieving tags for problem ID ${id}:`, error);
        return null;
    }
}

function getHintsAndSolutionApproach(id) {
    try {
        const value = getProblemDataById(id);
        if (!value) return null;

        const hintsObj = value?.data?.hints;
        if (!hintsObj) return null;

        const decodeHtml = (html) => {
            const txt = document.createElement("textarea");
            txt.innerHTML = html;
            return txt.value;
        };

        const stripHtmlTags = (html) => {
            let clean = decodeHtml(
                html
                    .replace(/<\/p>/gi, '\n')        // Paragraph end to newline
                    .replace(/<br\s*\/?>/gi, '\n')   // <br> to newline
                    .replace(/<[^>]*>/g, '')         // Strip all remaining HTML tags
                    .replace(/\\n/g, '\n')           // Convert escaped \n to real newlines
                    .replace(/\\t/g, '\t')           // Convert escaped \t to real tabs
            );

            // Collapse 3+ newlines into 2
            clean = clean.replace(/\n{3,}/g, '\n\n');

            // Normalize spacing before Markdown-like headings
            clean = clean.replace(/(\*\*HINT\d+\*\*)/gi, '\n$1');
            clean = clean.replace(/(\*\*SOLUTION APPROACH\*\*)/gi, '\n$1');

            return clean.trim();
        };

        let result = "";
        for (const [key, val] of Object.entries(hintsObj)) {
            const readableKey = key.replace(/_/g, " ").toUpperCase();  // E.g. solution_approach → SOLUTION APPROACH
            const cleanVal = stripHtmlTags(val);
            result += `### **${readableKey}**\n\n${cleanVal}\n\n`;
        }

        return result.trim();
    } catch (error) {
        console.log(`Error retrieving hints for problem ID ${id}:`, error);
        return null;
    }
}

function getCodeLanguage(id){
    try {
        const value = getProblemDataById(id);
        if (!value) return null;

        const codeLanguage = value?.data?.editorial_code[0]?.language;
        return codeLanguage || null;
    } catch (error) {
        console.log(`Error retrieving Code Language for problem ID ${id}:`, error);
        return null;
    }
}

function getSolutionCode(id){
    console.log("Entered CodeSolution function");
    try {
        const value = getProblemDataById(id);
        if (!value) return null;
        console.log("value of CodeSolution,",value.data.editorial_code[0].language);
        const editorialCode = value?.data?.editorial_code[0]?.code;
        return editorialCode || null;
    } catch (error) {
        console.log(`Error retrieving Solution code for problem ID ${id}:`, error);
        return null;
    }
}

function getUserId(key){
    console.log("Entered Get UserId");
    try {
        const value = getProblemDataById(key);
        if (!value) return null;
        const userId = value?.data?.id;
        console.log("--------------------------------------#######################***********  UserId:",userId);
        return userId || null;
    } catch (error) {
        console.log(`Error retrieving userId :`, error);
        return null;
    }
}

function getCurrentCode(){
    console.log("Get Current Code:-----------------------------------------*********&&&&&&&&&&&&&&&&&&&&&&");
    const prefixOfProblemCode = "course";
    const userId = getUserId(-1);
    const problemId = getCurrentProblemId();
    const codeLanguage = document.querySelector(".ant-select.coding_select__UjxFb.css-ja10cu.ant-select-single.ant-select-show-arrow");
    if( !userId || !problemId || !codeLanguage ) return null;
    
    const key = `${prefixOfProblemCode}_${userId}_${problemId}_${codeLanguage.textContent}`;
    console.log(key);
    const editorialCodeRaw = localStorage.getItem(key);
    let editorialCode = null;
    if (editorialCodeRaw) {
        try {
            editorialCode = JSON.parse(editorialCodeRaw);
            console.log("Editorial code: ",editorialCode);
            return { myCodeLanguage: codeLanguage.textContent, myCurrentCode: editorialCode };
        } catch (e) {
            console.error("Error parsing template from localStorage:", e);
            return null;
        }
    }
    return null; 
}

function getEmptyString(){
    return "";
}

async function addAndSaveSystemMessage(){
    let id = getCurrentProblemId();
    let prompt = ``;
    let context = getContext() || getEmptyString();
    let problemName = getProblemName();
    let description = getDescription();
    let inputFormat = getInputFormat();
    let outputFormat = getOutputFormat();
    let constraints = getConstraints();
    let sampleTestCases = getSampleTestCases();
    let notes = getNote();
    let tags = getTags(id) || getEmptyString();
    let hintsAndSolutionApproach = getHintsAndSolutionApproach(id) || getEmptyString();
    let codeLanguage = getCodeLanguage(id) || getEmptyString();
    let solutionCode = getSolutionCode(id) || getEmptyString();
    let {myCodeLanguage, myCurrentCode} = getCurrentCode() || {myCodeLanguage: "plaintext", myCurrentCode: "No current code available in local storage for this problem."};

const insertCodeInPrompt = `
\`\`\`${myCodeLanguage}
${myCurrentCode}
\`\`\`
`;

prompt = `
${context} 
**Problem Title:** <<${problemName}>>

**Description:**:
${description}

**Input Format:**  
${inputFormat}

**Output Format:**  
${outputFormat}

**Constraints:**  
${constraints}

**Sample Test Cases:**  
${sampleTestCases}

**Test Case Explanations:**  
${notes}

**Tags (if any):**  
${tags}

**Hints And Solution Approach (if any):**  
${JSON.stringify(hintsAndSolutionApproach)}

**Solution Code (if any):**  
**Coding Language:** ${codeLanguage}
${solutionCode}

**My Current Code Written Until now (It may be the starting code only, will be further enhanced and user may provide enhanced code if necessary, even if the code is finished and working user may still ask doubts or try to solve the problem again):**
${insertCodeInPrompt}
`;

    console.log("-------------------------------------------*************        PROMPT         ***********------------------------------------------------------");
    console.log(prompt);
    await saveChatMessageToLocalStorage(prompt, "system");
    console.log("---------------------------*****   PRINTING PROBLEMS MAP      *****----------------------------------------");
    for (const [key, value] of problemsDataMap){
        console.log(`Key: ${key}`,typeof key, value);
    }

    for (const [key, value] of problemsDataMap){
        
        console.log(`Key: ${key}`, value.data);
    }

    for (const [key, value] of problemsDataMap){
        
        console.log(`Key: ${key}`, value.data.tags);
    }
}

async function sendUserMessageForAiResponse(input){
    const userMessage = input.value.trim();
    if(userMessage==="") return;
    input.value = "";
    input.style.height = "2.6rem";
    input.disabled = true;

    // Call Gemini AI 
    const problemId = window.location.pathname.split("/")[2];
    const problemKey = `${keyWithoutId}${problemId}`;
    let storageData  = await chrome.storage.local.get([API_KEY,problemKey]);
    const apiKey = storageData[API_KEY];
    // SafeSide
    if(!apiKey){
        addMessage("API key is missing. Please set it in extension settings.", "model");
        input.disabled = false;
        return;
    }
    
    let history = storageData[problemKey] || [];
    if(history.length === 0){
        await addAndSaveSystemMessage();
    }

    addMessage(userMessage, "user");
    await saveChatMessageToLocalStorage(userMessage,"user");

    storageData  = await chrome.storage.local.get([API_KEY,problemKey]);
    history = storageData[problemKey] || []; 

    const geminiMessages = history.map(message => ({
        role: (message["role"] === "system") ? "user" : message["role"],
        parts: [{ text: message["msg"] }]
    }));

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: geminiMessages
            })
        });

        const data = await res.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || data.error?.message || "Sorry, I didn't understand that.";
        addMessage(aiResponse, "model");
        await saveChatMessageToLocalStorage(aiResponse, "model");

    } catch (error) {
        console.error("API Error:", error);
        addMessage("There was an error connecting to the AI.", "model");
    } finally {
        input.disabled = false;
    }
}

function addSendButtonStyles(sendBtn){
    addSendButtonStyles_OnlyColorChanges(sendBtn);
    sendBtn.style.marginLeft = "8px";
    sendBtn.style.padding = "8px 12px";
    sendBtn.style.borderWidth = "1px";
    sendBtn.style.borderStyle = "solid";
    sendBtn.style.borderRadius = "6px";
    sendBtn.style.cursor = "pointer";
    sendBtn.style.marginBottom = "5px";
    sendBtn.style.fontSize = "1rem";
    sendBtn.style.fontWeight = "600";
    sendBtn.style.alignSelf = "flex-end";
    sendBtn.style.transition = "border-color 0.2s ease";
}

function addSendButtonEventListeners(sendBtn){
    sendBtn.addEventListener("mouseover", () => {
        sendBtn.style.backgroundColor = theme === "dark" ? COLORS["sendBtn-mouseover-backgroundColor-dark"] : COLORS["sendBtn-mouseover-backgroundColor-light"];   // hover color
        sendBtn.style.borderWidth = "1px";
        sendBtn.style.borderStyle = "solid";
        sendBtn.style.borderColor = theme === "dark" ? COLORS["sendBtn-mouseover-borderColor-dark"] : COLORS["sendBtn-mouseover-borderColor-light"];
    });

    sendBtn.addEventListener("mouseout", () => {
        sendBtn.style.backgroundColor = theme === "dark" ? COLORS["sendBtn-mouseout-backgroundColor-dark"] : COLORS["sendBtn-mouseout-backgroundColor-light"];   // original color
        sendBtn.style.borderWidth = "1px";
        sendBtn.style.borderStyle = "solid";
        sendBtn.style.borderColor = theme === "dark" ? COLORS["sendBtn-mouseout-borderColor-dark"] : COLORS["sendBtn-mouseout-borderColor-light"];
    });
}

function addSendButtonStyles_OnlyColorChanges(sendBtn){
    sendBtn.style.backgroundColor = theme === "dark" ? COLORS["sendBtn-backgroundColor-dark"] : COLORS["sendBtn-backgroundColor-light"];
    sendBtn.style.color = theme === "dark" ? COLORS["sendBtn-color-dark"] : COLORS["sendBtn-color-light"];
    sendBtn.style.borderColor = theme === "dark" ? COLORS["sendBtn-borderColor-dark"] : COLORS["sendBtn-borderColor-light"];
}

function addResizeStripesStyles(stripes){
    stripes.style.position = "absolute";
    stripes.style.height = "10px";
    stripes.style.width = "10px";
    stripes.style.right = "0px";
    stripes.style.bottom = "0px";
    stripes.style.zIndex = "93";
    stripes.style.background = 'repeating-linear-gradient(135deg, #666 0 2px, transparent 2px 4px)';
    stripes.style.cursor = "nwse-resize";
}

function mousedownBottomRight(event, container) {
    event.stopPropagation();
    isResizing = true;

    // Disable text selection
    document.body.style.userSelect = "none";

    // Create and insert overlay to block interaction
    const resizeOverlay = createResizeOverlay();
    resizeOverlay.style.cursor = "nwse-resize";

    function onMouseMove(e) {
        if (!isResizing) return;

        const minHeight = CHAT_BOX_MIN_DIMENSIONS["height"];
        const minWidth = CHAT_BOX_MIN_DIMENSIONS["width"];
        const maxWidth = window.innerWidth;
        const maxHeight = window.innerHeight;

        let newWidth = e.clientX - container.getBoundingClientRect().left;
        let newHeight = e.clientY - container.getBoundingClientRect().top;

        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

        container.style.width = `${newWidth}px`;
        container.style.height = `${newHeight}px`;
    }

    function onMouseUp() {
        isResizing = false;
        document.body.style.userSelect = "";

        // Remove overlay
        if (resizeOverlay) {
            document.body.removeChild(resizeOverlay);
        }

        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
}

function addAllResizers(container) {
    const sides = ['right', 'left', 'top', 'bottom'];

    sides.forEach(side => {
        const el = document.createElement('div');
        el.className = `resize-${side}`;
        setResizerStyle(el, side);
        el.addEventListener('mousedown', (e) => mousedownResizeFourSides(e, container, side));
        container.appendChild(el);
    });
}

function setResizerStyle(el, side) {
    el.style.position = 'absolute';
    el.style.zIndex = '93';
    el.style.background = 'transparent';
    el.style.cursor = side === 'left' || side === 'right' ? 'ew-resize' : 'ns-resize';

    if (side === 'right') {
        el.style.height = "calc(100% - 10px)";
        el.style.width = '10px';
        el.style.right = '0';
        el.style.top = '0';
    } else if (side === 'left') {
        el.style.height = "100%";
        el.style.width = '10px';
        el.style.left = '0';
        el.style.top = '0';
    } else if (side === 'top') {
        el.style.height = '10px';
        el.style.width = "100%";
        el.style.top = '0';
        el.style.left = '0';
    } else if (side === 'bottom') {
        el.style.height = '10px';
        el.style.width = "calc(100% - 10px)";
        el.style.bottom = '0';
        el.style.left = '0';
    }
}

function mousedownResizeFourSides(event, container, side) {
    event.preventDefault();
    event.stopPropagation();

    document.body.style.userSelect = 'none';

    const resizeOverlay = createResizeOverlay();

    const minHeight = CHAT_BOX_MIN_DIMENSIONS["height"];
    const minWidth = CHAT_BOX_MIN_DIMENSIONS["width"];

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = parseInt(document.defaultView.getComputedStyle(container).width, 10);
    const startHeight = parseInt(document.defaultView.getComputedStyle(container).height, 10);
    const startLeft = container.getBoundingClientRect().left;
    const startTop = container.getBoundingClientRect().top;

    function doDrag(e) {
        if (side === 'right') {
            const newWidth = startWidth + e.clientX - startX;
            container.style.width = `${Math.max(minWidth, newWidth)}px`;
        } else if (side === 'left') {
            const deltaX = e.clientX - startX;
            const newWidth = startWidth - deltaX;
            const newLeft = startLeft + deltaX;
            if (newWidth >= minWidth) {
                container.style.width = `${newWidth}px`;
                container.style.left = `${newLeft}px`;
            }
        } else if (side === 'bottom') {
            const newHeight = startHeight + e.clientY - startY;
            container.style.height = `${Math.max(minHeight, newHeight)}px`;
        } else if (side === 'top') {
            const deltaY = e.clientY - startY;
            const newHeight = startHeight - deltaY;
            const newTop = startTop + deltaY;
            if (newHeight >= minHeight && newTop >= 10) {
                container.style.height = `${newHeight}px`;
                container.style.top = `${newTop}px`;
            }
        }
    }

    function stopDrag() {
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', doDrag);
        window.removeEventListener('mouseup', stopDrag);
        if (resizeOverlay && resizeOverlay.parentNode) {
            resizeOverlay.remove();
        }
    }

    window.addEventListener('mousemove', doDrag);
    window.addEventListener('mouseup', stopDrag);
}

function createResizeOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.zIndex = '91';
    overlay.style.cursor = 'default'; // cursor will still show based on the resizer
    overlay.style.background = 'transparent'; // or 'rgba(0,0,0,0.01)' if needed
    overlay.style.pointerEvents = "all"; // block all events
    document.body.appendChild(overlay);
    return overlay;
}

function addMessage(message, role) {
    if(role==="system") return;
    const messages = document.getElementById("chat-box-chat-messages");
    const msgDiv = document.createElement("div");
    msgDiv.style.boxSizing = "border-box";

    const html = marked.parse(message);
    console.log(html);
    msgDiv.innerHTML = html;

    // Remove margin from paragraphs
    const paragraphs = msgDiv.querySelectorAll("p");
    paragraphs.forEach((p) => {
        p.style.margin = "0px";
    });

    // Style inline code elements (if any)
    const inlineCodes = msgDiv.querySelectorAll("p > code");
    inlineCodes.forEach((code) => inlineCodeStyles(code));

    // Style block code sections (pre > code)
    const codeBlocks = msgDiv.querySelectorAll("pre code");
    codeBlocks.forEach((code) => preCodeBlocksStyles(code));

    const preBlocks = msgDiv.querySelectorAll("pre");
    preBlocks.forEach((pre) => preBlocksStyles(pre));

    addMessageStyles(msgDiv, role);
    
    const copyIconImg = document.createElement('img');
    copyIconImg.src = copyIcon;
    addCopyIconImgStyles(copyIconImg);
    if(role === "user"){
        copyIconImg.style.alignSelf = "flex-start";
    }else if(role === "model"){
        copyIconImg.style.alignSelf = "flex-end";
    }

    msgDiv.appendChild(copyIconImg);
    messages.appendChild(msgDiv);
    // messages.scrollTop = messages.scrollHeight;
    msgDiv.scrollIntoView({ block: "start", behavior: "smooth" });

    copyIconImg.addEventListener("click", (event) => {
        event.stopPropagation(); // just in case

        // Get the text content of the message div, excluding the copy icon itself
        const parent = event.target.parentElement;

        // Clone the message div to safely remove the icon
        const clone = parent.cloneNode(true);

        // Remove the copy icon from the cloned node
        const icon = clone.querySelector('img');
        if (icon) icon.remove();

        const textToCopy = clone.innerText.trim();

        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy).then(() => {
            copyIconImg.src = tickmarkIcon;
            setTimeout(() => {
                copyIconImg.src = copyIcon;
            }, 2000);

        }).catch(err => {
            console.error("Copy failed:", err);
        });
    });
}

function addCopiedMsgStyles(copiedMsg){
    copiedMsg.style.fontSize = "10px";
    addCopiedMsgStyles_OnlyColorChanges(copiedMsg);
}

function addCopiedMsgStyles_OnlyColorChanges(copiedMsg){
    copiedMsg.style.color = theme === "dark" ? COLORS["copiedMsg-color-dark"] : COLORS["copiedMsg-color-light"];
}

function addCopyIconImgStyles(copyIconImg){
    copyIconImg.style.height = "12px";
    copyIconImg.style.width = "12px";
    copyIconImg.style.marginTop = "5px";
    copyIconImg.style.cursor = "pointer";
}

function addTickmarkImgIcon(tickmarkImgIcon){
    tickmarkImgIcon.style.marginRight = "2px";
    tickmarkImgIcon.style.height = "13px";
    tickmarkImgIcon.style.width = "13px";
}

function inlineCodeStyles(code){
    inlineCodeStyles_OnlyColorChanges(code);
    code.style.padding = "2px 4px";
    code.style.borderRadius = "4px";
}

function inlineCodeStyles_OnlyColorChanges(code){
    code.style.backgroundColor = theme === "dark" ? COLORS["inlineCodeStyle-backgroundColor-dark"] : COLORS["inlineCodeStyle-backgroundColor-light"];
    code.style.color = theme === "dark" ? COLORS["inlineCodeStyle-color-dark"] : COLORS["inlineCodeStyle-color-light"];
}

function preCodeBlocksStyles(code){
    preCodeBlocksStyles_OnlyColorChanges(code);
    code.style.display = "block";
    code.style.padding = "1em";
    code.style.borderRadius = "8px";
    code.style.overflowX = "auto";
    code.style.fontFamily = "monospace";
    code.style.whiteSpace = "pre-wrap";
}

function preCodeBlocksStyles_OnlyColorChanges(code){
    code.style.backgroundColor = theme === "dark" ? COLORS["preCodeBlockStyle-backgroundColor-dark"] : COLORS["preCodeBlockStyle-backgroundColor-light"];
    code.style.color = theme === "dark" ? COLORS["preCodeBlockStyle-color-dark"] : COLORS["preCodeBlockStyle-color-light"];
}

function preBlocksStyles(pre){
    preBlocksStyles_OnlyColorChanges(pre);
    pre.style.borderRadius = "8px";
    pre.style.padding = "0";
    pre.style.margin = "0.5em 0";
}

function preBlocksStyles_OnlyColorChanges(pre){
    pre.style.backgroundColor = theme === "dark" ? COLORS["preBlockStyle-backgroundColor-dark"] : COLORS["preBlockStyle-backgroundColor-light"];
}

function addMessageStyles(msgDiv,role){
    if(theme === "dark"){
        msgDiv.style.backgroundColor = role === "user" ? COLORS["userMessage-backgroundColor-dark"] : COLORS["aiResponse-backgroundColor-dark"];
    }else{
        msgDiv.style.backgroundColor = role === "user" ? COLORS["userMessage-backgroundColor-light"] : COLORS["aiResponse-backgroundColor-light"];
    }
    msgDiv.style.borderRadius = "6px";
    msgDiv.style.minWidth = "25%";
    msgDiv.style.maxWidth = "90%";
    msgDiv.style.overflowWrap = "break-word";
    msgDiv.style.alignSelf = role === "user" ? "flex-end" : "flex-start";
    msgDiv.style.color = theme === "dark" ? COLORS["chatMessage-color-dark"] : COLORS["chatMessage-color-light"];
    msgDiv.style.padding = "10px";
    msgDiv.style.margin = "6px";
    msgDiv.style.lineHeight = "1.5";
    msgDiv.style.fontSize = "14px";
    msgDiv.style.display = "flex";
    msgDiv.style.flexDirection = "column";
}

// Re-style previous chat messages
function applyThemeBasedStylesForChat(){
    const allMessages = document.querySelectorAll("#chat-box-chat-messages > div");
    allMessages.forEach((msgDiv) => {
        const isUser = msgDiv.style.alignSelf === "flex-end";
        msgDiv.style.backgroundColor = isUser
            ? (theme === "dark" ? COLORS["userMessage-backgroundColor-dark"] : COLORS["userMessage-backgroundColor-light"])
            : (theme === "dark" ? COLORS["aiResponse-backgroundColor-dark"] : COLORS["aiResponse-backgroundColor-light"]);
        msgDiv.style.color = theme === "dark" ? COLORS["chatMessage-color-dark"] : COLORS["chatMessage-color-light"];
    });

    // Style inline code elements (if any)
    const inlineCodes = document.querySelectorAll("#chat-box-chat-messages p > code");
    inlineCodes.forEach((code) => inlineCodeStyles_OnlyColorChanges(code));

    // Style block code sections (pre > code)
    const codeBlocks = document.querySelectorAll("#chat-box-chat-messages pre code");
    codeBlocks.forEach((code) => preCodeBlocksStyles_OnlyColorChanges(code));

    const preBlocks = document.querySelectorAll("#chat-box-chat-messages pre");
    preBlocks.forEach((pre) => preBlocksStyles_OnlyColorChanges(pre));
}

async function saveChatMessageToLocalStorage(msg, role) {
    try {
        const problemId = window.location.pathname.split("/")[2];
        if (!problemId) throw new Error("Invalid problemId from URL.");

        const key = `${keyWithoutId}${problemId}`;
        const localStorageData = await chrome.storage.local.get([key]);
        const value = localStorageData[key] || [];
        value.push({ role, msg });
        await chrome.storage.local.set({ [key]: value });
    } catch (error) {
        console.error("Failed to save chat message:", error);
    }
}


