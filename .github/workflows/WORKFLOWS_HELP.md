# GitHub Actions Workflows Help

This document provides an overview of the GitHub Actions workflow files: `ci.yml` and `Deploy.yml`. These automate testing and deployment of a Node.js application, with persistent logging and revision preservation.

## Prerequisites

- **GitHub Secrets**:

  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: For S3 and Elastic Beanstalk access.
  - `MONGODB_URI`: MongoDB connection string.
  - `JWT_SECRET`: JWT authentication secret.
  - Configure in `Settings > Secrets and variables > Actions`.

- **AWS Resources**:

  - S3 bucket: `elasticbeanstalk-ap-southeast-2-591408364730` with `test-logs/` and `DEV-API/DEVAPI-env/logs/`.
  - Elastic Beanstalk application: `DEV API`, environment: `DEVAPI-env` in `ap-southeast-2`.

- **Node.js Project**:
  - `package.json` with `npm install` and `test` scripts (Jest).
  - Node.js 18.

## Workflow Descriptions

### 1. `ci.yml` - Continuous Integration

**Purpose**: Runs tests, generates custom logs, and stores them in S3 and Elastic Beanstalk.

**Triggers**:

- **Push** to `main` for changes in `src/`, `tests/`, `package.json`, or `package-lock.json`.
- **Pull request** targeting `main` with same path filters.
- **Schedule**: Daily at midnight UTC (`0 0 * * *`), skips if repository is archived.

**Steps**:

1. **Checkout Code**: `actions/checkout@v3`.
2. **Set Up Node.js**: `actions/setup-node@v3` with Node.js 18.
3. **Install Dependencies**: `npm install`.
4. **Run Tests**: `npx jest --ci --json > test-results.json` with `MONGODB_URI` and `JWT_SECRET`.
5. **Create Custom Test Log**: Generates `test-results-custom.log` with test summary or JSON errors.
6. **Upload to S3**: Stores log in `s3://elasticbeanstalk-ap-southeast-2-591408364730/test-logs/`.
7. **Upload to Elastic Beanstalk Logs**: Stores log in `s3://elasticbeanstalk-ap-southeast-2-591408364730/DEV-API/DEVAPI-env/logs/`.
8. **Archive Results**: Uploads `test-results.json` and `test-results-custom.log` as artifacts.

**Viewing Results**:

- **GitHub Actions**: `Actions` tab, select `CI` run, download `test-results` artifact.
- **S3**: `s3://elasticbeanstalk-ap-southeast-2-591408364730/test-logs/test-results-<commit-sha>.log`.
- **Elastic Beanstalk**: `DEV API` > `DEVAPI-env` > `Logs`, or `s3://elasticbeanstalk-ap-southeast-2-591408364730/DEV-API/DEVAPI-env/logs/`.

### 2. `Deploy.yml` - Deployment to Elastic Beanstalk

**Purpose**: Deploys the application to Elastic Beanstalk, preserving revisions.

**Triggers**:

- **Push** to `main` for changes in `src/`, `package.json`, or `package-lock.json`.
- **Manual dispatch**: With `environment` input (defaults to `DEVAPI-env`).

**Steps**:

1. **Run Tests**: Calls `ci.yml` to ensure tests pass.
2. **Checkout Code**: `actions/checkout@v3`.
3. **Set Up Node.js**: `actions/setup-node@v3`.
4. **Install Dependencies**: `npm install`.
5. **Create Deployment Package**: Zips code into `application.zip`.
6. **Deploy to Elastic Beanstalk**: Uploads to S3, creates version, updates environment.

**Viewing Results**:

- **GitHub Actions**: `Actions` tab for deployment logs.
- **Elastic Beanstalk**: `DEV API` > `DEVAPI-env` > `Logs` or `Application Versions`.

## Troubleshooting

- **Secrets Errors**: Configure secrets in `Settings > Secrets and variables > Actions`.
- **AWS Errors**: Verify S3 bucket and Elastic Beanstalk resources.
- **Test Failures**: Check `Run tests` logs in `ci.yml`.
- **JSON Errors**: Ensure Jest outputs valid JSON (`npx jest --ci --json`).
- **Deployment Failures**: Check Elastic Beanstalk logs.

## Notes

- Uses `ubuntu-latest` (runner `2.324.0`).
- Requires Jest for JSON output.
- Logs are persistent in S3 and Elastic Beanstalk.
- Artifacts retained for 90 days.
- Elastic Beanstalk versions preserved for rollback.

For assistance, refer to [GitHub Actions](https://docs.github.com/en/actions) or [AWS](https://docs.aws.amazon.com).
