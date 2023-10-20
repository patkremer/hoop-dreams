import { EspnList, EspnTeamSchedule } from './../models/espn';
import { CheerioAPI } from 'cheerio';
import { Log, Request } from 'crawlee';
import { EspnScraper } from './scraper';

export class EspnTeamScheduleScraper implements EspnScraper {
    getData<EspnTeamScheduleList>(log: Log, request: Request<any>, $: CheerioAPI): EspnTeamScheduleList {
        const schedules: EspnTeamSchedule = [];
        const schedule_url = request.url;


        throw new Error('Method not implemented.');
    }

}