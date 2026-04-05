# Software Development Agent Suite

This workspace defines a multi-agent workflow for software development, with the following specialized agents:

- **Orchestrator**: Coordinates all other agents, delegates tasks, monitors progress.
- **Planner**: Breaks down requirements into actionable tasks and plans.
- **Implementer**: Writes code for planned tasks.
- **Reviewer**: Reviews code for correctness and quality.
- **Fixer**: Fixes bugs and issues found during review or testing.
- **Tester**: Tests code for correctness and requirements coverage.

Each agent is defined in its own `.agent.md` file in this directory. The Orchestrator agent manages the workflow and communication between all agents.

To use this suite, invoke the Orchestrator agent with your high-level software development request.
