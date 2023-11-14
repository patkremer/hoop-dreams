import { CheerioAPI } from 'cheerio';
import { createCheerioRouter, Request, Dataset } from 'crawlee';
import { espnUrls } from './utils/espn-urls.js';
import { EspnBracketologyScraper } from './scrapers/espn-bracketology-scraper.js';
import { EspnBoxScore, EspnBracketologyList, EspnTeamScheduleList } from './models/espn.js';
import { EspnTeamScheduleScraper } from './scrapers/espn-team-schedule-scraper.js';
import { EspnBoxScoreScraper } from './scrapers/espn-box-score-scraper.js';
import { EspnTeamStatsScraper } from './scrapers/espn-team-stats-scraper.js';

export const router = createCheerioRouter();
export const createDataToSave = (request: Request<any>, $: CheerioAPI ) => {
    return {
        url: request.url,
        label: request.label,
        htmlData: $('div.page-container').html()
    }
}

router.addDefaultHandler(async ({ enqueueLinks, log, request, $, pushData }) => {
    log.info(`enqueueing new URLs`);
    
    if (request.url === espnUrls.bracketology) {
        log.info(`${request.label} ${request.url} being ran`);

        const scraper = new EspnBracketologyScraper();
        const data = scraper.getData(log, request, $);
        
        const dataset = await Dataset.open('bracket');
        await dataset.pushData(data);

        await enqueueLinks({
            globs: [espnUrls.teamsBlobUrl],
            label: 'teams',
        });    

    } else if (request.url === espnUrls.dailyD1Scoreboard || request.url.startsWith('https://www.espn.com/mens-college-basketball/scoreboard/_/date')) {
        log.info('boxscore queued')
        enqueueLinks({
            globs: [espnUrls.gameBoxScoreBlobUrl],
            label: 'game-boxscores',
        });
    }

    // enqueueLinks({
    //     globs: [espnUrls.gameBoxScoreBlobUrl],
    //     label: 'game-boxscores',
    // });
   
});

router.addHandler('teams', async ({ request, $, log, pushData, enqueueLinks  }) => {
    log.info(`${request.label} ${request.url} being ran`);

    await enqueueLinks({
        globs: [espnUrls.teamStatsBlobUrl],
        label: 'team-stats',
    });

    await enqueueLinks({
        globs: [espnUrls.scheduleBlobUrl],
        label: 'schedule',
    });
    
    await pushData({
        url: request.url,
        label: request.label
    });

});


router.addHandler('schedule', async ({ request, $, log, pushData, enqueueLinks  }) => {
    log.info(`${request.label} ${request.url} being ran`);
    // const scraper = new EspnTeamScheduleScraper();
    // const data = scraper.getData<EspnTeamScheduleList>(log, request, $);

    // const dataset = await Dataset.open('schedule');
    // await dataset.pushData(data);
    enqueueLinks({
        globs: [espnUrls.gameBlobUrl],
        label: 'games',
    });
});

router.addHandler('team-stats', async ({ request, $, log, enqueueLinks }) => {
    log.info(`${request.label} ${request.url} being ran`);
    const scraper = new EspnTeamStatsScraper();
    const teamstats = await scraper.getData(log, request, $);
    const dataset = await Dataset.open('team-stats');
    await dataset.pushData(teamstats);
    // enqueueLinks({
    //     globs: [espnUrls.playerBlobUrl],
    //     label: 'player',
    // })

});

router.addHandler('player', async ({ request, $, log, pushData, enqueueLinks }) => {
    log.info(`${request.label} ${request.url} being ran`);

    enqueueLinks({
        globs: [espnUrls.playerGameLogBlobUrl],
        label: 'player-game-log',
    })

    await pushData({
        url: request.url,
        label: request.label
    });
});

router.addHandler('player-game-log', async ({ request, $, log, pushData, enqueueLinks }) => {
    log.info(`${request.label} ${request.url} being ran`);

    await pushData({
        url: request.url,
        label: request.label
    });
});


router.addHandler('games', async ({ request, $, log, pushData, enqueueLinks  }) => {
    log.info(`${request.label} ${request.url} being ran`);

    enqueueLinks({
        globs: [espnUrls.gameBoxScoreBlobUrl],
        label: 'game-boxscores',
    });

    await pushData({
        url: request.url,
        label: request.label
    });
});
router.addHandler('game-boxscores', async ({ request, $, log, pushData  }) => {
    const scraper = new EspnBoxScoreScraper();
    const data = scraper.getData(log, request, $);
    const dataset = await Dataset.open('boxscores');
    await dataset.pushData(data);
    log.info(`${request.label} ${request.url} being ran`);
});


export const teamStatsRouter = createCheerioRouter();
teamStatsRouter.addDefaultHandler(async ({ enqueueLinks, log, request, $, pushData }) => {
    log.info(`${request.url} being ran`);
    const scraper = new EspnTeamStatsScraper();
    const teamstats = await scraper.getData(log, request, $);
    const dataset = await Dataset.open('team-stats');
    await dataset.pushData(teamstats);
});