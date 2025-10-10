# Agent Development Guidelines

This document provides guidelines for AI agents developing this project.

## General Principles

- **Follow the Plan**: Adhere to the established development plan. If the plan needs to be changed, update it using the `set_plan` tool.
- **Verify Your Work**: After every file modification, use `read_file` or `ls` to confirm that the changes were applied correctly.
- **Modular Code**: Write clean, modular, and well-documented code.

## Backend (FastAPI)

- **Dependencies**: Add any new Python dependencies to `backend/requirements.txt`.
- **API Design**: Ensure API endpoints are well-defined and follow RESTful principles. Use Pydantic models for request and response validation.
- **Testing**: Add unit tests for new features in the `backend/tests` directory.

## Frontend (React)

- **Dependencies**: Add any new Node.js dependencies to `frontend/package.json`.
- **Component-Based Architecture**: Build reusable components and keep them small and focused.
- **State Management**: Use a clear and consistent state management strategy.

## Commits and Pull Requests

- **Branching**: Use descriptive branch names (e.g., `feature/add-summarization-logic`).
- **Commit Messages**: Write clear and concise commit messages.
- **Pull Requests**: Provide a detailed description of the changes in your pull requests.