// DOM Elements
const terminal = document.getElementById("terminal");
const prompt = `user@portfolio:~$`;
const files = ["master-resume.md"];
const fileURL = "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";

// Initialize Terminal
document.addEventListener("DOMContentLoaded", () => {
    printLine("Welcome to my Terminal Portfolio! Type <strong>help</strong> to get started.");
    addNewInputLine();
});

document.addEventListener("click", () => document.querySelector(".command-input").focus());

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
    }
});

// Simplified Command List
const commands = ["help", "ls", "cat", "cv", "clear"];

// Command Handler
async function handleCommand(input) {
    const [command, ...args] = input.split(" ");
    switch (command) {
        case "help":
            printHelp();
            break;
        case "ls":
            printLine(files.join("<br>"));
            break;
        case "cat":
            if (args[0] === "master-resume.md") {
                await renderMarkdownFile();
            } else {
                printLine(`cat: ${args[0]}: No such file`);
            }
            break;
        case "cv":
            await renderMarkdownFile();
            break;
        case "clear":
            clearTerminal();
            break;
        default:
            printLine(`bash: ${command}: command not found`);
    }
}

// Render Full Markdown Resume
async function renderMarkdownFile() {
    try {
        const response = await fetch(fileURL);
        if (!response.ok) throw new Error("Failed to fetch the resume file.");
        const markdown = await response.text();
        printLine(marked.parse(markdown));
    } catch (error) {
        printLine(`Error: Could not load master-resume.md`);
    }
}

// Add new input line
function addNewInputLine() {
    const inputLine = document.createElement("div");
    inputLine.className = "input-line";
    inputLine.innerHTML = `<span class="input-prompt">${prompt}</span><input type="text" class="command-input" autofocus autocomplete="off">`;
    terminal.appendChild(inputLine);
    terminal.scrollTop = terminal.scrollHeight;
    inputLine.querySelector(".command-input").focus();
}

// Print Help
function printHelp() {
  printLine(`
<strong>Available Commands:</strong><br>
<table>
<tr><td>help</td><td>Show available commands.</td></tr>
<tr><td>ls</td><td>List files.</td></tr>
<tr><td>cat &lt;filename&gt;</td><td>Display the content of a file.</td></tr>
<tr><td>cv</td><td>View the resume (alias for 'cat master-resume.md').</td></tr>
<tr><td>clear</td><td>Clear the terminal.</td></tr>
</table>`);
}

// Print lines
function printLine(content) {
    const line = document.createElement("div");
    line.innerHTML = content;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// Clear terminal
function clearTerminal() {
    terminal.innerHTML = "";
}

// Tab Autocomplete
function handleTabCompletion(inputField) {
    const input = inputField.value.trim();
    const matches = commands.filter((cmd) => cmd.startsWith(input));
    if (matches.length === 1) inputField.value = matches[0];
}
