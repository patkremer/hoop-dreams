import { CheerioAPI } from 'cheerio';
import { createCheerioRouter, Request } from 'crawlee';
import { espnUrls } from './utils/espn-urls.js';

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

        const bracket = $('.bracket__container').each((i, el) => {
            log.info($(el).find('.bracket__subhead').first().text());
        });
        log.info(bracket.length.toString());

        await pushData(createDataToSave(request, $));
  
        await enqueueLinks({
            globs: [espnUrls.teamsBlobUrl],
            label: 'teams',
        });    
    }

    await enqueueLinks({
        globs: [espnUrls.teamStatsBlobUrl],
        label: 'team-stats',
    });

    await enqueueLinks({
        globs: [espnUrls.scheduleBlobUrl],
        label: 'schedule',
    });

   
   
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

    // enqueueLinks({
    //     globs: [espnUrls.gameBlobUrl],
    //     label: 'games',
    // });

    await pushData(createDataToSave(request, $));

});

router.addHandler('team-stats', async ({ request, $, log, pushData, enqueueLinks }) => {
    log.info(`${request.label} ${request.url} being ran`);

    // enqueueLinks({
    //     globs: [espnUrls.playerBlobUrl],
    //     label: 'player',
    // })

    await pushData(createDataToSave(request, $));
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
    log.info(`${request.label} ${request.url} being ran`);

    await pushData(createDataToSave(request, $));
});


