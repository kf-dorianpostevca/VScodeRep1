# Copilot Instructions for AI Agents

## Project Overview
This codebase contains simple test scripts in JavaScript (`jsFirstTest.js`), Node.js (`node.js`), and Python (`PythonTest.py`). There is no complex architecture or multi-file component structure. Each file is standalone and serves as a basic test or demonstration.

## Key Files
- `jsFirstTest.js`: JavaScript test script. Entry point for JS experiments.
- `node.js`: Node.js script. Use for Node-specific tests.
- `PythonTest.py`: Python script. Use for Python-specific tests.

## Developer Workflows
- **Run JavaScript/Node.js**: Use `node <filename>` in the terminal (e.g., `node jsFirstTest.js`).
- **Run Python**: Use `python PythonTest.py` in the terminal. Ensure Python is installed and available in PATH.
- No build, test, or linting workflows are present.

## Patterns & Conventions
- Scripts are flat and do not import from each other.
- No external dependencies or package managers (no `package.json` or `requirements.txt`).
- No custom configuration files or environment variables required.
- No framework-specific conventions.

## Integration Points
- No external APIs, services, or integrations are present.
- No cross-file communication or shared modules.

## Example Usage
```powershell
# Run JavaScript test
node jsFirstTest.js

# Run Node.js test
node node.js

# Run Python test
python PythonTest.py
```

## Guidance for AI Agents
- Focus on direct script editing and execution.
- If adding new scripts, follow the pattern of standalone files.
- If introducing dependencies, document them and add relevant config files.
- Keep instructions and comments concise and relevant to the file's purpose.

---
For questions or unclear conventions, ask the user for clarification or examples.