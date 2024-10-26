const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleButton = document.querySelector("#toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");
const suggestions = document.querySelectorAll(".suggestion-list");

let userMessage = null;
let isResponseGenerating = false;
// API config
const API_KEY = "AIzaSyANHCGp8yGyf49CorgzXA3xUcqZ0HUYV5s";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () =>{
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode",isLightMode);
    toggleButton.innerText = isLightMode ? "dark_mode" : "light_mode";

    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats);
    chatList.scrollTo(0, chatList.scrollHeight);
}
loadLocalstorageData();


// create a new message element and return it
const createMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement, incomingMessageDiv)=>{
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(()=>{
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        
        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats",chatList.innerHTML);
        }
        chatList.scrollTo(0, chatList.scrollHeight);
    },75);
}

// Fetch response from the API based on user message
const generateAPIresponse = async(incomingMessageDiv)=>{
    const textElement = incomingMessageDiv.querySelector(".text");
    // Send a POST resquest to the API with the user's message
    try {
        const response = await fetch(API_URL,{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: userMessage}]
                }]
            })
        });    

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);

    } catch (error) {
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    }
    finally{
        incomingMessageDiv.classList.remove("loading");
    }
}

// show a loading animation while waiting for the api response
const showLoadingAnimation = ()=>{
    const html = `
    <div class="message-content">
                <img src="gemini.svg" alt="gemini" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copyMessage(this)" class="icon"><i class="fa-regular fa-copy"></i></span>`;

const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
chatList.appendChild(incomingMessageDiv);

chatList.scrollTo(0, chatList.scrollHeight);
generateAPIresponse(incomingMessageDiv);
}

const copyMessage = (copyIcon)=>{
    const messageText = copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "";
    setTimeout(() => copyIcon.innerText = "", 1000);
}

// handle sending outgoing chat message
const handleOutgoingChat = () => {
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) 
        return;// exit if thereis no message


    isResponseGenerating = true;



    const html = `
         <div class="message-content">
            <img src="uaKsnKgg.jpg" alt="user" class="avatar">
            <p class="text"></p>
        </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector('.text').innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // Clear input field
    chatList.scrollTo(0, chatList.scrollHeight);
    document.body.classList.add("hide-header");
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

suggestions.forEach(suggestion => {
    suggestion.addEventListener("click",()=>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingChat();
    })
})

// Darkmode/lightmode toggle button
toggleButton.addEventListener("click", function(){
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode")
    toggleButton.innerText = isLightMode ? "dark_mode" : "light_mode" 
});

deleteChatButton.addEventListener("click", function(){
    if(confirm("Are you sure you want to delete all messages?")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
});

typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    handleOutgoingChat();
});