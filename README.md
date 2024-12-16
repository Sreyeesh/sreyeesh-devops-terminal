

---

# 🚀 Terminal Portfolio

A lightweight, **Linux-like terminal simulation** built with **HTML**, **CSS**, and **JavaScript**. This interactive terminal displays your portfolio content, including your resume, using standard terminal commands like `ls`, `cat`, and `pwd`.

---

## 🌟 **Features**
- **Linux Terminal Simulation**: Emulates a lightweight terminal interface.
- **Markdown Rendering**: Displays your resume (Markdown file) rendered as HTML.
- **Tab Autocomplete**: Autocomplete commands and file names using the `Tab` key.
- **Interactive Commands**:
    - `help` - Show all available commands.
    - `ls` - List files in the current directory.
    - `cat <filename>` - View the content of a file (supports Markdown).
    - `cv` - Alias for `cat master-resume.md` (view your resume).
    - `pwd` - Show the current working directory.
    - `clear` - Clear the terminal screen.

---

## 📂 **Project Structure**

```
terminal-portfolio/
│
├── index.html              # The main HTML file
├── styles.css              # Terminal styling
├── script.js               # Main JavaScript file for functionality
├── .github/                # GitHub Actions workflows
│   └── workflows/         
│       └── deploy.yml      # GitHub Actions workflow for deployment
└── README.md               # Project documentation
```

---

## 🚀 **Getting Started**

### Prerequisites
Ensure you have a browser installed. No additional dependencies are required.

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

## 🛠 **Available Commands**

| **Command**       | **Description**                                |
|--------------------|-----------------------------------------------|
| `help`            | Show available commands.                      |
| `ls`              | List files in the current directory.          |
| `cat <filename>`  | Display the content of a file.                |
| `cv`              | Alias for `cat master-resume.md` (view resume).|
| `pwd`             | Show current directory.                       |
| `clear`           | Clear the terminal.                           |

---

## 🎉 **Live Demo**

You can access the live demo of the terminal portfolio here:  
🔗 **[https://sreyeesh.github.io/sreyeesh-devops-terminal/](https://sreyeesh.github.io/sreyeesh-devops-terminal/)**  

---


