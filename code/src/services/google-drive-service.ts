import { fetchWithTimeout } from "../commons/fetch-timeout";
import { configurationService } from "./configuration-service";

class GoogleDriveService {

    private access_token!: string | undefined;
    private initializing = false;

    public checkNewAccessToken() {
        if (localStorage.getItem("GOOGLE_ACCESS_TOKEN_LOADED") == 'TRUE') {
            localStorage.removeItem("GOOGLE_ACCESS_TOKEN_LOADED");
            configurationService.configuration.syncGoogleDrive = (localStorage.getItem("GOOGLE_ACCESS_TOKEN") != null);
        }
    }

    public init(renewAccessToken = false): Promise<string | undefined> {
        return new Promise<string | undefined>(async resolve => {
            if (!this.initializing) {
                this.initializing = true;
            } else {
                let i = 20;
                while (this.initializing && i > 0) {
                    i--;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                resolve(this.access_token);
                return;
            }
            if (renewAccessToken) {
                localStorage.removeItem("GOOGLE_ACCESS_TOKEN");
                this.access_token = undefined;
            }
            if (this.access_token == undefined) {
                this.access_token = localStorage.getItem("GOOGLE_ACCESS_TOKEN") || undefined;
            }
            if (this.access_token !== undefined) {
                resolve(this.access_token);
                this.initializing = false;
                return;
            }
            const storageListener = () => {
                window.removeEventListener('storage', storageListener);
                this.access_token = localStorage.getItem("GOOGLE_ACCESS_TOKEN") || undefined;
                resolve(this.access_token);
                this.initializing = false;
            };
            window.addEventListener('storage', storageListener);
            localStorage.setItem('theme', configurationService.configuration.colorTheme);
            localStorage.setItem('renew', `${renewAccessToken}`);
            if (!localStorage.getItem('button-ok-message') || localStorage.getItem('button-ok-message') == 'Google Login') {
                let messageOk = 'Google Login';
                let messageKo = 'Cancel';
                try {
                    messageOk = window.AlpineI18n.t('app.button-google-login');
                    messageKo = window.AlpineI18n.t('app.button-google-cancel');
                } catch {
    
                }
                localStorage.setItem('button-ok-message', messageOk);
                localStorage.setItem('button-ko-message', messageKo);
            }
            window.location.href = '/gdrive/index.html';
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

    private async findFolder(folderName: string, retry = false): Promise<string | null> {
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
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.findFolder(folderName, true));
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.files.length > 0 ? data.files[0].id : null;
    }

    private async createFolder(folderName: string, retry = false): Promise<string> {
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
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.createFolder(folderName, true));
        } else if (!response.ok) {
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

    private async findFile(filename: string, folderId: string, retry = false): Promise<string | null> {
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
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.findFile(filename, folderId, true));
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.files.length > 0 ? data.files[0].id : null;
    }

    private async getFileContent(fileId: string, retry = false): Promise<string | null> {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.access_token}`
            }
        });
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.getFileContent(fileId, true));
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.text();
    }

    private async createFile(jsonData: any, filename: string, folderId: string, retry = false): Promise<string> {
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
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.createFile(jsonData, filename, folderId, true));
        } else if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.id;
    }

    private async updateFileContent(fileId: string, jsonData: any, filename: string, retry = false): Promise<void> {
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
        if (!retry && (response.status == 401 || response.status == 403)) {
            return this.init(true).then(() => this.updateFileContent(fileId, jsonData, filename, true));
        } else if (!response.ok) {
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
