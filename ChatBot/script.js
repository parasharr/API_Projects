const typingForm = document.querySelector(".typing-form");
const chatList = document.querySelector(".chat-list");

let userMessage = null;

// create a new message element and return it
const createMessageElement = (content, className) =>{
    const div = document.createElement("div");
    div.classList.add("message", className);
    div.innerHTML = content;
    return div;
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
            <span class="icon"><i class="fa-regular fa-copy"></i></span>`;

const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
chatList.appendChild(incomingMessageDiv);
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

typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    handleOutgoingChat();
});