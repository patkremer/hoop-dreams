// For more information, see https://crawlee.dev/
import { CheerioCrawler, ProxyConfiguration, log, CrawlerAddRequestsOptions, CheerioCrawlerOptions, Dataset, Configuration } from 'crawlee';

import { router, teamStatsRouter } from './routes.js';
import { loadJSON } from './utils/loadJson.js';
import { TeamData } from './models/ncaa-basketball.js';
import * as fs from 'fs';
import { espnUrls } from './utils/espn-urls.js';
import { eachDayOfInterval, format, isWithinInterval } from 'date-fns';

const teams: TeamData[] = loadJSON('../data/teams.json');

const teamfullUrl = teams.map(team => {
    return {
        ...team,
        espn_team_full_url: `${team.espn_url}/${team.link}`
    } as TeamData
});

const teamDs = await Dataset.open('team-data');
await teamDs.pushData(teamfullUrl);
await teamDs.exportToJSON('team-data');

const config = Configuration.getGlobalConfig();
config.set('purgeOnStart', true);

const loadBracketology = async () => {
    const startUrls = [espnUrls.bracketology];

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: router,

        failedRequestHandler: ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });

    const teamfullUrl = teams.map(team => `${team.espn_url}/${team.link}`);

    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(startUrls);

    await crawler.run();
}


const loadDailyBoxScores = async () => {
    //https://www.espn.com/mens-college-basketball/scoreboard/_/date/20231106/group/50

    const datesRangesToScrape = eachDayOfInterval({
        start: new Date(2023, 10, 6),
        end: new Date()
    });

    // 'https://www.espn.com/mens-college-basketball/scoreboard/_/date/{date}/group/50'
    const boxscoreUrls = datesRangesToScrape.map(date => {
        const scoreboardTemplateUrl = espnUrls.dateD1Scoreboard;
        return scoreboardTemplateUrl.replace('{date}', format(date, 'yyyyMMdd'));
    });

    log.warning('BoxScoreUrls', boxscoreUrls);

    const startUrls = boxscoreUrls;

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),

        requestHandler: router,
        failedRequestHandler: ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });



    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(startUrls);

    await crawler.run();
}


const loadAllTeams = async () => {

    const crawler = new CheerioCrawler({
        // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
        requestHandler: teamStatsRouter,

        failedRequestHandler: ({ request }) => {
            log.debug(`Request ${request.url} failed twice.`);
        },
    });

    const teamfullUrl = teams.map(team => team.espn_stats_url);
    log.debug(`Running TeamfullUrl length: ${teamfullUrl.length}`, teamfullUrl);
    // await crawler.addRequests(scheduleUrls);
    await crawler.addRequests(teamfullUrl);

    await crawler.run();
    while (crawler.running) {
        log.debug(`Crawler load teams... ${crawler.requestQueue?.assumedHandledCount} out of ${crawler.requestQueue?.assumedTotalCount}`);
    }

}






// await loadDailyBoxScores();
// const boxscores = await Dataset.open('boxscores');
// const boxscoresData = await boxscores.getData();
// await boxscores.exportToJSON('boxscores');

await loadAllTeams();
const teamStats = await Dataset.open('team-stats');
const teamStatsData = await teamStats.getData();

await teamStats.exportToJSON('team-stats');

log.warning(`Boxscores count: ${boxscoresData.total}, teamStats: ${teamStatsData.total}`);