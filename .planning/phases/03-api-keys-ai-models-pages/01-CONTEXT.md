# Phase 3 Context: API Keys + AI Models Pages

This document captures the implementation decisions made during the discussion phase to guide research and planning.

## Unsaved Changes Bar
- **Scope**: The `UnsavedBar` globally tracks changes across the application. It acts as a central staging area for all pending updates (whether from the API Keys page, AI Models page, or others). 
- **Behavior**: Clicking "Publish" commits all pending changes to Remote Config simultaneously. Discarding clears all pending changes.

## API Key Masking
- **Default State**: API keys are heavily redacted. Only the last 4 characters are visible by default (e.g., `********************a1b2`).
- **Interaction**: Users can toggle visibility on/off. Toggling ON reveals the full API key. Toggling OFF reverts to the redacted state.

## Data Structure Strategy
- **Approach**: Agent Discretion used. We will store dynamic providers as stringified JSON objects in Remote Config (e.g., one parameter `api_keys_config` containing an array or record of providers and their keys, and another `ai_models_config` for the model settings). 
- **Reasoning**: This prevents cluttering Remote Config with dozens of individual keys (`api_key_openai`, `api_key_anthropic`) and makes adding/deleting dynamic providers clean and structured.

## Delete Provider Behavior
- **Staging**: Deleting a provider (API key or AI model tab) immediately removes it from the local UI, but does **not** persist to Firebase.
- **Persistence**: Deletions are added to the global pending changes state. The user must click "Publish" on the `UnsavedBar` to actually persist the deletion to Remote Config.

## UI Components
- Shared components (`Toast`, `Modal`, `UnsavedBar`) must be implemented to support the workflows above.
