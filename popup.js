const saveButton = document.getElementById('save-button');
const inputButton = document.getElementById('take-input');
const API_KEY = "api_key_ai_extension";

inputButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    saveAPIKey();
  }
});
saveButton.addEventListener("click",saveAPIKey);

function saveAPIKey() {
    const value = document.getElementById('take-input').value.trim();

    if(value==="") {
        displayMessage("Input Cannot be empty","lightcoral");
        setTimeout(() => {
            const msg = document.querySelector('.add-status-message');
            if (msg) msg.remove();
        }, 2000);
        return;
    }

    chrome.storage.local.set({ [API_KEY]: value }, () => {
        if (chrome.runtime.lastError) {
            console.log("Error Occurred:", chrome.runtime.lastError.message);
        } else {
            console.log("Added Successfully");
            displayMessage("successfully added","green");
            setTimeout(() => {
                const msg = document.querySelector('.add-status-message');
                if (msg) msg.remove();
            }, 2000);
        }
    });
}

function displayMessage(msg,color){
    const messageElement = document.createElement('div');
    messageElement.innerHTML = msg;
    messageElement.classList.add("add-status-message");
    messageElement.style.backgroundColor = color;
    const saveButton = document.querySelector('button');
    saveButton.insertAdjacentElement("afterend",messageElement);
}

