export interface EspnList<Type> {
    list: Type[];
}

export interface EspnTeamSchedule {
    team_id: string;
    opponent_id: string;
    season: string;
    game_date: string;
    result: string;
}

export type EspnTeamScheduleList = EspnList<EspnTeamSchedule>;