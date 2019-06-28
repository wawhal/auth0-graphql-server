const { ApolloServer, ApolloError } = require('apollo-server');
const { makeExecutableSchema } = require('graphql-tools');
const fetch = require('node-fetch');

const ADMIN_TOKEN = process.env.AUTH0_ADMIN_TOKEN;

const getUserFromAuth0 = async (sub) => {
  if (!ADMIN_TOKEN) {
    throw new ApolloError("invalid admin token");
  }
  const options = {
    method: 'GET',
    url: 'https://auth0-remote.eu.auth0.com/api/v2/users',
    qs: {
      q: `nickname:"rishichandrawawhal"`,
      search_engine: 'v3'
    },
    headers: {
      "Authorization": 'Bearer ' + ADMIN_TOKEN
    }
  };
  const response = await fetch(
    'https://auth0-remote.eu.auth0.com/api/v2/users',
    options
  );
  try {
    const respObj = await response.json();
    return respObj;
  } catch (e) {
    console.error(e);
    throw new ApolloError(e);
  }
}

const typeDefs = `
  type Query {
    auth0_info (auth0_id: String): Auth0Info
  }

  type Auth0Info {
    user_id: String,
    email: String,
    email_verified: Boolean,
    name: String,
    picture: String,
    nickname: String,
    created_at: String,
    last_login: String,
    logins_count: Int
  }
`;

const resolvers = {
  Query: {
    auth0_info: async (_, args) => {
      let response;
      try {
        response = await getUserFromAuth0(args.auth0_id);
      } catch (e) {
        throw e;
      }
      return response.find(u => u.user_id === args.auth0_id);
    }
  }
}

const schema = makeExecutableSchema({typeDefs, resolvers});

const server = new ApolloServer({ schema, debug: false });

server.listen().then(({url}) => {
  console.log('Listening at ' + url);
});



