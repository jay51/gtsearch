
export default [
    {
        name: 'root',
        path: '/',
    },

    {
        name: 'repositoryInfo',
        path: '/repository/:name/info',
    },

    {
        name: 'repositorySearch',
        path: '/repository/:name?q',
    },

    {
        name: 'createRepository',
        path: '/create-repository',
    },

    {
        name: 'login',
        path: '/login',
    },

    {
        name: 'logout',
        path: '/logout',
    },
]
