document.addEventListener("DOMContentLoaded", () => {
  if (window.terminalInitialized) return;
  window.terminalInitialized = true;

  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";

  const resumeURLs = {
    "master-resume.md": "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md",
    "devops-engineer-resume.md": "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/refs/heads/main/resumes/Sreyeesh_Garimella_DevOps_Engineer.md",
    "master-resume.pdf": "assets/resumes/master-resume.pdf",
    "Sreyeesh_Garimella_DevOps_Engineer.pdf": "assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.pdf",
  };
  

  const files = {
    "master-resume.md": null,
    "devops-engineer-resume.md": null,
    "master-resume.pdf": null,
    "Sreyeesh_Garimella_DevOps_Engineer.pdf": null,
  };
  
  const commands = {
    help: showHelp,
    ls: listFiles,
    cat: displayFile,
    cv: () => displayFile("master-resume.md"),
    devops: () => displayFile("devops-engineer-resume.md"),
    projects: showProjects,
    clear: clearTerminal,
    download: downloadFile, // Add the download command
  };

  let inputElement;
  let commandHistory = [];
  let historyIndex = -1;

  initializeTerminal();

  function initializeTerminal() {
    terminal.innerHTML = "";
    writeOutput("Welcome to my Terminal Portfolio!\nType 'help' for a list of commands.");
    renderPrompt();
  }

  function downloadFile(filename) {
    if (!filename) {
      writeOutput("Usage: download <filename>");
      renderPrompt();
      return;
    }
  
    if (filename.endsWith(".pdf") && filename in resumeURLs) {
      const link = document.createElement("a");
      link.href = resumeURLs[filename];
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      writeOutput(`Downloading '${filename}'...`);
    } else if (filename.endsWith(".md")) {
      writeOutput(`Error: Cannot download '${filename}'. Only PDF files are available for download.`);
    } else {
      writeOutput(`Error: '${filename}' is not available.`);
    }
    renderPrompt();
  }
  

  function showHelp() {
    const helpHTML = `
      <div class="help-container">
        <div class="help-header">
          <span class="help-command">Command</span>
          <span class="help-description">Description</span>
        </div>
        <hr class="help-divider"/>
        <div class="help-row">
          <span class="help-command">help</span>
          <span class="help-description">Show available commands.</span>
        </div>
        <div class="help-row">
          <span class="help-command">ls</span>
          <span class="help-description">List available files.</span>
        </div>
        <div class="help-row">
          <span class="help-command">cat &lt;filename&gt;</span>
          <span class="help-description">Display the content of a file.</span>
        </div>
        <div class="help-row">
          <span class="help-command">cv</span>
          <span class="help-description">View the master resume (rendered in Markdown).</span>
        </div>
        <div class="help-row">
          <span class="help-command">devops</span>
          <span class="help-description">View the tailored DevOps Engineer resume (rendered in Markdown).</span>
        </div>
        <div class="help-row">
          <span class="help-command">projects</span>
          <span class="help-description">List and describe portfolio projects.</span>
        </div>
        <div class="help-row">
          <span class="help-command">clear</span>
          <span class="help-description">Clear the terminal.</span>
        </div>
        <div class="help-row">
          <span class="help-command">download &lt;filename&gt;</span>
          <span class="help-description">Download a file (e.g., resumes) as a PDF.</span>
        </div>
        <hr class="help-divider"/>
        <div class="help-header">
          <span class="help-command">Shortcut</span>
          <span class="help-description">Description</span>
        </div>
        <hr class="help-divider"/>
        <div class="help-row">
          <span class="help-command">Ctrl + C</span>
          <span class="help-description">Cancel current input and reset the prompt.</span>
        </div>
        <div class="help-row">
          <span class="help-command">Ctrl + L</span>
          <span class="help-description">Clear the terminal screen.</span>
        </div>
        <div class="help-row">
          <span class="help-command">Arrow Up/Down</span>
          <span class="help-description">Navigate through command history.</span>
        </div>
        <div class="help-row">
          <span class="help-command">Tab</span>
          <span class="help-description">Auto-complete commands or file names.</span>
        </div>
      </div>
    `;
    writeOutput(helpHTML);
    renderPrompt();
  }

  function listFiles() {
    // List all files
    writeOutput(Object.keys(files).join("\n"));
    renderPrompt();
  }
  
  async function displayFile(filename) {
    if (!filename) {
      writeOutput("Usage: cat <filename>");
      renderPrompt();
      return;
    }

    if (filename in files) {
      if (!files[filename]) {
        writeOutput(`Fetching ${filename}...`);
        try {
          const response = await fetch(resumeURLs[filename]);
          if (!response.ok) throw new Error("Failed to fetch file.");
          files[filename] = await response.text();
        } catch (error) {
          writeOutput(`Error: Could not fetch '${filename}'.`);
          renderPrompt();
          return;
        }
      }
      writeOutput(`<div class="markdown-output">${marked.parse(files[filename])}</div>`);
    } else {
      writeOutput(`cat: ${filename}: No such file.`);
    }
    renderPrompt();
  }

  async function showProjects() {
    try {
      const response = await fetch("projects.json");
      if (!response.ok) throw new Error("Failed to load projects.");
      const projects = await response.json();

      const projectsList = projects
        .map(
          (project) => `
        <li>
          <strong>${project.name}</strong><br>
          ${project.description}<br>
          <a href="${project.link}" target="_blank">${project.link}</a>
        </li>`
        )
        .join("");

      writeOutput(`<ul class="project-links">${projectsList}</ul>`);
    } catch (error) {
      writeOutput("Error: Unable to load projects.");
    }
    renderPrompt();
  }

  function clearTerminal() {
    terminal.innerHTML = "";
    writeOutput("Welcome to my Terminal Portfolio!\nType 'help' for a list of commands.");
    renderPrompt();
  }

  function writeOutput(content) {
    const outputLine = document.createElement("div");
    outputLine.innerHTML = content;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function renderPrompt() {
    const existingInputs = document.querySelectorAll(".command-input");
    existingInputs.forEach((input) => input.remove());

    const promptLine = document.createElement("div");
    promptLine.classList.add("input-line");

    const promptTextElement = document.createElement("span");
    promptTextElement.textContent = promptText;

    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");
    inputElement.autofocus = true;

    inputElement.addEventListener("keydown", handleCommand);
    inputElement.addEventListener("keydown", handleTabCompletion);
    inputElement.addEventListener("keydown", handleShortcuts);

    promptLine.appendChild(promptTextElement);
    promptLine.appendChild(inputElement);
    terminal.appendChild(promptLine);

    inputElement.focus();
    terminal.scrollTop = terminal.scrollHeight;
  }

  function handleCommand(event) {
    if (event.key === "Enter") {
      const input = event.target.value.trim();
      if (input === "") return;

      writeOutput(`${promptText} ${input}`);
      commandHistory.push(input);
      historyIndex = commandHistory.length;

      const [command, ...args] = input.split(" ");
      event.target.disabled = true;

      if (commands[command]) {
        commands[command](args.join(" "));
      } else {
        writeOutput(`Error: '${command}' is not a valid command. Type 'help' for a list of commands.`);
        renderPrompt();
      }
    }
  }

  let tabSuggestions = [];
let tabIndex = 0;

function handleTabCompletion(event) {
  if (event.key === "Tab") {
    event.preventDefault();

    const inputValue = inputElement.value.trim();
    const words = inputValue.split(" ");

    if (words.length === 1) {
      // First word: suggest commands
      const currentInput = words[0];
      tabSuggestions = Object.keys(commands).filter((cmd) => cmd.startsWith(currentInput));
    } else if (words[0] === "download") {
      // Second word: suggest files for download
      const currentInput = words[1] || ""; // Handle case where second word is empty
      if (!tabSuggestions.length || !tabSuggestions[0].startsWith(currentInput)) {
        // Populate suggestions only if starting input changes
        tabSuggestions = Object.keys(resumeURLs).filter((file) => file.startsWith(currentInput));
        tabIndex = 0; // Reset index
      }
    }

    if (tabSuggestions.length > 0) {
      // Cycle through suggestions
      words[words.length - 1] = tabSuggestions[tabIndex];
      inputElement.value = words.join(" ") + " ";
      tabIndex = (tabIndex + 1) % tabSuggestions.length; // Loop through suggestions
    } else {
      // Reset suggestions if no match
      tabSuggestions = [];
      tabIndex = 0;
    }
  } else {
    // Reset suggestions if user types a new character
    tabSuggestions = [];
    tabIndex = 0;
  }
}

    
  function handleShortcuts(event) {
    if (event.ctrlKey && event.key === "c") {
      inputElement.value = "";
      writeOutput(`^C`);
      renderPrompt();
    } else if (event.ctrlKey && event.key === "l") {
      clearTerminal();
    } else if (event.key === "ArrowUp") {
      if (historyIndex > 0) {
        historyIndex--;
        inputElement.value = commandHistory[historyIndex];
      }
    } else if (event.key === "ArrowDown") {
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputElement.value = commandHistory[historyIndex];
      } else {
        inputElement.value = "";
        historyIndex = commandHistory.length;
      }
    }
  }
});
