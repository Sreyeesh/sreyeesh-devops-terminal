// DOM Elements
const terminalOutput = document.getElementById("output");
const commandInput = document.getElementById("command-input");

// File System Simulation
const files = {
    "master-resume.md": "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md",
};

// Available Commands
const commands = {
    help: showHelp,
    clear: clearTerminal,
    ls: listFiles,
    cat: viewFileContent,
    pwd: printWorkingDirectory,
    resume: fetchMasterResume,
    exit: terminateSession,
};

// Command history
let commandHistory = [];
let historyIndex = 0;

// Current working directory simulation
const currentDirectory = "~";

// Focus input and set default theme on page load
document.addEventListener("DOMContentLoaded", () => {
    document.body.className = "dark"; // Default theme
    terminalOutput.innerHTML += `
Welcome to my Terminal Portfolio!<br>
Type <strong>help</strong> to get started.<br><br>
`;
    commandInput.focus();
});

document.addEventListener("click", () => commandInput.focus());

// Tab Auto-Completion
commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        e.preventDefault();
        const input = commandInput.value.trim();
        const args = input.split(" ");

        if (args.length === 1) {
            // Auto-complete commands if typing the first argument
            const matches = Object.keys(commands).filter((cmd) => cmd.startsWith(args[0]));
            handleAutoComplete(matches);
        } else if (args[0] === "cat" && args.length === 2) {
            // Auto-complete file names for the "cat" command
            const matches = Object.keys(files).filter((file) => file.startsWith(args[1]));
            handleAutoComplete(matches, args[0] + " ");
        }
    }
});

// Auto-complete helper function
function handleAutoComplete(matches, prefix = "") {
    if (matches.length === 1) {
        commandInput.value = prefix + matches[0]; // Auto-complete if only one match
    } else if (matches.length > 1) {
        terminalOutput.innerHTML += `<div class="output-line">Suggestions: ${matches.join(" ")}</div>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
}

// Command Implementations
function showHelp() {
    return `
<span class="help-header">Available Commands:</span>
<div class="help-row"><span class="help-command">help</span> <span class="help-description">Show this help message.</span></div>
<div class="help-row"><span class="help-command">clear</span> <span class="help-description">Clear the terminal screen.</span></div>
<div class="help-row"><span class="help-command">ls</span> <span class="help-description">List files in the current directory.</span></div>
<div class="help-row"><span class="help-command">cat &lt;filename&gt;</span> <span class="help-description">View the content of a file.</span></div>
<div class="help-row"><span class="help-command">pwd</span> <span class="help-description">Print the current working directory.</span></div>
<div class="help-row"><span class="help-command">resume</span> <span class="help-description">View the full resume.</span></div>
<div class="help-row"><span class="help-command">exit</span> <span class="help-description">Close the terminal session.</span></div>
    `;
}

function clearTerminal() {
    terminalOutput.innerHTML = "";
    return null;
}

function listFiles() {
    return Object.keys(files).join("\n");
}

function printWorkingDirectory() {
    return currentDirectory;
}

async function viewFileContent(input) {
    const args = input.split(" ");
    if (args.length < 2) {
        return "Error: No file specified. Usage: cat <filename>";
    }

    const filename = args[1];
    if (!files[filename]) {
        return `Error: File "${filename}" not found.`;
    }

    try {
        const response = await fetch(files[filename]);
        if (!response.ok) throw new Error("Error fetching the file.");
        const content = await response.text();

        // Render Markdown files using marked
        if (filename.endsWith(".md")) {
            return `<div>${marked.parse(content)}</div>`;
        }

        // Plain text fallback for non-Markdown files
        return `<pre>${content}</pre>`;
    } catch (error) {
        return `Error: Could not read the file "${filename}".`;
    }
}

async function fetchMasterResume() {
    return await viewFileContent("cat master-resume.md");
}

function terminateSession() {
    terminalOutput.innerHTML += `<div class="output-line">^D</div>`;
    terminalOutput.innerHTML += `<div class="output-line terminated">Session terminated. Closing...</div>`;
    commandInput.disabled = true;
    document.getElementById("input-line").style.display = "none";

    setTimeout(() => {
        window.close();
    }, 1000);
}

// Input Handling
commandInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const input = commandInput.value.trim();
        if (input) {
            commandHistory.push(input);
            historyIndex = commandHistory.length;

            const command = input.split(" ")[0];
            const response = commands[command]
                ? await commands[command](input)
                : `"${input}" is not a valid command. Type 'help' for a list of commands.`;

            terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div><div class="output-line">${response || ""}</div><br>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight; // Auto-scroll to bottom
        }
        commandInput.value = "";
    }
});
