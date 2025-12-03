export default function sitemap() {
    const baseUrl = 'https://www.xn--notvarm-xfb.com';

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/forum`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/search`,
            lastModified: new Date(),
            changeFrequency: 'always',
            priority: 0.7,
        },
    ];
}
