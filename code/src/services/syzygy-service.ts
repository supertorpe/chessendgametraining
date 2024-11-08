// This project has been carried out as part of the Final Degree Project in the Bachelor's Degree in Computer Engineering at UNIR

import { fetchWithTimeout } from "../commons";

class SyzygyService {
   
    public async init(): Promise<any> {

    }

    public get(fen: string): Promise<Response> {
        return fetchWithTimeout(`https://tablebase.lichess.ovh/standard?fen=${fen}`, {
            method: 'GET',
            cache: 'force-cache',
            timeout: 2000
        });
    }
}

export const syzygyService = new SyzygyService();
