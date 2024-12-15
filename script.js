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
};

// Fetch and render the Markdown resume
async function fetchMarkdown(file) {
    const url = `https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/${file}`;
    try {
        console.log(`Fetching: ${url}`);
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
1. **Portfolio Terminal** - A terminal-style portfolio website. [GitHub](https://github.com/Sreyeesh/portfolio-terminal)
2. **ResumeForge** - A resume generator for developers. [GitHub](https://github.com/Sreyeesh/ResumeForge)
3. **Task Manager** - A task management tool. [Live Demo](https://example.com)
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

// Tab autocomplete for commands
commandInput.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
        e.preventDefault(); // Prevent default Tab behavior

        const input = commandInput.value.trim();
        const availableCommands = Object.keys(commands);

        // Filter commands that start with the current input
        const matchingCommands = availableCommands.filter((cmd) =>
            cmd.startsWith(input)
        );

        // If there's only one match, autocomplete the input
        if (matchingCommands.length === 1) {
            commandInput.value = matchingCommands[0];
        }
        // If multiple matches, show suggestions in the terminal
        else if (matchingCommands.length > 1) {
            terminalOutput.innerHTML += `<div class="output-line">${matchingCommands.join("  ")}</div>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }
});

// Handle terminal input
commandInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const input = commandInput.value.trim();

        if (input === "clear") {
            clearTerminal();
            commandInput.value = "";
            return;
        }

        const response =
            typeof commands[input] === "function"
                ? await commands[input]()
                : `"${input}" is not a valid command. Type 'help' for a list of commands."`;

        // Update terminal output
        terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div>`;
        terminalOutput.innerHTML += `<div class="output-line">${response}</div><br>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
        commandInput.value = ""; // Clear input field
    }
});
