import { EspnList, EspnBoxScorePlayerStats, EspnGameBoxScore, EspnBoxScore, ColumnNameMap, ColumnIndexLookup, ColumnKeys } from './../models/espn';
import { CheerioAPI } from 'cheerio';
import { Log, Request } from 'crawlee';
import { EspnScraper } from './scraper';
import { getIdFromUrlWithTeam } from '../utils/helpers.js';


export class EspnBoxScoreScraper implements EspnScraper {
    selectors = {
        //selectors
        //div.Boxscore.flex.flex-column tr[data-idx="0"]
        //div.ResponsiveTable.Boxscore.flex.flex-column
        //div.ResponsiveTable.Boxscore.flex.flex-column tr[data-idx]
        awayTeamGameStripContainer: 'div.Gamestrip__Competitors .Gamestrip__Team--away',
        homeTeamGameStripContainer: 'div.Gamestrip__Competitors .Gamestrip__Team--home',
        gameStripWinnerClass: '.Gamestrip__Team--winner',
        gameStripLoserClass: '.Gamestrip__Team--loser',
        gameStripTeamContent: 'div.Gamestrip__TeamContent',
        gameStripScore: 'div.Gamestrip__Score',
        gameStripTeamLink: '.Gamestrip__InfoWrapper a.AnchorLink',
        gameStripTeamName: '.ScoreCell__TeamName',
        gameStripScoreDate: '.ScoreCell__ScoreDate .Gamestrip__ScoreDate', // if scoredate, game hasnt started use time
        gameStripScoreTime: '.ScoreCell__ScoreTime .Gamestrip__Time', // if time is 'Final', game is done, else in-progress or agme time
        gameStripNotes: '.ScoreCell__GameNote', // if text starts with 'Men's Basketball Championship' its post season
        gameStripOverview: '.Gamestrip__Overview',
        gameStripCompetitors: '.Gamestrip__Competitors',
        gameStripDiv: '#themeProvider div.Gamestrip',
        boxscorePlayerNameSelector: '.Boxscore__AthleteName'
    }

    getData<EspnBoxScore>(log: Log, request: Request<any>, $: CheerioAPI): EspnBoxScore {
        let boxScore: EspnGameBoxScore = {
            game_id: '',
            home_team_id: '',
            away_team_id: '',
            away_score: null,
            home_score: null,
            game_status: '',
            season: '',
            game_date: '',
            is_post_season: '',
            result: null
        };

        let playerStats: EspnBoxScorePlayerStats[] = [];

        const game_id = request.url; //boxscore game_id
        const boxscore_url = request.url;

        log.info(`game_id: ${game_id}`);

        const gameStripDiv = $(this.selectors.gameStripDiv);
        const gameStripNotes = $(gameStripDiv).find(this.selectors.gameStripNotes);
        // const competitorsDiv = $(this.selectors.gameStripCompetitors);
        const awayTeamDiv = gameStripDiv.find(this.selectors.awayTeamGameStripContainer);
        const homeTeamDiv = $(gameStripDiv).find(this.selectors.homeTeamGameStripContainer);
        // const overviewDiv = $(gameStripDiv).find(this.selectors.gameStripOverview);
        const home_team_url = $(homeTeamDiv).find(this.selectors.gameStripTeamLink).attr('href');
        const away_team_url = $(awayTeamDiv).find(this.selectors.gameStripTeamLink).attr('href');
        const home_team_id = getIdFromUrlWithTeam(home_team_url);
        const away_team_id = getIdFromUrlWithTeam(away_team_url);
        const home_team = $(homeTeamDiv).find(this.selectors.gameStripTeamName).text();
        const away_team = $(awayTeamDiv).find(this.selectors.gameStripTeamName).text();

        boxScore = {
            game_id,
            home_team_id,
            away_team_id,
            away_score: null,
            home_score: null,
            game_status: '',
            season: '2023-24',
            game_date: '',
            is_post_season: '',
            result: null
        };

        // log home_team away_team
        log.info(`home team: ${home_team}, away team: ${away_team}`);
        log.info(`home team: ${home_team_id}, away team: ${away_team_id}`);

        const tables = $('div.ResponsiveTable.ResponsiveTable--fixed-left.Boxscore.flex.flex-column').each((i, el) => {
            const team_name = $(el).parent().find('.BoxscoreItem__TeamName.h5').text();
            const isHomeTeam = (team_name === home_team);
            const team_id = (isHomeTeam) ? home_team_id : away_team_id;
            const team_url = ((isHomeTeam) ? home_team_url : away_team_url) ?? '';
            log.info(`team boxscore: ${team_name}, ${team_id}`);


            const tables = $(el).find('table');
            const playerTable = tables[0];
            const statsTable = tables[1];
            const columnNameIndex: ColumnIndexLookup = {};

            const statsRows = $(statsTable).find('tr').each((index, row) => {
                const dataIdx = $(row).data('idx');
                log.info(`data-idx: ${dataIdx}, ${index}`);
                const tds = $(row).children('td');
                log.info(`number of columns: ${tds.length}`);
                const firstColumn = tds.first();
                const isHeader = firstColumn.hasClass('Table__customHeader');
                if (isHeader) {
                    log.info(`isHeader: ${isHeader} ${firstColumn.text()}`);
                    // build map 

                    if (firstColumn.text()) {
                        tds.each((mapIndex, header) => {
                            const text = $(header).text().toString();
                            if (text) {
                                columnNameIndex[text] = mapIndex;
                            }
                        });
                    }
                    log.info(`columnNames ${JSON.stringify(columnNameIndex)}`);
                    return;
                }
            });

            const playerInfo = $(playerTable).find(this.selectors.boxscorePlayerNameSelector).map((i, playerEl) => {
                const player_url = $(playerEl).attr('href') as string;
                const player_id = getIdFromUrlWithTeam(player_url);
                const player_name = $(playerEl).text();
                const position = $(playerEl).siblings('.playerPosition').first().text();
                const playerIdx = $(playerEl).parents('tr').data('idx') as number;
                log.info(`playerIdx: ${playerIdx}, playerUrl: ${player_url}, playerName: ${player_name}, position: ${position}`);

                const currentPlayerTds = $(statsTable).find('tr').eq(playerIdx).children('td');
                // const currentPlayerTds = currentPlayerRow.children('td');
                const minutes_played = currentPlayerTds.eq(columnNameIndex['MIN']).text();
                const points = currentPlayerTds.eq(columnNameIndex['PTS']).text();
                
                const player: EspnBoxScorePlayerStats = { player_id, player_url, player_name, position, points, minutes_played, game_id, boxscore_url, team_id, team_url, team_name }
                playerStats.push(player);
                log.info(`player ${JSON.stringify(player)}`);
            });
          

        });




        return { boxScore, playerStats: playerStats } as EspnBoxScore;
    }

}