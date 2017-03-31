import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLInterfaceType,
  GraphQLUnionType,
  GraphQLInt,
  GraphQLList,
  GraphQLString
} from 'graphql/type';
import moment from 'moment';
import _ from 'lodash';

import { UserType } from './users';
const database = require('./../database.json');
const users = database.users;
const agendas = database.agenda;

/**
 * Type used as an Interface to other Agenda Types
 */
const AgendaType = new GraphQLInterfaceType({
  name: 'AgendaInterfaceType',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Agenda entry id',
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Owner\'s id',
    },
    date: {
      type: GraphQLString,
      description: 'Agenda entry date',
    },
    title: {
      type: GraphQLString,
      description: 'Agenda entry title',
    },
    appointmentType: {
      type: GraphQLString,
      description: 'Agenda entry type',
    },
  }),
});

/**
 * Type used to represent an agenda entry with appointmentType='meeting'
 */
const AgendaMeetingType = new GraphQLObjectType({
  name: 'AgendaMeetingType',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Agenda entry id',
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Owner\'s id',
    },
    date: {
      type: GraphQLString,
      description: 'Agenda entry date',
    },
    title: {
      type: GraphQLString,
      description: 'Agenda entry title',
    },
    appointmentType: {
      type: GraphQLString,
      description: 'Agenda entry type',
    },
    invitedUsers: {
      type: new GraphQLList(UserType),
      description: 'Invited users',
      resolve: obj => users.filter(u => obj.invitedUsers.indexOf(u._id) !== -1),
    },
  }),
  interfaces: [AgendaType],
  isTypeOf: obj => obj.appointmentType === 'meeting',
});

/**
 * Type used to represent an agenda entry with appointmentType='event'
 */
const AgendaEventType = new GraphQLObjectType({
  name: 'AgendaEventType',
  fields: () => ({
    _id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Agenda entry id',
    },
    userId: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'Owner\'s id',
    },
    date: {
      type: GraphQLString,
      description: 'Agenda entry date',
    },
    title: {
      type: GraphQLString,
      description: 'Agenda entry title',
    },
    appointmentType: {
      type: GraphQLString,
      description: 'Agenda entry type',
    },
    notes: {
      type: GraphQLString,
      description: 'Event notes',
    },
  }),
  interfaces: [AgendaType],
  isTypeOf: obj => obj.appointmentType === 'event',
});

/**
 * Input type used as a filter to all agenda entries
 */
export const AgendaFilter = new GraphQLInputObjectType({
  name: 'AgendaFilterType',
  fields: () => ({
    startDate: {
      type: GraphQLString,
    },
    endDate: {
      type: GraphQLString,
    },
    orderBy: {
      type: GraphQLString,
    },
    limit: {
      type: GraphQLInt,
    },
  }),
});

/**
 * Union used to represent all agenda types
 */
export const AgendaUnion = new GraphQLUnionType({
  name: 'Agenda',
  types: [AgendaMeetingType, AgendaEventType],
  resolveType: obj => obj.appointmentType === 'meeting' ? AgendaMeetingType : AgendaEventType,
});

/**
 * Resolve function used to filter results
 * @param root
 * @param userId
 * @param filter
 * @returns {*|{name, type}|Array|Array.<T>}
 */
export const agendaFilterResolve = (root, { userId = null, filter = {} }) => {
  let agenda = userId ? agendas.filter(a => a.userId === userId) : agendas;

  if (filter.startDate) {
    agenda = agenda.filter(a => moment(a.date).isAfter(moment(filter.startDate)));
  }

  if (filter.endDate) {
    agenda = agenda.filter(a => moment(a.date).isBefore(moment(filter.endDate)));
  }

  if (filter.orderBy) {
    const orderBy = filter.orderBy.split('_');
    agenda = _.orderBy(agenda, orderBy[0].toLowerCase(), orderBy[1].toLowerCase());
  }

  if (filter.limit) {
    agenda = agenda.slice(0, filter.limit);
  }

  return agenda;
};


const agendaQuery = {
  type: new GraphQLList(AgendaUnion),
  args: {
    userId: {
      name: '_id',
      type: GraphQLInt,
    },
    filter: {
      name: 'AgendaFilter',
      type: AgendaFilter,
    },
  },
  resolve: agendaFilterResolve,
};

export default agendaQuery;
