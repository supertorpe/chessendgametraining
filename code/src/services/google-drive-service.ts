import { fetchWithTimeout } from "../commons/fetch-timeout";

const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

class GoogleDriveService {

    private access_token!: string | undefined;

    private init(): Promise<string | undefined> {
        return new Promise<string | undefined>(resolve => {
            if (this.access_token == undefined) {
                this.access_token = localStorage.getItem("GOOGLE_ACCESS_TOKEN") || undefined;
            }
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
                        localStorage.setItem("GOOGLE_ACCESS_TOKEN", this.access_token);
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

    private async createFolderIfNotExists(folderName: string): Promise<string> {
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

    private async findFolder(folderName: string): Promise<string | null> {
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

    private async createFolder(folderName: string): Promise<string> {
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

    private async uploadJsonToFolder(jsonData: any, filename: string, folderId: string): Promise<string> {
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

    private async findFile(filename: string, folderId: string): Promise<string | null> {
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

    private async getFileContent(fileId: string): Promise<string | null> {
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
        return await response.text();
    }

    private async createFile(jsonData: any, filename: string, folderId: string): Promise<string> {
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

    private async updateFileContent(fileId: string, jsonData: any, filename: string): Promise<void> {
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

    public getFile<T>(foldername: string, filename: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const MSG_ERROR = `Error loading file ${foldername}/${filename}`;
            this.init().then((token) => {
                if (!token) { reject(MSG_ERROR); return; }
                this.findFolder(foldername).then((folderId) => {
                    if (!folderId) { reject(MSG_ERROR); return; }
                    this.findFile(filename, folderId).then((fileId) => {
                        if (!fileId) { reject(MSG_ERROR); return; }
                        this.getFileContent(fileId).then((fileContent) => {
                            if (!fileContent) { reject(MSG_ERROR); return; }
                            const result: T = JSON.parse(fileContent);
                            resolve(result);
                        });
                    });
                });
            });
        });
    }

    public putFile<T>(foldername: string, filename: string, fileContent: T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const MSG_ERROR = `Error loading file ${foldername}/${filename}`;
            this.init().then((token) => {
                if (!token) { reject(MSG_ERROR); return; }
                this.createFolderIfNotExists(foldername).then((folderId) => {
                    this.uploadJsonToFolder(fileContent, filename, folderId).then(() => {
                        resolve(fileContent);
                    });
                });
            });
        });
    }
}

export const googleDriveService = new GoogleDriveService();
