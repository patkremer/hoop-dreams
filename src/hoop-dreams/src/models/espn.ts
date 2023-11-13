import { Position } from './ncaa-basketball';

export interface EspnList<T> {
    data: { [key: string]: T[] }
}

export interface EspnBoxScore {
    game: EspnGameBoxScore;
    players_stats: EspnBoxScorePlayerStats[];
}

// might not need
export interface EspnGame {
    game_id: string; 
    home_team_id: string;
    away_team_id: string;
    season: string;
    game_date: string;
    is_post_season: boolean | string;
    result: string | null;
}


export interface EspnGameBoxScore {
    game_id: string; // game url
    home_team_id: string;
    away_team_id: string;
    away_score: string | number | null;
    home_score: string | number | null;
    game_status: string; //  final, in progress, or not played
    season: string;
    game_date: string;
    is_post_season: boolean | string;
    result: string | null;
}

export interface EspnBoxScorePlayerStats {
    game_id: string;
    player_id: string | null;
    player_name: string | null;
    team_id: string | null;
    team_url: string | null;
    team_name: string | null;
    boxscore_url: string;
    player_url: string | null;
    minutes_played: number | string;
    points: number | string;
    position: string;
}

export interface EspnBracketologyTeam {
    team_link: string | undefined;
    team_id: string | undefined;
    team: string;
    seed: string;
    region: string;
    season: string;
}

export interface EspnTeamPlayerStats {
    player_id: string;
    team_id: string;
    player: string;
    position: Position | string;
    games_played: string;
    games_started: string;
    minutes_per_game: number;
    points_per_game: number;
    player_link: string;
    season: string;

  }

export type EspnTeamScheduleList = EspnList<EspnGame>;

export type EspnBracketologyList = EspnList<EspnBracketologyTeam>;

export type ColumnIndexLookup = { [key: string | ColumnKeys]: number };

export type ColumnNameMap = { 0:'MIN', 1:'FG', 2:'3PT',3:'FT',4:'OREB',5:'DREB',6:'REB',7:'AST',8:'STL',9:'BLK',10:'TO',11:'PF',12:'PTS'};
export type ColumnKeys = 'MIN' | 'FG' | '3PT'|'FT' | 'OREB' | 'DREB' | 'REB' | 'AST' | 'STL' | 'BLK' | 'TO' | 'PF' | 'PTS';