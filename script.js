document.addEventListener("DOMContentLoaded", () => {
  const terminal = document.getElementById("terminal");
  const promptText = "user@portfolio:~$";
  const masterResumeURL =
    "https://raw.githubusercontent.com/Sreyeesh/ResumeForge/main/resumes/master-resume.md";
  const files = {
    "master-resume.md": null, // Placeholder for the fetched resume content
  };

  const commands = {
    help: showHelp,
    ls: listFiles,
    cat: displayFile,
    cv: () => displayFile("master-resume.md"),
    clear: clearTerminal,
  };

  // Initialize terminal
  initializeTerminal();

  function initializeTerminal() {
    clearTerminal();
    writeOutput(
      "Welcome to my Terminal Portfolio!\nType 'help' for a list of commands.\n"
    );
    renderPrompt();
  }

  // Display help
  function showHelp() {
    writeOutput(`
Available Commands:
help               Show available commands.
ls                 List available files.
cat <filename>     Display the content of a file.
cv                 View the resume (alias for 'cat master-resume.md').
clear              Clear the terminal.
`);
  }

  // List files
  function listFiles() {
    writeOutput(Object.keys(files).join("\n"));
  }

  // Display file content
  async function displayFile(filename) {
    if (!filename) {
      writeOutput("Usage: cat <filename>");
      return;
    }

    if (filename === "master-resume.md") {
      if (!files[filename]) {
        writeOutput("Fetching master-resume.md...");
        try {
          const response = await fetch(masterResumeURL);
          if (!response.ok) throw new Error("Failed to fetch file.");
          files[filename] = await response.text(); // Cache content
        } catch (error) {
          writeOutput(`Error: Could not fetch '${filename}'.`);
          return;
        }
      }
      writeOutput(marked.parse(files[filename])); // Render Markdown
    } else {
      writeOutput(`cat: ${filename}: No such file.`);
    }
  }

  // Clear the terminal
  function clearTerminal() {
    terminal.innerHTML = "";
  }

  // Write content to the terminal
  function writeOutput(content) {
    const outputLine = document.createElement("div");
    outputLine.innerHTML = content;
    terminal.appendChild(outputLine);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll to bottom
  }

  // Render the prompt
  function renderPrompt() {
    const prompt = document.createElement("div");
    prompt.classList.add("input-line");

    const promptTextElement = document.createElement("span");
    promptTextElement.classList.add("prompt");
    promptTextElement.textContent = promptText;

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("command-input");
    input.autofocus = true;

    input.addEventListener("keydown", handleCommand);

    prompt.appendChild(promptTextElement);
    prompt.appendChild(input);
    terminal.appendChild(prompt);
    input.focus();
  }

  // Handle commands
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
      }

      renderPrompt();
    }
  }
});
