const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");
const toggleButton = document.querySelector("#toggle-button");

let userMessage = null;

// API config
const API_KEY = "AIzaSyANHCGp8yGyf49CorgzXA3xUcqZ0HUYV5s";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const loadLocalstorageData = () =>{
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");

    document.body.classList.toggle("light_mode",isLightMode);
    toggleButton.innerText = isLightMode ? "dark_mode" : "light_mode" 

    chatList.innerHTML = savedChats || "";
}
loadLocalstorageData();


// create a new message element and return it
const createMessageElement = (content, ...classes) =>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const showTypingEffect = (text, textElement)=>{
    const words = text.split(' ');
    let currentWordIndex = 0;
    const typingInterval = setInterval(()=>{
        textElement.innerText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex++];
        
        if(currentWordIndex === words.length){
            clearInterval(typingInterval);
            localStorage.setItem("savedChats",chatList.innerHTML);
        }
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
        // console.log(data)

        const apiResponse = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement);

    } catch (error) {
        console.log(error);  
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
    userMessage = typingForm.querySelector(".typing-input").value.trim();
    if(!userMessage) 
        return; // exit if there is no message

    // console.log(userMessage);



    const html = `
         <div class="message-content">
            <img src="uaKsnKgg.jpg" alt="user" class="avatar">
            <p class="text"></p>
        </div>`;

    const outgoingMessageDiv = createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector('.text').innerText = userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // Clear input field
    setTimeout(showLoadingAnimation, 500); // Show loading animation after a delay
}

// Darkmode/lightmode toggle button
toggleButton.addEventListener("click", function(){
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode")
    toggleButton.innerText = isLightMode ? "dark_mode" : "light_mode" 
});

typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    handleOutgoingChat();
});