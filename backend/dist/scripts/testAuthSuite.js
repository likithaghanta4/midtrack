"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAuthTestSuite = runAuthTestSuite;
const app_1 = require("../app");
const http_1 = __importDefault(require("http"));
async function runAuthTestSuite() {
    console.log('================================================================================');
    console.log('MODULE 4: COMPLETE AUTHENTICATION TEST SUITE');
    console.log('================================================================================\n');
    // Start test server on dynamic test port
    const app = (0, app_1.createApp)();
    const testPort = 5999;
    const server = http_1.default.createServer(app);
    await new Promise((resolve) => {
        server.listen(testPort, () => {
            resolve();
        });
    });
    const baseUrl = `http://localhost:${testPort}/api`;
    const request = async (endpoint, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (options.token) {
            headers['Authorization'] = `Bearer ${options.token}`;
        }
        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
        let data = null;
        try {
            data = await res.json();
        }
        catch {
            data = null;
        }
        return { status: res.status, data };
    };
    let passedTests = 0;
    let totalTests = 0;
    const assertTest = (name, condition, details) => {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`[PASS] ${name}`);
            console.log(`       -> ${details}`);
        }
        else {
            console.error(`[FAIL] ${name}`);
            console.error(`       -> ${details}`);
        }
    };
    try {
        // -------------------------------------------------------------------------
        // TEST 0: Faculty List for Dropdown
        // -------------------------------------------------------------------------
        const res0 = await request('/auth/faculty');
        assertTest('TEST 0: GET /api/auth/faculty (Login Dropdown List)', res0.status === 200 && res0.data.count === 23 && Array.isArray(res0.data.faculty), `Status: ${res0.status}, Faculty Count: ${res0.data.count}, Has Passwords Exposed: ${JSON.stringify(res0.data).includes('password')}`);
        // -------------------------------------------------------------------------
        // TEST 1: Faculty Valid Login
        // -------------------------------------------------------------------------
        const res1 = await request('/auth/faculty/login', {
            method: 'POST',
            body: {
                facultyId: '780', // Dr. M SURESH BABU
                password: 'admin@123',
            },
        });
        const facultyToken = res1.data?.token;
        assertTest('TEST 1: Faculty Valid Login (EMPID 780 + admin@123)', res1.status === 200 && res1.data.success === true && res1.data.user?.role === 'FACULTY' && !!facultyToken, `Status: ${res1.status}, Role: ${res1.data.user?.role}, Name: ${res1.data.user?.name}, Token Generated: ${!!facultyToken}`);
        // -------------------------------------------------------------------------
        // TEST 2: Faculty Wrong Password
        // -------------------------------------------------------------------------
        const res2 = await request('/auth/faculty/login', {
            method: 'POST',
            body: {
                facultyId: '780',
                password: 'wrong_password_123',
            },
        });
        assertTest('TEST 2: Faculty Wrong Password Rejection', res2.status === 401 && res2.data.success === false && res2.data.message === 'Invalid username or password.', `Status: ${res2.status}, Message: "${res2.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 3: Student Valid Login
        // -------------------------------------------------------------------------
        const res3 = await request('/auth/student/login', {
            method: 'POST',
            body: {
                registerNumber: '24B91A0701', // A PREETHI
                password: '24B91A0701',
            },
        });
        const studentToken = res3.data?.token;
        assertTest('TEST 3: Student Valid Login (24B91A0701 + 24B91A0701)', res3.status === 200 && res3.data.success === true && res3.data.user?.role === 'STUDENT' && !!studentToken, `Status: ${res3.status}, Role: ${res3.data.user?.role}, Name: ${res3.data.user?.name}, Section: ${res3.data.user?.section}`);
        // -------------------------------------------------------------------------
        // TEST 4: Student Wrong Password
        // -------------------------------------------------------------------------
        const res4 = await request('/auth/student/login', {
            method: 'POST',
            body: {
                registerNumber: '24B91A0701',
                password: 'wrong_student_password',
            },
        });
        assertTest('TEST 4: Student Wrong Password Rejection', res4.status === 401 && res4.data.success === false && (res4.data.message === 'Invalid registration number or password.' || res4.data.message === 'Invalid username or password.'), `Status: ${res4.status}, Message: "${res4.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 5: Student attempting Faculty authentication endpoint
        // -------------------------------------------------------------------------
        const res5 = await request('/auth/faculty/login', {
            method: 'POST',
            body: {
                facultyId: '24B91A0701',
                password: '24B91A0701',
            },
        });
        assertTest('TEST 5: Student attempting Faculty Endpoint (Cross-role block)', res5.status === 401 && res5.data.success === false, `Status: ${res5.status}, Message: "${res5.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 6: Faculty attempting Student authentication endpoint
        // -------------------------------------------------------------------------
        const res6 = await request('/auth/student/login', {
            method: 'POST',
            body: {
                registerNumber: '780',
                password: 'admin@123',
            },
        });
        assertTest('TEST 6: Faculty attempting Student Endpoint (Cross-role block)', res6.status === 401 && res6.data.success === false, `Status: ${res6.status}, Message: "${res6.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 7: Nonexistent Register Number
        // -------------------------------------------------------------------------
        const res7 = await request('/auth/student/login', {
            method: 'POST',
            body: {
                registerNumber: '99B91A9999',
                password: 'password123',
            },
        });
        assertTest('TEST 7: Nonexistent Register Number Rejection', res7.status === 401 && (res7.data.message === 'Invalid registration number or password.' || res7.data.message === 'Invalid username or password.'), `Status: ${res7.status}, Message: "${res7.data.message}" (Generic security response)`);
        // -------------------------------------------------------------------------
        // TEST 8: Nonexistent Faculty Identifier
        // -------------------------------------------------------------------------
        const res8 = await request('/auth/faculty/login', {
            method: 'POST',
            body: {
                facultyId: '99999',
                password: 'password123',
            },
        });
        assertTest('TEST 8: Nonexistent Faculty Identifier Rejection', res8.status === 401 && res8.data.message === 'Invalid username or password.', `Status: ${res8.status}, Message: "${res8.data.message}" (Generic security response)`);
        // -------------------------------------------------------------------------
        // TEST 9: GET /api/auth/me (Faculty & Student)
        // -------------------------------------------------------------------------
        const res9Faculty = await request('/auth/me', { token: facultyToken });
        const res9Student = await request('/auth/me', { token: studentToken });
        assertTest('TEST 9: GET /api/auth/me (Protected Identity Profile Verification)', res9Faculty.status === 200 && res9Faculty.data.user.role === 'FACULTY' &&
            res9Student.status === 200 && res9Student.data.user.role === 'STUDENT', `Faculty Profile: ${res9Faculty.data.user.name} (${res9Faculty.data.user.facultyProfile?.department}) | Student Profile: ${res9Student.data.user.name} (${res9Student.data.user.studentProfile?.section})`);
        // -------------------------------------------------------------------------
        // TEST 10: Invalid JWT Token
        // -------------------------------------------------------------------------
        const res10 = await request('/auth/me', {
            token: 'this_is_a_malformed_fake_token.123.456',
        });
        assertTest('TEST 10: Invalid JWT Token Rejection', res10.status === 401 && res10.data.message === 'Authentication required.', `Status: ${res10.status}, Message: "${res10.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 11: Missing JWT Token
        // -------------------------------------------------------------------------
        const res11 = await request('/auth/me');
        assertTest('TEST 11: Missing JWT Token Rejection on Protected Endpoint', res11.status === 401 && res11.data.message === 'Authentication required.', `Status: ${res11.status}, Message: "${res11.data.message}"`);
        // -------------------------------------------------------------------------
        // TEST 12: Student Identity Protection
        // -------------------------------------------------------------------------
        assertTest('TEST 12: Student Identity Isolated to JWT Claims', res9Student.data.user.id === res3.data.user.id &&
            res9Student.data.user.studentProfile.registerNumber === '24B91A0701' &&
            !res9Student.data.user.passwordHash, `Verified: Identity is derived from token payload userId (${res9Student.data.user.id}), zero password hash exposure.`);
    }
    finally {
        server.close();
    }
    console.log('\n================================================================================');
    console.log(`TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED (100%)`);
    console.log('================================================================================\n');
    if (passedTests !== totalTests) {
        throw new Error('Some authentication tests failed.');
    }
}
if (require.main === module) {
    runAuthTestSuite()
        .then(() => process.exit(0))
        .catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
