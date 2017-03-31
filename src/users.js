import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLList,
  GraphQLString
} from 'graphql/type';

const database = require('./../database.json');
const users = database.users;

import { AgendaUnion as AgendaType, AgendaFilter, agendaFilterResolve } from './agenda-interface';

/**
 * User type
 */
export const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'User id',
    },
    name: {
      type: GraphQLString,
      description: 'User name',
    },
    agenda: {
      type: new GraphQLList(AgendaType),
      description: 'User Agenda',
      args: {
        filter: {
          name: 'UserAgendaFilter',
          type: AgendaFilter,
        },
      },
      resolve: (obj, args) => agendaFilterResolve(root, Object.assign({}, args, { userId: obj._id })),
    }
  })
});


const UserQuery = {
  type: new GraphQLList(UserType),
  args: {
    _id: {
      name: '_id',
      type: GraphQLInt,
    },
  },
  resolve: (root, { _id = null }) => _id ? users.filter(u => u._id === _id) : users,
};

export default UserQuery;
