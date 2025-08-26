# Postman Collection Overview

This page explains how the provided "Notion API" Postman collection is organized and how its variables map to the local environment to keep Postman, examples, and the docs in sync.

The collection requires an integration access token and workspace identifiers (database, page, user, block), which must be added under its Variables tab before making requests.

## Variables

Use the following mapping so variable names in Postman align with .env keys used by the runnable examples and snippets in this repository.

| Postman variable | .env key           | Purpose                                                  | Where to get value |
| ---              | ---                | ---                                                      | --- |
| BEARER_TOKEN     | NOTION_TOKEN | OAuth access token used in Authorization: Bearer headers for API calls. | Create a Notion integration and copy its token; for OAuth apps, use the runtime access token issued after auth. |
| NOTION_VERSION   | NOTION_VERSION | API version string for the Notion-Version header on every request. | Use the version specified in the collection or current supported date string. |
| DATABASE_ID      | DATABASE_ID  | Target database identifier for database and page operations. | From the database URL in the workspace or the provided template database. |
| PAGE_ID          | PAGE_ID      | Target page identifier for page and block operations. | From the page URL in the workspace. |
| USER_ID          | USER_ID      | User identifier for user retrieval endpoints. | From user data returned by the API or admin interfaces. |
| BLOCK_ID         | BLOCK_ID     | Block identifier for comments and block endpoints. | From block URLs or API responses related to pages/blocks. |
| DISCUSSION_ID    | DISCUSSION_ID | Discussion thread identifier used when adding comments to an existing discussion. | From prior comment/discussion API responses. |
| PROPERTY_ID      | PROPERTY_ID   | Property identifier used to retrieve a page property item. | From database schema or page property metadata in responses. |

> Note: Pages parented by a database must have properties that match the parent database schema; update request bodies accordingly when not using the provided template.

## Keep Postman and .env in sync

- For local testing, add the following keys to the top-level .env.example so examples and Postman share the same values; do not commit real secrets.

