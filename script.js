// DOM Elements
const terminalOutput = document.getElementById("output");
const commandInput = document.getElementById("command-input");

// Commands
const commands = {
    help: showHelp,
    clear: clearTerminal,
    ls: ls,
    cd: cd,
    cat: cat,
    github: fetchGitHubRepos,
    resume: fetchMasterResume,
    skills: () => fetchResumeSection("Skills"),
    experience: () => fetchResumeSection("Experience"),
    education: () => fetchResumeSection("Education"),
    projects: () => fetchResumeSection("Projects"),
    contact: () => fetchResumeSection("Contact"),
    theme: changeTheme,
    exit: terminateSession,
};

// Command history
let commandHistory = [];
let historyIndex = 0;

// Fake File System
const fileSystem = {
    home: {
        "resume.md": "This is your resume content. Add more details here.",
        projects: {
            "portfolio.md": "Portfolio Terminal Project: A terminal-style portfolio website.",
            "resumeforge.md": "ResumeForge: A Markdown-based resume generator."
        },
    },
};

let currentDirectory = fileSystem.home;

// Focus input and set default theme on page load
document.addEventListener("DOMContentLoaded", () => {
    document.body.className = "dark"; // Default theme
    terminalOutput.innerHTML += `
Welcome to my Terminal Portfolio!
Type <strong>help</strong> to get started. Key Commands: resume | skills | experience | education | projects | contact
<br>
`;
    commandInput.focus();
});

document.addEventListener("click", () => commandInput.focus());

// Command Implementations
function showHelp() {
  return `
<span class="help-header">Available Commands:</span>

<div class="help-row">
  <span class="help-command">resume</span> 
  <span class="help-description">View the full master resume.</span>
</div>
<div class="help-row">
  <span class="help-command">skills</span> 
  <span class="help-description">View technical skills.</span>
</div>
<div class="help-row">
  <span class="help-command">experience</span> 
  <span class="help-description">View professional experience.</span>
</div>
<div class="help-row">
  <span class="help-command">education</span> 
  <span class="help-description">View educational background.</span>
</div>
<div class="help-row">
  <span class="help-command">projects</span> 
  <span class="help-description">View key projects.</span>
</div>
<div class="help-row">
  <span class="help-command">contact</span> 
  <span class="help-description">View contact information.</span>
</div>
<div class="help-row">
  <span class="help-command">github</span> 
  <span class="help-description">Fetch my GitHub repositories.</span>
</div>
<div class="help-row">
  <span class="help-command">theme</span> 
  <span class="help-description">Change the terminal theme. Usage: theme &lt;light|dark|retro&gt;</span>
</div>
<div class="help-row">
  <span class="help-command">clear</span> 
  <span class="help-description">Clear the terminal.</span>
</div>
<div class="help-row">
  <span class="help-command">exit</span> 
  <span class="help-description">Terminate the session.</span>
</div>
<div class="help-row">
  <span class="help-command">help</span> 
  <span class="help-description">Show this help message.</span>
</div>
  `;
}


function clearTerminal() {
    terminalOutput.innerHTML = "";
    return null;
}

function ls() {
    return Object.keys(currentDirectory).join("  ");
}

function cd(args) {
    const dir = args.split(" ")[1];
    if (!dir) return "cd: Please specify a directory.";
    if (dir === "..") {
        currentDirectory = fileSystem.home;
        return "Moved to home directory.";
    }
    if (currentDirectory[dir] && typeof currentDirectory[dir] === "object") {
        currentDirectory = currentDirectory[dir];
        return `Moved to ${dir}`;
    }
    return `cd: ${dir}: No such directory.`;
}

function cat(args) {
    const file = args.split(" ")[1];
    if (!file) return "cat: Please specify a file.";
    return currentDirectory[file] || `cat: ${file}: No such file.`;
}

async function fetchGitHubRepos(args) {
    const username = "Sreyeesh";
    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=5`);
        const repos = await response.json();
        return repos.map((repo) => `- <a href="${repo.html_url}" target="_blank">${repo.name}</a>`).join("\n");
    } catch (error) {
        return "Error fetching GitHub repositories.";
    }
}

async function fetchMasterResume() {
    const fileURL = "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";
    try {
        clearTerminal();
        const response = await fetch(fileURL);
        if (!response.ok) throw new Error("Error fetching the resume.");
        const markdown = await response.text();
        return `<div>${marked.parse(markdown)}</div>`;
    } catch (error) {
        return "Error: Could not fetch the master resume.";
    }
}

async function fetchResumeSection(section) {
    const fileURL = "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";
    try {
        const response = await fetch(fileURL);
        if (!response.ok) throw new Error("Error fetching the resume.");
        const markdown = await response.text();
        const sections = markdown.split(/(?=## )/);
        const sectionContent = sections.find((s) => s.startsWith(`## ${section}`));
        return sectionContent ? `<div>${marked.parse(sectionContent)}</div>` : `Section "${section}" not found.`;
    } catch (error) {
        return "Error: Could not fetch the master resume.";
    }
}

function changeTheme(args) {
    const theme = args.split(" ")[1];
    if (["light", "dark", "retro"].includes(theme)) {
        document.body.className = theme;
        return `Theme changed to ${theme}.`;
    }
    return "Invalid theme. Available themes: light, dark, retro.";
}

function terminateSession() {
    terminalOutput.innerHTML += `<div class="output-line">^D</div>`;
    terminalOutput.innerHTML += `<div class="output-line terminated">Session terminated.</div>`;
    commandInput.disabled = true;
    document.getElementById("input-line").style.display = "none";
}

// Input Handling
commandInput.addEventListener("keydown", async (e) => {
    if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        clearTerminal();
    } else if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        terminateSession();
    } else if (e.key === "Enter") {
        const input = commandInput.value.trim();
        if (input) {
            commandHistory.push(input);
            historyIndex = commandHistory.length;
            const response = commands[input.split(" ")[0]]
                ? await commands[input.split(" ")[0]](input)
                : `"${input}" is not a valid command. Type 'help' for a list of commands.`;
            terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div><div class="output-line">${response || ""}</div><br>`;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
        commandInput.value = "";
    }
});
