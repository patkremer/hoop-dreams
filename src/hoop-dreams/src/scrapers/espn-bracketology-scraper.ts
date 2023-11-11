import { EspnList, EspnBracketologyList, EspnBracketologyTeam } from './../models/espn';
import { CheerioAPI, Cheerio, Element } from 'cheerio';
import { Log, Request } from 'crawlee';
import { EspnScraper } from './scraper';
import { getIdFromUrl } from '../utils/helpers.js';

export class EspnBracketologyScraper implements EspnScraper {
    getData<EspnBracketologyList>(log: Log, request: Request<any>, $: CheerioAPI): EspnBracketologyList {
        const bracket: EspnBracketologyTeam[] = [];
        const regions: { [key: string]: EspnBracketologyTeam[] } = {};
        $('.bracket__container').each((i, el) => {
            const region = $(el).find('.bracket__subhead').first().text();
            regions[region] = [];
            log.info(`processing region ${region}`);
            const singleTeamEl = $(el).find('.bracket__item > .bracket__team-single');
            const doubleTeamEl = $(el).find('.bracket__item > .bracket__team-double');

            if (doubleTeamEl.length > 0) {
                $(doubleTeamEl).each((i, doubleEl) => {
                    const seed = $(doubleEl).find('.bracket__seed').first().text();
                    const linkEls = $(doubleEl).find('a.bracket__link').each((i, doubleLink) => {
                        const bracketTeam: EspnBracketologyTeam = this.parseBracketTeam($, $(doubleLink), log, seed, region);
                        bracket.push(bracketTeam);
                        regions[region].push(bracketTeam);
                    });
                });
            }

            if (singleTeamEl.length > 0) {
                $(singleTeamEl).each((i, singleEl) => {
                    const seed = $(singleEl).find('.bracket__seed').first().text();
                    const linkEl = $(singleEl).find('a.bracket__link');
                    const bracketTeam: EspnBracketologyTeam = this.parseBracketTeam($, linkEl, log, seed, region);

                    //log.info(JSON.stringify(bracketTeam));
                    regions[region].push(bracketTeam);
                    bracket.push(bracketTeam);
                });
            }
        });

        log.info(`number of teams found: ${bracket.length}`);
        return { data: regions } as EspnBracketologyList;
    }


    private parseBracketTeam($: CheerioAPI, linkEl: Cheerio<Element>, log: Log, seed: string, region: string) {
        let team_link = $(linkEl).attr('href') ? $(linkEl).attr('href')?.toString() as string : '';
        // parse team_id
        let team_id = getIdFromUrl(team_link);
        const team = $(linkEl).text().replace('aq - ', '').replace(' - aq', '').trim();
        if (Number.isNaN(parseInt(team_id))) {
            log.error(`TEAM_ID NOT A NUMBER ${team}`);
           team_id = '0';
           team_link = '';
        }

        log.info(`${team_id} ${team}`);

        const bracketTeam: EspnBracketologyTeam = {
            seed,
            region,
            team_link,
            team,
            team_id,
            season: '2023-24'
        };
        return bracketTeam;
    }
}