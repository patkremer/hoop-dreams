import { log, Log, Request  } from 'crawlee';
import { CheerioAPI } from 'cheerio';

export interface EspnScraper { 
    getData<Type>(log: Log, request: Request<any>, $: CheerioAPI): Type;
}

export interface CrawleeScraper {
    getData(log: Log, request: Request<any>, $: CheerioAPI): unknown;
}

