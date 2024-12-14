const terminalOutput = document.getElementById("output");
const commandInput = document.getElementById("command-input");

const commands = {
    about: "I am a passionate developer skilled in JavaScript, Python, and Linux systems.",
    projects: "1. Portfolio Terminal\n2. E-commerce Site\n3. Open Source Contributions",
    contact: "Email: yourname@example.com\nGitHub: github.com/yourprofile",
    help: "Available commands: about, projects, contact, help",
};

commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const input = commandInput.value.trim();
        const response = commands[input] || `"${input}" is not a valid command. Type 'help' for a list of commands.`;
        terminalOutput.innerHTML += `$ ${input}\n${response}\n\n`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        commandInput.value = "";
    }
});
