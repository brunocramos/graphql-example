import {
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql/type';

import userQuery from './users';
import agendaQuery from './agenda-interface';

const query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    users: userQuery,
    agenda: agendaQuery, // This won't be used. It' here just as an example
  },
});

export default new GraphQLSchema({
  query,
});
