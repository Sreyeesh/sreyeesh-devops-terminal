```markdown
# 🚀 Terminal Portfolio

An interactive, **Linux-like terminal simulation** built with **HTML**, **CSS**, and **JavaScript**. This terminal-style portfolio lets users explore your resume, projects, and skills using standard terminal commands like `ls`, `cat`, and `pwd`.

---

## 🌟 Features

- **Linux Terminal Simulation**: A fully interactive, lightweight terminal interface.
- **Markdown Rendering**: Displays resumes and other content in Markdown format, rendered as clean HTML.
- **Interactive Commands**:
  - `help` - Show all available commands.
  - `ls` - List files and directories in the current directory.
  - `cd <directory>` - Navigate into directories.
  - `cat <filename>` - View the content of files (Markdown supported).
  - `download <filename>` - Download files, such as resumes, in PDF format.
  - `pwd` - Show the current directory path.
  - `clear` - Clear the terminal screen.
- **Tab Autocomplete**: Autocomplete commands and file names with the `Tab` key.
- **Onboarding Walkthrough**: Provides step-by-step guidance for first-time users to help them navigate the terminal interface effectively.

---

## 🧭 Onboarding Walkthrough

When a new user visits the portfolio, they are welcomed with an **interactive onboarding experience** that includes:

1. **Welcome Message**: A friendly introduction explaining the purpose of the terminal portfolio.
2. **Command Overview**: Highlights essential commands like `ls`, `cd`, `cat`, and `download`.
3. **Step-by-Step Guidance**:
   - Guides users on navigating directories (`cd` command).
   - Explains how to list files using `ls`.
   - Demonstrates how to view files with `cat`.
   - Shows how to download files using the `download` command.
4. **Helpful Prompts**: Ensures users feel confident using the terminal commands by providing tips and examples during their first session.

---

## 📂 Project Structure

```plaintext
terminal-portfolio/
│
├── assets/                          # Assets directory for static files
│   └── resumes/                     # Resumes directory
│       ├── master-resume.md         # Markdown version of the master resume
│       ├── Sreyeesh_Garimella_DevOps_Engineer.md  # Markdown version of DevOps Engineer resume
│       ├── master-resume.pdf        # PDF version of the master resume
│       └── Sreyeesh_Garimella_DevOps_Engineer.pdf # PDF version of DevOps Engineer resume
│
├── .github/                         # GitHub-related files
│   └── workflows/                   # GitHub Actions workflows
│       └── deploy.yml               # Workflow for deploying to GitHub Pages
│
├── index.html                       # Main HTML file for the terminal
├── styles.css                       # CSS file for styling the terminal
├── script.js                        # JavaScript file for terminal functionality
├── README.md                        # Project documentation
└── LICENSE                          # License for the project
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (e.g., Chrome, Firefox, Edge).
- No additional dependencies are required.

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Sreyeesh/sreyeesh-devops-terminal.git
   cd sreyeesh-devops-terminal
   ```

2. **Run Locally**:
   - Open `index.html` directly in your browser, or
   - Use a live server:
     ```bash
     npx serve .
     ```

3. **Deploy Using GitHub Actions**:
   - Push changes to the `main` branch.
   - The workflow defined in `.github/workflows/deploy.yml` will handle automatic deployment.

---

## 🛠 Available Commands

| **Command**       | **Description**                                |
|--------------------|-----------------------------------------------|
| `help`            | Show available commands.                      |
| `ls`              | List files and directories in the current directory. |
| `cd <directory>`  | Navigate to a directory.                      |
| `cat <filename>`  | Display the content of a file (Markdown supported). |
| `download <file>` | Download a file, such as a resume in PDF format. |
| `pwd`             | Display the current directory path.           |
| `clear`           | Clear the terminal screen.                    |

---

## 🎉 Live Demo

Explore the live terminal portfolio:  
🔗 **[sreyeesh.github.io/sreyeesh-devops-terminal](https://sreyeesh.github.io/sreyeesh-devops-terminal/)**  

---

## 🐛 Issues and Feedback

If you encounter any issues or have suggestions for improvement, please raise an issue in the repository:  
👉 **[Submit an Issue](https://github.com/Sreyeesh/sreyeesh-devops-terminal/issues)**

---

## ✨ Future Plans
- **Enhanced Theming**: Add support for light/dark modes.
- **File Permissions**: Implement a basic `chmod` functionality for files.
- **Easter Eggs**: Introduce fun commands like `fortune` or `matrix`.
- **Simulated Pipes**: Add Linux-like piping and redirection.

---
