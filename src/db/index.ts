import { createConnection, ConnectionOptions } from 'typeorm';
import { ormConfig } from '../config';
import { getPubSub } from './pubsub';

const connect = async() => createConnection(ormConfig as ConnectionOptions);

export default { connect, getPubSub };
