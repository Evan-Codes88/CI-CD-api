# GitHub Actions Workflows Help

This document provides an overview of the GitHub Actions workflow files used in this repository: `Deploy.yml` and `ci.yml`. These workflows automate the testing and deployment of the Node.js application, with detailed test logging and persistent storage.

## Prerequisites

- **GitHub Secrets**:

  - `AWS_ACCESS_KEY_ID`: AWS access key for S3 and Elastic Beanstalk access.
  - `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3 and Elastic Beanstalk access.
  - `MONGODB_URI`: MongoDB connection string for testing and deployment.
  - `JWT_SECRET`: Secret key for JWT authentication in testing and deployment.
  - Configure these in your repository settings under `Settings > Secrets and variables > Actions`.

- **AWS Resources**:

  - An S3 bucket (`elasticbeanstalk-ap-southeast-2-591408364730`) with a `test-logs/` directory for storing test logs.
  - An Elastic Beanstalk application (`DEV API`) and environment (`DEVAPI-env`) in the `ap-southeast-2` region.

- **Node.js Project**:
  - A `package.json` file with `npm install` and `npm test` scripts.
  - A test framework (e.g., Jest) that supports JSON output via `npm test -- --json`.
  - Node.js version 18 or compatible.

## Workflow Descriptions

### 1. `ci.yml` - Continuous Integration with Test Logging

**Purpose**: Runs automated tests, generates a custom test log, and stores it persistently in an AWS S3 bucket.

**Triggers**:

- Push to the `main` branch.
- Pull requests targeting the `main` branch.

**Steps**:

1. **Checkout Code**: Clones the repository using `actions/checkout@v3`.
2. **Set Up Node.js**: Installs Node.js 18 using `actions/setup-node@v3`.
3. **Install Dependencies**: Runs `npm install` to install project dependencies.
4. **Run Tests**: Executes `npm test -- --json > test-results.json` to run tests and save results in JSON format, using `MONGODB_URI` and `JWT_SECRET` environment variables.
5. **Create Custom Test Log**: Processes `test-results.json` to create `test-results-custom.log`, including:
   - Timestamp
   - Total tests, passed, failed, and pending counts
   - Detailed results per test suite, including test titles, statuses, and failure messages
6. **Upload Test Log to S3**: Uploads `test-results-custom.log` to `s3://elasticbeanstalk-ap-southeast-2-591408364730/test-logs/test-results-<commit-sha>.log`.
7. **Archive Test Results**: Archives `test-results.json` and `test-results-custom.log` as GitHub Actions artifacts.

**Usage**:

- Ensure `npm test -- --json` is supported by your test framework (e.g., Jest with `jest --json`).
- Monitor the workflow status in the repository's "Actions" tab.
- Access archived test results in the "Actions" tab or download logs from the S3 bucket.
- If tests fail, check the logs for errors (e.g., missing dependencies, invalid secrets, or test failures).

### 2. `Deploy.yml` - Deployment to Elastic Beanstalk

**Purpose**: Deploys the application to AWS Elastic Beanstalk on pushes to the the `main` branch.

**Triggers**:

- Push to the `main` branch.

**Steps**:

1. **Checkout Code**: Clones the repository using `actions/checkout@v3`.
2. **Set Up Node.js**: Installs Node.js 18 using `actions/setup-node@v3`.
3. **Install Dependencies**: Runs `npm install` to install project dependencies.
4. **Create Deployment Package**: Zips the application code (excluding `node_modules`, `.git`, `.github`, and `tests` directories) into `application.zip`.
5. **Deploy to Elastic Beanstalk**:
   - Uploads `application.zip` to the specified S3 bucket.
   - Creates a new Elastic Beanstalk application version using the commit SHA as the version label.
   - Updates the `DEVAPI-env` environment to use the new version.

**Usage**:

- Ensure the AWS S3 bucket and Elastic Beanstalk application/environment exist.
- Verify that secrets are correctly set in the repository.
- Monitor deployment status in the "Actions" tab and Elastic Beanstalk console.

## Troubleshooting

- **Secrets Errors**: If secrets are missing or invalid, configure them in `Settings > Secrets and variables > Actions`.
- **AWS Errors**: Verify that the S3 bucket and Elastic Beanstalk resources exist and are accessible with the provided credentials.
- **Test Failures**: Check the test logs in the CI workflow or S3 bucket for details on failed tests. Ensure `npm test -- --json` is correctly set up.
- **Log Creation Errors**: Ensure the test framework outputs valid JSON. If the Node.js script fails, check for syntax errors or missing `test-results.json`.
- **Deployment Failures**: Check the Elastic Beanstalk logs for issues with the application or environment configuration.

## Notes

- Both workflows use `ubuntu-latest` runners for compatibility and performance.
- The `ci.yml` workflow requires a test framework that supports JSON output (e.g., Jest).
- The `Deploy.yml` workflow assumes the AWS CLI is available on the runner (pre-installed on GitHub-hosted runners).
- Test logs are stored persistently in S3 for long-term access and auditing.
- Regularly review secrets and AWS resource configurations to avoid issues.

For further assistance, contact the repository maintainer or refer to the [GitHub Actions documentation](https://docs.github.com/en/actions) or [AWS documentation](https://docs.aws.amazon.com).
