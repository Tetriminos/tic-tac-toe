import { PostgresPubSub } from 'graphql-postgres-subscriptions';
import { Client } from 'pg';
import { clientConfig } from '../config';

export const getPubSub = async () => {
    const client = new Client(clientConfig);
    await client.connect();
    return new PostgresPubSub({ client });
};
