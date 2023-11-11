export interface EspnList<Type> {
    data: { [key: string]: Type[] }
}

export interface EspnTeamSchedule {
    team_id: string;
    opponent_id: string;
    season: string;
    game_date: string;
    result: string;
}

export interface EspnBracketologyTeam {
    team_link: string | undefined;
    team_id: string | undefined;
    team: string;
    seed: string;
    region: string;
    season: string;
}

export type EspnTeamScheduleList = EspnList<EspnTeamSchedule>;

export type EspnBracketologyList = EspnList<EspnBracketologyTeam>;
