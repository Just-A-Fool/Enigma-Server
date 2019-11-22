module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'development',
    PORT : process.env.PORT || 8000,
    DB_URL: process.env.DB_URL,
    JWT_SECRET: process.env.JWT_SECRET
};