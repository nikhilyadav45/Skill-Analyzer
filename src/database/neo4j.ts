import neo4j from 'neo4j-driver';
import { env } from '../common/config/env';

export const neo4jDriver = neo4j.driver(
  env.NEO4J_URI,
  neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD)
);
