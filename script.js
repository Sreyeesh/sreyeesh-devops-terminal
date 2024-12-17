document.addEventListener("DOMContentLoaded", () => {
  // Prevent duplicate initialization
  if (window.terminalInitialized) return;
  window.terminalInitialized = true;

  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";
  const masterResumeURL =
    "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";
  const files = {
    "master-resume.md": null, // Placeholder for fetched resume content
  };

  const commands = {
    help: showHelp,
    ls: listFiles,
    cat: displayFile,
    cv: () => displayFile("master-resume.md"),
    clear: clearTerminal,
  };

  let inputElement;

  // Initialize terminal
  initializeTerminal();

  function initializeTerminal() {
    terminal.innerHTML = ""; // Clear the terminal on load
    writeOutput("Welcome to my Terminal Portfolio!\nType 'help' for a list of commands.");
    renderPrompt(); // Ensure the prompt appears after the welcome message
  }

  function showHelp() {
    writeOutput(`
Available Commands:
help               Show available commands.
ls                 List available files.
cat <filename>     Display the content of a file.
cv                 View the resume (alias for 'cat master-resume.md').
clear              Clear the terminal.
`);
    renderPrompt();
  }

  function listFiles() {
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
          const response = await fetch(masterResumeURL);
          if (!response.ok) throw new Error("Failed to fetch file.");
          files[filename] = await response.text();
        } catch (error) {
          writeOutput(`Error: Could not fetch '${filename}'.`);
          renderPrompt();
          return;
        }
      }
      writeOutput(marked.parse(files[filename]));
    } else {
      writeOutput(`cat: ${filename}: No such file.`);
    }
    renderPrompt();
  }

  function clearTerminal() {
    terminal.innerHTML = ""; // Clear terminal content
    writeOutput("Welcome to my Terminal Portfolio!\nType 'help' for a list of commands.");
    renderPrompt(); // Ensure the prompt appears after the welcome message
  }

  function writeOutput(content) {
    const outputLine = document.createElement("div");
    outputLine.innerHTML = content;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
  }

  function renderPrompt() {
    // Prevent duplicate prompts by removing any previous input element
    const existingInputs = document.querySelectorAll(".command-input");
    existingInputs.forEach((input) => input.remove());

    const promptLine = document.createElement("div");
    promptLine.classList.add("input-line");

    const promptTextElement = document.createElement("span");
    promptTextElement.classList.add("prompt");
    promptTextElement.textContent = promptText;

    inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.classList.add("command-input");
    inputElement.autofocus = true;

    inputElement.addEventListener("keydown", handleCommand);
    inputElement.addEventListener("keydown", handleTabCompletion);

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

  function handleTabCompletion(event) {
    if (event.key === "Tab") {
      event.preventDefault();
      const inputValue = inputElement.value.trim();
      const words = inputValue.split(" ");
      const currentInput = words[words.length - 1];

      let suggestions = [];

      if (words.length === 1) {
        // Suggest commands
        suggestions = Object.keys(commands).filter((cmd) =>
          cmd.startsWith(currentInput)
        );
      } else {
        // Suggest files
        suggestions = Object.keys(files).filter((file) =>
          file.startsWith(currentInput)
        );
      }

      if (suggestions.length === 1) {
        words[words.length - 1] = suggestions[0];
        inputElement.value = words.join(" ") + " ";
      } else if (suggestions.length > 1) {
        writeOutput(suggestions.join(" "));
        renderPrompt();
      }
    }
  }
});
