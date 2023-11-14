import { CheerioAPI } from 'cheerio';
import { Log, Request } from 'crawlee';
import { ColumnIndexLookup, DataMap, EspnList, EspnTeamPlayerPerGameStats, EspnTeamStatsList } from '../models/espn';
import { EspnScraper } from './scraper.js';
import { getIdFromUrlWithTeam } from '../utils/helpers.js';
import { TeamData } from '../models/ncaa-basketball.js';
import { loadJSON } from '../utils/loadJson.js';

const teams: TeamData[] = loadJSON('../data/teams.json');

export class EspnTeamStatsScraper implements EspnScraper<EspnTeamStatsList> {
    selectors = {
        tableTitle: '.Table__Title:contains("Per Game Stats")',
        tableHeader: 'th.Table__TH',
        statsHeader: 'span.stats-cell',
        yearSelector: '#fittPageContainer > div.StickyContainer > div.page-container.cf > div > div > section > div > div.stats-header > div > div > select:nth-child(2) > option:nth-child(1)'
    }

    getData(log: Log, request: Request<any>, $: CheerioAPI): EspnTeamStatsList {
        const teamStats: { [key: string]: EspnTeamPlayerPerGameStats[] } = {};
        teamStats[request.url] = [];
        const team = teams.find(t => t.espn_stats_url === request.url) as TeamData;
        const perGameStatsTitleDiv = $(this.selectors.tableTitle)
        const tables = perGameStatsTitleDiv.siblings('div.flex').find('table');

        if (tables.length > 0) {
            // get tables
            const team_stats_url = request.url;

            const [playerTable, statsTable] = tables;
            const columnNameIndex: ColumnIndexLookup = {};
            const columnFullNameIndex: DataMap = {};
            $(statsTable)
                .children('thead')
                .children('tr')
                .children('th')
                .each((index, el) => {
                    const columnTitle = $(el).find('span').attr('title') as string;
                    const column = $(el).find('span a').text().toLowerCase();
                    columnNameIndex[column.toLowerCase()] = index;
                    columnFullNameIndex[column.toLowerCase()] = columnTitle;
                }); //.find('th.stats-cell');
            // log.info(`Stats columns: ${JSON.stringify(columnNameIndex)}`);
            // log.info(`Stats columns: ${JSON.stringify(columnFullNameIndex)}`);
            
            const lastIndex = $(playerTable).find('tbody tr');

            $(playerTable).find('tbody tr').each((i, playerEl) => {
                if ($(playerEl).children('td').first().is('.Stats__TotalRow')) return;

                const playerLinkEl = $(playerEl).children('td').find('a.AnchorLink');
                const player_name = playerLinkEl.text();
                const player_url = playerLinkEl.attr('href') as string;
                const player_id = getIdFromUrlWithTeam(player_url);
                const position = $(playerLinkEl).siblings('span').first().text().trim();
                const playerIdx = $(playerEl).data('idx') as number;

                const currentPlayerTds = $(statsTable).find('tbody tr').eq(playerIdx).children('td');
                log.info(`playerIdx: ${playerIdx}, playerUrl: ${player_url}, playerName: ${player_name}, position: ${position}`);
                const data: DataMap = {};
                Object.keys(columnNameIndex).forEach((val, index) => {
                    data[val] = currentPlayerTds.eq(index).text();
                });

                const player: EspnTeamPlayerPerGameStats = {
                    position,
                    games_played: data['gp'],
                    games_started: '',
                    minutes_per_game: data['min'],
                    points_per_game: data['pts'],
                    season: $(this.selectors.yearSelector).text(),
                    player_id,
                    player_name,
                    player_url,
                    team_id: team.id,
                    team_url: team.espn_url,
                    team_name: team.espn_name,
                    data
                }

                teamStats[request.url].push(player);
            });
        }

        return { data: teamStats } as EspnTeamStatsList;
    }


}