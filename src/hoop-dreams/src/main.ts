// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration, log, CrawlerAddRequestsOptions } from 'crawlee';

import { router } from './routes.js';
import { loadJSON } from './utils/loadJson.js';
import { TeamData } from './models/ncaa-basketball.js';
import * as fs from 'fs';
import { espnUrls } from './utils/espn-urls.js';

const teams: TeamData[] = loadJSON('../data/teams.json');


const loadBracketology = async () => {
    const startUrls = [espnUrls.bracketology];

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
    });

    const teamfullUrl = teams.map(team => `${team.espn_url}/${team.link}`);

    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(startUrls);

    await crawler.run();
}


const loadDailyBoxScores = async () => {
    const startUrls = [espnUrls.dateD1Scoreboard];

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
    });

    const teamfullUrl = teams.map(team => `${team.espn_url}/${team.link}`);

    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(startUrls);

    await crawler.run();
}


const loadAllTeams = async () => {

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,
    });

    const teamfullUrl = teams.map(team => team.espn_url);

    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(teamfullUrl);

    await crawler.run();
}

await loadDailyBoxScores();
