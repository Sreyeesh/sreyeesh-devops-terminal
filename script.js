// DOM Elements
const terminalOutput = document.getElementById("output");
const commandInput = document.getElementById("command-input");

// Commands object
const commands = {
    help: showHelp,
    resume: displayMarkdownResume,
    clear: clearTerminal,
    projects: showProjects,
    contact: showContact,
    skills: showSkills,
    exit: terminateSession, // Exit command
};

// Command history
let commandHistory = [];
let historyIndex = -1;

// Fetch and render the Markdown resume
async function fetchMarkdown(file) {
    const url = `https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/${file}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        return await response.text();
    } catch (error) {
        return `Error fetching the resume. Ensure the file exists at: ${url}`;
    }
}

// Display Markdown resume
async function displayMarkdownResume() {
    const markdown = await fetchMarkdown("master-resume.md");
    return marked.parse(markdown);
}

// Show help commands
function showHelp() {
    return `
Available commands:
- resume: Display the resume from the repository.
- clear: Clear the terminal output.
- projects: List my projects with descriptions.
- contact: Display my contact information.
- skills: Show my technical skills.
- exit: Terminate the terminal session.
- help: Show this help message.
    `;
}

// Clear the terminal output
function clearTerminal() {
    terminalOutput.innerHTML = "";
    return null;
}

// Show projects
function showProjects() {
    return `
My Projects:
1. **Portfolio Terminal** - A terminal-style portfolio website. 
   [GitHub](https://github.com/Sreyeesh/portfolio-terminal)
2. **ResumeForge** - A resume generator for developers. 
   [GitHub](https://github.com/Sreyeesh/ResumeForge)
3. **Task Manager** - A task management tool. 
   [Live Demo](https://example.com)
    `;
}

// Show contact information
function showContact() {
    return `
Contact Me:
- Email: sreyeesh@example.com
- GitHub: [github.com/Sreyeesh](https://github.com/Sreyeesh)
- LinkedIn: [linkedin.com/in/sreyeesh](https://linkedin.com/in/sreyeesh)
    `;
}

// Show technical skills
function showSkills() {
    return `
Technical Skills:
- **Programming Languages**: JavaScript, Python, C++
- **Frontend**: HTML, CSS, React.js
- **Backend**: Node.js, Express.js
- **Tools**: Git, Docker, Linux
- **Other**: Markdown, LaTeX, API Integration
    `;
}

// Terminate the session
function terminateSession() {
    terminalOutput.innerHTML += `<div class="output-line">^D</div>`;
    terminalOutput.innerHTML += `<div class="output-line terminated">Session terminated</div>`;

    // Attempt to close the tab
    const isClosed = window.close();

    if (!isClosed) {
        // Fallback message if close fails
        terminalOutput.innerHTML += `
        <div class="output-line close-tab">
            Press <strong>Ctrl + W</strong> to close this tab in Chrome.
        </div>`;
    }

    commandInput.disabled = true; // Disable input
    document.getElementById("input-line").style.display = "none"; // Hide input prompt
}

// Handle terminal input and keyboard shortcuts
commandInput.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        terminateSession();
    } else if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        clearTerminal();
    } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (historyIndex > 0) historyIndex--;
        commandInput.value = commandHistory[historyIndex] || "";
    } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) historyIndex++;
        else historyIndex = commandHistory.length;
        commandInput.value = commandHistory[historyIndex] || "";
    } else if (e.key === "Enter") {
        const input = commandInput.value.trim();

        if (input) {
            commandHistory.push(input);
            historyIndex = commandHistory.length;
        }

        if (input === "clear") {
            clearTerminal();
            commandInput.value = "";
            return;
        }

        const response =
            typeof commands[input] === "function"
                ? await commands[input]()
                : `"${input}" is not a valid command. Type 'help' for a list of commands."`;

        terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div>`;
        terminalOutput.innerHTML += `<div class="output-line">${response}</div><br>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        commandInput.value = "";
    }
});
