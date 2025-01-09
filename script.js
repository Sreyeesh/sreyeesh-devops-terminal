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
        "Master Resume (Markdown)": "./assets/resumes/master-resume.md",
        "Master Resume (PDF)": "./assets/resumes/master-resume.pdf",
        "DevOps Engineer Resume (Markdown)": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.md",
        "DevOps Engineer Resume (PDF)": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.pdf",
      },
    },
  };

  let currentDirectory = directories.home;
  const commands = {
    help: showHelp,
    onboarding: startOnboarding,
    resumes: showResumes,
    ls: listFiles,
    cat: displayFile,
    download: downloadFile,
    clear: clearTerminal,
    pwd: printWorkingDirectory,
    cd: changeDirectory,
  };

  let inputElement;
  let commandHistory = [];
  let historyIndex = -1;
  let tabSuggestions = [];
  let tabIndex = 0;

  initializeTerminal();

  function initializeTerminal() {
    terminal.innerHTML = "";
    writeOutput("Welcome to my Terminal Portfolio!\nType 'help' to get started or 'onboarding' for a guided walkthrough.");
    renderPrompt();
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

    promptLine.appendChild(inputElement);
    terminal.appendChild(promptLine);

    inputElement.focus();
    terminal.scrollTop = terminal.scrollHeight;
  }

  function writeOutput(content) {
    const outputLine = document.createElement("div");
    outputLine.classList.add("output-line");
    outputLine.innerHTML = content;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight;
  }

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

    // Case 1: Suggest commands
    if (words.length === 1) {
      tabSuggestions = Object.keys(commands).filter((cmd) => cmd.startsWith(baseCommand));
    }
    // Case 2: Suggest files or directories for specific commands
    else if (["cd", "cat", "download"].includes(baseCommand)) {
      tabSuggestions = Object.keys(currentDirectory).filter((key) => key.startsWith(partialArg));
    }

    if (tabSuggestions.length === 1) {
      words[words.length - 1] = tabSuggestions[0];
      inputElement.value = words.join(" ");
      tabSuggestions = [];
    } else if (tabSuggestions.length > 1) {
      writeOutput(tabSuggestions.join(" "));
      tabIndex = (tabIndex + 1) % tabSuggestions.length;
      inputElement.value = `${baseCommand} ${tabSuggestions[tabIndex]}`;
    } else {
      tabSuggestions = [];
      tabIndex = 0;
    }
  }

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
        writeOutput(`Error: '${command}' is not a valid command. Type 'help' for a list of commands.`);
        renderPrompt();
      }
    }
  }

  async function startOnboarding() {
    const steps = [
      "Welcome to the onboarding walkthrough!",
      "1. Type 'resumes' to view all available resumes and download them.",
      "2. Type 'ls' and 'cd' to navigate directories, e.g., 'cd projects' to explore projects.",
      "3. Use 'cat <filename>' to view file content.",
      "4. Use 'download <filename>' to save a file locally.",
      "You're now ready to explore!",
    ];

    for (const step of steps) {
      await delay(1500);
      writeOutput(step);
    }
    renderPrompt();
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function listFiles() {
    const entries = Object.keys(currentDirectory);
    if (entries.length) {
      writeOutput(entries.join("\n"));
    } else {
      writeOutput("No files or directories.");
    }
    renderPrompt();
  }

  function showResumes() {
    writeOutput(`
<strong>Resumes:</strong>
- <a href="./assets/resumes/master-resume.pdf" target="_blank">Master Resume (PDF)</a>
- <a href="./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.pdf" target="_blank">DevOps Engineer Resume (PDF)</a>
- <a href="./assets/resumes/master-resume.md" target="_blank">Master Resume (Markdown)</a>
- <a href="./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.md" target="_blank">DevOps Engineer Resume (Markdown)</a>

You can also use 'cat <filename>' or 'download <filename>' to view or save files locally.
    `);
    renderPrompt();
  }

  async function displayFile(filename) {
    if (!filename) {
      writeOutput("Usage: cat <filename>");
      renderPrompt();
      return;
    }

    if (currentDirectory[filename]) {
      try {
        const response = await fetch(currentDirectory[filename]);
        if (!response.ok) throw new Error(`Failed to fetch '${filename}'`);

        const content = await response.text();
        writeOutput(`<pre>${content.replace(/\n/g, "<br>")}</pre>`);
      } catch (error) {
        writeOutput(`Error: Could not fetch '${filename}': ${error.message}`);
      }
    } else {
      writeOutput(`Error: '${filename}' does not exist.`);
    }
    renderPrompt();
  }

  function downloadFile(filename) {
    if (!filename) {
      writeOutput("Usage: download <filename>");
      renderPrompt();
      return;
    }

    if (currentDirectory[filename]) {
      const link = document.createElement("a");
      link.href = currentDirectory[filename];
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      writeOutput(`Downloading '${filename}'...`);
    } else {
      writeOutput(`Error: '${filename}' does not exist.`);
    }
    renderPrompt();
  }

  function changeDirectory(dirname) {
    if (dirname === "..") {
      currentDirectory = directories.home;
      writeOutput("Changed to parent directory.");
    } else if (currentDirectory[dirname] && typeof currentDirectory[dirname] === "object") {
      currentDirectory = currentDirectory[dirname];
      writeOutput(`Changed to '${dirname}' directory.`);
    } else if (currentDirectory[dirname]) {
      writeOutput(`Error: '${dirname}' is a file, not a directory.`);
    } else {
      writeOutput(`cd: '${dirname}': No such file or directory.`);
    }
    renderPrompt();
  }

  function printWorkingDirectory() {
    const path = getPath(directories.home, currentDirectory, "home");
    writeOutput(`/${path.join("/")}`);
    renderPrompt();
  }

  function clearTerminal() {
    terminal.innerHTML = "";
    renderPrompt();
  }

  function showHelp() {
    const helpOutput = `
Commands:
  help                Show this help message.
  onboarding          Start the onboarding walkthrough.
  resumes             Display all available resumes.
  ls                  List files and directories.
  cat <filename>      Display the content of a file.
  download <filename> Download a file.
  pwd                 Print the current directory path.
  cd <dirname>        Change the current directory.
  clear               Clear the terminal screen.
    `;
    writeOutput(`<pre>${helpOutput}</pre>`);
    renderPrompt();
  }

  function getPath(root, target, path) {
    for (const [key, value] of Object.entries(root)) {
      if (value === target) return [path, key];
      if (typeof value === "object") {
        const result = getPath(value, target, `${path}/${key}`);
        if (result) return result;
      }
    }
    return [];
  }
});
