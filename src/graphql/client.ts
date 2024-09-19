import { createClient, fetchExchange } from '@urql/core'

export default createClient({
    url: import.meta.env.GITHUB_API_URL,
    fetchOptions: () => {
        return {
            headers: {
                authorization: `Bearer ${import.meta.env.GITHUB_API_KEY}`,
                'user-agent': `${import.meta.env.DOMAIN}`
            },
        };
    },
    requestPolicy: 'network-only',
    exchanges: [ fetchExchange ]
})