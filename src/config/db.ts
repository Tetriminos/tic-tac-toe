const config = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [
        'dist/components/**/model.js'
    ],
    migrations: ['dist/db/migration/**/*{.ts,.js}'],
    subscribers: ['src/db/subscriber/**/*{.ts,.js}'],
    synchronize: false,
    migrationsRun: true,
};

const ormConfig = config;

// the pg client needed for pubsub uses different field names than typeorm for it's config
const clientConfig = {
    type: config.type,
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.database,
};

export {
    ormConfig,
    clientConfig
};
