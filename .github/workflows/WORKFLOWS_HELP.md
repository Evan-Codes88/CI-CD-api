# GitHub Actions Workflows Help

## Overview

This document details `ci.yml` and `Deploy.yml` for the RentSync project, automating testing and deployment with persistent logging and revision preservation.

## Prerequisites

- **GitHub Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `MONGODB_URI`, `JWT_SECRET` in `Settings > Secrets and variables > Actions`.
- **AWS Resources**: S3 bucket `elasticbeanstalk-ap-southeast-2-591408364730` with `test-logs/` and `DEV-API/DEVAPI-env/logs/`. Elastic Beanstalk application `DEV API`, environment `DEVAPI-env` in `ap-southeast-2`.
- **Node.js Project**: `package.json` with Jest (`npm install --save-dev jest`, `"test": "jest"`), Node.js 18.
- **.ebextensions**: Add `logs.config` to project root for Elastic Beanstalk logs.

## Workflows

### 1. `ci.yml` - Continuous Integration

**Purpose**: Runs Jest tests, generates logs, and exports test data.
**Triggers**:

- Push to `main`.
- Pull request to `main`.

**Steps**:

1. Checkout code (`actions/checkout@v3`).
2. Set up Node.js 18 (`actions/setup-node@v3`).
3. Install dependencies (`npm install`).
4. Debug Jest setup (logs version, dependencies).
5. Run tests (`npx jest --ci --json`).
6. Debug test results (logs `test-results.json`).
7. Create custom log and `test-summary.json`.
8. Upload logs to S3 (`test-logs/`) and Elastic Beanstalk (`DEV-API/DEVAPI-env/logs/`).
9. Archive `test-results.json`, `test-results-custom.log`, `test-summary.json`.

**Outputs**:

- **Artifacts**: Download from `Actions` tab (`https://github.com/Evan-Codes88/CI-CD-api/actions`).
- **S3**: `s3://elasticbeanstalk-ap-southeast-2-591408364730/test-logs/test-results-<commit-sha>.log`.
- **Elastic Beanstalk**: `DEV API` > `DEVAPI-env` > `Logs` or `s3://elasticbeanstalk-ap-southeast-2-591408364730/DEV-API/DEVAPI-env/logs/`.
- **Test Summary**: `test-summary.json` for reuse.

### 2. `Deploy.yml` - Deployment

**Purpose**: Deploys to Elastic Beanstalk after testing.
**Triggers**:

- Push to `main`.

**Steps**:

1. Run `ci.yml` tests.
2. Checkout code, set up Node.js, install dependencies.
3. Create `application.zip`.
4. Debug AWS setup.
5. Deploy to Elastic Beanstalk via S3.

**Outputs**:

- **Logs**: `Actions` tab, `deploy` job.
- **Revisions**: Elastic Beanstalk `DEV API` versions, S3 `application.zip`.

## Debugging

- **No Runs**: Check `Actions` tab, ensure `main` branch commits, verify Actions enabled in `Settings`.
- **S3/Beanstalk Failures**: Review `Debug AWS setup` logs, confirm secrets, test S3 permissions (`aws s3 ls`).
- **Test Failures**: Check `Debug Jest setup` and `Debug test results` logs, ensure `package.json` has `"test": "jest"`.
- **401 Errors**: Verify `JWT_SECRET`, middleware in `index.js`.
- **MongoDB**: Ensure `MONGODB_URI` in GitHub secrets and Elastic Beanstalk environment properties.

## Notes

- Runner: `ubuntu-latest` (2.324.0).
- Artifacts: 90-day retention.
- Persistent logs in S3/Elastic Beanstalk.
- Add `.ebextensions/logs.config` for log visibility.

Refer to [GitHub Actions](https://docs.github.com/en/actions) or [AWS](https://docs.aws.amazon.com).
