import { EspnList, EspnBoxScorePlayerStats, EspnGameBoxScore, ColumnIndexLookup, DataMap, EspnBoxScore } from './../models/espn';
import { CheerioAPI } from 'cheerio';
import { Log, Request } from 'crawlee';
import { EspnScraper } from './scraper';
import { getIdFromUrl, getIdFromUrlWithTeam } from '../utils/helpers.js';


export class EspnBoxScoreScraper implements EspnScraper<EspnBoxScore> {
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
        gameStripScoreTime: '.Gamestrip__Time', // if time is 'Final', game is done, else in-progress or agme time
        gameStripNotes: '.ScoreCell__GameNote', // if text starts with 'Men's Basketball Championship' its post season
        gameStripOverview: '.Gamestrip__Overview',
        gameStripCompetitors: '.Gamestrip__Competitors',
        gameStripDiv: '#themeProvider div.Gamestrip',
        gameDateInfo: '.GameInfo__Meta',
        boxscorePlayerNameSelector: '.Boxscore__AthleteName'
    }

    getData(log: Log, request: Request<any>, $: CheerioAPI): EspnBoxScore {
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
            data: {}
        };

        let playerStats: EspnBoxScorePlayerStats[] = [];

        const game_id = getIdFromUrl(request.url); //boxscore game_id
        const boxscore_url = request.url;

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
        let home_score = $(homeTeamDiv).find(this.selectors.gameStripScore).text();
        let away_score = $(awayTeamDiv).find(this.selectors.gameStripScore).text();
        if (home_score.includes('Winner Icon')) {
            [home_score] = home_score.split('Winner');
        }
        if (away_score.includes('Winner')) {
            [away_score] = away_score.split('Winner');
        }
        const game_status = $(gameStripDiv).find(this.selectors.gameStripScoreTime).text();
        const game_date = $(this.selectors.gameDateInfo).children('span').first().text().trim();
        let is_post_season = false;
        if (gameStripNotes.length > 0 && gameStripNotes.text()) {
            is_post_season = gameStripNotes.text().includes(`Men's Basketball Championship`);
        }

        boxScore = {
            game_id,
            home_team_id,
            away_team_id,
            away_score,
            home_score,
            game_status,
            season: '2023-24',
            game_date,
            is_post_season,
            data: {}
        };

        const tables = $('div.ResponsiveTable.ResponsiveTable--fixed-left.Boxscore.flex.flex-column').each((i, el) => {
            const team_name = $(el).parent().find('.BoxscoreItem__TeamName.h5').text();
            const isHomeTeam = (team_name === home_team);
            const team_id = (isHomeTeam) ? home_team_id : away_team_id;
            const team_url = ((isHomeTeam) ? home_team_url : away_team_url) ?? '';

            const tables = $(el).find('table');
            const [playerTable, statsTable] = tables;
            const columnNameIndex: ColumnIndexLookup = {};

            // build column dictionary
            $(statsTable).find('tr').each((index, row) => {
                const tds = $(row).children('td');
                const firstColumn = tds.first();
                const isHeader = firstColumn.hasClass('Table__customHeader');
                if (isHeader && firstColumn.text()) {
                    // build map 
                    tds.each((mapIndex, header) => {
                        const text = $(header).text().toString();
                        if (text) {
                            columnNameIndex[text.toLowerCase()] = mapIndex;
                        }
                    });
                    // log.info(`columnNames ${JSON.stringify(columnNameIndex)}`);
                    return;
                }
            });

            const playerInfo = $(playerTable).find(this.selectors.boxscorePlayerNameSelector).each((i, playerEl) => {
                const player_url = $(playerEl).attr('href') as string;
                const player_id = getIdFromUrlWithTeam(player_url);
                const player_name = $(playerEl).text();
                const position = $(playerEl).siblings('.playerPosition').first().text();
                const playerIdx = $(playerEl).parents('tr').data('idx') as number;
                log.info(`playerIdx: ${playerIdx}, playerUrl: ${player_url}, playerName: ${player_name}, position: ${position}`);

                const currentPlayerTds = $(statsTable).find('tr').eq(playerIdx).children('td');
                // const currentPlayerTds = currentPlayerRow.children('td');
                const minutes_played = currentPlayerTds.eq(columnNameIndex['min']).text();
                const points = currentPlayerTds.eq(columnNameIndex['pts']).text();

                const data: DataMap = {};
                Object.keys(columnNameIndex).forEach((val, index) => {
                    data[val] = currentPlayerTds.eq(index).text();
                });

                const player: EspnBoxScorePlayerStats = { 
                    player_id, player_url, player_name, position, points, minutes_played, game_id, boxscore_url, team_id, team_url, team_name, data 
                };
                playerStats.push(player);

                // log.info(`player ${JSON.stringify(player)}`);
            });


        });

        return { game: boxScore, players_stats: playerStats } as EspnBoxScore;
    }

}