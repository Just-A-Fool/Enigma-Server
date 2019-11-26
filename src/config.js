module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'development',
    PORT : process.env.PORT || 8000,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_TEST_URL: process.env.DATABASE_TEST_URL,
    JWT_SECRET: process.env.JWT_SECRET
};