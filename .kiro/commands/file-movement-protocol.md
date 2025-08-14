---
description: "Action: Safely move or rename files and directories within the project, following the A05 risk mitigation model."
---

## Scope

This action applies to any movement of files or directories within the project, especially those that are part of the Single Source of Truth (SoT) (`docs/` and `.kiro/`). This includes moving documentation, specifications, steering documents, and code files.

*   **Documentation Movement**: Moving files between `docs/` subdirectories (e.g., `docs/guides/` to `docs/specs/`).
*   **SoT Relocation**: Moving files from `docs/` to `.kiro/` or vice-versa, after careful consideration.
*   **Archiving**: Moving obsolete files to `docs/archive/`.
*   **Code Restructuring**: Moving or renaming code files, modules, or packages.

## Objective

To relocate files or directories in a controlled manner that maintains the integrity of all references, links, and dependencies, while minimizing disruption to the project and its consumers. The process must:

*   **Conduct Impact Analysis**: Identify all files, internal links, and external systems that might be affected by the move.
*   **Update Aliases and Mappings**: Ensure `docs/ALIAS_MAP.json` and `docs/INDEX_MAP.md` are updated to reflect the new locations.
*   **Preserve History**: Maintain the git history of the moved files.
*   **Validate Post-Move**: Ensure all links are working and the project structure is consistent.

## Deliverables

1.  A completed file/directory move with its full git history preserved.
2.  An updated `docs/ALIAS_MAP.json` with an entry for the moved file, pointing to its new location.
3.  An updated `docs/INDEX_MAP.md` if the move affects the overall index structure.
4.  A final pull request detailing the move, the impact analysis, and the validation steps taken.
5.  A report from the `docs_link_check.py` script confirming all links are valid.

## Process

### 1. Etki Analizi ve Referans Envanteri (Impact Analysis and Reference Inventory)

1.  **Identify the Target File/Directory**:
    *   Clearly define the file or directory you intend to move and its proposed new location.

2.  **Find All References**:
    *   Use `git grep` or a similar tool to search for all occurrences of the file's name (with and without extensions) across the entire repository.
    *   Pay special attention to:
        *   Internal Markdown links (`[text](path/to/file.md)`).
        *   References in code comments or configuration files.
        *   Any hardcoded paths in scripts or documentation.
    *   Create a comprehensive list of all files that reference the target.

3.  **Identify Consumers (if applicable)**:
    *   If the file is part of a public API or a consumed module, identify any external projects or systems that might depend on its current path. This is critical for files in `.kiro/specs` or public `docs/specs`.

4.  **Document the Plan**:
    *   Create a document or a detailed comment in your `docs/ALIAS_MAP.json` plan outlining:
        *   The file to be moved.
        *   The source and destination paths.
        *   The list of affected files and references.
        *   The plan for updating each reference.

### 2. ALIASMAP ve Taşıma Planı (ALIAS_MAP and Movement Plan)

1.  **Update `docs/ALIAS_MAP.json`**:
    *   Add an entry to the `notes` field of `docs/ALIAS_MAP.json`.
    *   **Example**:
        ```json
        "notes": {
          "move_after_dependency_check": true,
          "consumers updated": false,
          "planned_moves": [
            {
              "source": "docs/old-location/file.md",
              "target": "docs/new-location/file.md",
              "reason": "Restructuring guides for better clarity.",
              "affected_consumers": ["external-project-x", "script-y"]
            }
          ]
        }
        ```
    *   Set `"move_after_dependency_check": true` if there are external consumers that need to be updated first.
    *   Set `"consumers updated": false` initially. This will be set to `true` after all known consumers have been notified or updated.

### 3. Dry-Run

1.  **Execute Dry-Run Script**:
    *   Run the project's dry-run script to simulate the move and check for potential issues.
    *   **Command**: `bash scripts/dry_run.sh` or `python scripts/docs_move.py --dry-run --from <source> --to <target>`
    *   **Review Output**: Carefully examine the dry-run report for any broken links, missing files, or other problems.

2.  **Address Issues**:
    *   Fix any issues identified during the dry-run before proceeding to the actual move.

### 4. Taşıma Uygulaması (Apply Movement)

1.  **Execute the Move**:
    *   Use the provided script to perform the file movement.
    *   **Command**: `python scripts/docs_move.py --from <source> --to <target>`
    *   **Manual Move (if no script)**: Use `git mv` to move the file. This preserves history.
        ```bash
        git mv docs/old-location/file.md docs/new-location/file.md
        ```

2.  **Update All Internal References**:
    *   Go through the list of affected files you identified in Step 1.
    *   Update all internal links and references to point to the new file path.
    *   Commit these changes in a separate, logical commit.

### 5. Güncellenen Tüketici Doğrulaması (Validate Updated Consumers)

1.  **Notify/Update Consumers**:
    *   If there were external consumers, update their code or documentation to use the new path.
    *   This might involve coordinating with other teams or projects.

2.  **Update `docs/ALIAS_MAP.json`**:
    *   Once all consumers have been updated, change the `"consumers updated"` field to `true`.
    *   Commit this change.

### 6. Review ve Raporlama (Review and Reporting)

1.  **Open Pull Request**:
    *   Open a pull request containing all the changes from the move and reference updates.
    *   **PR Title**: `docs: Move <file> from <source> to <target>`
    *   **PR Description**:
        *   Explain the reason for the move.
        *   Summarize the impact analysis.
        *   List all files that were updated.
        *   Include a link to the dry-run report.
        *   Confirm that all consumers have been updated.

2.  **Request Review**:
    *   Assign the PR to at least one other team member for review.
    *   Ensure the reviewer understands the A05 risk model and has checked the impact.

3.  **Link Doğrulaması (Link Validation)**:
    *   After the PR is merged, run the link checker to ensure everything is working correctly.
    *   **Command**: `python scripts/docs_link_check.py`
    *   Fix any remaining broken links.

4.  **Finalize `docs/ALIAS_MAP.json`**:
    *   Once everything is validated, you can remove the temporary `planned_moves` entry from `docs/ALIAS_MAP.json` or move it to an `archive` section within the notes.

## Roles & Responsibilities

*   **Initiator/Developer**: Responsible for identifying the need for a move, conducting the impact analysis, and executing the movement protocol.
*   **Project Lead/Architect**: Responsible for approving the move, especially for SoT files or high-impact changes.
*   **Consumer Team (if applicable)**: Responsible for updating their own codebase/documentation to reflect the new file location.
*   **Reviewer**: Responsible for validating the impact analysis and ensuring the protocol was followed correctly.

## Timeline

*   **Impact Analysis**: 1-2 hours, depending on the number of references.
*   **Dry-Run and Issue Fixing**: 30 minutes - 1 hour.
*   **Move and Reference Updates**: 1-2 hours.
*   **Consumer Update and Validation**: Varies (hours to days, depending on consumer count).
*   **PR Review and Merge**: 1-2 days.
