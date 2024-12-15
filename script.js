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
        console.log(`Fetching: ${url}`); // Log the URL being fetched
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        return await response.text();
    } catch (error) {
        return `Error fetching the resume. Ensure the file exists at: ${url}`;
    }
}

// Display the Markdown resume
async function displayMarkdownResume() {
    const markdown = await fetchMarkdown("master-resume.md"); // Use the correct file name
    return marked.parse(markdown); // Convert Markdown to HTML using Marked.js
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
    terminalOutput.innerHTML = ""; // Clear all previous output
    return ""; // Return an empty string to avoid displaying anything
}

// Display list of projects
function showProjects() {
    return `
My Projects:
1. **Portfolio Terminal** - A terminal-style portfolio website. [GitHub](https://github.com/Sreyeesh/portfolio-terminal)
2. **ResumeForge** - A resume generator for developers. [GitHub](https://github.com/Sreyeesh/ResumeForge)
3. **Task Manager** - A web-based task management tool. [Live Demo](https://example.com) | [GitHub](https://github.com/Sreyeesh/task-manager)
    `;
}

// Display contact information
function showContact() {
    return `
Contact Me:
- Email: sreyeesh@example.com
- GitHub: [github.com/Sreyeesh](https://github.com/Sreyeesh)
- LinkedIn: [linkedin.com/in/sreyeesh](https://linkedin.com/in/sreyeesh)
    `;
}

// Display technical skills
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

// Handle terminal input
commandInput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
      const input = commandInput.value.trim();

      // Special behavior for `clear` command
      if (input === "clear") {
          clearTerminal(); // Clear the terminal output
          commandInput.value = ""; // Clear the input field
          return; // Stop further processing
      }

      // Process other commands
      const response =
          typeof commands[input] === "function"
              ? await commands[input]()
              : `"${input}" is not a valid command. Type 'help' for a list of commands."`;

      // Update terminal output
      terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div>`;
      terminalOutput.innerHTML += `<div class="output-line">${response}</div><br>`;
      terminalOutput.scrollTop = terminalOutput.scrollHeight; // Scroll to the bottom
      commandInput.value = ""; // Clear input field
  }
});

