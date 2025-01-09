document.addEventListener("DOMContentLoaded", () => {
  if (window.terminalInitialized) return;
  window.terminalInitialized = true;

  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";

  const directories = {
    home: {
      projects: {
        "projects.md": "./assets/projects/projects.md",
      },
      resumes: {
        "master-resume.md": "./assets/resumes/master-resume.md",
        "master-resume.pdf": "./assets/resumes/master-resume.pdf",
        "Sreyeesh_Garimella_DevOps_Engineer.md": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.md",
        "Sreyeesh_Garimella_DevOps_Engineer.pdf": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.pdf",
      },
    },
  };

  let currentDirectory = directories.home;
  let inputElement;
  let commandHistory = [];
  let historyIndex = -1;
  let tabSuggestions = [];
  let tabIndex = 0;

  /**
   * Utility Functions
   */
  function writeOutput(content, isError = false) {
    const outputLine = document.createElement("div");
    outputLine.classList.add("output-line");
    outputLine.innerHTML = isError ? `<span style="color: red;">${content}</span>` : content;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function renderPrompt() {
    const promptLine = document.createElement("div");
    promptLine.classList.add("input-line");

    const promptTextElement = document.createElement("span");
    promptTextElement.textContent = promptText;
    promptLine.appendChild(promptTextElement);

    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");
    inputElement.autofocus = true;

    inputElement.addEventListener("keydown", handleCommand);
    inputElement.addEventListener("keydown", handleTabCompletion);
    inputElement.addEventListener("keydown", handleSpecialKeys);

    promptLine.appendChild(inputElement);
    terminal.appendChild(promptLine);

    inputElement.focus();
    terminal.scrollTop = terminal.scrollHeight;
  }

  function parseMarkdown(content) {
    return content
      .replace(/(?:\r\n|\r|\n)/g, "<br>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/---/g, "<hr>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  }

  /**
   * Command Functions
   */
  function listFiles() {
    const entries = Object.keys(currentDirectory);
    if (entries.length) {
      writeOutput(entries.join("    "));
    } else {
      writeOutput("ls: No files or directories", true);
    }
    renderPrompt();
  }

  async function displayFile(filename) {
    if (!filename) {
      writeOutput("Usage: cat <filename>", true);
      renderPrompt();
      return;
    }

    filename = filename.trim().replace(/^["']|["']$/g, "");
    if (currentDirectory[filename]) {
      const fileExtension = filename.split(".").pop();

      if (fileExtension === "pdf") {
        writeOutput(
          `cat: ${filename}: Cannot display binary file. Use 'download ${filename}' or <a href="${currentDirectory[filename]}" target="_blank">click here</a> to view.`,
          true
        );
        renderPrompt();
        return;
      }

      try {
        const response = await fetch(currentDirectory[filename]);
        if (!response.ok) throw new Error(`Failed to fetch '${filename}'`);

        const content = await response.text();
        if (fileExtension === "md") {
          writeOutput(`<div class="markdown">${parseMarkdown(content)}</div>`);
        } else {
          writeOutput(`<pre>${content.replace(/\n/g, "<br>")}</pre>`);
        }
      } catch (error) {
        writeOutput(`cat: ${filename}: ${error.message}`, true);
      }
    } else {
      writeOutput(`cat: ${filename}: No such file or directory`, true);
    }
    renderPrompt();
  }

  function downloadFile(filename) {
    if (!filename) {
      writeOutput("Usage: download <filename>", true);
      renderPrompt();
      return;
    }

    filename = filename.trim().replace(/^["']|["']$/g, "");
    if (currentDirectory[filename]) {
      const link = document.createElement("a");
      link.href = currentDirectory[filename];
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      writeOutput(`Downloading '${filename}'...`);
    } else {
      writeOutput(`download: ${filename}: No such file or directory`, true);
    }
    renderPrompt();
  }

  function changeDirectory(dirname) {
    dirname = dirname.trim();
    if (dirname === "..") {
      currentDirectory = directories.home;
      writeOutput("Changed to parent directory.");
    } else if (currentDirectory[dirname] && typeof currentDirectory[dirname] === "object") {
      currentDirectory = currentDirectory[dirname];
      writeOutput(`Changed to '${dirname}' directory.`);
    } else if (currentDirectory[dirname]) {
      writeOutput(`Error: '${dirname}' is not a directory. Use 'ls' to view available directories.`, true);
    } else {
      writeOutput(`cd: '${dirname}': No such file or directory`, true);
    }
    renderPrompt();
  }

  function showResumes() {
    const resumeLinks = Object.keys(directories.home.resumes)
      .map((file) => {
        const fileExtension = file.split('.').pop();
        const linkClass = fileExtension === "md" ? "md-link" : "pdf-link";
        return `<li>
          <a href="${directories.home.resumes[file]}" target="_blank" class="${linkClass}">
            ${file}
          </a>
        </li>`;
      })
      .join("");

    writeOutput(`
      <div>
        <strong style="color: yellow; font-size: 1.2em;">Available Resumes:</strong>
        <ul>
          ${resumeLinks}
        </ul>
        <p style="color: lightgray;">You can also use 'download <filename>' to save them locally.</p>
      </div>
    `);
    renderPrompt();
  }

  function clearTerminal() {
    terminal.innerHTML = "";
    renderPrompt();
  }

  /**
   * Tab Completion
   */
  function handleTabCompletion(event) {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const input = inputElement.value.trim();
    const words = input.split(" ");
    const baseCommand = words[0];
    const partialArg = words.slice(1).join(" ");

    if (!input) {
      tabSuggestions = [];
      tabIndex = 0;
      return;
    }

    if (words.length === 1) {
      tabSuggestions = Object.keys(commands).filter((cmd) => cmd.startsWith(baseCommand));
    } else if (["cd", "cat", "download"].includes(baseCommand)) {
      tabSuggestions = Object.keys(currentDirectory).filter((key) => key.startsWith(partialArg));
    }

    if (tabSuggestions.length === 1) {
      words[words.length - 1] = tabSuggestions[0];
      inputElement.value = words.join(" ");
      tabSuggestions = [];
    } else if (tabSuggestions.length > 1) {
      writeOutput(tabSuggestions.join("    "));
      tabIndex = (tabIndex + 1) % tabSuggestions.length;
      inputElement.value = `${baseCommand} ${tabSuggestions[tabIndex]}`;
    } else {
      tabSuggestions = [];
      tabIndex = 0;
    }
  }

  /**
   * Event Handlers
   */
  function handleCommand(event) {
    if (event.key === "Enter") {
      const input = inputElement.value.trim();
      if (!input) return;

      writeOutput(`${promptText} ${input}`);
      commandHistory.push(input);
      historyIndex = commandHistory.length;

      const [command, ...args] = input.split(" ");
      inputElement.disabled = true;

      if (commands[command]) {
        commands[command](args.join(" "));
      } else {
        writeOutput(`bash: ${command}: command not found`, true);
        renderPrompt();
      }
    }
  }

  function handleSpecialKeys(event) {
    if (event.ctrlKey && event.key === "c") {
      event.preventDefault();
      writeOutput(`${promptText} ^C`);
      renderPrompt();
    }

    if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      clearTerminal();
    }
  }

  /**
   * Commands
   */
  const commands = {
    help: () => {
      const helpText = `
Commands:
  help                Show this help message.
  resumes             Display all available resumes.
  ls                  List files and directories.
  cat <filename>      Display the content of a file.
  download <filename> Download a file.
  cd <dirname>        Change the current directory.
  clear               Clear the terminal screen.

Shortcuts:
  Tab                 Auto-complete commands or filenames.
  Ctrl+C              Interrupt current command.
  Ctrl+L              Clear the terminal screen.
      `;
      writeOutput(`<pre>${helpText}</pre>`);
      renderPrompt();
    },
    resumes: showResumes,
    ls: listFiles,
    cat: displayFile,
    download: downloadFile,
    cd: (dirname) => changeDirectory(dirname),
    clear: clearTerminal,
  };

  /**
   * Initialize Terminal
   */
  function initializeTerminal() {
    terminal.innerHTML = "";
    writeOutput(
      "Welcome to my Terminal Portfolio! Type 'help' to get started."
    );
    renderPrompt();
  }

  initializeTerminal();
});
