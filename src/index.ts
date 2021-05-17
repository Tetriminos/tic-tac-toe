import { bootstrapServer } from './app';
import { PORT as port } from './config';
import logger from './logger';

(async () => {
    const PORT = port;

    const { httpServer, apolloServer } = await bootstrapServer();

    httpServer.listen(PORT, () => {
        logger.info(`Server started at http://localhost:${PORT}${apolloServer.graphqlPath}`);
        logger.info(`Subscriptions ready at ws://localhost:${PORT}${apolloServer.subscriptionsPath}`);
    });
})();
