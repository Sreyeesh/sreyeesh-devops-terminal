// DOM Elements
const terminalOutput = document.getElementById("output");
const commandInput = document.getElementById("command-input");

// Commands object
const commands = {
    help: showHelp,
    resume: displayMarkdownResume,
    clear: clearTerminal,
};

// Fetch and render the Markdown resume
async function fetchMarkdown(file) {
    const url = `https://raw.githubusercontent.com/Sreyeesh/resume-templates/main/resumes/${file}`;
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
- help: Show this help message.
    `;
}

// Clear the terminal output
function clearTerminal() {
    terminalOutput.innerHTML = ""; // Clear all previous output
    return ""; // Return an empty string to avoid displaying anything
}

// Handle terminal input
commandInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const input = commandInput.value.trim();
        const response =
            typeof commands[input] === "function"
                ? await commands[input]() // Execute the command function
                : `"${input}" is not a valid command. Type 'help' for a list of commands.`;

        // Update terminal output
        terminalOutput.innerHTML += `<div class="output-line">$ ${input}</div>`;
        terminalOutput.innerHTML += `<div class="output-line">${response}</div><br>`;
        terminalOutput.scrollTop = terminalOutput.scrollHeight; // Scroll to the bottom
        commandInput.value = ""; // Clear input field
    }
});
