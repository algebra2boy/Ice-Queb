import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * The **MongoDB** class is a custom class that allows us for making Connections to MongoDB.
 * @example
 * ```ts
 * import { MongoDB } from './configs/database.config.js';
 * import { Db, Collection } from 'mongodb';
 *
 * // Start running the server, only used once in the entire app
 * MongoDB.runServer()
 *
 * // How to retrieve the Database
 * const database: Db = MongoDB.getIceQuebDB()
 *
 * // How to retrieve the collection with a genetric type <T>
 * const <collection-name>: Collection<T> = MongoDB.getIceQuebDB().collection(<collection-name>);
 * ```
 */
export class MongoDB {
    // establish the client connection to the mongo db
    private static client: MongoClient;

    // the database instance of the mongodb
    private static iceQuebDB: Db;

    // this is a mock database instance that creates a copy of
    // production instance that will be discarded once all tests are executed
    private static mockDB: MongoMemoryServer | null = null;

    /**
   The static method sets the connection to MongoDB using the environment database url.
   Connection pooling is used for multi-threading enviornment, allowing multiple 
   threads to use separate connections concurrently
   */
    private static async setClient() {
        if (!process.env.MONGODB_URL) throw new Error('MongoDB URL not found in the .env file');

        let dbUrl = process.env.MONGODB_URL;

        if (process.env.NODE_ENV === 'test') {
            MongoDB.mockDB = await MongoMemoryServer.create();
            dbUrl = MongoDB.mockDB.getUri();
        }

        MongoDB.client = new MongoClient(dbUrl, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            minPoolSize: 10, // minimum number of connections in the pool
            maxPoolSize: 100, // maximum number of connections in the pool
        });
    }

    /**
     * This static method retrieves the iceQuebDB Db
     * @returns iceQuebDB MongoDB Database.
     */
    public static getIceQuebDB(): Db {
        if (!MongoDB.iceQuebDB) {
            throw new Error('Mongo iceQuebDB Database does not exist yet...');
        }
        return MongoDB.iceQuebDB;
    }

    /**
     * This method connects the client to the server,
     * sends a ping to confirm a succesful connection.
     */
    public static async runServer() {
        try {
            await MongoDB.setClient();

            const client = await MongoDB.client.connect();

            await client.db('iceQueb').command({ ping: 1 });

            if (process.env.NODE_ENV !== 'test') {
                console.log('Pinged your deployment. You successfully connected to MongoDB!');
            }

            MongoDB.iceQuebDB = MongoDB.client.db('iceQueb');
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * Closes the MongoDB client connection.
     */
    public static async closeConnection() {
        if (MongoDB.client) {
            await MongoDB.client.close();
        }

        if (MongoDB.mockDB) {
            await MongoDB.mockDB.stop();
        }
    }
}
