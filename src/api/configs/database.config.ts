import { MongoClient, ServerApiVersion, Db, Collection } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { OfficeHour, OfficeHourList } from '../services/officeHour/officeHour.model.js';
import { Queue } from '../services/queue/queue.model.js';
import { User } from '../services/auth/auth.model.js';
import { MongoDBName, DBCollection } from './constants.config.js';

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

    // the collection of the student account
    private static accountCollection: Collection<User>;

    // the collection of the teacher account
    private static teacherAccountCollection: Collection<User>;

    // the collection of the office hours
    private static OHCollection: Collection<OfficeHour>;

    // the collection of the student office hours
    private static studentOHCollection: Collection<OfficeHourList>;

    // the collection of the student office hours
    private static teacherOHCollection: Collection<OfficeHourList>;

    // the collection of queue
    private static queueCollection: Collection<Queue>;

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
     * This static method retrieves the Account Collection
     * @returns Account Collection.
     */
    public static getAccountCollection(): Collection<User> {
        if (!MongoDB.accountCollection) {
            throw new Error('Mongo Account Collection does not exist yet...');
        }
        return MongoDB.accountCollection;
    }

    /**
     * This static method retrieves the Account Collection
     * @returns Account Collection.
     */
    public static getTeacherAccountCollection(): Collection<User> {
        if (!MongoDB.teacherAccountCollection) {
            throw new Error('Mongo TeacherAccount Collection does not exist yet...');
        }
        return MongoDB.teacherAccountCollection;
    }

    /**
     * This static method retrieves the OfficeHour Collection
     * @returns OfficeHour Collection.
     */

    public static getOHCollection(): Collection<OfficeHour> {
        if (!MongoDB.OHCollection) {
            throw new Error('Mongo OfficeHour Collection does not exist yet...');
        }
        return MongoDB.OHCollection;
    }

    /**
     * This static method retrieves the StudentOfficeHour Collection
     * @returns StudentOfficeHour Collection.
     */

    public static getStudentOHCollection(): Collection<OfficeHourList> {
        if (!MongoDB.studentOHCollection) {
            throw new Error('Mongo StudentOfficeHour Collection does not exist yet...');
        }
        return MongoDB.studentOHCollection;
    }

    /**
     * This static method retrieves the StudentOfficeHour Collection
     * @returns StudentOfficeHour Collection.
     */

    public static getTeacherOHCollection(): Collection<OfficeHourList> {
        if (!MongoDB.teacherOHCollection) {
            throw new Error('Mongo TeacherOfficeHour Collection does not exist yet...');
        }
        return MongoDB.teacherOHCollection;
    }

    /**
     * This static method retrieves the Queue Collection (real time database for queueing system)
     * @returns Queue Collection.
     */
    public static getQueueCollection(): Collection<Queue> {
        if (!MongoDB.queueCollection) {
            throw new Error('Mongo Queue Collection does not exist yet...');
        }
        return MongoDB.queueCollection;
    }

    /**
     * This method connects the client to the server and set up the database and collection,
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

            MongoDB.iceQuebDB = MongoDB.client.db(MongoDBName);

            MongoDB.accountCollection = MongoDB.iceQuebDB.collection(DBCollection.Account);
            MongoDB.teacherAccountCollection = MongoDB.iceQuebDB.collection(
                DBCollection.TeacherAccount,
            );
            MongoDB.OHCollection = MongoDB.iceQuebDB.collection(DBCollection.OfficeHour);
            MongoDB.studentOHCollection = MongoDB.iceQuebDB.collection(
                DBCollection.StudentOfficeHour,
            );
            MongoDB.teacherOHCollection = MongoDB.iceQuebDB.collection(
                DBCollection.TeacherOfficeHour,
            );
            MongoDB.queueCollection = MongoDB.iceQuebDB.collection(DBCollection.Queue);
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
