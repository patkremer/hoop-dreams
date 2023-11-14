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


export interface EspnGameBoxScore extends ExtraData {
    game_id: string; // game url
    home_team_id: string;
    away_team_id: string;
    away_score: string | number | null;
    home_score: string | number | null;
    game_status: string; //  final, in progress, or not played
    season: string;
    game_date: string;
    is_post_season: boolean | string;
}

export interface EspnBoxScorePlayerStats extends EspnPlayerBase, ExtraData, EspnTeamBase  {
    game_id: string;
    boxscore_url: string;
    minutes_played: number | string;
    points: number | string;
}

export interface EspnBracketologyTeam extends EspnTeamBase {
    seed: string;
    region: string;
    season: string;
}

export interface EspnTeamBase {
    team_id: string | null | undefined;
    team_url: string | null | undefined;
    team_name: string | null | undefined;
}

export interface EspnPlayerBase {
    player_id: string | null | undefined;
    player_name: string | null | undefined;
    player_url: string | null | undefined;
    position: Position | string | null | undefined;
}

export interface EspnTeamPlayerPerGameStats extends EspnPlayerBase, EspnTeamBase, ExtraData {
    position: Position | string;
    games_played: string;
    games_started: string;
    minutes_per_game: number | string | null;
    points_per_game: number | string | null;
    season: string;
  }

  export interface ExtraData {
    data: DataMap | null | undefined;
  }

export type DataMap = { [key: string]: string };

export type EspnTeamScheduleList = EspnList<EspnGame>;

export type EspnBracketologyList = EspnList<EspnBracketologyTeam>;

export type EspnTeamStatsList = EspnList<EspnTeamPlayerPerGameStats>;

export type ColumnIndexLookup = { [key: string | ColumnKeys]: number };

export type ColumnNameMap = { 0:'MIN', 1:'FG', 2:'3PT',3:'FT',4:'OREB',5:'DREB',6:'REB',7:'AST',8:'STL',9:'BLK',10:'TO',11:'PF',12:'PTS'};
export type ColumnKeys = 'MIN' | 'FG' | '3PT'|'FT' | 'OREB' | 'DREB' | 'REB' | 'AST' | 'STL' | 'BLK' | 'TO' | 'PF' | 'PTS';