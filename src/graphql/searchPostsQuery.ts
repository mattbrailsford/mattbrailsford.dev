import { gql } from '@urql/core'

export default gql`
  query ($query: String!, $limit: Int!, $after: String) {
    search(query: $query, type: DISCUSSION, first: $limit, after: $after) {
      pageInfo {
        startCursor
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          ... on Discussion {
            id
            url
            number
            databaseId
            title
            body
            createdAt
            updatedAt
            labels(first: 10) {
              edges {
                node {
                  id
                  name
                  description
                  color
                }
              }
            }
          }
        }
      }
    }
  }
`