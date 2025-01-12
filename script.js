document.addEventListener("DOMContentLoaded", () => {
  // Prevent re-initializing if already initialized
  if (window.terminalInitialized) return;
  window.terminalInitialized = true;

  /**
   * DOM Elements & Prompt
   */
  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";

/**
 * Simple in-memory filesystem
 */
const directories = {
  home: {
    projects: {
      "projects.md": "./assets/projects/projects.md",
    },
    resumes: {
      "Sreyeesh_Garimella_Master_Resume_FullStack_DevOps.md": "./assets/resumes/Sreyeesh_Garimella_Master_Resume_FullStack_DevOps.md",
      "Sreyeesh_Garimella_Master_Resume_FullStack_DevOps.pdf": "./assets/resumes/Sreyeesh_Garimella_Master_Resume_FullStack_DevOps.pdf",
    },
    "readme.txt": "Welcome to your home directory!",
  },
};


  // Keep track of our current directory and path
  let currentDirectory = directories.home;
  let currentPath = ["home"];

  // Command history
  let commandHistory = [];
  let historyIndex = -1;

  // Tab completion state (for cycling matches)
  window.tabState = {
    lastInput: "",
    matches: [],
    tabIndex: 0,
  };

  // Onboarding steps
  let onboardingActive = false;
  let onboardingStep = 0;
  const onboardingSteps = [
    { instruction: "Type 'resumes' to view all available resumes.", command: "resumes" },
    { instruction: "Type 'ls' to list files and directories.", command: "ls" },
    { instruction: "Type 'cd projects' to explore the projects directory.", command: "cd projects" },
    { instruction: "Type 'cat projects.md' to see the actual projects.md file content.", command: "cat projects.md" },
    { instruction: "Type 'download master-resume.pdf' to simulate file download.", command: "download master-resume.pdf" },
    { instruction: "Congratulations! You've completed the walkthrough.", command: null },
  ];

  /* ===================================
              RENDER METHODS
  ====================================== */

  function writeOutput(content, isError = false) {
    const outputLine = document.createElement("pre");
    outputLine.classList.add("output-line");
    if (isError) {
      outputLine.innerHTML = `<span style="color: red;">${content}</span>`;
    } else {
      outputLine.innerHTML = content;
    }
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function renderPrompt() {
    const promptLine = document.createElement("div");
    promptLine.classList.add("input-line");

    const promptTextElement = document.createElement("span");
    promptTextElement.textContent = promptText;
    promptLine.appendChild(promptTextElement);

    const inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");
    inputElement.autofocus = true;

    // Event listeners
    inputElement.addEventListener("keydown", handleShortcuts);
    inputElement.addEventListener("keydown", handleCommand);
    inputElement.addEventListener("keydown", handleTabCompletion);
    inputElement.addEventListener("keydown", handleHistoryNavigation);

    promptLine.appendChild(inputElement);
    terminal.appendChild(promptLine);

    inputElement.focus();
    terminal.scrollTop = terminal.scrollHeight;
  }

  /* ===================================
              EVENT HANDLERS
  ====================================== */

  /**
   * Handle Ctrl+C and Ctrl+L
   */
  function handleShortcuts(event) {
    if (event.ctrlKey && !event.shiftKey) {
      // Ctrl + C
      if (event.key.toLowerCase() === "c") {
        event.preventDefault();
        const inputElement = event.target;
        const typedText = inputElement.value;
        inputElement.value = "";
        writeOutput(`${promptText} ${typedText}`);
        writeOutput("^C");
        renderPrompt();
      }
      // Ctrl + L
      else if (event.key.toLowerCase() === "l") {
        event.preventDefault();
        clearTerminal();
      }
    }
  }

  /**
   * Handle 'Enter' key -> execute commands
   */
  function handleCommand(event) {
    if (event.key === "Enter") {
      const inputElement = event.target;
      const input = inputElement.value.trim();
      if (!input) return;

      writeOutput(`${promptText} ${input}`);
      commandHistory.push(input);
      historyIndex = commandHistory.length;

      inputElement.value = "";

      // If onboarding is active, check steps
      if (onboardingActive) {
        processOnboarding(input);
      } else {
        executeCommand(input);
      }
    }
  }

  /**
   * Cycling Tab Completion
   */
  function handleTabCompletion(event) {
    if (event.key !== "Tab") return;

    event.preventDefault();
    const inputElement = event.target;
    const rawInput = inputElement.value;
    const words = rawInput.trim().split(" ");
    const baseCommand = words[0] || "";
    const partialArg = words.slice(1).join(" ");

    // If user typed something new, reset
    if (rawInput !== window.tabState.lastInput) {
      window.tabState.matches = [];
      window.tabState.tabIndex = 0;
    }
    window.tabState.lastInput = rawInput;

    let possibleMatches = [];

    // 1) Single word -> match commands
    if (words.length === 1) {
      possibleMatches = Object.keys(commands).filter((cmd) =>
        cmd.startsWith(baseCommand)
      );
    } else {
      // 2) Multi-word
      if (baseCommand === "download") {
        // Suggest from /home/resumes
        const resumesDir = directories.home.resumes;
        possibleMatches = Object.keys(resumesDir).filter((filename) =>
          filename.startsWith(partialArg)
        );
      } else if (["cat", "cd", "rm", "rmdir"].includes(baseCommand)) {
        // Suggest from current directory
        possibleMatches = Object.keys(currentDirectory).filter((item) =>
          item.startsWith(partialArg)
        );
      }
      // You could add other custom logic for other commands if needed
    }

    if (!possibleMatches.length) {
      // optional beep or do nothing
      // writeOutput("\u0007");
      return;
    }

    // If we didn't store matches yet or they've changed
    if (!window.tabState.matches.length) {
      window.tabState.matches = possibleMatches;
      window.tabState.tabIndex = 0;
    } else {
      // Check if the new possible matches are the same set as before
      const oldMatches = window.tabState.matches;
      const sameSet =
        possibleMatches.length === oldMatches.length &&
        possibleMatches.every((val, idx) => val === oldMatches[idx]);

      if (!sameSet) {
        // reset with new set
        window.tabState.matches = possibleMatches;
        window.tabState.tabIndex = 0;
      }
    }

    // Fill input with the current match
    const match = window.tabState.matches[window.tabState.tabIndex];
    if (words.length === 1) {
      // user typed partial command
      words[0] = match;
    } else {
      // user typed 'download master-resume.'
      words[words.length - 1] = match;
    }
    inputElement.value = words.join(" ");

    // Move index to next match, cycling
    window.tabState.tabIndex =
      (window.tabState.tabIndex + 1) % window.tabState.matches.length;
  }

  /**
   * Handle ArrowUp / ArrowDown for command history
   */
  function handleHistoryNavigation(event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        event.target.value = commandHistory[historyIndex];
      }
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        event.target.value = commandHistory[historyIndex];
      } else {
        event.target.value = "";
      }
    }
  }

  /* ===================================
             COMMAND FUNCTIONS
  ====================================== */

  // cat command: fetch or display file
  async function displayFile(filename) {
    if (!filename) {
      writeOutput("Usage: cat <filename>", true);
      renderPrompt();
      return;
    }
    filename = filename.trim();
    const fileRef = currentDirectory[filename];

    if (!fileRef) {
      writeOutput(`cat: ${filename}: No such file`, true);
      renderPrompt();
      return;
    }
    if (typeof fileRef === "object") {
      writeOutput(`cat: '${filename}' is a directory.`, true);
      renderPrompt();
      return;
    }
    if (filename.toLowerCase().endsWith(".pdf")) {
      writeOutput(`cat: '${filename}' is a PDF. Use 'download ${filename}'.`);
      renderPrompt();
      return;
    }

    try {
      if (fileRef.startsWith("./")) {
        const response = await fetch(fileRef);
        if (!response.ok) throw new Error(`Failed to fetch '${filename}'`);
        let content = await response.text();

        if (filename.toLowerCase().endsWith(".md")) {
          const parsedMarkdown = marked.parse(content);
          writeOutput(parsedMarkdown);
          Prism.highlightAllUnder(terminal);
        } else if (
          filename.toLowerCase().endsWith(".js") ||
          filename.toLowerCase().endsWith(".py") ||
          filename.toLowerCase().endsWith(".txt")
        ) {
          const language = filename.endsWith(".py") ? "python" : "javascript";
          writeOutput(
            `<pre><code class="language-${language}">${escapeHtml(content)}</code></pre>`
          );
          Prism.highlightAllUnder(terminal);
        } else {
          writeOutput(content);
        }
      } else {
        // If fileRef is just a string
        writeOutput(fileRef);
      }
    } catch (err) {
      writeOutput(`cat: ${filename}: ${err.message}`, true);
    }
    renderPrompt();
  }

  function escapeHtml(html) {
    return html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // ls command
  function listFiles() {
    const keys = Object.keys(currentDirectory);
    if (!keys.length) {
      writeOutput("This directory is empty.");
    } else {
      keys.forEach((k) => {
        if (typeof currentDirectory[k] === "object") {
          writeOutput(k + "/");
        } else {
          writeOutput(k);
        }
      });
    }
    renderPrompt();
  }

  // cd command
  function changeDirectory(dirname) {
    if (!dirname) {
      writeOutput("Usage: cd <directory>", true);
      renderPrompt();
      return;
    }
    dirname = dirname.trim();
    if (dirname === "..") {
      if (currentPath.length > 1) {
        currentPath.pop();
        currentDirectory = directories.home;
        for (let i = 1; i < currentPath.length; i++) {
          currentDirectory = currentDirectory[currentPath[i]];
        }
      } else {
        writeOutput("Already at root directory.", true);
      }
      renderPrompt();
      return;
    }
    if (!currentDirectory[dirname]) {
      writeOutput(`cd: no such directory: ${dirname}`, true);
      renderPrompt();
      return;
    }
    if (typeof currentDirectory[dirname] !== "object") {
      writeOutput(`cd: '${dirname}' is not a directory`, true);
      renderPrompt();
      return;
    }
    currentPath.push(dirname);
    currentDirectory = currentDirectory[dirname];
    renderPrompt();
  }

  // download command (UPDATED for real downloads)
  function downloadFile(filename) {
    if (!filename) {
      writeOutput("Usage: download <filename>", true);
      renderPrompt();
      return;
    }
    // Must exist in /home/resumes
    const resumesDir = directories.home.resumes;
    if (!resumesDir[filename]) {
      writeOutput(
        `download: cannot download '${filename}': No such file in resumes`,
        true
      );
      renderPrompt();
      return;
    }
    if (typeof resumesDir[filename] === "object") {
      writeOutput(`download: '${filename}' is a directory, not a file.`, true);
      renderPrompt();
      return;
    }

    // Perform a real download via a hidden <a>
    const filePath = resumesDir[filename];
    const link = document.createElement("a");
    link.href = filePath;
    link.download = filename; // So the user sees the correct file name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    writeOutput(`Downloading '${filename}'...`);
    renderPrompt();
  }

  // pwd command
  function printWorkingDirectory() {
    writeOutput("/" + currentPath.join("/"));
    renderPrompt();
  }

  // clear command
  function clearTerminal() {
    terminal.innerHTML = "";
    renderPrompt();
  }

  // history command
  function printHistory() {
    commandHistory.forEach((cmd, index) => {
      writeOutput(`${index + 1}  ${cmd}`);
    });
    renderPrompt();
  }

  // mkdir command
  function makeDirectory(dirname) {
    if (!dirname) {
      writeOutput("Usage: mkdir <dirname>", true);
      renderPrompt();
      return;
    }
    if (currentDirectory[dirname]) {
      writeOutput(`mkdir: cannot create directory ‘${dirname}’: File exists`, true);
      renderPrompt();
      return;
    }
    currentDirectory[dirname] = {};
    writeOutput(`Created directory '${dirname}'.`);
    renderPrompt();
  }

  // rmdir command
  function removeDirectory(dirname) {
    if (!dirname) {
      writeOutput("Usage: rmdir <dirname>", true);
      renderPrompt();
      return;
    }
    const dir = currentDirectory[dirname];
    if (!dir) {
      writeOutput(`rmdir: failed to remove '${dirname}': No such directory`, true);
      renderPrompt();
      return;
    }
    if (typeof dir !== "object") {
      writeOutput(`rmdir: failed to remove '${dirname}': Not a directory`, true);
      renderPrompt();
      return;
    }
    if (Object.keys(dir).length > 0) {
      writeOutput(`rmdir: failed to remove '${dirname}': Directory not empty`, true);
      renderPrompt();
      return;
    }
    delete currentDirectory[dirname];
    writeOutput(`Removed directory '${dirname}'.`);
    renderPrompt();
  }

  // touch command
  function touchFile(filename) {
    if (!filename) {
      writeOutput("Usage: touch <filename>", true);
      renderPrompt();
      return;
    }
    if (currentDirectory[filename] && typeof currentDirectory[filename] === "object") {
      writeOutput(`touch: cannot touch '${filename}': Is a directory`, true);
      renderPrompt();
      return;
    }
    if (!currentDirectory[filename]) {
      currentDirectory[filename] = "";
      writeOutput(`Created file '${filename}'.`);
    } else {
      writeOutput(`Touched file '${filename}'. (timestamp updated)`);
    }
    renderPrompt();
  }

  // rm command
  function removeFile(filename) {
    if (!filename) {
      writeOutput("Usage: rm <filename>", true);
      renderPrompt();
      return;
    }
    const fileData = currentDirectory[filename];
    if (!fileData) {
      writeOutput(`rm: cannot remove '${filename}': No such file`, true);
      renderPrompt();
      return;
    }
    if (typeof fileData === "object") {
      writeOutput(`rm: cannot remove '${filename}': Is a directory`, true);
      renderPrompt();
      return;
    }
    delete currentDirectory[filename];
    writeOutput(`Removed file '${filename}'.`);
    renderPrompt();
  }

  // echo command
  function echoCommand(args) {
    if (!args) {
      writeOutput("Usage: echo <text> [>> file]", true);
      renderPrompt();
      return;
    }
    const hasAppend = args.includes(">>");
    if (!hasAppend) {
      writeOutput(args);
      renderPrompt();
      return;
    }
    const parts = args.split(">>");
    const textPart = parts[0].trim();
    const filePart = (parts[1] || "").trim();
    if (!filePart) {
      writeOutput("Usage: echo <text> >> <filename>", true);
      renderPrompt();
      return;
    }
    if (typeof currentDirectory[filePart] === "object") {
      writeOutput(`echo: '${filePart}' is a directory`, true);
      renderPrompt();
      return;
    }
    if (!currentDirectory[filePart]) {
      currentDirectory[filePart] = "";
    }
    const unquotedText = textPart.replace(/^["']|["']$/g, "");
    currentDirectory[filePart] += unquotedText + "\n";
    writeOutput(`Appended to '${filePart}'.`);
    renderPrompt();
  }

  // exit command
  function exitTerminal() {
    writeOutput("Exiting... attempting to close this tab.");
    setTimeout(() => {
      window.close();
      if (!window.closed) {
        window.open("about:blank", "_self");
        window.close();
      }
    }, 500);
  }

  /* ===================================
                ONBOARDING
  ====================================== */

  function startOnboarding() {
    onboardingActive = true;
    onboardingStep = 0;
    writeOutput("Onboarding started!");
    writeOutput(onboardingSteps[0].instruction);
    renderPrompt();
  }

  function processOnboarding(input) {
    const current = onboardingSteps[onboardingStep];
    // If there's no command (final step) or user typed correct command
    if (!current.command || input === current.command) {
      // Execute the command (so we see real output)
      if (current.command) {
        executeCommand(current.command);
      }
      onboardingStep++;
      if (onboardingStep >= onboardingSteps.length) {
        onboardingActive = false;
        writeOutput("Onboarding complete. Type 'help' to see more commands!");
      } else {
        writeOutput(onboardingSteps[onboardingStep].instruction);
      }
    } else {
      writeOutput(
        `Expected: "${current.command}" but got: "${input}". Try again.`,
        true
      );
    }
    renderPrompt();
  }

  /* ===================================
          MAIN COMMAND EXECUTOR
  ====================================== */

  function executeCommand(input) {
    const [command, ...rest] = input.split(" ");
    const args = rest.join(" ").trim();
    if (commands[command]) {
      commands[command](args);
    } else {
      writeOutput(`Unknown command: ${command}`, true);
      renderPrompt();
    }
  }

  /* ===================================
            COMMANDS OBJECT
  ====================================== */

  const commands = {
    help: () => {
      writeOutput(`
Available Commands:
  help                 Show this help message
  onboarding           Start the onboarding walkthrough
  resumes              List files in /home/resumes
  ls                   List files and directories
  cat <filename>       Display a file (supports .md with Marked.js)
  download <filename>  (Now actually downloads the file for real!)
  cd <dirname>         Change the current directory
  pwd                  Show the current path
  clear                Clear the terminal
  history              Show command history
  mkdir <dirname>      Create a new directory
  rmdir <dirname>      Remove an empty directory
  touch <filename>     Create a file or update its timestamp
  rm <filename>        Remove a file
  echo <text> [>> file] Echo text or append text to a file
  exit                 Attempt to close this browser tab

Shortcuts:
  Tab                  Cycle through all possible matches
  ArrowUp/ArrowDown    Command history
  Ctrl+C               Cancel current input
  Ctrl+L               Clear the screen
      `);
      renderPrompt();
    },

    onboarding: startOnboarding,

    resumes: () => {
      writeOutput("Here are the files in /home/resumes:\n");
      const resumesDir = directories.home.resumes;
      Object.keys(resumesDir).forEach((filename) => {
        if (typeof resumesDir[filename] === "object") {
          writeOutput(filename + "/");
        } else {
          writeOutput(filename);
        }
      });
      renderPrompt();
    },

    ls: listFiles,
    cat: displayFile,
    // Updated "download" calls the function with real download logic
    download: downloadFile,
    cd: changeDirectory,
    pwd: printWorkingDirectory,
    clear: clearTerminal,
    history: printHistory,
    mkdir: makeDirectory,
    rmdir: removeDirectory,
    touch: touchFile,
    rm: removeFile,
    echo: echoCommand,
    exit: exitTerminal,
  };

  /* ===================================
            TERMINAL INIT
  ====================================== */

  function initializeTerminal() {
    terminal.innerHTML = "";
    writeOutput(
      "Welcome to my Terminal Portfolio! Type 'onboarding' to begin or 'help' for more commands."
    );
    renderPrompt();
  }

  initializeTerminal();
});
