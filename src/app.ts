import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import logger from './logger';
import db from './db';

import { Game, GameResolver, GameService } from './components/game';
import { Move, MoveService } from './components/move';
import { getRepository } from 'typeorm';
import { getPubSub } from './db/pubsub';


const bootstrapServer = async () => {
    const app = express();

    try {
        await db.connect();
    } catch (err) {
        logger.error(`An error occurred while connecting to the db: ${err}\nExiting...`);
        process.exit(1);
    }

    const { MyContainer, gamePubSub } = await resolveDependencies();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [GameResolver],
            container: MyContainer,
            pubSub: gamePubSub,
        }),
        context: ({ req, res }) => ({ req, res })
    });

    apolloServer.applyMiddleware({ app });

    const httpServer = createServer(app);

    apolloServer.installSubscriptionHandlers(httpServer);

    return { httpServer, apolloServer };
};

const resolveDependencies = async () => {
    const moveService = new MoveService(getRepository(Move));
    const gamePubSub = await getPubSub();
    const gameService = new GameService(moveService, getRepository(Game));
    const gameResolver = new GameResolver(gameService);

    // Type-graphql needs a container object with a .get() method for DI
    // Since we've opted out of a DI library, this is a simple workaround
    // If the app grows to multiple resolvers, a DI library would make more sense
    const MyContainer = {
        get (resolver: any) {
            if (resolver === GameResolver) {
                return gameResolver;
            }
            return new resolver();
        }
    };

    return { MyContainer, gamePubSub };
};

export { bootstrapServer };
