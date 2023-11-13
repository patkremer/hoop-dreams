import { EspnList, EspnGame } from './../models/espn';
import { CheerioAPI } from 'cheerio';
import { Log, Request } from 'crawlee';
import { EspnScraper } from './scraper';

export class EspnTeamScheduleScraper implements EspnScraper {
    getData<EspnTeamScheduleList>(log: Log, request: Request<any>, $: CheerioAPI): EspnTeamScheduleList {
        const schedules: { [key: string]: EspnGame[] } = {};
        const schedule_url = request.url;

        const trs = $('tr.Table__TR').each((i, el) => {
            let isPostSeason = false;
            if (i === 0) {
                const tds = $(el).find('td');
                isPostSeason = tds.first().text() === 'Postseason';
            }
            log.info(`row has index: ${$(el).index().toString()} ${$(el).children('td').first().text()}`);

        });


        const opponents = $('.opponent-logo').each((i, el) => {

            const parentTd = $(el).parent();
            const dateElTd = parentTd.prev();
            const dateSpan = $(dateElTd).find('span').first().text();
            const opponentLinkEl = $(el).find('a.AnchorLink');

            log.info(`schedule: ${dateSpan} ${opponentLinkEl.text()}`);


        });


        return { data: schedules } as EspnTeamScheduleList; 
    }

}