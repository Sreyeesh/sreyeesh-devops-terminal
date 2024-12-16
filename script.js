// DOM Elements
const terminal = document.getElementById("terminal");
const commands = ["help", "ls", "cat", "cv", "clear", "exit", "pwd"];
const files = ["master-resume.md"];
const prompt = `user@portfolio:~$`;

// Initialize Terminal
document.addEventListener("DOMContentLoaded", () => {
    printLine("Welcome to my streamlined Terminal Portfolio!");
    printLine("Type <strong>help</strong> to get started.");
    addNewInputLine();
});

document.addEventListener("click", () => document.querySelector(".command-input").focus());

// Handle Input Events
document.addEventListener("keydown", async (e) => {
    const inputField = document.activeElement;
    if (!inputField.classList.contains("command-input")) return;

    if (e.key === "Enter") {
        const input = inputField.value.trim();
        printLine(`${prompt} ${input}`);
        await handleCommand(input);
        inputField.disabled = true;
        addNewInputLine();
    } else if (e.key === "Tab") {
        e.preventDefault();
        handleTabCompletion(inputField);
    } else if (e.ctrlKey && e.key === "l") {
        clearTerminal();
        e.preventDefault();
    }
});

// Add a new input line dynamically
function addNewInputLine() {
    const inputLine = document.createElement("div");
    inputLine.className = "input-line";
    inputLine.innerHTML = `<span class="input-prompt">${prompt}</span><input type="text" class="command-input" autofocus autocomplete="off">`;
    terminal.appendChild(inputLine);
    terminal.scrollTop = terminal.scrollHeight;
    inputLine.querySelector(".command-input").focus();
}

// Handle commands
async function handleCommand(input) {
    const [command, ...args] = input.split(" ");
    switch (command) {
        case "help":
            printHelp();
            break;
        case "ls":
            printLine(files.join("<br>"));
            printLine(""); // Add spacing
            break;
        case "cat":
            if (args[0] === "master-resume.md") {
                await renderMarkdownFile();
            } else {
                printLine(`cat: ${args[0]}: No such file`);
                printLine(""); // Add spacing
            }
            break;
        case "cv": // Alias for cat master-resume.md
            await renderMarkdownFile();
            break;
        case "pwd":
            printLine("/home/user");
            printLine(""); // Add spacing
            break;
        case "clear":
            clearTerminal();
            break;
        case "exit":
            printLine("Session terminated. Goodbye!");
            disableInput();
            break;
        default:
            printLine(`bash: ${command}: command not found`);
            printLine(""); // Add spacing
    }
}

// Tab Autocomplete for Commands and Files
function handleTabCompletion(inputField) {
    const input = inputField.value.trim();
    const [command, partial] = input.split(" ");

    if (!command) {
        const matches = commands.filter((cmd) => cmd.startsWith(input));
        if (matches.length === 1) inputField.value = matches[0];
    } else if (command === "cat") {
        const matches = files.filter((file) => file.startsWith(partial || ""));
        if (matches.length === 1) inputField.value = `cat ${matches[0]}`;
    }
}

// Fetch and render Markdown file
async function renderMarkdownFile() {
    const fileURL = "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";
    try {
        const response = await fetch(fileURL);
        if (!response.ok) throw new Error("Failed to fetch the file.");
        const markdown = await response.text();

        const renderedHTML = marked.parse(markdown);
        printLine(`<div>${renderedHTML}</div>`);
        printLine(""); // Add spacing
    } catch (error) {
        printLine(`Error: Could not load master-resume.md`);
        printLine(""); // Add spacing
    }
}

// Print lines to terminal
function printLine(content) {
    const line = document.createElement("div");
    line.innerHTML = content;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// Print help menu
function printHelp() {
    printLine(`
<strong>Available Commands:</strong><br>
<table>
<tr><td>help</td><td>Show available commands.</td></tr>
<tr><td>ls</td><td>List files.</td></tr>
<tr><td>cat &lt;filename&gt;</td><td>Display the content of a file.</td></tr>
<tr><td>cv</td><td>View the resume (alias for 'cat master-resume.md').</td></tr>
<tr><td>pwd</td><td>Show current directory.</td></tr>
<tr><td>clear</td><td>Clear the terminal.</td></tr>
<tr><td>exit</td><td>Exit the terminal session.</td></tr>
</table>`);
    printLine(""); // Add spacing
}

// Clear terminal
function clearTerminal() {
    terminal.innerHTML = "";
}

// Disable input after exit
function disableInput() {
    const inputs = document.querySelectorAll(".command-input");
    inputs.forEach((input) => (input.disabled = true));
}
