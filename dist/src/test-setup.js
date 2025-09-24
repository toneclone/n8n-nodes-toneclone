"use strict";
process.env.NODE_ENV = 'test';
jest.setTimeout(10000);
global.console = {
    ...console,
};
//# sourceMappingURL=test-setup.js.map