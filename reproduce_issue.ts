
const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

function getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function getBrowserHeaders() {
    return {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Upgrade-Insecure-Requests': '1'
    };
}

async function testFetch(subreddit: string) {
    const url = `https://www.reddit.com/r/${subreddit}/new.json?limit=25`;
    console.log(`Fetching ${url}...`);
    try {
        const response = await fetch(url, {
            headers: getBrowserHeaders(),
        });

        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.error(`Failed to fetch: ${response.statusText}`);
            const text = await response.text();
            console.error('Response body:', text.substring(0, 200)); // Log first 200 chars
        } else {
            console.log('Success!');
            const data = await response.json();
            console.log(`Found ${data.data.children.length} posts.`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function testSearch(query: string) {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25&sort=new&type=link`;
    console.log(`Searching ${url}...`);
    try {
        const response = await fetch(url, {
            headers: getBrowserHeaders(),
        });

        console.log(`Status: ${response.status}`);
        if (!response.ok) {
            console.error(`Failed to search: ${response.statusText}`);
        } else {
            console.log('Search Success!');
            const data = await response.json();
            console.log(`Found ${data.data.children.length} posts.`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function run() {
    await testFetch('ecommerce');
    await testSearch('AI stylist');
}

run();
