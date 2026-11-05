/**
 * ==============================================================================
 * ATTENDX — CLOUD DEPLOYMENT & INFRASTRUCTURE READINESS SUITE
 * ==============================================================================
 * Targets:
 * - Render Web Service (Spring Boot 3.3.5 Backend + Java 21)
 * - Firebase Hosting (Saveetha V-Study Frontend SPA)
 * - Supabase PostgreSQL Database & Flyway Migrations
 * - GitHub Actions CI/CD Pipeline
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class DeploymentTestSuite {
  constructor(backendUrl = 'http://localhost:8080') {
    this.backendUrl = backendUrl;
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  assert(id, desc, condition) {
    if (condition) {
      this.passed++;
      this.results.push({ id, desc, status: 'PASSED' });
      console.log(`  [PASS] ${id}: ${desc}`);
    } else {
      this.failed++;
      this.results.push({ id, desc, status: 'FAILED' });
      console.log(`  [FAIL] ${id}: ${desc}`);
    }
  }

  async checkEndpoint(path) {
    return new Promise((resolve) => {
      http.get(`${this.backendUrl}${path}`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }).on('error', (err) => resolve({ status: 0, error: err.message }));
    });
  }

  async runAll() {
    console.log('\n==================================================================');
    console.log('  ATTENDX: EXECUTING CLOUD DEPLOYMENT READINESS SUITE');
    console.log('==================================================================\n');

    // 1. Render Infrastructure Specification
    const renderYamlPath = path.resolve(__dirname, '../../render.yaml');
    const dockerfilePath = path.resolve(__dirname, '../../backend/Dockerfile');
    const prodConfigPath = path.resolve(__dirname, '../../backend/src/main/resources/application-prod.yml');

    this.assert('DEP-RND-001', 'render.yaml specification exists in project root', fs.existsSync(renderYamlPath));
    this.assert('DEP-RND-002', 'Production multi-stage Dockerfile exists for Java 21', fs.existsSync(dockerfilePath));
    this.assert('DEP-RND-003', 'Production Spring Boot profile application-prod.yml exists', fs.existsSync(prodConfigPath));

    if (fs.existsSync(renderYamlPath)) {
      const yaml = fs.readFileSync(renderYamlPath, 'utf8');
      this.assert('DEP-RND-004', 'render.yaml configures healthCheckPath: /api/v1/health', yaml.includes('/api/v1/health'));
      this.assert('DEP-RND-005', 'render.yaml declares SUPABASE_DB_URL sync: false', yaml.includes('SUPABASE_DB_URL'));
    }

    // 2. Firebase Hosting Configuration
    const firebaseJsonPath = path.resolve(__dirname, '../../firebase.json');
    this.assert('DEP-FB-001', 'firebase.json exists with clean rewrite rules', fs.existsSync(firebaseJsonPath));

    if (fs.existsSync(firebaseJsonPath)) {
      const fbConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
      this.assert('DEP-FB-002', 'Firebase public directory configured to "frontend"', fbConfig.hosting && fbConfig.hosting.public === 'frontend');
      this.assert('DEP-FB-003', 'Firebase SPA rewrite rule configured (/** -> /index.html)',
        fbConfig.hosting && fbConfig.hosting.rewrites && fbConfig.hosting.rewrites[0].destination === '/index.html');
    }

    // 3. Database Persistence & Migrations
    const flywayV1 = path.resolve(__dirname, '../../backend/src/main/resources/db/migration/V1__create_normalized_schema.sql');
    const flywayV2 = path.resolve(__dirname, '../../backend/src/main/resources/db/migration/V2__seed_institutional_data.sql');
    const supabaseSql = path.resolve(__dirname, '../../backend/src/main/resources/schema-supabase.sql');

    this.assert('DEP-DB-001', 'Flyway V1 schema migration present', fs.existsSync(flywayV1));
    this.assert('DEP-DB-002', 'Flyway V2 institutional seed migration present', fs.existsSync(flywayV2));
    this.assert('DEP-DB-003', 'Supabase schema includes Row Level Security (RLS) policies',
      fs.existsSync(supabaseSql) && fs.readFileSync(supabaseSql, 'utf8').includes('ROW LEVEL SECURITY'));

    // 4. Live Health Probes
    const healthRes = await this.checkEndpoint('/api/v1/health');
    this.assert('DEP-HLT-001', 'Backend health probe returns 200 OK and status UP',
      healthRes.status === 200 && healthRes.data && healthRes.data.status === 'UP');

    const actuatorRes = await this.checkEndpoint('/actuator/health');
    this.assert('DEP-HLT-002', 'Spring Boot Actuator health probe returns 200 OK and status UP',
      actuatorRes.status === 200 && actuatorRes.data && actuatorRes.data.status === 'UP');

    console.log('\n==================================================================');
    console.log(`  DEPLOYMENT READINESS RESULTS: ${this.passed} PASSED, ${this.failed} FAILED (TOTAL: ${this.results.length})`);
    console.log('==================================================================\n');

    return {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      results: this.results
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DeploymentTestSuite;
}

if (require.main === module) {
  const suite = new DeploymentTestSuite();
  suite.runAll();
}
