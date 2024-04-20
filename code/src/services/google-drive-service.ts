import { fetchWithTimeout } from "../commons/fetch-timeout";

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

class GoogleDriveService {

    private access_token!: string;

    public init(): Promise<string | undefined> {
        return new Promise<string | undefined>(resolve => {
            if (this.access_token !== undefined) {
                resolve(this.access_token);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.onload = () => {
                //@ts-ignore
                const client = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPE,
                    prompt: '',
                    callback: async (response) => {
                        this.access_token = response.access_token;
                        resolve(response.access_token);
                    },
                    error_callback: (error) => {
                        console.log(`error_callback: ${JSON.stringify(error)}`);
                        resolve(undefined);
                    }
                });
                client.requestAccessToken({ prompt: 'consent' });
            };
            document.body.appendChild(script);
        });
    };
/*
    private checkInitialized(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            if (this.access_token === undefined) {
                this.init().then(value => resolve(value !== undefined));
            } else {
                resolve(true);
            }
        });
    }
*/
    public async createFolderIfNotExists(folderName: string): Promise<string> {
        //await this.checkInitialized();
        // Check if the folder already exists
        const folderId = await this.findFolder(folderName);
        if (folderId) {
            console.log('Folder already exists. Folder ID:', folderId);
            return folderId;
        }

        // If the folder doesn't exist, create it
        const newFolderId = await this.createFolder(folderName);
        console.log('Folder created successfully. Folder ID:', newFolderId);
        return newFolderId;
    }

    public async findFolder(folderName: string): Promise<string | null> {
        //await this.checkInitialized();
        const url = `https://www.googleapis.com/drive/v3/files`;
        const queryParams = {
            q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
        };
        const searchUrl = new URL(url);
        searchUrl.search = new URLSearchParams(queryParams).toString();

        const response = await fetchWithTimeout(searchUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.files.length > 0 ? data.files[0].id : null;
    }

    public async createFolder(folderName: string): Promise<string> {
        //await this.checkInitialized();
        const url = 'https://www.googleapis.com/drive/v3/files';
        const metadata = {
            'name': folderName,
            'mimeType': 'application/vnd.google-apps.folder'
        };

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(metadata)
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.id;
    }

    public async uploadJsonToFolder(jsonData: any, filename: string, folderId: string): Promise<string> {
        //await this.checkInitialized();
        // Check if the file already exists in the folder
        const existingFileId = await this.findFile(filename, folderId);
        if (existingFileId) {
            // File already exists, update its content
            await this.updateFileContent(existingFileId, jsonData, filename);
            console.log('File updated successfully. File ID:', existingFileId);
            return existingFileId;
        }
        // File does not exist, create a new file
        const newFileId = await this.createFile(jsonData, filename, folderId);
        console.log('File created successfully. File ID:', newFileId);
        return newFileId;
    }

    public async findFile(filename: string, folderId: string): Promise<string | null> {
        //await this.checkInitialized();
        const url = 'https://www.googleapis.com/drive/v3/files';
        const queryParams = {
            q: `name='${filename}' and '${folderId}' in parents and trashed=false`
        };
        const searchUrl = new URL(url);
        searchUrl.search = new URLSearchParams(queryParams).toString();
        const response = await fetchWithTimeout(searchUrl.toString(), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.files.length > 0 ? data.files[0].id : null;
    }

    public async getFileContent(fileId: string): Promise<string | null> {
        //await this.checkInitialized();
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.text();
        return data;
    }

    public async createFile(jsonData: any, filename: string, folderId: string): Promise<string> {
        //await this.checkInitialized();
        const metadata = {
            'name': filename,
            'parents': [folderId],
            'mimeType': 'application/json'
        };
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));
        const response = await fetchWithTimeout('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.id;
    }

    public async updateFileContent(fileId: string, jsonData: any, filename: string): Promise<void> {
        //await this.checkInitialized();
        const metadata = {
            'name': filename
        };
        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', new Blob([JSON.stringify(jsonData)], { type: 'application/json' }));

        const response = await fetchWithTimeout(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${this.access_token}`,
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    }
}

export const googleDriveService = new GoogleDriveService();
