class SyzygyService {
   
    public async init(): Promise<any> {

    }

    public get(fen: string): Promise<Response> {
        return fetch(`https://tablebase.lichess.ovh/standard?fen=${fen}`, {
            method: 'GET',
            cache: 'force-cache'
        });

    }
}

export const syzygyService = new SyzygyService();
