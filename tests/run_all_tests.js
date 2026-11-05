/**
 * ==============================================================================
 * ATTENDX — MASTER AUTOMATED TEST ORCHESTRATOR & JUNIT XML REPORTER
 * ==============================================================================
 * Orchestrates:
 * 1. 1,800 Data-Driven Validation & Regulatory Integrity Tests
 * 2. Selenium WebDriver E2E Web UI Test Suite (23 Tests)
 * 3. Appium Mobile Automation Test Suite for Android APK (14 Tests)
 * 4. Cloud Deployment & Health Readiness Test Suite (13 Tests)
 * TOTAL: 1,850 FULLY AUTOMATED TEST CASES
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const ValidationTestSuite = require('./validation/comprehensive_1800_tests');
const SeleniumE2ETestSuite = require('./selenium/selenium_tests');
const AppiumMobileTestSuite = require('./appium/appium_tests');
const DeploymentTestSuite = require('./deployment/deployment_tests');

async function main() {
  const startTime = Date.now();
  console.log('╔════════════════════════════════════════════════════════════════════╗');
  console.log('║           ATTENDX 1,800+ AUTOMATED TEST SUITE RUNNER               ║');
  console.log('║  Selenium Web E2E + Appium Mobile + Deployment + Validation Tests  ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝');

  const allTestCases = [];
  let totalPassed = 0;
  let totalFailed = 0;

  // 1. Run 1,800 Validation Tests
  const valSuite = new ValidationTestSuite();
  const valRes = valSuite.runAll();
  totalPassed += valRes.passed;
  totalFailed += valRes.failed;
  valRes.results.forEach(r => allTestCases.push({ suite: 'Validation_1800_Suite', ...r }));

  // 2. Run Selenium WebDriver E2E Tests
  const selSuite = new SeleniumE2ETestSuite('http://localhost:8080');
  const selRes = await selSuite.runAll();
  totalPassed += selRes.passed;
  totalFailed += selRes.failed;
  selRes.results.forEach(r => allTestCases.push({ suite: 'Selenium_Web_E2E', ...r }));

  // 3. Run Appium Mobile Automation Tests
  const appSuite = new AppiumMobileTestSuite();
  const appRes = appSuite.runAll();
  totalPassed += appRes.passed;
  totalFailed += appRes.failed;
  appRes.results.forEach(r => allTestCases.push({ suite: 'Appium_Mobile_APK', ...r }));

  // 4. Run Cloud Deployment Readiness Tests
  const depSuite = new DeploymentTestSuite('http://localhost:8080');
  const depRes = await depSuite.runAll();
  totalPassed += depRes.passed;
  totalFailed += depRes.failed;
  depRes.results.forEach(r => allTestCases.push({ suite: 'Cloud_Deployment_Readiness', ...r }));

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(2);
  const totalTests = allTestCases.length;

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                      FINAL TEST SUMMARY                            ║');
  console.log('╠════════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Test Cases Executed: ${String(totalTests).padEnd(38)} ║`);
  console.log(`║  Tests Passed:              ${String(totalPassed).padEnd(38)} ║`);
  console.log(`║  Tests Failed:              ${String(totalFailed).padEnd(38)} ║`);
  console.log(`║  Success Rate:              ${((totalPassed / totalTests) * 100).toFixed(2)}%${' '.repeat(34)} ║`);
  console.log(`║  Execution Time:            ${elapsedSeconds} seconds${' '.repeat(30)} ║`);
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Generate JUnit XML Report for GitHub Actions
  const xmlReportPath = path.resolve(__dirname, 'test-results.xml');
  const xmlLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuites name="AttendX Automated Test Suite" tests="${totalTests}" failures="${totalFailed}" time="${elapsedSeconds}">`,
    `  <testsuite name="AttendX Comprehensive Master Suite" tests="${totalTests}" failures="${totalFailed}" time="${elapsedSeconds}">`
  ];

  allTestCases.forEach((tc) => {
    const safeDesc = (tc.desc || tc.id).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    if (tc.status === 'PASSED') {
      xmlLines.push(`    <testcase classname="${tc.suite}" name="${tc.id} - ${safeDesc}" time="0.001" />`);
    } else {
      xmlLines.push(`    <testcase classname="${tc.suite}" name="${tc.id} - ${safeDesc}" time="0.001">`);
      xmlLines.push(`      <failure message="Assertion failed">${safeDesc}</failure>`);
      xmlLines.push(`    </testcase>`);
    }
  });

  xmlLines.push('  </testsuite>');
  xmlLines.push('</testsuites>');

  fs.writeFileSync(xmlReportPath, xmlLines.join('\n'), 'utf8');
  console.log(`[JUnit Reporter] Generated test report at: ${xmlReportPath}\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

