import { generateOpenGraphImage } from './generateOpenGraphImage';
const pathToSlug = (path) => {
    path = path.replace(/^\/src\/pages\//, '');
    path = path.replace(/\.[^\.]*$/, '') + '.png';
    path = path.replace(/\/index\.png$/, '.png');
    return path;
};
function makeGetStaticPaths({ pages, param, getSlug = pathToSlug, }) {
    const slugs = Object.entries(pages).map((page) => getSlug(...page));
    const paths = slugs.map((slug) => ({ params: { [param]: slug } }));
    return function getStaticPaths() {
        return paths;
    };
}
function createOGImageEndpoint({ getSlug = pathToSlug, ...opts }) {
    return async function getOGImage({ params }) {
        const pageEntry = Object.entries(opts.pages).find((page) => {
            const slug = getSlug(...page);
            return slug === params[opts.param] || slug.replace(/^\//, "") === params[opts.param];
        });
        if (!pageEntry)
            return new Response('Page not found', { status: 404 });
        return new Response(await generateOpenGraphImage(await opts.getImageOptions(...pageEntry)));
    };
}
export function OGImageRoute(opts) {
    return {
        getStaticPaths: makeGetStaticPaths(opts),
        GET: createOGImageEndpoint(opts),
    };
}