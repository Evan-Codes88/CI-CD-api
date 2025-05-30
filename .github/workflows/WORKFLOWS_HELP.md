# GitHub Actions Workflows Help

## Overview

This document details `ci.yml` and `Deploy.yml`, automating testing and deployment for a Node.js application with persistent logging, revision preservation, and data export.

## Prerequisites

- **GitHub Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `MONGODB_URI`, `JWT_SECRET` in `Settings > Secrets and variables > Actions`.
- **AWS Resources**: S3 bucket `elasticbeanstalk-ap-southeast-2-591408364730` with `test-logs/` and `DEV-API/DEVAPI-env/logs/`. Elastic Beanstalk application `DEV API`, environment `DEVAPI-env` in `ap-southeast-2`.
- **Node.js Project**: `package.json` with Jest (`npm install --save-dev jest`, `"test": "jest"`), Node.js 18.

## Workflows

### 1. `ci.yml` - Continuous Integration

**Purpose**: Runs tests, generates logs, and exports test data.
**Triggers**:

- **Push** to `main` for `src/`, `tests/`, `package.json`, `package-lock.json`.
- **Pull Request** to `main` with same paths.
- **Schedule**: Daily at midnight UTC.
- **Condition**: Skips if repository is archived.

**Steps**:

1. Checkout code (`actions/checkout@v3`).
2. Set up Node.js 18 (`actions/setup-node@v3`).
3. Install dependencies (`npm install`).
4. Run tests (`npx jest --ci --json`).
5. Create custom log and export `test-summary.json`.
6. Upload logs to S3 (`test-logs/`) and Elastic Beanstalk (`DEV-API/DEVAPI-env/logs/`).
7. Archive `test-results.json`, `test-results-custom.log`, `test-summary.json`.

**Outputs**:

- **Artifacts**: Download from `Actions` tab.
- **S3**: `s3://elasticbeanstalk-ap-southeast-2-591408364730/test-logs/test-results-<commit-sha>.log`.
- **Elastic Beanstalk**: `DEV-API/DEVAPI-env/logs/test-results-<commit-sha>.log`.
- **Test Summary**: `test-summary.json` for reuse (e.g., reporting).

### 2. `Deploy.yml` - Deployment

**Purpose**: Deploys to Elastic Beanstalk after testing.
**Triggers**:

- **Push** to `main` for `src/`, `package.json`, `package-lock.json`.
- **Manual Dispatch**: With `environment` input.
- **Condition**: Manual dispatch requires `DEVAPI-env`.

**Steps**:

1. Run `ci.yml` tests.
2. Checkout code, set up Node.js, install dependencies.
3. Create `application.zip`.
4. Deploy to Elastic Beanstalk via S3.

**Outputs**:

- **Logs**: GitHub Actions `deploy` job.
- **Revisions**: Elastic Beanstalk `DEV API` versions, S3 `application.zip`.

## Troubleshooting

- **Secrets**: Verify in GitHub settings.
- **AWS**: Check S3/Elastic Beanstalk access.
- **Tests**: Ensure Jest configuration.
- **JSON Errors**: Debug with `cat test-results.json`.
- **Deployment**: Review Elastic Beanstalk logs.

## Notes

- Runner: `ubuntu-latest` (2.324.0).
- Artifacts: 90-day retention.
- Persistent logs in S3/Elastic Beanstalk.
- Reusable `test-summary.json`.

Refer to [GitHub Actions](https://docs.github.com/en/actions) or [AWS](https://docs.aws.amazon.com).
