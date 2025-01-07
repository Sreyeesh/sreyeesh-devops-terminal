document.addEventListener("DOMContentLoaded", () => {
  if (window.terminalInitialized) return;
  window.terminalInitialized = true;

  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";

  const directories = {
    home: {
      "README.md": "Welcome to your home directory!",
      resume: {
        "master-resume.md": "./assets/resumes/master-resume.md",
        "devops-engineer-resume.md": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.md",
        "master-resume.pdf": "./assets/resumes/master-resume.pdf",
        "Sreyeesh_Garimella_DevOps_Engineer.pdf": "./assets/resumes/Sreyeesh_Garimella_DevOps_Engineer.pdf",
      },
    },
  };

  let currentDirectory = directories.home;
  const commands = {
    help: showHelp,
    onboarding: startOnboarding,
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

  // Global keyboard shortcut listeners
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.key === "l") {
      event.preventDefault();
      clearTerminal();
    }
  });

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

    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");
    inputElement.autofocus = true;

    inputElement.addEventListener("keydown", (event) => handleCommand(event));
    inputElement.addEventListener("keydown", handleTabCompletion);
    inputElement.addEventListener("keydown", handleHistoryNavigation);

    promptLine.appendChild(promptTextElement);
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

  async function startOnboarding() {
    const steps = [
      "Welcome to the onboarding walkthrough!",
      "1. Type 'ls' to list the files and directories available.",
      "2. Navigate to a directory using 'cd <directory_name>'. For example, try 'cd resume'.",
      "3. View a file's content using 'cat <file_name>'. For example, 'cat README.md'.",
      "4. Download a file with 'download <file_name>'. For example, 'download master-resume.pdf'.",
      "That's it! You're ready to explore the portfolio. Type 'help' anytime for a list of commands.",
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
    writeOutput(entries.length ? entries.join("\n") : "No files or directories.");
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
        const url = currentDirectory[filename];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch '${filename}'`);

        const fileExtension = filename.split(".").pop();

        if (fileExtension === "md") {
          const content = await response.text();
          const plainTextContent = content
            .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold syntax (**bold** -> bold)
            .replace(/---/g, "") // Remove horizontal rules
            .replace(/\[(.*?)\]\((.*?)\)/g, "$1: $2"); // Convert links

          writeOutput(`<pre>${plainTextContent}</pre>`);
        } else {
          writeOutput(`Cannot display '${filename}'. Use 'download ${filename}' to save it locally.`);
        }
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
    } else if (currentDirectory[dirname]) {
      currentDirectory = currentDirectory[dirname];
      writeOutput(`Changed to '${dirname}' directory.`);
    } else {
      writeOutput(`cd: ${dirname}: No such file or directory.`);
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
    ls                  List files and directories.
    cat <filename>      Display the content of a file.
    download <filename> Download a file.
    pwd                 Print the current directory path.
    cd <dirname>        Change the current directory.
    clear               Clear the terminal screen.
  
  Shortcuts:
    Ctrl + L            Clear the terminal screen.
    Tab                 Auto-complete commands or file names.
    Arrow Up/Down       Navigate through command history.
  `;
    writeOutput(`<pre>${helpOutput}</pre>`);
    renderPrompt();
  }

  function handleHistoryNavigation(event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputElement.value = commandHistory[historyIndex];
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputElement.value = commandHistory[historyIndex];
      } else {
        inputElement.value = "";
      }
    }
  }

  function handleTabCompletion(event) {
    if (event.key === "Tab") {
      event.preventDefault();

      const inputValue = inputElement.value.trim();
      const words = inputValue.split(" ");

      if (words.length === 1) {
        tabSuggestions = Object.keys(commands).filter((cmd) =>
          cmd.startsWith(words[0])
        );
      } else if (["cat", "download", "cd"].includes(words[0])) {
        tabSuggestions = Object.keys(currentDirectory).filter((file) =>
          file.startsWith(words[1] || "")
        );
      }

      if (tabSuggestions.length === 1) {
        words[words.length - 1] = tabSuggestions[0];
        inputElement.value = words.join(" ") + " ";
        tabSuggestions = [];
      } else if (tabSuggestions.length > 1) {
        const commonPrefix = getLongestCommonPrefix(tabSuggestions);
        if (commonPrefix.length > (words[words.length - 1] || "").length) {
          words[words.length - 1] = commonPrefix;
          inputElement.value = words.join(" ");
        } else {
          words[words.length - 1] = tabSuggestions[tabIndex];
          inputElement.value = words.join(" ");
          tabIndex = (tabIndex + 1) % tabSuggestions.length;
        }
        writeOutput(tabSuggestions.join(" "));
      } else {
        tabSuggestions = [];
        tabIndex = 0;
      }
    } else {
      tabSuggestions = [];
      tabIndex = 0;
    }
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

  function getLongestCommonPrefix(strings) {
    if (!strings.length) return "";
    let prefix = strings[0];
    for (let i = 1; i < strings.length; i++) {
      while (!strings[i].startsWith(prefix)) {
        prefix = prefix.slice(0, -1);
        if (!prefix) return "";
      }
    }
    return prefix;
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
});
