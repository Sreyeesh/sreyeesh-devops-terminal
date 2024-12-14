const terminalBody = document.getElementById('terminal-body');
const terminalInput = document.getElementById('terminal-input');
const prompt = document.getElementById('prompt');

// Command definitions
const commands = {
    help: `Available commands:
- help: Display this help message
- ls: List directory contents
- pwd: Show current directory
- clear: Clear the terminal`,
    ls: () => "home  about.txt  projects",
    pwd: () => "/home/user",
    clear: () => {
        terminalBody.innerHTML = '';
        return '';
    }
};

// Function to execute user commands
function executeCommand(input) {
    const [command, ...args] = input.trim().split(' ');
    let output;

    if (commands[command]) {
        output = typeof commands[command] === 'function' ? commands[command](args) : commands[command];
    } else {
        output = `Command not found: ${command}`;
    }

    if (command !== 'clear') {
        terminalBody.innerHTML += `\n${prompt.textContent} ${input}\n${output}`;
    }

    terminalBody.scrollTop = terminalBody.scrollHeight; // Auto-scroll to the bottom
}

// Event listener for terminal input
terminalInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const input = terminalInput.value;
        terminalInput.value = '';
        executeCommand(input);
    }
});
