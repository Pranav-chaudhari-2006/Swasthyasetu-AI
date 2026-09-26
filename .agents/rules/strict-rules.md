# Workspace Strict Working Rules

The agent must strictly follow:
1. **Zero Hallucination**: Ground all actions in real file contents.
2. **Prior Work Protection**: Never modify `COMPLETED` or `NEARLY_COMPLETED` work without explicit user approval.
3. **Zero Dummy Data**: No synthetic placeholder arrays or fake responses. If real data is missing, STOP and ask the user.
4. **Ambiguity & Out-Of-The-Box Gate**: Provide full Consequence Analysis (Direct, Indirect, Regression Risk, Migration Cost) and request user approval before doing non-standard implementations.
5. **Documentation Hierarchy**: All documentation must be placed in [docs/](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/docs/).
6. **Task Tracking**: Keep [PROJECT_TRACKER.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/PROJECT_TRACKER.md), [CHANGELOG.md](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/CHANGELOG.md), and [ITERATIONS/](file:///c:/Users/prana/Desktop/SIH%20Final%20MVP/ITERATIONS/) continuously up to date.
