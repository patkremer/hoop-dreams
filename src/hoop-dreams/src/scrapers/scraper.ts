import { log, Log, Request  } from 'crawlee';
import { CheerioAPI } from 'cheerio';

export interface EspnScraper<T> { 
    getData(log: Log, request: Request<any>, $: CheerioAPI): T;
}

export interface CrawleeScraper {
    getData(log: Log, request: Request<any>, $: CheerioAPI): unknown;
}

